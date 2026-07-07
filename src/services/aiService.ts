const MODELS = [
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
];

const SYSTEM_PROMPT = `You are JanaSetu Sahayak, a helpful assistant for the JanaSetu citizen grievance portal.
You help citizens with Indian government welfare schemes (PM Kisan, Ayushman Bharat, National Scholarship, PM Awas, Ujjwala, MGNREGA, PM Mudra, etc.), filing and tracking grievances, document requirements, appointment booking, and general government services.

Answer concisely in simple language (max 3-4 sentences). Be helpful and accurate. If you don't know something, say so.

IMPORTANT: Detect the language the user writes in and respond in the SAME language. If they write in Hindi, reply in Hindi. If they write in Marathi, reply in Marathi. If they write in Tamil, reply in Tamil. If they write in English, reply in English.`;

let apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

export function setApiKey(key: string) {
  apiKey = key;
}

export function hasApiKey(): boolean {
  return !!apiKey;
}

export async function askAI(query: string): Promise<string> {
  if (!apiKey) return '';

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: query }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) continue;
        const errText = await response.text();
        console.error('Gemini API error:', response.status, errText);
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
    } catch (e) {
      console.error('Gemini fetch error:', e);
      continue;
    }
  }

  return '';
}

const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  gu: 'Gujarati',
  mr: 'Marathi',
  ta: 'Tamil',
  te: 'Telugu',
  bn: 'Bengali',
};

export function getSupportedLanguages(): Record<string, string> {
  return { ...SUPPORTED_LANGUAGES };
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!apiKey) return '';

  const langName = SUPPORTED_LANGUAGES[targetLang] || targetLang;
  const prompt = `Translate the following text to ${langName}. Reply with ONLY the translation, no explanation or quotes.

Text: ${text}`;

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) continue;
        continue;
      }

      const data = await response.json();
      const result = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (result) return result;
    } catch {
      continue;
    }
  }

  return '';
}
