const functions = require('firebase-functions');
const admin = require('firebase-admin');
const vision = require('@google-cloud/vision');

admin.initializeApp();
const visionClient = new vision.ImageAnnotatorClient();

exports.onImageSighting = functions.storage.object().onFinalizing(async (object) => {
  if (!object.name.endsWith('01.img')) return;

  const userId = object.name.split('/')[1];
  const bucket = admin.storage().bucket(object.bucket);
  const file = bucket.file(object.name);

  // Sight the Face via Cloud Vision
  const [result] = await visionClient.faceDetection(`gs://${object.bucket}/${object.name}`);
  const faces = result.faceAnnotations;

  if (faces && faces.length > 0) {
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' });

    await admin.firestore().doc(`users/${userId}`).update({
      biometricVerified: true,
      sightingUrl: url,
      velocity: 8.09
    });
  }
});
