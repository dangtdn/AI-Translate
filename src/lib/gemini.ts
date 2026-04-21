import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";

let lastUsedKeyIndex = 0;

export async function getGeminiInstance(): Promise<GoogleGenAI> {
  const keysString = await storage.get("api_keys");
  if (!keysString) {
    throw new Error("Vui lòng cài đặt API Key trong phần Settings.");
  }
  
  const keys = `${keysString}`
    .split(/[\n,]+/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  if (keys.length === 0) {
    throw new Error("Không có API Key hợp lệ. Vui lòng kiểm tra lại Settings.");
  }

  // Simple round-robin key selection
  const key = keys[lastUsedKeyIndex % keys.length];
  lastUsedKeyIndex++;

  return new GoogleGenAI({ apiKey: key });
}

export type TranslateLang = "en" | "vi";

export async function translateText(text: string, from: TranslateLang, to: TranslateLang): Promise<string> {
  const ai = await getGeminiInstance();
  const fromName = from === "en" ? "English" : "Vietnamese";
  const toName = to === "en" ? "English" : "Vietnamese";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following text from ${fromName} to ${toName}. Only return the translated text without any quotes or Markdown formatting unless present in the original.\n\nText: ${text}`,
  });
  return response.text?.trim() || "";
}

export async function fixAndSuggest(text: string): Promise<{ corrected: string; explanation: string; alternatives: string[] }> {
  const ai = await getGeminiInstance();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert English editor and communication assistant. 
Review the following text. If it is English with errors, fix the grammar. If it is a context or idea (in Vietnamese or English), provide the most natural English sentence for it.

Format your response EXACTLY like this:
CORRECTED: [the best corrected text or translation only]
EXPLANATION: [a brief explanation of the fixes or context in Vietnamese]
ALTERNATIVES:
- [Alternative natural sentence 1]
- [Alternative natural sentence 2]
- [Alternative natural sentence 3]

Text to process: ${text}`,
  });
  
  const resultText = response.text || "";
  const correctedMatch = resultText.match(/CORRECTED:\s*(.*?)(?:\nEXPLANATION:|$)/ms);
  const explanationMatch = resultText.match(/EXPLANATION:\s*(.*?)(?:\nALTERNATIVES:|$)/ms);
  const alternativesMatch = resultText.match(/ALTERNATIVES:\s*(.*)/ms);
  
  const alternativesStr = alternativesMatch ? alternativesMatch[1].trim() : "";
  const alternatives = alternativesStr
    .split("\n")
    .map(line => line.replace(/^[\s\-\d\.]+/, "").trim())
    .filter(line => line.length > 0)
    .slice(0, 3);
  
  return {
    corrected: correctedMatch ? correctedMatch[1].trim() : text,
    explanation: explanationMatch ? explanationMatch[1].trim() : "Không tìm thấy lỗi hoặc không thể giải thích.",
    alternatives: alternatives.length > 0 ? alternatives : []
  };
}

export async function rewriteViToEn(text: string): Promise<string> {
  const ai = await getGeminiInstance();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following Vietnamese text into natural, native-sounding English. Ensure the tone is appropriate for general communication (like sending an email or a message). Return ONLY the translated English text, without markdown, quotes, or explanations.\n\nText: ${text}`,
  });
  return response.text?.trim() || "";
}
