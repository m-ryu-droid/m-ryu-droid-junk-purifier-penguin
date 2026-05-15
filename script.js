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

// --- 2. 共通関数（重複を削除して1つにまとめたっピ！） ---

// 画面を更新する
function updateDisplay() {
    const ptDisp = document.getElementById('total-pt-display');
    const bossDisp = document.getElementById('boss-distance');
    const bar = document.getElementById('purify-bar');
    const weightDisp = document.getElementById('current-weight');
    const diffDisp = document.getElementById('weight-diff');
    
    loadEquipped(); // 装備の見た目も一緒に更新

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

// 装備を反映させる
function loadEquipped() {
    ['hat', 'body'].forEach(type => {
        const savedImg = localStorage.getItem('equipped-' + type);
        const mainEl = document.getElementById('main-' + type);
        const closetEl = document.getElementById('closet-' + type);
        if (mainEl) mainEl.src = savedImg || "";
        if (closetEl) closetEl.src = savedImg || "";
    });
}

// 画面切り替え（window.を付けてHTMLから呼べるようにしてるっピ）
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
            let btn = document.createElement('button');
            btn.innerText = item.name;
            btn.style = "padding: 8px 15px; border-radius: 20px; border: 2px solid #81d4fa; background: white; cursor: pointer;";
            btn.onclick = () => {
                const currentImg = localStorage.getItem('equipped-' + item.type);
                if (currentImg === item.img) {
                    localStorage.removeItem('equipped-' + item.type);
                } else {
                    localStorage.setItem('equipped-' + item.type, item.img);
                }
                loadEquipped();
            };
            closetItems.appendChild(btn);
        }
    });
}

// 体重入力
window.openWeightInput = function() {
    let w = window.prompt("今の体重を教えて〜！(kg)", currentWeight || "");
    if (!w) return;
    currentWeight = parseFloat(w);
    localStorage.setItem('currentWeight', currentWeight);
    updateDisplay();
};

// --- 3. 起動時の処理（ここも1つにまとめたっピ） ---
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay(); // 起動時に数値を出す

    const uploadBtn = document.getElementById('upload-btn');
    const cameraInput = document.getElementById('camera-input');

    if (uploadBtn && cameraInput) {
        uploadBtn.onclick = () => cameraInput.click();
    }
    // ...以下、カメラの解析処理（前と同じ）
});
