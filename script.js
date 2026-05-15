const part1 = "AIza"; 
const part2 = "SyCVm1ZdSOBR5q8gnDJl9RFB15b_cwq4dJU"; 
const API_KEY = part1 + part2;

// 目標設定
const BOSS_GOAL = 30;
let targetWeight = localStorage.getItem('targetWeight') ? parseFloat(localStorage.getItem('targetWeight')) : 70; // 仮の目標

// データの読み込み
let totalPoints = localStorage.getItem('purifyPoints') ? parseInt(localStorage.getItem('purifyPoints')) : 0;
let currentWeight = localStorage.getItem('currentWeight') ? parseFloat(localStorage.getItem('currentWeight')) : null;

// --- 画面表示を更新する最強の関数 ---
function updateDisplay() {
    document.getElementById('total-pt-display').innerText = totalPoints;
    
    // ボスまで
    let remaining = BOSS_GOAL - totalPoints;
    document.getElementById('boss-distance').innerText = (remaining < 0 ? 0 : remaining);
    
    // ゲージ
    let percent = (totalPoints / BOSS_GOAL) * 100;
    document.getElementById('purify-bar').style.width = (percent > 100 ? 100 : percent) + "%";
    
    // 体重表示
    if (currentWeight) {
       // 減った時はマイナス、増えた時はプラスが自動で付くようにするっピ！
    document.getElementById('weight-diff').innerText = (diff > 0 ? "+" : "") + diff.toFixed(1);
    }
}

// 体重入力のダイアログ
window.openWeightInput = function() {
    let w = window.prompt("今の体重を教えてほしいっピ！(kg)", currentWeight || "");
    if (w) {
        currentWeight = parseFloat(w);
        localStorage.setItem('currentWeight', currentWeight);
        
        // 初めての時は目標体重も聞いちゃう
        if (!localStorage.getItem('targetWeight')) {
            let t = window.prompt("目標の体重は？", "65");
            if (t) {
                targetWeight = parseFloat(t);
                localStorage.setItem('targetWeight', targetWeight);
            }
        }
        updateDisplay();
        alert("記録したっピ！目標に向かって一緒に頑張るっピ！");
    }
};

// 浄化完了後の処理（これを completePurify の中で呼ぶ）
window.completePurify = function(score, story) {
    totalPoints += score;
    localStorage.setItem('purifyPoints', totalPoints);
    
    updateDisplay(); // ★ここで上の数字を全部書き換える！

    document.getElementById('message').innerText = story;
    document.getElementById('result').innerHTML = `
        <div style="text-align:center; padding:15px; background:white; border-radius:10px; margin-top:10px;">
            <div style="font-size:24px; color:#0288d1; font-weight:bold;">✨ ＋${score} pt 浄化完了！</div>
            <button onclick="resetUI()" style="margin-top:10px; padding:8px 20px; border-radius:20px; border:none; background:#eee; cursor:pointer;">次へ</button>
        </div>
    `;
};

window.resetUI = function() {
    document.getElementById('result').innerHTML = "";
    document.getElementById('message').innerText = "海が少しずつ綺麗になっているっピ！";
};

// HTMLのボタンと入力をプログラムで繋ぐっピ！
const uploadBtn = document.getElementById('upload-btn');
const cameraInput = document.getElementById('camera-input');

if (uploadBtn && cameraInput) {
    uploadBtn.onclick = () => {
        cameraInput.click(); // ボタンを押したらカメラ（ファイル選択）を起動！
    };
}

// --- [ここから追加してだっピ！] ---

// 画面が全部読み込まれてから繋ぐっピ
document.addEventListener('DOMContentLoaded', () => {
    // 改めてHTMLの部品を取得し直すっピ
    const cameraInput = document.getElementById('camera-input');
    const messageText = document.getElementById('message');
    
    // 【最重要】写真が選ばれた時の命令をここに繋ぎ直すっピ！
    if (cameraInput) {
        cameraInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // ここから解析スタートだっピ！
            messageText.innerText = "ペンペンが食材をスキャン中だっピ...🔍";
            const resultArea = document.getElementById('result');
            if(resultArea) resultArea.innerHTML = ""; 
            
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Image = reader.result.split(',')[1];
                
                try {
                    // Gemini 2.5 Flash に送信だっピ
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
                    
                    // エラーチェックだっピ
                    if (data.error) {
                        messageText.innerText = "エラーだっピ： " + data.error.message;
                        return;
                    }

                    const rawText = data.candidates[0].content.parts[0].text;
                    
                    // JSON部分を抽出して解析
                    const jsonMatch = rawText.match(/\{.*\}/s);
                    if (jsonMatch) {
                        const result = JSON.parse(jsonMatch[0]);
                        showConfirmation(result); // 確認画面へ
                    } else {
                        messageText.innerText = "スキャンに失敗したっピ...もう一度撮ってほしいっピ。";
                    }
                    
                } catch (error) {
                    console.error(error);
                    messageText.innerText = "エラーだっピ。APIキーかネットが怪しいっピ。";
                }
            };
            reader.readAsDataURL(file);
        });
    }
    
    // 起動時の表示更新
    updateDisplay();
});

// 起動時に実行
updateDisplay();
