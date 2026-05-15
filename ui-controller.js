// ==========================================
// ui-controller.js: 画面表示・着せ替え・更新担当
// ==========================================

/**
 * 1. 画面全体の表示を最新状態に更新する
 */
function updateDisplay() {
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
    
    // 体重情報の更新（ここが関数の外に出ちゃってたのを直したっピ！）
    const weightDisp = document.getElementById('current-weight');
    const diffDisp = document.getElementById('weight-diff');
    if (currentWeight && weightDisp && diffDisp) {
        weightDisp.innerText = currentWeight.toFixed(1) + "kg";
        let diff = currentWeight - targetWeight;
        diffDisp.innerText = diff <= 0 ? "目標達成！✨" : "あと " + diff.toFixed(1) + "kg";
    }

    // 着せ替え状態を反映
    loadEquipped();
}

/**
 * 2. 装備（着せ替え）を画像に反映する
 */
function loadEquipped() {
    const mainEl = document.getElementById('main-penguin-img');
    const closetEl = document.getElementById('closet-penguin-img');
    
    let hat = localStorage.getItem('equipped-hat');
    let body = localStorage.getItem('equipped-body');

    let imgSrc = "assets/penguin.png"; 

    if (hat === 'assets/hat_straw.png') {
        imgSrc = "assets/hat_straw.png"; 
    } 
    else if (hat === 'assets/hat_knit.png' || hat === 'penguin.png') {
        imgSrc = "assets/penguin.png"; 
    } 
    else if (body === 'assets/mantle.png') {
        imgSrc = "assets/penguin_mantle.png";
    }

    if (mainEl) mainEl.src = imgSrc;
    if (closetEl) closetEl.src = imgSrc;

    const mainHatTag = document.getElementById('main-hat');
    if (mainHatTag) mainHatTag.style.display = "none";
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
        updateDisplay();
    } else {
        closetScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
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
 * 5. アイテムを装備・購入・脱ぐ処理
 */
window.equipItem = function(type, imgPath, requiredPt, itemName) {
    let ownedItems = localStorage.getItem('owned-items') || "";
    let ownedArray = ownedItems.split(',').filter(x => x);
    let currentEquipped = localStorage.getItem('equipped-' + type);

    if (currentEquipped === imgPath) {
        localStorage.removeItem('equipped-' + type);
        alert(itemName + "を脱いだっピ！");
    } else if (ownedArray.includes(itemName)) {
        localStorage.setItem('equipped-' + type, imgPath);
        alert(itemName + "に着替えたっピ！");
    } else {
        if (totalPoints < requiredPt) {
            alert("ポイントが足りないっピ！");
            return;
        }
        totalPoints -= requiredPt;
        localStorage.setItem('purifyPoints', totalPoints);
        ownedArray.push(itemName);
        localStorage.setItem('owned-items', ownedArray.join(','));
        localStorage.setItem('equipped-' + type, imgPath);
        alert(itemName + "をゲットしたっピ！✨");
    }

    updateDisplay();
    initCloset();
};

// --- 初期化処理 ---
window.addEventListener('DOMContentLoaded', () => {
    initCloset();
    updateDisplay();
});
