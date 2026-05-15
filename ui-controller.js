// ==========================================
// ui-controller.js: 画面表示・着せ替え・更新担当
// ==========================================

/**
 * 1. 画面全体の表示を最新状態に更新する
 */
function updateDisplay() {
    // 💡【重要】ここで「最新のデータ」をグローバルから、あるいはlocalStorageから取得し直すっピ！
    // もし config.js で window.totalPoints と書いているならこれだけでOK
    
    // スコア表示の更新
    const ptDisp = document.getElementById('total-pt-display');
    if (ptDisp) ptDisp.innerText = totalPoints;

    // ボスまでの残りポイント（BOSS_GOALが見つからないとここでエラーになるっピ）
    const bossDisp = document.getElementById('boss-distance');
    if (bossDisp) {
        // もし BOSS_GOAL が undefined なら 30 を使う、という安全策
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
    
    // localStorage から今の装備を取得（ここには単品の画像パスが入ってるっピ）
    let hat = localStorage.getItem('equipped-hat');
    let body = localStorage.getItem('equipped-body');

    // 1. 基本は「何も着ていないペンギン」
    let imgSrc = "assets/penguin.png"; 

    // 2. 装備に応じて「帽子をかぶったペンギン」の画像パスに差し替える
    if (hat === 'assets/hat_straw.png') {
        // 👒 麦わら帽子の単品を選んでいるなら、用意したこの画像を表示！
        imgSrc = "assets/hat_straw.png"; 
    } 
    else if (hat === 'assets/hat_knit.png' || hat === 'penguin.png') {
        // 🧶 ニット帽をかぶったペンギン画像
        imgSrc = "assets/penguin.png"; 
    } 
    else if (body === 'assets/mantle.png') {
        // 🦸 マントをつけたペンギン画像
        imgSrc = "assets/penguin_mantle.png";
    }

    // 3. 画像を反映（帽子単品の重ね着タグは非表示にするっピ）
    if (mainEl) mainEl.src = imgSrc;
    if (closetEl) closetEl.src = imgSrc;

    // 【重要】画像自体に帽子が含まれているので、HTMLの「重ねる用の帽子タグ」は隠すっピ！
    const mainHatTag = document.getElementById('main-hat');
    if (mainHatTag) mainHatTag.style.display = "none";
};
    
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
/**
 * 5. アイテムを装備・購入・脱ぐ処理
 */
window.equipItem = function(type, imgPath, requiredPt, itemName) {
    // 持ち物リストを読み込む (例: "麦わら帽子,サングラス")
    let ownedItems = localStorage.getItem('owned-items') || "";
    let ownedArray = ownedItems.split(',').filter(x => x);

    // 現在の装備を確認
    let currentEquipped = localStorage.getItem('equipped-' + type);

    // 【脱ぐ処理】すでに装備しているものをもう一度選んだ場合
    if (currentEquipped === imgPath) {
        localStorage.removeItem('equipped-' + type);
        alert(itemName + "を脱いだっピ！");
        updateDisplay();
        initCloset(); // ボタンの文字を更新するために再描画
        return;
    }

    // 【購入・着替え処理】
    if (ownedArray.includes(itemName)) {
        // すでに持っているならそのまま着替える
        localStorage.setItem('equipped-' + type, imgPath);
        alert(itemName + "に着替えたっピ！");
    } else {
        // 持っていないならポイントを消費して購入
        if (totalPoints < requiredPt) {
            alert("ポイントが足りないっピ！");
            return;
        }
        totalPoints -= requiredPt; // ポイントを引く
        localStorage.setItem('purifyPoints', totalPoints);
        
        // 持ち物リストに追加
        ownedArray.push(itemName);
        localStorage.setItem('owned-items', ownedArray.join(','));
        
        // 装備する
        localStorage.setItem('equipped-' + type, imgPath);
        alert(itemName + "をゲットして着替えたっピ！✨");
    }

    updateDisplay();
    initCloset(); // ボタンの文字を「着替える」や「脱ぐ」に変えるために再描画
};

/**
 * 4. クローゼットのボタン表示をリッチにする
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
            buttonStyle = "background: #ef5350; color: white;"; // 赤色
        } else if (isOwned) {
            buttonText = "着替える";
            buttonStyle = "background: #4caf50; color: white;"; // 緑色
        } else {
            buttonText = item.pt + "ptでゲット";
            buttonStyle = "background: #0288d1; color: white;"; // 青色
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
