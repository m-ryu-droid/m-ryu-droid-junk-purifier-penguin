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

// 【注意】items の img の設定を変えるっピ！
const items = [
    // 麦わら帽子を選んだら、その帽子をかぶったペンギン画像にする
    { name: '麦わら帽子', pt: 10, img: 'penguin_straw.png', type: 'hat' }, 
    // ニット帽なら今回の画像にする
    { name: 'ニット帽', pt: 30, img: 'penguin.png', type: 'hat' }, // 今の画像をニット帽用にする
    // 勇者のマントならマントをつけたペンギン画像にする
    { name: '勇者のマント', pt: 50, img: 'penguin_mantle.png', type: 'body' }
];

// loadEquipped 関数を、画像を差し替える方式に直す
function loadEquipped() {
    const mainEl = document.getElementById('main-penguin-img');
    const closetEl = document.getElementById('closet-penguin-img'); // クローゼット側もIDを合わせる
    
    // 装備に合わせて画像を差し替えるロジックを入れる
    let hat = localStorage.getItem('equipped-hat');
    let body = localStorage.getItem('equipped-body');

    // 例えば、何も装備していなければ「裸のペンギン」画像
    let imgSrc = "penguin_naked.png"; 

    // ニット帽なら今回作った画像
    if (hat === 'penguin.png') imgSrc = "penguin.png"; 
    
    // マントならマント画像、など
    // ... (この辺りはアイテムが増えたらまた教えるっピ！)

    if (mainEl) mainEl.src = imgSrc;
    if (closetEl) closetEl.src = imgSrc;
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
// 4. カメラ・AI解析 & 完了・リセット処理
// ==========================================
let loadingInterval = null; // アニメーション用の変数を宣言しておくっピ

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

            // 前のタイマーが動いてたら一旦止める
            if (loadingInterval) clearInterval(loadingInterval);

            // 🐧「確認中」アニメーション開始！
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
                }
            };
            reader.readAsDataURL(file);
        });
    }
});

// 食材確認画面を出す
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

// 浄化完了！
window.completePurify = function(score, story) {
    totalPoints += score;
    localStorage.setItem('purifyPoints', totalPoints);
    updateDisplay();
    
    document.getElementById('message').innerText = story;
    document.getElementById('result').innerHTML = `<button onclick="resetUI()" style="margin-top:10px; padding:10px 25px; border-radius:20px; border:none; background:#81d4fa; color:white; font-weight:bold; cursor:pointer;">次へ進むっピ！</button>`;
};

// 全てをリセットして最初に戻る
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
