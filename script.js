// --- 1. 設定エリア ---
const part1 = "AIza"; 
const part2 = "SyCVm1ZdSOBR5q8gnDJl9RFB15b_cwq4dJU"; 
const API_KEY = part1 + part2;

const BOSS_GOAL = 30;
let totalPoints = localStorage.getItem('purifyPoints') ? parseInt(localStorage.getItem('purifyPoints')) : 0;
let currentWeight = localStorage.getItem('currentWeight') ? parseFloat(localStorage.getItem('currentWeight')) : null;
let targetWeight = localStorage.getItem('targetWeight') ? parseFloat(localStorage.getItem('targetWeight')) : 70;

// --- 2. 画面更新の命令（ステータスボード用） ---
function updateDisplay() {
    const ptDisp = document.getElementById('total-pt-display');
    const bossDisp = document.getElementById('boss-distance');
    const bar = document.getElementById('purify-bar');
    const weightDisp = document.getElementById('current-weight');
    const diffDisp = document.getElementById('weight-diff');

    if (ptDisp) ptDisp.innerText = totalPoints;
    
    let remaining = BOSS_GOAL - totalPoints;
    if (bossDisp) bossDisp.innerText = (remaining < 0 ? 0 : remaining);
    
    if (bar) {
        let percent = (totalPoints / BOSS_GOAL) * 100;
        bar.style.width = (percent > 100 ? 100 : percent) + "%";
    }
    
    if (currentWeight && weightDisp && diffDisp) {
        weightDisp.innerText = currentWeight.toFixed(1) + "kg";
        let diff = currentWeight - targetWeight;
        diffDisp.innerText = (diff > 0 ? "+" : "") + diff.toFixed(1) + "kg";
    }
}

// --- 3. メインの処理（画面の準備ができたら実行） ---
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay(); // 起動時に数字を出す
    
    const uploadBtn = document.getElementById('upload-btn');
    const cameraInput = document.getElementById('camera-input');
    const messageText = document.getElementById('message');
    const resultArea = document.getElementById('result');

    // 写真ボタンと隠し入力を繋ぐ
    if (uploadBtn && cameraInput) {
        uploadBtn.onclick = () => cameraInput.click();
    }

    // 写真が選ばれた時の処理（ここに入れたっピ！）
    if (cameraInput) {
        cameraInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (messageText) messageText.innerText = "ペンペンが食材をスキャン中だっピ...🔍";
            if (resultArea) resultArea.innerHTML = ""; 
            
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
                                    { text: "写真の食材をリストアップして、最後に以下のJSON形式だけで出力して。余計な解説は不要。形式: {\"ingredients\": [\"食材1\", \"食材2\"], \"score\": 10, \"story\": \"物語\"}" },
                                    { inline_data: { mime_type: file.type, data: base64Image } }
                                ]
                            }]
                        })
                    });

                    const data = await response.json();
                    if (data.candidates && data.candidates[0].content.parts[0].text) {
                        const rawText = data.candidates[0].content.parts[0].text;
                        const jsonMatch = rawText.match(/\{.*\}/s);
                        if (jsonMatch) {
                            showConfirmation(JSON.parse(jsonMatch[0]));
                        }
                    } else {
                        if (messageText) messageText.innerText = "解析に失敗したっピ。もう一度試してほしいっピ。";
                    }
                } catch (error) {
                    console.error("Error:", error);
                    if (messageText) messageText.innerText = "通信エラーだっピ。";
                }
            };
            reader.readAsDataURL(file);
        });
    }
});

// --- 4. サブの機能 ---

function showConfirmation(data) {
    const messageText = document.getElementById('message');
    const resultArea = document.getElementById('result');
    messageText.innerText = "見つけた食材はこれであってるっピ？";
    
    let html = `<div style="background:#fff; padding:15px; border-radius:10px; text-align:left; border:2px solid #81d4fa;">`;
    data.ingredients.forEach((item, index) => {
        html += `<div style="margin-bottom:8px; display:flex; align-items:center;">
                    <input type="checkbox" checked id="check-${index}" style="margin-right:10px;">
                    <input type="text" value="${item}" id="input-${index}" style="flex:1; border:1px solid #ddd; padding:4px; border-radius:4px;">
                 </div>`;
    });
    // storyが空の場合の対策
    const safeStory = data.story ? data.story.replace(/'/g, "\\'") : "浄化完了だっピ！";
    html += `<button onclick="completePurify(${data.score}, '${safeStory}')" style="background:#0288d1; color:#fff; border:none; padding:12px; width:100%; border-radius:5px; margin-top:10px; font-weight:bold; cursor:pointer;">これで浄化するっピ！✨</button></div>`;
    resultArea.innerHTML = html;
}

window.completePurify = function(score, story) {
    totalPoints += score;
    localStorage.setItem('purifyPoints', totalPoints);
    updateDisplay();
    document.getElementById('message').innerText = story;
    document.getElementById('result').innerHTML = `<div style="text-align:center; padding:15px;"><div style="font-size:24px; color:#0288d1; font-weight:bold;">＋${score} pt 浄化完了！</div><button onclick="resetUI()" style="margin-top:10px; padding:8px 20px; border-radius:20px; border:none; background:#eee; cursor:pointer;">次へ</button></div>`;
};

window.openWeightInput = function() {
    let w = window.prompt("今の体重を教えてほしい！(kg)", currentWeight || "");
    if (!w) return;

    currentWeight = parseFloat(w);
    localStorage.setItem('currentWeight', currentWeight);

    let changeTarget = window.confirm(`今の目標は ${targetWeight}kg だっピ。目標も変更する？`);
    if (changeTarget) {
        let t = window.prompt("新しい目標体重は？(kg)", targetWeight);
        if (t) {
            targetWeight = parseFloat(t);
            localStorage.setItem('targetWeight', targetWeight);
        }
    }
    updateDisplay();
};

window.resetUI = function() {
    document.getElementById('result').innerHTML = "";
    document.getElementById('message').innerText = "海が綺麗になってきてるっピ！";
};

// データリセット用
window.resetData = function() {
    if (window.confirm("全データをリセットするっピ？")) {
        localStorage.clear();
        location.reload();
    }
};
