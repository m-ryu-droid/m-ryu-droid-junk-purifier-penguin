// ==========================================
// app-logic.js: 計算・AI解析・入力担当
// ==========================================

// アニメーション用のタイマー変数（1つだけ宣言するっピ）
let loadingInterval = null; 

/**
 * 1. 体重と目標の入力処理
 */
window.openWeightInput = function() {
    // 🌟 グローバルまたはLocalStorageから安全に現在の値を取得して初期化
    let currentWeight = parseFloat(localStorage.getItem('currentWeight')) || 60.0;
    let targetWeight = parseFloat(localStorage.getItem('targetWeight')) || 55.0;

    let w = window.prompt("今の体重を教えて〜！(kg)", currentWeight || "");
    if (!w) return;
    
    currentWeight = parseFloat(w);
    localStorage.setItem('currentWeight', currentWeight);

    let changeTarget = window.confirm(`今の目標は ${targetWeight}kg だよ！目標も変更する？`);
    if (changeTarget) {
        let t = window.prompt("新しい目標体重は？(kg)", targetWeight);
        if (t) {
            targetWeight = parseFloat(t);
            localStorage.setItem('targetWeight', targetWeight);
        }
    }
    // ui-controller.js にある更新関数を呼ぶっピ
    if (typeof updateDisplay === 'function') updateDisplay();
};

/**
 * 2. カメラ起動とGemini AIによる画像解析
 */
document.addEventListener('DOMContentLoaded', () => {
    // 起動時に画面を一度更新
    if (typeof updateDisplay === 'function') updateDisplay();

    const uploadBtn = document.getElementById('upload-btn');
    const cameraInput = document.getElementById('camera-input');
    const messageText = document.getElementById('message');
    const resultArea = document.getElementById('result');

    if (uploadBtn && cameraInput) {
        uploadBtn.onclick = () => cameraInput.click();
    }

    if (cameraInput) {
        cameraInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // 前のタイマーが動いてたら止める
            if (loadingInterval) clearInterval(loadingInterval);

            // 🐧「確認中」アニメーション開始
            let dots = "";
            loadingInterval = setInterval(() => {
                dots = dots.length >= 3 ? "" : dots + ".";
                messageText.innerText = `🐧「お食事内容を確認中だよ！」${dots}🔍`;
            }, 500);
            
            resultArea.innerHTML = ""; 
            
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Image = reader.result.split(',')[1];
                try {
                    // API_KEY は config.js から読み込まれるっピ
                    // 🌟 Gemini 2.5 の最新画像リクエスト形式に美しく修正したっピ！
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [
                                   parts: [
                                    parts: [
                                    { text: "写真の食材を分析して、最後に以下のJSON形式だけで出力して。\n\n【重要ルール】\n写真の中に見つけた食材が、以下の【図鑑食材リスト】のいずれかに該当する場合は、その「ID」を必ず zukan_ids 配列に入れてだっピ！\n（複数あれば全部入れて、該当するものが全くない場合は空っぽの [] にしてね）\n\n【図鑑食材リスト】\n・pancake (スフレパンケーキ)\n・tomato (トマト)\n・salmon (サーモン)\n・banana (バナナ)\n・egg (たまご)\n・broccoli (ブロッコリー)\n・chicken_breast (鶏むね肉)\n・chicken_tender (鶏ささみ)\n・yogurt (ヨーグルト)\n・avocado (アボカド)\n\n【出力JSON形式】\n{\"ingredients\": [\"見つけた食材名\"], \"zukan_ids\": [\"該当したID\"], \"score\": 10, \"story\": \"ペンギンが喜んでいる30文字以内の短いセリフ\"}" },
                                    { inlineData: { mimeType: file.type, data: base64Image } }
                                ]
                            }]
                        })
                    });

                    const data = await response.json();
                    console.log("AIからの生の返事だっピ:", data);

                    // 🌟【大復活】解析が終わったので、まず真っ先にタイマーアニメーションを止める！
                    if (loadingInterval) clearInterval(loadingInterval); 

                    // 💡 AIの返事の形が多少ズレてても、執念深くテキストを探し出す処理
                    let rawText = "";
                    try {
                        if (data.candidates && data.candidates[0]) {
                            const cand = data.candidates[0];
                            if (cand.content && cand.content.parts && cand.content.parts[0]) {
                                rawText = cand.content.parts[0].text;
                            } else if (cand.text) {
                                rawText = cand.text;
                            } else if (cand.parts && cand.parts[0]) {
                                rawText = cand.parts[0].text;
                            }
                        }
                    } catch (e) {
                        console.log("テキスト抽出失敗", e);
                    }

// 🌟 テキストが見つかったら、あらゆるノイズ（```json等）を削ぎ落としてJSONを引っこ抜く！
                    if (rawText) {
                        // 前後の余計な空白や、AIが勝手につける「```json」や「```」を徹底的にトリミングするっピ！
                        let cleanedText = rawText.trim();
                        cleanedText = cleanedText.replace(/^```json\s*/i, ''); // 先頭の ```json を消す
                        cleanedText = cleanedText.replace(/^```\s*/, '');     // 先頭の ``` を消す
                        cleanedText = cleanedText.replace(/```$/, '');         // 末尾の ``` を消す
                        cleanedText = cleanedText.trim();

                        // それでもダメな時のために、一番外側の { } を力づくで見つけるっピ
                        const firstBracket = cleanedText.indexOf('{');
                        const lastBracket = cleanedText.lastIndexOf('}');

                       if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                            const jsonString = cleanedText.substring(firstBracket, lastBracket + 1);
                            try {
                                const parsedData = JSON.parse(jsonString);
                                window.lastAiData = parsedData; // 🌟 ここでバッチリ一時記憶！
                                showConfirmation(parsedData);
                            } catch (parseError) {
                                console.error("JSONパース失敗:", parseError, "対象文字列:", jsonString);
                                messageText.innerText = "🐧「データの形が壊れていて読めなかったっピ…」";
                            }
                        } else {
                            messageText.innerText = "🐧「返事の中にデータが見つからなかったっピ…」";
                            console.log("パースできなかった生テキスト:", rawText);
                        }
                        } else {
                            messageText.innerText = "🐧「返事の中にデータが見つからなかったっピ…」";
                            console.log("パースできなかった生テキスト:", rawText);
                        }
                    } else {
                        messageText.innerText = "...";
                        console.error("想定外のデータ構造:", data);
                    }

                } catch (error) {
                    // ✅ fetch失敗時の catch を追加
                    clearInterval(loadingInterval);
                    messageText.innerText = "🐧「通信エラーだっピ…」";
                    console.error(error);
                }
            };  // reader.onload の閉じ括弧
            reader.readAsDataURL(file);
        });
    }
});

/**
 * 3. 食材確認画面の表示
 */
window.showConfirmation = function(data) {
    const messageText = document.getElementById('message');
    const resultArea = document.getElementById('result');
    
    messageText.innerText = "🐧「見つけた食材はこれであってるかな？」";
    
    let html = `<div style="background:#fff; padding:15px; border-radius:10px; border:2px solid #81d4fa;">`;
    data.ingredients.forEach((item, index) => {
        html += `<div style="margin-bottom:8px; display:flex; align-items:center;">
                    <input type="checkbox" checked id="check-${index}" style="margin-right:10px;">
                    <input type="text" value="${item}" style="flex:1; border:1px solid #ddd; padding:4px; border-radius:4px;">
                 </div>`;
    });
    const safeStory = data.story ? data.story.replace(/'/g, "\\'") : "浄化完了だっピ！";
    html += `<button onclick="completePurify(${data.score}, '${safeStory}')" style="background:#0288d1; color:#fff; border:none; padding:12px; width:100%; border-radius:5px; margin-top:10px; font-weight:bold; cursor:pointer;">これで浄化するっピ！✨</button></div>`;
    resultArea.innerHTML = html;
};

/**
 * 4. 浄化完了処理
 */
window.completePurify = function(score, story) {
    let totalPoints = parseInt(localStorage.getItem('purifyPoints')) || 0;
    totalPoints += score;
    localStorage.setItem('purifyPoints', totalPoints);
    
    // 📖 新要素：今回AIが見つけた図鑑IDを、実際に図鑑に登録・カウントするっピ！
    let zukanMessage = "";
    try {
        // 直前のAIの返事（resultエリアの裏側など）から、今回該当したIDを引っこ抜く仕掛け
        // ※簡易的に、現在画面に写っているパーツやデータから連動させるために、
        // 直前の確認画面のデータに仕込まれたzukan_ids（もしあれば）を処理します。
        // ここではグローバルに一時保存されたデータ、または今回新しく見つかったIDを処理！
        if (window.lastAiData && window.lastAiData.zukan_ids) {
            window.lastAiData.zukan_ids.forEach(id => {
                if (typeof window.addFoodToZukan === 'function') {
                    let res = window.addFoodToZukan(id);
                    if (res && res.isNew) {
                        zukanMessage += `\n✨新しい食材【${id}】を図鑑に登録したっピ！`;
                        
                        // 🎁 やりこみ要素：もし10種類コンプリートしたらボーナス50pt！
                        if (res.totalUnlocked === 10) {
                            totalPoints += 50;
                            localStorage.setItem('purifyPoints', totalPoints);
                            zukanMessage += `\n🎉すごーーいっピ！10種類コンプリート特典で【50pt】ゲット＆おきがえ衣装が解放されたっピ！！👑`;
                        }
                    }
                }
            });
        }
    } catch(e) {
        console.error("図鑑登録エラー:", e);
    }

    if (typeof updateDisplay === 'function') updateDisplay();
    
    // AIのストーリーのあとに、図鑑の解放ニュースをドッキングして表示するっピ！
    document.getElementById('message').innerText = story + zukanMessage;
    document.getElementById('result').innerHTML = `<button onclick="resetUI()" style="margin-top:10px; padding:10px 25px; border-radius:20px; border:none; background:#81d4fa; color:white; font-weight:bold; cursor:pointer;">次へ進むっピ！</button>`;
};
/**
 * 5. 全てをリセットして最初に戻る
 */
window.resetUI = function() {
    const messageText = document.getElementById('message');
    const resultArea = document.getElementById('result');
    const cameraInput = document.getElementById('camera-input');

    messageText.innerText = "ご飯の写真を撮って、海を浄化するっピ！";
    resultArea.innerHTML = "";
    if (cameraInput) {
        cameraInput.value = "";
    }
    console.log("リセット完了！");
};
