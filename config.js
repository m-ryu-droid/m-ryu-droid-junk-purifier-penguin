// API・ボスまでの目標設定 //

const part1 = "AIza"; 
const part2 = "SyCVm1ZdSOBR5q8gnDJl9RFB15b_cwq4dJU"; 
const API_KEY = part1 + part2;

const BOSS_GOAL = 30;

// データは常にlocalStorageから最新を読み込むっピ
let totalPoints = parseInt(localStorage.getItem('purifyPoints')) || 0;
let currentWeight = parseFloat(localStorage.getItem('currentWeight')) || null;
let targetWeight = parseFloat(localStorage.getItem('targetWeight')) || 70;

// アイテム設定 //
const items = [
    { name: '麦わら帽子', pt: 10, img: 'assets/hat_straw.png', type: 'hat' },
    { name: 'サングラス', pt: 30, img: 'assets/glasses.png', type: 'hat' },
    { name: '勇者のマント', pt: 50, img: 'assets/mantle.png', type: 'body' }
];
