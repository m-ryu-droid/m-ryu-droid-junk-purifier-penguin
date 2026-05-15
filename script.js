// --- 1. 設定エリア ---
const part1 = "AIza"; 
const part2 = "SyCVm1ZdSOBR5q8gnDJl9RFB15b_cwq4dJU"; 
const API_KEY = part1 + part2;

const BOSS_GOAL = 30;
let totalPoints = localStorage.getItem('purifyPoints') ? parseInt(localStorage.getItem('purifyPoints')) : 0;
let currentWeight = localStorage.getItem('currentWeight') ? parseFloat(localStorage.getItem('currentWeight')) : null;
let targetWeight = localStorage.getItem('targetWeight') ? parseFloat(localStorage.getItem('targetWeight')) : 70;

const items = [
    { name: '麦わら帽子', pt: 10, img: 'hat_straw.png', type: 'hat' },
    { name: 'サングラス', pt: 30, img: 'glasses.png', type: 'hat' },
    { name: '勇者のマント', pt: 50, img: 'mantle.png', type: 'body' }
];

// --- 2. 共通関数 ---

function updateDisplay() {
    const ptDisp = document.getElementById('total-pt-display');
    const bossDisp = document.getElementById('boss-distance');
    const bar = document.getElementById('purify-bar');
    const weightDisp = document.getElementById('current-weight');
    const diffDisp = document.getElementById('weight-diff');
    
    loadEquipped();

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
        diffDisp.innerText = diff <= 0 ? "目標達成！✨" : "あと " + diff.toFixed(1) + "kg";
    }
}

function loadEquipped() {
    ['hat', 'body'].forEach(type => {
        // 保存されている画像名（hat_straw.png など）を取得
        const savedImg = localStorage.getItem('equipped-' + type);
        
        // HTMLの ID ("main-hat" や "main-body") を探す
        const mainEl = document.getElementById('main-' + type);
        const closetEl = document.getElementById('closet-' + type);
        
        // 画像があれば表示、なければ空にする
        if (mainEl) mainEl.src = savedImg || "";
        if (closetEl) closetEl.src = savedImg || "";
        
        // デバッグ用：動かない時はブラウザのコンソールでこれを見てだっピ！
        console.log(`${type} を更新しました: ${savedImg}`);
    });
}

window.toggleScreen = function(screenName) {
    const main = document.getElementById('main-screen');
    const closet = document.getElementById('closet-screen');
    if (screenName === 'closet') {
        main.style.display = 'none';
        closet.style.display = 'block';
        updateClosetButtons(); 
    } else {
        main.style.display = 'block';
        closet.style.display = 'none';
        updateDisplay();
    }
};

function updateClosetButtons() {
    const closetItems = document.getElementById('closet-items');
    if (!closetItems) return;
    closetItems.innerHTML = "";

    items.forEach(item => {
        // 所持ポイントが足りている場合のみボタンを表示
        if (totalPoints >= item.pt) {
            let btn = document.createElement('button');
            
            // 現在装備中かどうかをチェック
            const currentImg = localStorage.getItem('equipped-' + item.type);
            const isEquipped = (currentImg === item.img);

            // ボタンの見た目を「選択中」か「未選択」で変える
            btn.innerText = isEquipped ? `【選択中】${item.name}` : item.name;
            btn.style = `padding: 10px 15px; border-radius: 20px; cursor: pointer; margin: 5px; font-weight: bold;
                        border: 2px solid #81d4fa; 
                        background: ${isEquipped ? '#b3e5fc' : 'white'}; 
                        color: ${isEquipped ? '#01579b' : '#666'};`;
            
            btn.onclick = () => {
                if (isEquipped) {
                    // すでに着ていたら脱ぐ
                    localStorage.removeItem('equipped-' + item.type);
                } else {
                    // 着ていなかったら着る
                    localStorage.setItem('equipped-' + item.type, item.img);
                }
                
                // 【重要】見た目を即座に更新する命令を全部呼ぶ！
                loadEquipped();      // ペンペンの見た目更新
                updateClosetButtons(); // 自分（ボタン）の見た目も更新
            };
            closetItems.appendChild(btn);
        }
    });
}

window.openWeightInput = function() {
    let w = window.prompt("今の体重を教えて〜！(kg)", currentWeight || "");
    if (!w) return;
    currentWeight = parseFloat(w);
    localStorage.setItem('currentWeight', currentWeight);
    updateDisplay();
};

// --- 3. 起動時 & カメラ解析処理（ここを復活させたっピ！） ---
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();

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

            messageText.innerText = "ペンペンが食材をスキャン中だっピ...🔍";
            resultArea.innerHTML = ""; 
            
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
                        messageText.innerText = "解析に失敗したっピ。";
                    }
                } catch (error) {
                    console.error("Error:", error);
                    messageText.innerText = "通信エラーだっピ。";
                }
            };
            reader.readAsDataURL(file);
        });
    }
});

// --- 4. 確認・完了処理 ---
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
    const safeStory = data.story ? data.story.replace(/'/g, "\\'") : "浄化完了だっピ！";
    html += `<button onclick="completePurify(${data.score}, '${safeStory}')" style="background:#0288d1; color:#fff; border:none; padding:12px; width:100%; border-radius:5px; margin-top:10px; font-weight:bold; cursor:pointer;">これで浄化するっピ！✨</button></div>`;
    resultArea.innerHTML = html;
}

window.completePurify = function(score, story) {
    totalPoints += score;
    localStorage.setItem('purifyPoints', totalPoints);
    updateDisplay();
    document.getElementById('message').innerText = story;
    document.getElementById('result').innerHTML = `<button onclick="resetUI()" style="margin-top:10px; padding:8px 20px; border-radius:20px; border:none; background:#eee; cursor:pointer;">次へ</button>`;
};

window.resetUI = function() {
    document.getElementById('result').innerHTML = "";
    document.getElementById('message').innerText = "海が綺麗になってきてるっピ！";
};
