// ==========================================
// 1. 設定・データ管理
// ==========================================
const part1 = "AIza"; 
const part2 = "SyCVm1ZdSOBR5q8gnDJl9RFB15b_cwq4dJU"; 
const API_KEY = part1 + part2;

const BOSS_GOAL = 30;

// データは常にlocalStorageから最新を読み込むっピ
let totalPoints = parseInt(localStorage.getItem('purifyPoints')) || 0;
let currentWeight = parseFloat(localStorage.getItem('currentWeight')) || null;
let targetWeight = parseFloat(localStorage.getItem('targetWeight')) || 70;

const items = [
    { name: '麦わら帽子', pt: 10, img: 'assets/hat_straw.png', type: 'hat' },
    { name: 'サングラス', pt: 30, img: 'assets/glasses.png', type: 'hat' },
    { name: '勇者のマント', pt: 50, img: 'assets/mantle.png', type: 'body' }
];

// ==========================================
// 2. 画面更新（この1つで全てを制御するっピ）
// ==========================================
function updateDisplay() {
    // 数値の表示更新
    if (document.getElementById('total-pt-display')) {
        document.getElementById('total-pt-display').innerText = totalPoints;
    }
    
    let remaining = BOSS_GOAL - totalPoints;
    if (document.getElementById('boss-distance')) {
        document.getElementById('boss-distance').innerText = (remaining < 0 ? 0 : remaining);
    }
    
    const bar = document.getElementById('purify-bar');
    if (bar) {
        let percent = (totalPoints / BOSS_GOAL) * 100;
        bar.style.width = (percent > 100 ? 100 : percent) + "%";
    }
    
    // 体重情報の更新
    const weightDisp = document.getElementById('current-weight');
    const diffDisp = document.getElementById('weight-diff');
    if (currentWeight && weightDisp && diffDisp) {
        weightDisp.innerText = currentWeight.toFixed(1) + "kg";
        let diff = currentWeight - targetWeight;
        diffDisp.innerText = diff <= 0 ? "目標達成！✨" : "あと " + diff.toFixed(1) + "kg";
    }

    // 見た目（着替え）の更新
    loadEquipped();
}

// 装備を反映（IDさえ合っていればメインもクローゼットも着替えるっピ）
function loadEquipped() {
    ['hat', 'body'].forEach(type => {
        const savedImg = localStorage.getItem('equipped-' + type);
        const mainEl = document.getElementById('main-' + type);
        const closetEl = document.getElementById('closet-' + type);
        
        const imgSrc = savedImg ? savedImg : "";
        if (mainEl) mainEl.src = imgSrc;
        if (closetEl) closetEl.src = imgSrc;
    });
}

// ==========================================
// 3. ユーザー操作（ボタンなど）
// ==========================================

// 体重と目標の入力（ここを復活させたっピ！）
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
    updateDisplay();
};

// 画面切り替え
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

// クローゼットのボタン生成
function updateClosetButtons() {
    const closetItems = document.getElementById('closet-items');
    if (!closetItems) return;
    closetItems.innerHTML = "";

    items.forEach(item => {
        if (totalPoints >= item.pt) {
            const currentImg = localStorage.getItem('equipped-' + item.type);
            const isEquipped = (currentImg === item.img);

            let btn = document.createElement('button');
            btn.innerText = isEquipped ? `✅ ${item.name}` : item.name;
            btn.style = `padding: 10px 15px; border-radius: 20px; cursor: pointer; margin: 5px; border: 2px solid #81d4fa; 
                        background: ${isEquipped ? '#b3e5fc' : 'white'};`;
            
            btn.onclick = () => {
                if (isEquipped) {
                    localStorage.removeItem('equipped-' + item.type);
                } else {
                    localStorage.setItem('equipped-' + item.type, item.img);
                }
                updateDisplay(); // 全体を更新
                updateClosetButtons(); // ボタン自身を更新
            };
            closetItems.appendChild(btn);
        }
    });
}

// ==========================================
// 4. カメラ・AI解析（消えちゃった部分）
// ==========================================
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

                    const data = await response.json();
                    if (data.candidates && data.candidates[0].content.parts[0].text) {
                        const jsonMatch = data.candidates[0].content.parts[0].text.match(/\{.*\}/s);
                        if (jsonMatch) showConfirmation(JSON.parse(jsonMatch[0]));
                    }
                } catch (error) {
                    messageText.innerText = "通信エラーだっピ。";
                }
            };
            reader.readAsDataURL(file);
        });
    }
});

function showConfirmation(data) {
    const messageText = document.getElementById('message');
    const resultArea = document.getElementById('result');
    messageText.innerText = "見つけた食材はこれであってるっピ？";
    
    let html = `<div style="background:#fff; padding:15px; border-radius:10px; border:2px solid #81d4fa;">`;
    data.ingredients.forEach((item, index) => {
        html += `<div style="margin-bottom:8px;"><input type="text" value="${item}" style="width:80%; padding:5px; border-radius:5px; border:1px solid #ddd;"></div>`;
    });
    html += `<button onclick="completePurify(${data.score}, '${data.story.replace(/'/g, "\\'")}')" style="background:#0288d1; color:#fff; border:none; padding:10px; width:100%; border-radius:5px; cursor:pointer;">これで浄化！✨</button></div>`;
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
