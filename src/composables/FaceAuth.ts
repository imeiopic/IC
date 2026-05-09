// src/composables/FaceAuth.ts
import * as faceapi from 'face-api.js';

export const loadFaceModels = async () => {
  // Your model loading logic (ssdMobilenetv1, faceLandmark68Net, faceRecognitionNet)
  const MODEL_URL = '/models';
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  console.log('--- Face Models Grounded ---');
};

// THIS IS THE MISSING LINK
export const getFaceDescriptor = async (videoElement: HTMLVideoElement) => {
  const detection = await faceapi
    .detectSingleFace(videoElement)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    console.warn("NO_FACE_SIGHTED");
    return null;
  }

  // Returns the Float32Array descriptor
  return detection.descriptor;
};