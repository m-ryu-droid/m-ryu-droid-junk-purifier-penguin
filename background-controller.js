/**
 * 背景画像を管理・更新する専用のコントローラー
 */
window.updateAppBackground = function() {
    // 💡 localStorage から現在の浄化ポイントを取得
    // （※お手元の変数名に合わせて 'purifyPoints' などを調整してね）
    const currentPoints = parseInt(localStorage.getItem('purifyPoints')) || 0; 

    // 画面全体の container をつかまえる
    const container = document.querySelector('.container');
    if (!container) return;

    // ポイントに応じた背景画像の切り替え条件
    if (currentPoints >= 30) {
        container.style.backgroundImage = "url('assets/stage4_crystal.png')";
    } else if (currentPoints >= 20) {
        container.style.backgroundImage = "url('assets/stage3_aurora.png')";
    } else if (currentPoints >= 10) {
        container.style.backgroundImage = "url('assets/stage2_ocean.png')";
    } else {
        container.style.backgroundImage = "url('assets/stage1_blizzard.png')";
    }

    // 背景画像をきれいにフィットさせる共通設定
    container.style.backgroundSize = "cover";
    container.style.backgroundPosition = "center";
    container.style.backgroundRepeat = "no-repeat";
};
