/**
 * 背景画像を管理・更新する専用のコントローラー
 */
window.updateAppBackground = function() {
    // 💡 変数 totalPoints があるならそれを使い、無ければ localStorage から取得する（二段構えで確実にするっピ）
    const currentPoints = (typeof totalPoints !== 'undefined') ? totalPoints : (parseInt(localStorage.getItem('purifyPoints')) || 0); 

    // 💡 画面全体の一番外側の枠をつかまえる（.container がダメだった時のために body も候補に入れるっピ）
    let container = document.querySelector('.container') || document.body;
    if (!container) return;

    // 💡 一旦、画像のパスが1ミリもズレないように設定
    // ※「assets/」フォルダの中に本当にこの名前で画像があるか、1文字ずつチェックしてね！
    let bgUrl = "";
    if (currentPoints >= 30) {
        bgUrl = "assets/stage4_crystal.png";
    } else if (currentPoints >= 20) {
        bgUrl = "assets/stage3_aurora.png";
    } else if (currentPoints >= 10) {
        bgUrl = "assets/stage2_ocean.png";
    } else {
        bgUrl = "assets/stage1_blizzard.png";
    }

    // 🌟 画面に背景画像を確実に流し込む！
    container.style.backgroundImage = "url('" + bgUrl + "')";

    // 背景画像をきれいにフィットさせる共通設定
    container.style.backgroundSize = "cover";
    container.style.backgroundPosition = "center";
    container.style.backgroundRepeat = "no-repeat";
};
