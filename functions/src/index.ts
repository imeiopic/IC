import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as faceapi from '@vladmandic/face-api';
import { Canvas, Image, ImageData } from 'canvas';

// Initialize face-api with canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

admin.initializeApp();

export const myTask = functions.https.onRequest(async (req, res) => {
  // ✅ DO THIS: Initialize services inside the handler
  const db = admin.firestore();
  // const heavyClient = new HeavyExternalService({ apiKey: '...' });

  res.send('PULSE_RECEIVED');
});

export const compareFaces = functions.https.onRequest(async (req, res) => {
  try {
    const { uid, newImageBase64 } = req.body;

    if (!uid || !newImageBase64) {
      res.status(400).json({ error: 'Missing uid or newImageBase64' });
      return;
    }

    // Load face-api models
    await faceapi.nets.ssdMobilenetv1.loadFromUri(
      'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/'
    );
    await faceapi.nets.faceLandmark68Net.loadFromUri(
      'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/'
    );
    await faceapi.nets.faceRecognitionNet.loadFromUri(
      'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/'
    );

    // Fetch stored image from Firebase Storage
    const bucket = admin.storage().bucket('iopic-vre.firebasestorage.app');
    const file = bucket.file(`users/${uid}/01.img`);

    let storedImageBuffer: Buffer;
    try {
      [storedImageBuffer] = await file.download();
    } catch (error) {
      res.status(404).json({ error: 'Stored image not found' });
      return;
    }

    // Create canvases from images
    const storedImg = new Image();
    storedImg.src = storedImageBuffer;
    const storedCanvas = new Canvas(storedImg.width, storedImg.height);
    const storedCtx = storedCanvas.getContext('2d');
    storedCtx.drawImage(storedImg, 0, 0);

    const newImageBuffer = Buffer.from(newImageBase64, 'base64');
    const newImg = new Image();
    newImg.src = newImageBuffer;
    const newCanvas = new Canvas(newImg.width, newImg.height);
    const newCtx = newCanvas.getContext('2d');
    newCtx.drawImage(newImg, 0, 0);

    // Detect faces and get descriptors
    const storedDetection = await faceapi
      .detectSingleFace(storedCanvas)
      .withFaceLandmarks()
      .withFaceDescriptor();
    const newDetection = await faceapi
      .detectSingleFace(newCanvas)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!storedDetection) {
      res.json({ match: false, reason: 'No face detected in stored image' });
      return;
    }

    if (!newDetection) {
      res.json({ match: false, reason: 'No face detected in new image' });
      return;
    }

    // Compare face descriptors
    const distance = faceapi.euclideanDistance(storedDetection.descriptor, newDetection.descriptor);

    // Threshold for match (lower is more similar)
    const threshold = 0.6;
    const match = distance < threshold;

    res.json({ match, details: { distance, threshold } });
  } catch (error) {
    console.error('Error in compareFaces:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
