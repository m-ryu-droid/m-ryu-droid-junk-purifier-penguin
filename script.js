// ここに取得したAPIキーを貼り付けます
const API_KEY = 'あなたのAPIキーをここに貼り付け';

const cameraInput = document.getElementById('camera-input');
const messageText = document.getElementById('message');
const resultDiv = document.getElementById('result');

cameraInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    messageText.innerText = "ペンペンが解析中だっピ...🔍";
    
    // 画像をAIが読める形式に変換
    const reader = new FileReader();
    reader.onload = async () => {
        const base64Image = reader.result.split(',')[1];
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "あなたはペンギンの『ペンペンの助』です。この食事写真を見て、健康的な食事なら浄化成功、ジャンクフードなら浄化失敗として、100文字程度でリアクションしてだっピ。" },
                            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                        ]
                    }]
                })
            });

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            messageText.innerText = aiResponse;
            resultDiv.innerText = "浄化完了だっピ！✨";
            
        } catch (error) {
            messageText.innerText = "エラーだっピ...もう一度試してほしいっピ。";
            console.error(error);
        }
    };
    reader.readAsDataURL(file);
});
