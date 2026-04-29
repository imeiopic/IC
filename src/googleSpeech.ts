// Google Cloud Speech-to-Text API helper for Voice Recognition
// This function sends a base64-encoded audio (WAV/FLAC/LINEAR16) to the Speech-to-Text API and returns the transcription result.
// NOTE: For production, proxy this through your backend to avoid exposing your API key.

export async function transcribeVoiceWithGoogleSpeech(
  base64Audio: string,
  apiKey: string
): Promise<any> {
  const url = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;
  const body = {
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US'
    },
    audio: { content: base64Audio }
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Speech API error: ${response.status}`);
  return response.json();
}
