// ==========================================
// config.js: アプリの基本設定とデータ管理（完全修復版だっピ！）
// ==========================================

window.API_KEY = "AIza..." + "SyCVm1ZdSOBR5q8gnDJl9RFB15b_cwq4dJU"; 
window.totalPoints = parseInt(localStorage.getItem('purifyPoints')) || 0;
window.currentWeight = parseFloat(localStorage.getItem('currentWeight')) || null;
window.targetWeight = parseFloat(localStorage.getItem('targetWeight')) || 70;

window.BOSS_GOAL = 30;

// 3. ユーザーデータの初期化（localStorageから読み込む）
var totalPoints = parseInt(localStorage.getItem('purifyPoints')) || 0;
var currentWeight = parseFloat(localStorage.getItem('currentWeight')) || null;
var targetWeight = parseFloat(localStorage.getItem('targetWeight')) || 70;

// 4. アイテムリストの設定（カッコとコンマを完璧に繋ぎ直したっピ✨）
const items = [
    { name: '麦わら帽子', pt: 10, img: 'assets/hat_straw.png', type: 'hat' },
    { name: 'サングラス', pt: 30, img: 'assets/glasses.png', type: 'hat' },
    { name: '勇者のマント', pt: 50, img: 'assets/mantle.png', type: 'body' }, // 🌟ここにコンマを打ちました！
     { name: 'ニットスカーフ', pt: 10, img: 'assets/nitskafff.png', type: 'hat' }, 
    {
        name: "ピカピカの王冠",
        type: "hat",
        img: "assets/hat_crown.png",
        pt: 20
    }, // 🌟ここも綺麗に繋げました！
    {
        name: "かっこいい緑の服",
        type: "body",
        img: "assets/body_greencloth01.png",
        pt: 25
    }
];
