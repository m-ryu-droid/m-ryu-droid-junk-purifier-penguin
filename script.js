const part1 = "AIza"; 
const part2 = "SyCVm1ZdSOBR5q8gnDJl9RFB15b_cwq4dJU"; // ここを自分のキーに合わせてください
const API_KEY = part1 + part2;

let totalPoints = localStorage.getItem('purifyPoints') ? parseInt(localStorage.getItem('purifyPoints')) : 0;

const cameraInput = document.getElementById('camera-input');
const messageText = document.getElementById('message');
const resultArea = document.getElementById('result');

// 1. 写真が選ばれた時の処理
cameraInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    messageText.innerText = "ペンペンが食材をスキャン中だっピ...🔍";
    
    const reader = new FileReader();
    reader.onload = async () => {
        const base64Image = reader.result.split(',')[1];
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: `写真の食材をリストアップして、最後に【JSON】形式で結果を出力してだっピ。
                            形式: {"ingredients": ["食材1", "食材2"], "score": 浄化ポイント(-10〜10), "story": "短い物語"} 
                            健康ならプラス、ジャンクならマイナスだっピ。` },
                            { inline_data: { mime_type: file.type, data: base64Image } }
                        ]
                    }]
                })
            });

            const data = await response.json();
            const rawText = data.candidates[0].content.parts[0].text;
            
            // JSON部分を抽出して解析
            const jsonMatch = rawText.match(/\{.*\}/s);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                showConfirmation(result);
            } else {
                messageText.innerText = "スキャンに失敗したっピ...もう一度撮ってほしいっピ。";
            }
            
        } catch (error) {
            console.error(error);
            messageText.innerText = "エラーだっピ。混んでるかもしれないっピ。";
        }
    };
    reader.readAsDataURL(file);
});

// 2. 食材の確認画面を表示する関数
function showConfirmation(data) {
    messageText.innerText = "見つけた食材はこれで合ってるっピ？（修正もできるっピ！）";
    
    let html = `<div style="background:#fff; padding:15px; border-radius:10px; text-align:left; margin-top:10px;">`;
    data.ingredients.forEach((item, index) => {
        html += `<div style="margin-bottom:5px;">
                    <input type="checkbox" checked id="item-${index}">
                    <input type="text" value="${item}" id="val-${index}" style="border:none; border-bottom:1px solid #ccc; width:80%;">
                 </div>`;
    });
    html += `<button onclick="completePurify(${data.score}, '${data.story.replace(/'/g, "\\'")}')" style="background:#0288d1; color:#fff; border:none; padding:10px; width:100%; border-radius:5px; margin-top:10px;">これで浄化するっピ！✨</button>`;
    html += `</div>`;
    
    resultArea.innerHTML = html;
}

// 目標ポイント（例：30ptでボス戦）
const BOSS_GOAL = 30;

// 画面を更新する関数
function updateDisplay() {
    const display = document.getElementById('total-pt-display');
    const distance = document.getElementById('boss-distance');
    const bar = document.getElementById('purify-bar');
    
    display.innerText = totalPoints;
    
    // ボスまでの残り
    let remaining = BOSS_GOAL - totalPoints;
    if (remaining < 0) remaining = 0;
    distance.innerText = remaining;
    
    // ゲージの長さを計算 (最大100%)
    let percent = (totalPoints / BOSS_GOAL) * 100;
    if (percent > 100) percent = 100;
    bar.style.width = percent + "%";
}

// 浄化完了処理をアップグレード
window.completePurify = function(score, story) {
    totalPoints += score;
    localStorage.setItem('purifyPoints', totalPoints); 
    
    // 画面の数字とゲージを更新
    updateDisplay();
    
    // 完了後のメッセージ
    messageText.innerText = story;
    
    // 完了後は「解析結果」を消して、次へ進むボタンを出す
    resultArea.innerHTML = `
        <div style="text-align:center; padding:20px;">
            <div style="font-size:32px; margin-bottom:10px;">✨ ＋${score} pt</div>
            <button onclick="resetUI()" style="background:#81d4fa; border:none; padding:10px 20px; border-radius:20px; cursor:pointer;">次へ進むっピ！</button>
        </div>
    `;
    
    // ボス戦解禁のチェック
    if (totalPoints >= BOSS_GOAL) {
        messageText.innerText = "浄化完了だっピ！ついに汚染のボスが姿を現したっピ...！";
        resultArea.innerHTML += `<button onclick="startBossBattle()" style="background:#ef4444; color:white; border:none; padding:15px; width:100%; border-radius:10px; margin-top:10px; font-weight:bold; font-size:1.2em;">🔥 ボスを倒しに行く！</button>`;
    }
};

// UIをリセットして次の写真に備える
window.resetUI = function() {
    resultArea.innerHTML = "";
    messageText.innerText = "次のご飯も待ってるっピ！海をどんどん綺麗にするっピよ。";
};

// 起動時に一度表示を更新しておく
updateDisplay();
    
    // ゲージの更新（後で実装）
};
