// ==========================================
// config.js: アプリの基本設定とデータ管理
// ==========================================

// 1. APIキーの設定
const part1 = "AIza"; 
const part2 = "SyCVm1ZdSOBR5q8gnDJl9RFB15b_cwq4dJU"; 
const API_KEY = part1 + part2;

// 2. 目標値の設定
const BOSS_GOAL = 30;

// 3. ユーザーデータの初期化（localStorageから読み込む）
// 他のファイルでも使うので、ここで一括管理するっピ！
var totalPoints = parseInt(localStorage.getItem('purifyPoints')) || 0;
var currentWeight = parseFloat(localStorage.getItem('currentWeight')) || null;
var targetWeight = parseFloat(localStorage.getItem('targetWeight')) || 70;

// 4. アイテムリストの設定
const items = [
    { name: '麦わら帽子', pt: 10, img: 'assets/hat_straw.png', type: 'hat' },
    { name: 'サングラス', pt: 30, img: 'assets/glasses.png', type: 'hat' },
    { name: '勇者のマント', pt: 50, img: 'assets/mantle.png', type: 'body' }
];
