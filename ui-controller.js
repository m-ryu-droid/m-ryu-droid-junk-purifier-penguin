// データは常にlocalStorageから最新を読み込むっピ
let totalPoints = parseInt(localStorage.getItem('purifyPoints')) || 0;
let currentWeight = parseFloat(localStorage.getItem('currentWeight')) || null;
let targetWeight = parseFloat(localStorage.getItem('targetWeight')) || 70;

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
