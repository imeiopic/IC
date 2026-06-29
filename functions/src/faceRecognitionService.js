// c:\IO\IC\functions\src\faceRecognitionService.js
const faceapi = require('@vladmandic/face-api');
const { Canvas, Image, ImageData, loadImage } = require('canvas');
const functions = require('firebase-functions'); // For logging

// Monkey-patch face-api.js with canvas for Node.js environment
// This makes face-api.js compatible with image buffers in Node.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Define model paths. These models need to be downloaded and placed
// in a 'models' directory relative to your Cloud Function's root.
const MODEL_URL = './models';

let modelsLoaded = false;

/**
 * Loads the necessary face-api.js models (TinyFaceDetector, FaceLandmark68Net, FaceRecognitionNet).
 * Models are loaded only once per function instance to optimize performance.
 * @returns {Promise<void>}
 */
async function loadModels() {
  if (modelsLoaded) {
    functions.logger.info('Face-api.js models already loaded.');
    return;
  }
  try {
    functions.logger.info('Loading face-api.js models...');
    await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
    modelsLoaded = true;
    functions.logger.info('Face-api.js models loaded successfully.');
  } catch (error) {
    functions.logger.error('Failed to load face-api.js models:', error);
    throw new Error(
      'Failed to load face-api.js models. Ensure they are in the "models" directory.'
    );
  }
}

/**
 * Detects a face in the provided image buffer and computes its descriptor.
 * @param {Buffer} imageBuffer - The image data as a Buffer.
 * @returns {Promise<{descriptor: Float32Array}|null>} An object containing the face descriptor, or null if no face is detected.
 */
async function detectFace(imageBuffer) {
  try {
    // Load image from buffer using canvas.loadImage
    const img = await loadImage(imageBuffer);

    // Perform face detection, landmark detection, and compute face descriptor
    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length > 0) {
      functions.logger.info(
        `Detected ${detections.length} face(s). Returning descriptor of the first face.`
      );
      return { descriptor: detections[0].descriptor };
    } else {
      functions.logger.info('No face detected in the image.');
      return null;
    }
  } catch (error) {
    functions.logger.error('Error during face detection:', error);
    throw new Error(`Face detection failed: ${error.message}`);
  }
}

/**
 * Compares two face descriptors and returns their Euclidean distance.
 * A smaller distance indicates higher similarity.
 * @param {Float32Array} descriptor1 - The first face descriptor.
 * @param {Float32Array} descriptor2 - The second face descriptor.
 * @returns {number} The Euclidean distance between the two descriptors.
 */
function compareDescriptors(descriptor1, descriptor2) {
  if (!descriptor1 || !descriptor2) {
    throw new Error('Both descriptors must be provided for comparison.');
  }
  return faceapi.euclideanDistance(descriptor1, descriptor2);
}

module.exports = {
  loadModels,
  detectFace,
  compareDescriptors
};
