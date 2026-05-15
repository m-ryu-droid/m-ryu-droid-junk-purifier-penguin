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
        let remaining = BOSS_GOAL - totalPoints;
        bossDisp.innerText = (remaining < 0 ? 0 : remaining);
    }

    // 浄化バー（進捗バー）の更新
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

    // 着せ替え状態を反映
    loadEquipped();
}

/**
 * 2. 装備（着せ替え）を画像に反映する
 */
function loadEquipped() {
    const mainEl = document.getElementById('main-penguin-img');
    const closetEl = document.getElementById('closet-penguin-img');
    
    // localStorage から今の装備を取得
    let hat = localStorage.getItem('equipped-hat');
    let body = localStorage.getItem('equipped-body');

    // 基本は「何も着ていないペンギン」
    let imgSrc = "assets/penguinc.png"; 

    // 装備に応じて画像を切り替える（画像パスは自分の環境に合わせてだっピ）
    if (hat === 'assets/hat_straw.png') {
        imgSrc = "assets/penguin_straw.png"; // 麦わら帽子をかぶったペンギン画像
    } else if (hat === 'assets/hat_knit.png' || hat === 'penguin.png') {
        imgSrc = "assets/penguin.png";       // ニット帽をかぶったペンギン画像
    } else if (body === 'assets/mantle.png') {
        imgSrc = "assets/penguin_mantle.png"; // マントをつけたペンギン画像
    }

    // メイン画面とクローゼット画面の両方のペンギンを更新
    if (mainEl) mainEl.src = imgSrc;
    if (closetEl) closetEl.src = imgSrc;
}

/**
 * 3. 画面の切り替え（メイン ↔ クローゼット）
 */
window.toggleScreen = function(screenName) {
    const mainScreen = document.getElementById('main-screen');
    const closetScreen = document.getElementById('closet-screen');

    if (screenName === 'closet') {
        mainScreen.classList.add('hidden');
        closetScreen.classList.remove('hidden');
        // クローゼットを開いた時も画面を更新
        updateDisplay();
    } else {
        closetScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        updateDisplay();
    }
};

/**
 * 4. クローゼットにアイテムを並べる（初期化用）
 */
function initCloset() {
    const grid = document.getElementById('item-grid');
    if (!grid) return;

    grid.innerHTML = ""; // 一旦空にする
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <img src="${item.img}" style="width:50px;">
            <p style="font-size:12px; margin:5px 0;">${item.name}</p>
            <button onclick="equipItem('${item.type}', '${item.img}', ${item.pt})" 
                    style="font-size:10px; padding:5px; cursor:pointer;">
                ${item.pt}ptで着替える
            </button>
        `;
        grid.appendChild(div);
    });
}

/**
 * 5. アイテムを装備する
 */
window.equipItem = function(type, imgPath, requiredPt) {
    if (totalPoints < requiredPt) {
        alert("ポイントが足りないっピ！ご飯を食べて浄化してだっピ。");
        return;
    }
    // localStorageに保存
    localStorage.setItem('equipped-' + type, imgPath);
    alert(type === 'hat' ? "帽子をかぶったっピ！" : "お洋服を着たっピ！");
    updateDisplay();
};

// ページ読み込み時にクローゼットを準備しておく
document.addEventListener('DOMContentLoaded', initCloset);

/**
 * 6. 初期化処理をまとめる
 */
function initAllUI() {
    console.log("UI初期化開始だっピ！");
    initCloset();    // クローゼットの中身を作る
    updateDisplay(); // 数値や着せ替えを最新にする
}

// ページ読み込み時に実行（他のファイルと競合しにくい書き方だっピ）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllUI);
} else {
    initAllUI();
}

// ページが読み込まれた時に、クローゼットを準備する
window.onload = function() {
    initCloset();    // クローゼットのボタンを生成
    updateDisplay(); // 画面の数値を更新
};
