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
 * 2. 装備（着せ替え）を正しく画面に反映する（メイン画面 ＆ クローゼット両方対応！）
 */
function loadEquipped() {
    // 💡 メイン画面のペンギン
    const mainImg = document.getElementById('main-penguin-img') || document.getElementById('penguin-img');
    const mainBody = document.getElementById('main-body') || document.getElementById('main-mantle') || document.getElementById('penguin-body');
    
    // 💡 クローゼットのポップアップ内のプレビュー用ペンギン
    const closetImg = document.getElementById('closet-penguin-preview') || document.getElementById('closet-penguin-img');
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
    if (closetImg) closetImg.src = baseSrc; // プレビュー画像も連動して変わるっピ！

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
 * 3. クローゼットのボタン・中身をポップアップ用に自動生成するっピ！
 */
function initCloset() {
    // ポップアップの中にあるグリッドを取得
    const grid = document.getElementById('closet-grid') || document.getElementById('item-grid');
    if (!grid) return;

    let ownedItems = localStorage.getItem('owned-items') || "";
    let ownedArray = ownedItems.split(',').filter(x => x);

    // テスト用のアイテムデータ（もし items が別ファイルになければここで安全に定義）
    const myItems = (typeof items !== 'undefined') ? items : [
        { name: "初期スカーフ", type: "body", img: "assets/scarf.png", pt: 0 },
        { name: "王冠（10種特典）", type: "hat", img: "assets/crown.png", pt: 10 },
        { name: "ひみつのリボン", type: "body", img: "assets/ribbon.png", pt: 20 }
    ];

    grid.innerHTML = "";
    myItems.forEach(item => {
        let isOwned = ownedArray.includes(item.name) || item.pt === 0; // 0ptは最初から所持
        let isEquipped = localStorage.getItem('equipped-' + item.type) === item.img;
        
        let buttonText = "";
        let buttonStyle = "";

        if (isEquipped) {
            buttonText = "脱ぐ";
            buttonStyle = "background: #ef5350; color: white; padding: 6px; border-radius: 6px; border: none; font-size: 0.75em; cursor: pointer;";
        } else if (isOwned) {
            buttonText = "着る";
            buttonStyle = "background: #4caf50; color: white; padding: 6px; border-radius: 6px; border: none; font-size: 0.75em; cursor: pointer;";
        } else {
            buttonText = item.pt + "pt";
            buttonStyle = "background: #0288d1; color: white; padding: 6px; border-radius: 6px; border: none; font-size: 0.75em; cursor: pointer;";
        }

        const div = document.createElement('div');
        div.style = "background: #ffffff; border: 2px solid #ffe082; border-radius: 12px; padding: 10px 5px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 4px;";
        div.innerHTML = `
            <div style="font-size: 1.5em;">${item.name.includes("冠") ? "👑" : item.name.includes("リボン") ? "🎀" : "🧣"}</div>
            <div style="font-size: 0.7em; font-weight: bold; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">${item.name}</div>
            <button onclick="equipItem('${item.type}', '${item.img}', ${item.pt}, '${item.name}')" style="${buttonStyle}">
                ${buttonText}
            </button>
        `;
        grid.appendChild(div);
    });
}

/**
 * 4. アイテムの購入・着替え処理
 */
window.equipItem = function(type, img, pt, name) {
    let ownedItems = localStorage.getItem('owned-items') || "";
    let ownedArray = ownedItems.split(',').filter(x => x);
    let isOwned = ownedArray.includes(name) || pt === 0;

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
        // プレビュー下のテキストをリセット
        const txt = document.getElementById('closet-item-name');
        if (txt) txt.innerText = "なにも着てないっピ";
    } else {
        localStorage.setItem('equipped-' + type, img);
        // プレビュー下のテキストを変更
        const txt = document.getElementById('closet-item-name');
        if (txt) txt.innerText = `✨ ${name} を着用中！`;
    }

    if (typeof loadEquipped === 'function') loadEquipped();
    if (typeof updateDisplay === 'function') updateDisplay();
    initCloset(); // ボタンの「着る/脱ぐ」表示をリアルタイム更新！
};

// --- 初期化処理 ---
window.addEventListener('DOMContentLoaded', () => {
    initCloset();
    updateDisplay();
});

// ==========================================
// 🏠 お部屋画面 ＆ 各種ポップアップのコントロールロジック
// ==========================================

window.goToRoom = function() {
    const room = document.getElementById('penguin-room');
    if (room) room.style.display = 'flex';
};

window.leaveRoom = function() {
    const room = document.getElementById('penguin-room');
    if (room) room.style.display = 'none';
};

/**
 * 【クローゼットを開く】ポップアップを表示して、中身のボタンを最新にするっピ！
 */
window.openClosetFromRoom = function() {
    const modal = document.getElementById('closet-modal');
    if (modal) {
        modal.style.display = 'flex';
        initCloset(); // 開いた瞬間に最新のポイントや所持状況でボタンを作る！
        console.log("クローゼットを開いたっピ！");
    }
};

/**
 * 【クローゼットを閉じる】
 */
window.closeCloset = function() {
    const modal = document.getElementById('closet-modal');
    if (modal) modal.style.display = 'none';
};

/**
 * ⚖️ 体重入力ポップアップを開く関数
 */
window.openWeightInput = function() {
    const modal = document.getElementById('weight-modal') || document.getElementById('weight-input-modal');
    if (modal) {
        modal.style.display = 'flex';
        console.log("体重入力画面を開いたっピ！");
    } else {
        const weight = prompt("今日の体重を入力してね(kg):");
        if (weight && typeof window.updateWeightDisplay === 'function') {
            window.updateWeightDisplay(weight);
        }
    }
};
