const part1 = "AIza"; 
const part2 = "SyCVm1ZdSOBR5q8gnDJl9RFB15b_cwq4dJU"; 
const API_KEY = part1 + part2;

// 目標設定
const BOSS_GOAL = 30;
let targetWeight = localStorage.getItem('targetWeight') ? parseFloat(localStorage.getItem('targetWeight')) : 70; // 仮の目標

// データの読み込み
let totalPoints = localStorage.getItem('purifyPoints') ? parseInt(localStorage.getItem('purifyPoints')) : 0;
let currentWeight = localStorage.getItem('currentWeight') ? parseFloat(localStorage.getItem('currentWeight')) : null;

// --- 画面表示を更新する最強の関数 ---
function updateDisplay() {
    document.getElementById('total-pt-display').innerText = totalPoints;
    
    // ボスまで
    let remaining = BOSS_GOAL - totalPoints;
    document.getElementById('boss-distance').innerText = (remaining < 0 ? 0 : remaining);
    
    // ゲージ
    let percent = (totalPoints / BOSS_GOAL) * 100;
    document.getElementById('purify-bar').style.width = (percent > 100 ? 100 : percent) + "%";
    
    // 体重表示
    if (currentWeight) {
        document.getElementById('current-weight').innerText = currentWeight.toFixed(1);
        let diff = currentWeight - targetWeight;
        document.getElementById('weight-diff').innerText = (diff > 0 ? "+" : "") + diff.toFixed(1);
    }
}

// 体重入力のダイアログ
window.openWeightInput = function() {
    let w = window.prompt("今の体重を教えてほしいっピ！(kg)", currentWeight || "");
    if (w) {
        currentWeight = parseFloat(w);
        localStorage.setItem('currentWeight', currentWeight);
        
        // 初めての時は目標体重も聞いちゃう
        if (!localStorage.getItem('targetWeight')) {
            let t = window.prompt("目標の体重は？", "65");
            if (t) {
                targetWeight = parseFloat(t);
                localStorage.setItem('targetWeight', targetWeight);
            }
        }
        updateDisplay();
        alert("記録したっピ！目標に向かって一緒に頑張るっピ！");
    }
};

// 浄化完了後の処理（これを completePurify の中で呼ぶ）
window.completePurify = function(score, story) {
    totalPoints += score;
    localStorage.setItem('purifyPoints', totalPoints);
    
    updateDisplay(); // ★ここで上の数字を全部書き換える！

    document.getElementById('message').innerText = story;
    document.getElementById('result').innerHTML = `
        <div style="text-align:center; padding:15px; background:white; border-radius:10px; margin-top:10px;">
            <div style="font-size:24px; color:#0288d1; font-weight:bold;">✨ ＋${score} pt 浄化完了！</div>
            <button onclick="resetUI()" style="margin-top:10px; padding:8px 20px; border-radius:20px; border:none; background:#eee; cursor:pointer;">次へ</button>
        </div>
    `;
};

window.resetUI = function() {
    document.getElementById('result').innerHTML = "";
    document.getElementById('message').innerText = "海が少しずつ綺麗になっているっピ！";
};

// 起動時に実行
updateDisplay();
