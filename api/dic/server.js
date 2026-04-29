// Simple Express server for DIC translation API
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Mount Iopic API endpoints
try {
  const iopicApi = require('../iopic-api');
  app.use(iopicApi);
  console.log('Iopic API endpoints mounted.');
} catch (e) {
  console.warn('Iopic API endpoints not mounted:', e.message);
}

// Health check for browser GET requests
app.get('/api/dic/translate', (req, res) => {
  res.json({ status: 'DIC translation API is running.' });
});

const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

app.post('/api/dic/translate', async (req, res) => {
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
    res.status(500).json({ error: 'Translation failed', details: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`DIC translation API running on http://localhost:${PORT}`);
});
