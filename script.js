// GitHubに直接書くとまた消されるので、空にしておきます
const API_KEY = window.prompt("APIキーを入力してほしいっピ！"); 

const cameraInput = document.getElementById('camera-input');
// ...（以下のコードはそのまま）
const cameraInput = document.getElementById('camera-input');
const messageText = document.getElementById('message');

cameraInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    messageText.innerText = "ペンペンが解析中だっピ...🔍";
    
    const reader = new FileReader();
    reader.onload = async () => {
        const base64Image = reader.result.split(',')[1];
        
        try {
            // ✅ 修正: 存在するモデル名に変更
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
                {
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
                }
            );
            const data = await response.json();
            
            if (data.error) {
                // ✅ エラー詳細も表示するよう改善
                messageText.innerText = `エラーだっピ: ${data.error.message}`;
                console.error(data.error);
                return;
            }
            const aiResponse = data.candidates[0].content.parts[0].text;
            messageText.innerText = aiResponse;
            
        } catch (error) {
            messageText.innerText = `通信エラーだっピ: ${error.message}`;
            console.error(error);
        }
    };
    reader.readAsDataURL(file);
});
