/**
 * 1. 画面全体の表示を最新状態に更新する（完全修正版だっピ！）
 */
function updateDisplay() {
    // 🌟【超重要】行方不明になっていた変数を、ここでLocalStorageからしっかり救出するっピ！
    // お手元の変数名（'purifyPoints'など）や初期値に合わせて調整してね！
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

    // 👗 着せ替え状態を反映（これで途切れることなく電気が届くっピ！）
    loadEquipped();

    // 🌌 背景を呼び出す
    if (typeof updateAppBackground === 'function') {
        updateAppBackground();
    }
}

/**
 * 2. 装備（着せ替え）を正しく画面に反映する
 * 帽子：土台の画像そのものを差し替える
 * 服　：土台の上に重ねて表示する
 */
/**
 * 2. 装備（着せ替え）を正しく画面に反映する
 */
function loadEquipped() {
    const mainImg = document.getElementById('main-penguin-img');
    const mainBody = document.getElementById('main-body');
    
    const closetImg = document.getElementById('closet-penguin-img');
    const closetBody = document.getElementById('closet-body');
    
    // localStorage から今の装備をしっかり取得
    let hat = localStorage.getItem('equipped-hat');   // 例: 'assets/hat_straw.png'
    let body = localStorage.getItem('equipped-body'); // 例: 'assets/mantle.png'

    // ------------------------------------------
    // 👒 【帽子・土台の処理】
    // ------------------------------------------
    // 基本は裸のペンギン（assets/penguin.png）
    let baseSrc = "assets/penguin.png"; 

    // 💡 ここが超重要！帽子を装備しているときだけ、土台を「帽子つき画像」にする
    // 帽子を脱いでいたら（hat が空なら）自動的に上の「裸のペンギン」が使われるっピ！
    if (hat) {
        baseSrc = hat; 
    }

    // 画面の土台（ペンギン自身）の画像を最新状態に塗り替える
    if (mainImg) mainImg.src = baseSrc;
    if (closetImg) closetImg.src = baseSrc;


    // ------------------------------------------
    // 👗 【服・重ね着の処理】
    // ------------------------------------------
    // 服（マントなど）を装備している場合は、土台の上に重ねて表示
    if (body) {
        if (mainBody) { mainBody.src = body; mainBody.style.display = "block"; }
        if (closetBody) { closetBody.src = body; closetBody.style.display = "block"; }
    } else {
        // 何も着ていないときは非表示にするっピ
        if (mainBody) mainBody.style.display = "none";
        if (closetBody) closetBody.style.display = "none";
    }

    // 💡【補足】HTMLに残っている古い「main-hat」タグは非表示で固定
    const mainHatTag = document.getElementById('main-hat');
    if (mainHatTag) mainHatTag.style.display = "none";
    const closetHatTag = document.getElementById('closet-hat');
    if (closetHatTag) closetHatTag.style.display = "none";
}

/**
 * 3. 画面の切り替え（修正版だっピ！）
 */
window.toggleScreen = function(screenName) {
    const mainScreen = document.getElementById('main-screen');
    const closetScreen = document.getElementById('closet-screen');

    if (screenName === 'closet') {
        mainScreen.classList.add('hidden');
        closetScreen.classList.remove('hidden');
        if (typeof loadEquipped === 'function') loadEquipped(); // クローゼットを開いた時も一応読み直す
        updateDisplay();
    } else {
        // 👗 クローゼットからメイン画面に戻るとき
        closetScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        
        // 🌟【超重要】メイン画面に戻った瞬間に、最新の服を重ね着させるっピ！
        if (typeof loadEquipped === 'function') loadEquipped(); 

        loadEquipped();
        
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
 * 5. アイテムの購入・着替え処理（追加・修正）
 */
window.equipItem = function(type, img, pt, name) {
    let ownedItems = localStorage.getItem('owned-items') || "";
    let ownedArray = ownedItems.split(',').filter(x => x);
    let isOwned = ownedArray.includes(name);

    // --- 【1】まだ持っていないアイテムの場合（購入処理） ---
    if (!isOwned) {
        let currentPt = parseInt(localStorage.getItem('purifyPoints')) || 0;
        if (currentPt < pt) {
            alert("ポイントが足りないっピ…！");
            return;
        }
        // ポイントを消費して購入
        currentPt -= pt;
        localStorage.setItem('purifyPoints', currentPt);
        
        ownedArray.push(name);
        localStorage.setItem('owned-items', ownedArray.join(','));
        alert(`${name}をゲットしたっピ！🎉`);
    }

    // --- 【2】すでに持っているアイテムの場合（着替え処理） ---
    // 今選んだスロット（equipped-hat または equipped-body）の現在の装備を取得
    let currentEquipped = localStorage.getItem('equipped-' + type);

    if (currentEquipped === img) {
        // すでに着ているものをもう一度押したら「脱ぐ」
        localStorage.removeItem('equipped-' + type);
    } else {
        // 別のアイテムなら「着る」
        localStorage.setItem('equipped-' + type, img);
    }

    // 画面の見た目を全部更新するっピ！
    if (typeof loadEquipped === 'function') loadEquipped();
    if (typeof updateDisplay === 'function') updateDisplay();
    initCloset(); // クローゼットのボタン（「着替える」や「脱ぐ」）を再描画
};

// --- 初期化処理 ---
window.addEventListener('DOMContentLoaded', () => {
    initCloset();
    updateDisplay();
});
