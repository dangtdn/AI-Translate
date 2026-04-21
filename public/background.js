chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate_text") {
    handleTranslation(request.text).then(sendResponse).catch(err => sendResponse({ error: err.message }));
    return true; // Signal async response
  }
});

async function handleTranslation(text) {
  const result = await chrome.storage.local.get("api_keys");
  const keysStr = result.api_keys;
  if (!keysStr) throw new Error("Vui lòng cài đặt API Key trong tiện ích.");
  
  const keys = keysStr.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean);
  if (!keys.length) throw new Error("API Key không hợp lệ.");
  
  // Pick random key for simple rotation
  const key = keys[Math.floor(Math.random() * keys.length)];
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: `Translate the following Vietnamese text into natural, native-sounding English. Ensure the tone is appropriate for general input/communication. Return ONLY the translated English text, without markdown, quotes, or explanations.\n\nText: ${text}` }]
      }]
    })
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Lỗi giao tiếp với Gemini");
  
  const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!translated) throw new Error("Không nhận được kết quả dịch hợp lệ.");
  
  return { translated };
}
