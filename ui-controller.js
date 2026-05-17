// ==========================================
// ui-controller.js: 画面表示・着せ替え・更新担当
// ==========================================

/**
 * 1. 画面全体の表示を最新状態に更新する
 */
function updateDisplay() {
    // 🌟LocalStorageから安全に変数を取得
    const totalPoints = parseInt(localStorage.getItem('purifyPoints')) || 0;
    const currentWeight = parseFloat(localStorage.getItem('currentWeight')) || 60.0;
    const targetWeight = parseFloat(localStorage.getItem('targetWeight')) || 55.0;

    // スコア表示の更新
    const ptDisp = document.getElementById('total-pt-display');
    if (ptDisp) ptDisp.innerText = totalPoints;

    // ボスまでの残りポイント
    const bossDisp = document.getElementById('boss-distance');
    if (bossDisp) {
        const goal = (typeof BOSS_GOAL !== 'undefined') ? BOSS_GOAL : 30;
        let remaining = goal - totalPoints;
        bossDisp.innerText = (remaining < 0 ? 0 : remaining);
    }

    // 浄化バー（進捗バー）の更新
    const bar = document.getElementById('purify-bar');
    if (bar) {
        const goal = (typeof BOSS_GOAL !== 'undefined') ? BOSS_GOAL : 30;
        let percent = (totalPoints / goal) * 100;
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

    // 👗 着せ替え状態を反映
    loadEquipped();

    // 🌌 背景を呼び出す
    if (typeof updateAppBackground === 'function') {
        updateAppBackground();
    }
}

/**
 * 2. 装備（着せ替え）を正しく画面に反映する（超・網羅版！）
 */
function loadEquipped() {
    // 💡 メイン画面のペンギン本体と服のタグを、あり得る名前すべてで探すっピ！
    const mainImg = document.getElementById('main-penguin-img') || document.getElementById('penguin-img');
    const mainBody = document.getElementById('main-body') || document.getElementById('main-mantle') || document.getElementById('penguin-body');
    
    const closetImg = document.getElementById('closet-penguin-img');
    const closetBody = document.getElementById('closet-body') || document.getElementById('closet-mantle');
    
    // localStorage から今の装備を取得
    let hat = localStorage.getItem('equipped-hat');   
    let body = localStorage.getItem('equipped-body'); 

    // --- 👒 帽子・土台の処理 ---
    let baseSrc = "assets/penguin.png"; 
    if (hat) {
        baseSrc = hat; 
    }
    if (mainImg) mainImg.src = baseSrc;
    if (closetImg) closetImg.src = baseSrc;

    // --- 👗 服・重ね着の処理 ---
    if (body) {
        if (mainBody) { mainBody.src = body; mainBody.style.display = "block"; }
        if (closetBody) { closetBody.src = body; closetBody.style.display = "block"; }
    } else {
        if (mainBody) mainBody.style.display = "none";
        if (closetBody) closetBody.style.display = "none";
    }

    // 古い不要なタグは非表示で固定
    const mainHatTag = document.getElementById('main-hat');
    if (mainHatTag) mainHatTag.style.display = "none";
    const closetHatTag = document.getElementById('closet-hat');
    if (closetHatTag) closetHatTag.style.display = "none";
}

/**
 * 3. 画面の切り替え
 */
window.toggleScreen = function(screenName) {
    const mainScreen = document.getElementById('main-screen');
    const closetScreen = document.getElementById('closet-screen');

    if (screenName === 'closet') {
        mainScreen.classList.add('hidden');
        closetScreen.classList.remove('hidden');
        if (typeof loadEquipped === 'function') loadEquipped();
        updateDisplay();
    } else {
        closetScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        
        if (typeof loadEquipped === 'function') loadEquipped(); 
        updateDisplay();
    }
};

/**
 * 4. クローゼットのボタン表示
 */
function initCloset() {
    const grid = document.getElementById('item-grid');
    if (!grid) return;

    let ownedItems = localStorage.getItem('owned-items') || "";
    let ownedArray = ownedItems.split(',').filter(x => x);

    grid.innerHTML = "";
    items.forEach(item => {
        let isOwned = ownedArray.includes(item.name);
        let isEquipped = localStorage.getItem('equipped-' + item.type) === item.img;
        
        let buttonText = "";
        let buttonStyle = "";

        if (isEquipped) {
            buttonText = "脱ぐ";
            buttonStyle = "background: #ef5350; color: white;";
        } else if (isOwned) {
            buttonText = "着替える";
            buttonStyle = "background: #4caf50; color: white;";
        } else {
            buttonText = item.pt + "ptでゲット";
            buttonStyle = "background: #0288d1; color: white;";
        }

        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <img src="${item.img}" style="width:50px; height:50px; object-fit: contain;">
            <p style="font-size:12px; margin:5px 0;">${item.name}</p>
            <button onclick="equipItem('${item.type}', '${item.img}', ${item.pt}, '${item.name}')" 
                    style="font-size:10px; padding:8px; cursor:pointer; border:none; border-radius:5px; ${buttonStyle}">
                ${buttonText}
            </button>
        `;
        grid.appendChild(div);
    });
}

/**
 * 5. アイテムの購入・着替え処理
 */
window.equipItem = function(type, img, pt, name) {
    let ownedItems = localStorage.getItem('owned-items') || "";
    let ownedArray = ownedItems.split(',').filter(x => x);
    let isOwned = ownedArray.includes(name);

    if (!isOwned) {
        let currentPt = parseInt(localStorage.getItem('purifyPoints')) || 0;
        if (currentPt < pt) {
            alert("ポイントが足りないっピ…！");
            return;
        }
        currentPt -= pt;
        localStorage.setItem('purifyPoints', currentPt);
        
        ownedArray.push(name);
        localStorage.setItem('owned-items', ownedArray.join(','));
        alert(`${name}をゲットしたっピ！🎉`);
    }

    let currentEquipped = localStorage.getItem('equipped-' + type);

    if (currentEquipped === img) {
        localStorage.removeItem('equipped-' + type);
    } else {
        localStorage.setItem('equipped-' + type, img);
    }

    if (typeof loadEquipped === 'function') loadEquipped();
    if (typeof updateDisplay === 'function') updateDisplay();
    initCloset();
};

// --- 初期化処理 ---
window.addEventListener('DOMContentLoaded', () => {
    initCloset();
    updateDisplay();
});

// ==========================================
// 🏠 新要素：お部屋画面への移動・切り替えロジック
// ==========================================

/**
 * メイン画面からお部屋へ移動するっピ！
 */
window.goToRoom = function() {
    const room = document.getElementById('penguin-room');
    if (room) {
        room.style.display = 'flex'; // お部屋画面をパッと表示！
        console.log("ペンギンのお部屋に遊びにきたっピ！");
    }
};

/**
 * お部屋画面からもとのメイン画面に戻るっピ！
 */
window.leaveRoom = function() {
    const room = document.getElementById('penguin-room');
    if (room) {
        room.style.display = 'none'; // お部屋画面を非表示にして戻る！
        console.log("メイン画面に戻ったっピ！");
    }
};

/**
 * お部屋からクローゼットを開く（今後の拡張用だっピ）
 */
window.openClosetFromRoom = function() {
    // 今あるおきがえモーダル（ダイアログ）を開く関数が別にあれば、ここにそれを繋ぐっピ！
    alert("🐧「クローゼットを開くっピ！おきがえ画面へレッツゴー！」");
};

/**
 * ⚖️ 体重入力ポップアップを開く関数（復活版！）
 */
window.openWeightInput = function() {
    // もし元々のポップアップを開くID名が違っていたら調整してね
    const modal = document.getElementById('weight-modal') || document.getElementById('weight-input-modal');
    if (modal) {
        modal.style.display = 'flex';
        console.log("体重入力画面を開いたっピ！");
    } else {
        // 万が一モーダルのID名が不明な場合は一時的にプロンプトで対応
        const weight = prompt("今日の体重を入力してね(kg):");
        if (weight && typeof window.updateWeightDisplay === 'function') {
            window.updateWeightDisplay(weight);
        }
    }
};
