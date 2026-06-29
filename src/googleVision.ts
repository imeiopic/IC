// Google Cloud Vision API helper for Face Detection
// This function sends a base64-encoded image to the Vision API and returns the face detection result.
// NOTE: For production, proxy this through your backend to avoid exposing your API key.

export async function detectFaceWithGoogleVision(
  base64Image: string,
  apiKey: string
): Promise<any> {
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  const body = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: 'FACE_DETECTION', maxResults: 1 }]
      }
    ]
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Vision API error: ${response.status}`);
  return response.json();
}
