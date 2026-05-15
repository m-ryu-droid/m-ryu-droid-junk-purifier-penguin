// ==========================================
// app-logic.js: 計算・AI解析・入力担当
// ==========================================

// アニメーション用のタイマー変数（1つだけ宣言するっピ）
let loadingInterval = null; 

/**
 * 1. 体重と目標の入力処理
 */
window.openWeightInput = function() {
    let w = window.prompt("今の体重を教えて〜！(kg)", currentWeight || "");
    if (!w) return;
    
    currentWeight = parseFloat(w);
    localStorage.setItem('currentWeight', currentWeight);

    let changeTarget = window.confirm(`今の目標は ${targetWeight}kg だっピ！目標も変更する？`);
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
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [
                                    { text: "写真の食材をリストアップして、最後に以下のJSON形式だけで出力して。形式: {\"ingredients\": [\"食材1\"], \"score\": 10, \"story\": \"物語\"}" },
                                    { inline_data: { mime_type: file.type, data: base64Image } }
                                ]
                            }]
                        })
                    });

                    // 解析が終わったらタイマーを止める
                    clearInterval(loadingInterval); 

                    const data = await response.json();
                    if (data.candidates && data.candidates[0].content.parts[0].text) {
                        const rawText = data.candidates[0].content.parts[0].text;
                        const jsonMatch = rawText.match(/\{.*\}/s);
                        if (jsonMatch) {
                            showConfirmation(JSON.parse(jsonMatch[0]));
                        }
                    }
                } catch (error) {
                    clearInterval(loadingInterval);
                    messageText.innerText = "🐧「通信エラーになっちゃったっピ...」";
                    console.error("Gemini Error:", error);
                }
            };
            reader.readAsDataURL(file);
        });
    }
});

/**
 * 3. 食材確認画面の表示
 */
function showConfirmation(data) {
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
}

/**
 * 4. 浄化完了処理
 */
window.completePurify = function(score, story) {
    // totalPoints は ui-controller.js か config.js で宣言されている想定だっピ
    totalPoints += score;
    localStorage.setItem('purifyPoints', totalPoints);
    if (typeof updateDisplay === 'function') updateDisplay();
    
    document.getElementById('message').innerText = story;
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
