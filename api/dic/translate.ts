import type { VercelRequest, VercelResponse } from '@vercel/node';

// Replace with your translation API key and endpoint
const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { text, from, to } = req.body;
  if (!text || !from || !to) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }
  try {
    const response = await fetch(`${TRANSLATE_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        format: 'text'
      })
    });
    const data = await response.json();
    const translation = data.data.translations[0].translatedText;
    res.status(200).json({ translation });
  } catch (err) {
    res.status(500).json({ error: 'Translation failed', details: err });
  }
}
