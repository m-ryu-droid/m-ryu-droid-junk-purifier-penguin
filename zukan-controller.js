// ==========================================
// zukan-controller.js: 食材図鑑データ・連動ロジック担当
// ==========================================

// 📖 図鑑マスターデータ（全10種）
const ZUKAN_MASTER = {
    "pancake":        { name: "スフレパンケーキ", icon: "🥞", desc: "ふわふわで甘い、ご褒美の定番だっピ！" },
    "tomato":         { name: "トマト",           icon: "🍅", desc: "真っ赤でジューシー！ビタミンたっぷりだっピ！" },
    "salmon":         { name: "サーモン",         icon: "🐟", desc: "ペンギンも大好物！脂が乗ってて美味しいっピ。" },
    "banana":         { name: "バナナ",           icon: "🍌", desc: "手軽にエネルギー補給！朝ごはんにも最高だっピ！" },
    "egg":            { name: "たまご",           icon: "🥚", desc: "栄養満点！いろんな料理に変身できる完全栄養食だっピ。" },
    "broccoli":       { name: "ブロッコリー",     icon: "🥦", desc: "歯ごたえ抜群！お弁当の彩りにも大活躍の緑黄色野菜だっピ。" },
    "chicken_breast": { name: "鶏むね肉",         icon: "🥩", desc: "ヘルシーで高タンパク！ダイエッターの強い味方だっピ！" },
    "chicken_tender": { name: "鶏ささみ",         icon: "🍗", desc: "脂肪がほぼゼロ！究極の筋肉おやつで引き締めるっピ！" },
    "yogurt":         { name: "ヨーグルト",       icon: "🥛", desc: "お腹に優しくて、発酵パワーで海も体も綺麗にするっピ！" },
    "avocado":        { name: "アボカド",         icon: "🥑", desc: "森のバター！良質な脂質が含まれていてお肌にもいいっピ！" }
};

/**
 * 【図鑑を開く】お部屋から食材図鑑のポップアップを開くっピ！
 */
window.openZukanFromRoom = function() {
    const modal = document.getElementById('zukan-modal');
    if (!modal) return;

    // LocalStorageから安全に読み込む
    const unlocked = JSON.parse(localStorage.getItem('zukan_unlocked')) || [];
    const counts = JSON.parse(localStorage.getItem('zukan_counts')) || {};

    // 達成度メーターを更新
    document.getElementById('zukan-progress-count').innerText = unlocked.length;

    // グリッドの中身を一度空っぽにする
    const grid = document.getElementById('zukan-grid');
    grid.innerHTML = "";

    // 10種類のマスターデータを順番に画面に並べる
    Object.keys(ZUKAN_MASTER).forEach(id => {
        const item = ZUKAN_MASTER[id];
        const isUnlocked = unlocked.includes(id);
        const count = counts[id] || 0;

        let cardHtml = '';
        if (isUnlocked) {
            cardHtml = `
                <div onclick="openZukanDetail('${id}')" style="background: #ffffff; border: 2px solid #b3e5fc; border-radius: 12px; padding: 10px 5px; text-align: center; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s;">
                    <div style="font-size: 1.8em; margin-bottom: 2px;">${item.icon}</div>
                    <div style="font-size: 0.7em; font-weight: bold; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
                    <div style="font-size: 0.6em; color: #ff5252; font-weight: bold; margin-top: 2px;">${count}回</div>
                </div>
            `;
        } else {
            cardHtml = `
                <div style="background: #eeeeee; border: 2px dashed #ccc; border-radius: 12px; padding: 10px 5px; text-align: center; color: #999;">
                    <div style="font-size: 1.8em; margin-bottom: 2px; filter: grayscale(1); opacity: 0.3;">❓</div>
                    <div style="font-size: 0.7em; font-weight: bold; color: #999;">？？？</div>
                    <div style="font-size: 0.6em; color: #999; margin-top: 2px;">0回</div>
                </div>
            `;
        }
        grid.innerHTML += cardHtml;
    });

    modal.style.display = 'flex';
};

/**
 * 【図鑑を閉じる】図鑑のポップアップを閉じるっピ！
 */
window.closeZukan = function() {
    const modal = document.getElementById('zukan-modal');
    if (modal) modal.style.display = 'none';
};

/**
 * 【詳細を開く】図鑑の食材をタップしたときに詳細ポップアップを出すっピ！
 */
window.openZukanDetail = function(id) {
    const item = ZUKAN_MASTER[id];
    if (!item) return;

    const counts = JSON.parse(localStorage.getItem('zukan_counts')) || {};
    const count = counts[id] || 0;

    document.getElementById('detail-image').innerText = item.icon;
    document.getElementById('detail-name').innerText = item.name;
    document.getElementById('detail-count').innerText = `食べた回数: ${count}回`;
    document.getElementById('detail-desc').innerText = item.desc;

    document.getElementById('zukan-detail-modal').style.display = 'flex';
};

/**
 * 【詳細を閉じる】詳細ポップアップを閉じるっピ！
 */
window.closeZukanDetail = function() {
    document.getElementById('zukan-detail-modal').style.display = 'none';
};

/**
 * 🌟【将来の連動用】AIが食材を見つけたときに図鑑に登録・カウントする関数だっピ！
 */
window.addFoodToZukan = function(foodId) {
    if (!ZUKAN_MASTER[foodId]) return false; // マスターにない食材は無視

    let unlocked = JSON.parse(localStorage.getItem('zukan_unlocked')) || [];
    let counts = JSON.parse(localStorage.getItem('zukan_counts')) || {};

    // 初めて食べた食材なら解放リストに追加
    let isNewNew = false;
    if (!unlocked.includes(foodId)) {
        unlocked.push(foodId);
        localStorage.setItem('zukan_unlocked', JSON.stringify(unlocked));
        isNewNew = true; // 新規解放フラグ
    }

    // 回数をプラス
    counts[foodId] = (counts[foodId] || 0) + 1;
    localStorage.setItem('zukan_counts', JSON.stringify(counts));

    return { isNew: isNewNew, totalUnlocked: unlocked.length };
};
