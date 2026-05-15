const API_KEY = 'AIzaSyDeck035jJZSr2ZoBS_7i-axS_ssQB6OCg'; // ここを書き換えてください

const cameraInput = document.getElementById('camera-input');
const messageText = document.getElementById('message');

cameraInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    messageText.innerText = "ペンペンが最新の脳（Gemini 3）で解析中だっピ...🔍";
    
    const reader = new FileReader();
    reader.onload = async () => {
        const base64Image = reader.result.split(',')[1];
        
        try {
            // Gemini 3 Flash を指定
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "あなたはペンギンの『ペンペンの助』だっピ。この写真の食事が健康的か判定して、おっとりした口調でリアクションしてほしいっピ。" },
                            { inline_data: { mime_type: file.type, data: base64Image } }
                        ]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.error) {
                messageText.innerText = "エラーだっピ。APIキーかモデル名が最新か確認してほしいっピ。";
                console.error(data.error);
                return;
            }

            const aiResponse = data.candidates[0].content.parts[0].text;
            messageText.innerText = aiResponse;
            
        } catch (error) {
            messageText.innerText = "通信エラーだっピ...。";
        }
    };
    reader.readAsDataURL(file);
});
