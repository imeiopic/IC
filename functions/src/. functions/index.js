const functions = require('firebase-functions');
const admin = require('firebase-admin');
const vision = require('@google-cloud/vision'); // Re-enabling for Safe Search detection

const { Configuration, PlaidApi, Products, CountryCode } = require('plaid'); // Import Plaid
const faceRecognitionService = require('./faceRecognitionService'); // Import the face recognition service

admin.initializeApp();
const visionClient = new vision.ImageAnnotatorClient(); // Initializing Cloud Vision client

const remoteConfig = admin.remoteConfig(); // Initialize Firebase Remote Config client

// Default levels to consider as inappropriate. This will be used if Remote Config fails or is not set.
let SAFE_SEARCH_THRESHOLD = ['LIKELY', 'VERY_LIKELY']; // Levels to consider as inappropriate
let DEFAULT_RECOGNITION_THRESHOLD = 0.6; // Default threshold for face recognition

// Define Plaid secrets
const plaidClientId = defineSecret('PLAID_CLIENT_ID');
const plaidSecret = defineSecret('PLAID_SECRET');

// Flag to ensure Remote Config is loaded only once per function instance lifecycle
let remoteConfigLoaded = false;

/**
 * Fetches and parses various configuration values from Firebase Remote Config.
 * This function is designed to be called once per function instance to optimize performance.
 */
async function loadRemoteConfigValues() {
  if (remoteConfigLoaded) {
    functions.logger.debug('Remote Config values already loaded for this instance.');
    return;
  }

  try {
    functions.logger.info('Attempting to fetch Remote Config values...');
    const template = await remoteConfig.getTemplate();
    const safeSearchParam = template.parameters.safe_search_threshold_levels;

    if (safeSearchParam && safeSearchParam.defaultValue && safeSearchParam.defaultValue.value) {
      const configValue = safeSearchParam.defaultValue.value;
      const parsedThreshold = configValue
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);
      if (parsedThreshold.length > 0) {
        SAFE_SEARCH_THRESHOLD = parsedThreshold;
        functions.logger.info(
          `SAFE_SEARCH_THRESHOLD updated from Remote Config: [${SAFE_SEARCH_THRESHOLD.join(', ')}]`
        );
      } else {
        functions.logger.warn(
          'Remote Config parameter "safe_search_threshold_levels" was empty or invalid after parsing. Using default.'
        );
      }
    } else {
      functions.logger.info(
        'Remote Config parameter "safe_search_threshold_levels" not found or has no default value. Using default.'
      );
    }

    // Fetch and parse biometric_recognition_threshold
    const recognitionThresholdParam = template.parameters.biometric_recognition_threshold;
    if (
      recognitionThresholdParam &&
      recognitionThresholdParam.defaultValue &&
      recognitionThresholdParam.defaultValue.value
    ) {
      const configValue = parseFloat(recognitionThresholdParam.defaultValue.value);
      if (!isNaN(configValue)) {
        DEFAULT_RECOGNITION_THRESHOLD = configValue;
        functions.logger.info(
          `DEFAULT_RECOGNITION_THRESHOLD updated from Remote Config: ${DEFAULT_RECOGNITION_THRESHOLD}`
        );
      } else {
        functions.logger.warn(
          'Remote Config parameter "biometric_recognition_threshold" was invalid. Using default.'
        );
      }
    } else {
      functions.logger.info(
        'Remote Config parameter "biometric_recognition_threshold" not found or has no default value. Using default.'
      );
    }
    remoteConfigLoaded = true;
  } catch (error) {
    functions.logger.error('Error fetching Remote Config values:', error); // Log the error for debugging
    functions.logger.warn('Failed to load Remote Config. Using default SAFE_SEARCH_THRESHOLD.');
  }
}

exports.onBiometricCapture = functions.storage.object().onFinalizing(async (object) => {
  const fileBucket = object.bucket;
  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.
  const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

  functions.logger.info(`Processing file: ${filePath} in bucket: ${fileBucket}`, {
    contentType,
    metageneration
  });

  // Check if the file is an image.
  if (!contentType || !contentType.startsWith('image/')) {
    functions.logger.info(`This is not an image. Skipping: ${filePath}`);
    return null;
  }

  // Determine if we are in development mode and get required suffix
  const isDevMode = functions.config().biometric?.dev_mode === 'true';
  const requiredSuffix = functions.config().biometric?.capture_suffix || '01.img';

  // Only process specific image names for biometric sighting
  if (!filePath.endsWith(requiredSuffix)) {
    functions.logger.info(
      `File name does not match required suffix '${requiredSuffix}'. Skipping: ${filePath}`
    );
    return null;
  }

  const pathSegments = filePath.split('/');
  if (pathSegments.length < 2) {
    functions.logger.warn(`File path too short to extract userId. Skipping: ${filePath}`);
    return null;
  }
  const userId = pathSegments[1]; // Assuming path format: `biometrics/{userId}/{imageName}`

  const bucket = admin.storage().bucket(fileBucket);
  const file = bucket.file(filePath);

  try {
    // Load Remote Config values (will only run once per instance)
    await loadRemoteConfigValues();

    functions.logger.info(`Loading face-api models for capture for user: ${userId}`);
    await faceRecognitionService.loadModels(); // Load models once per function instance

    // --- Cloud Vision: Safe Search Detection ---
    functions.logger.info(
      `Performing Safe Search detection for capture for user: ${userId} (from Storage)`
    ); // Corrected to use imageUri
    const [safeSearchResult] = await visionClient.safeSearchDetection({
      image: { source: { imageUri: file.publicUrl() } }
    });
    const safeSearch = safeSearchResult.safeSearchAnnotation;

    if (safeSearch) {
      const isUnsafe =
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.adult) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.spoof) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.medical) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.violence) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.racy);

      if (isUnsafe) {
        functions.logger.warn(
          `Safe Search detected potentially inappropriate content for user: ${userId} on file: ${filePath}`,
          safeSearch
        );
        // Update Firestore to reflect unsafe image and prevent biometric verification
        await admin.firestore().doc(`users/${userId}`).update({
          biometricVerified: false,
          biometricError: 'Image flagged by Safe Search',
          lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
        });
        return null; // Stop processing this image
      }
    }

    functions.logger.info(`Downloading image for capture for user: ${userId} from ${filePath}`);
    const [imageBuffer] = await file.download(); // Download image to buffer

    functions.logger.info(
      `Attempting face detection and description for capture for user: ${userId}`
    );
    const detection = await faceRecognitionService.detectFace(imageBuffer);

    if (detection && detection.descriptor) {
      functions.logger.info(`Face detected and descriptor generated for user: ${userId}.`);
      // Generate a signed URL for the image
      const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' });

      // Update Firestore document
      await admin
        .firestore()
        .doc(`users/${userId}`)
        .update({
          biometricVerified: true,
          sightingUrl: url,
          velocity: isDevMode ? 1.0 : 8.09, // Different velocity for dev mode
          biometricDescriptor: Array.from(detection.descriptor), // Store descriptor as plain array
          lastBiometricUpdate: admin.firestore.FieldValue.serverTimestamp()
        });
      functions.logger.info(`Firestore updated for user: ${userId} with biometric verification.`);
    } else {
      functions.logger.info(
        `No face detected or descriptor not generated for capture for user: ${userId} on file: ${filePath}`
      );
      // Optionally, update Firestore to indicate no face found or reset verification
      await admin.firestore().doc(`users/${userId}`).update({
        biometricVerified: false,
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    functions.logger.error(
      `Error during biometric capture processing for user ${userId} and file ${filePath}:`,
      error
    );
    // Optionally, update Firestore to log the error or set biometricVerified to false
    await admin
      .firestore()
      .doc(`users/${userId}`)
      .update({
        biometricDescriptor: admin.firestore.FieldValue.delete(), // Remove descriptor on error
        biometricVerified: false,
        biometricError: error.message,
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      })
      .catch((firestoreError) => {
        functions.logger.error(
          `Failed to update Firestore with biometric error for user ${userId}:`,
          firestoreError
        );
      });
    return null; // Indicate failure
  }

  return null;
});

/**
 * Firebase Cloud Function triggered when an image is uploaded to Storage for biometric login/verification.
 * This function detects the presence of a face and updates the user's login attempt status in Firestore.
 * This updated function now performs face *recognition* by comparing descriptors.
 *
 * (identity verification). It only confirms the *presence* of a face. For true biometric login,
 * a face recognition service/model would be needed to compare the uploaded face against a stored one.
 */
exports.onBiometricLogin = functions.storage.object().onFinalizing(async (object) => {
  const fileBucket = object.bucket;
  const filePath = object.name;
  const contentType = object.contentType;
  const metageneration = object.metageneration;

  functions.logger.info(
    `Processing biometric login attempt file: ${filePath} in bucket: ${fileBucket}`,
    {
      contentType,
      metageneration
    }
  );

  if (!contentType || !contentType.startsWith('image/')) {
    functions.logger.info(`This is not an image for biometric login. Skipping: ${filePath}`);
    return null;
  }

  // Get the required suffix for login images from Firebase config, defaulting to 'login.img'
  const requiredSuffix = functions.config().biometric?.login_suffix || 'login.img'; // Specific suffix for login
  let recognitionThreshold = DEFAULT_RECOGNITION_THRESHOLD; // Will be updated by Remote Config

  if (!filePath.endsWith(requiredSuffix)) {
    functions.logger.info(
      `File name does not match required login suffix '${requiredSuffix}'. Skipping: ${filePath}`
    );
    return null;
  }

  const pathSegments = filePath.split('/');
  if (pathSegments.length < 2) {
    functions.logger.warn(
      `File path too short to extract userId for biometric login. Skipping: ${filePath}`
    );
    return null;
  }
  const userId = pathSegments[1]; // Assuming path format: `biometrics/{userId}/{imageName}`

  try {
    // Load Remote Config values (will only run once per instance)
    await loadRemoteConfigValues();
    // After loading, DEFAULT_RECOGNITION_THRESHOLD will hold the RC value or its initial default
    recognitionThreshold = DEFAULT_RECOGNITION_THRESHOLD;

    functions.logger.info(
      `Attempting face detection for biometric login for user: ${userId} on file: ${filePath}`
    );

    // --- Cloud Vision: Safe Search Detection ---
    functions.logger.info(
      `Performing Safe Search detection for login for user: ${userId} (from Storage)`
    ); // Corrected to use imageUri
    const [safeSearchResult] = await visionClient.safeSearchDetection({
      image: { source: { imageUri: file.publicUrl() } }
    });
    const safeSearch = safeSearchResult.safeSearchAnnotation;

    if (safeSearch) {
      const isUnsafe =
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.adult) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.spoof) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.medical) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.violence) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.racy);

      if (isUnsafe) {
        functions.logger.warn(
          `Safe Search detected potentially inappropriate content for user: ${userId} on file: ${filePath}`,
          safeSearch
        );
        // Update Firestore to reflect unsafe image and fail login attempt
        await admin.firestore().doc(`users/${userId}`).update({
          biometricVerified: false,
          biometricLoginStatus: 'image_flagged_unsafe',
          lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
        });
        return null; // Stop processing this image
      }
    }
    await faceRecognitionService.loadModels(); // Load models once per function instance

    functions.logger.info(`Downloading image for login for user: ${userId} from ${filePath}`);
    const [loginImageBuffer] = await file.download(); // Download login image to buffer

    functions.logger.info(
      `Attempting face detection and description for login for user: ${userId}`
    );
    const loginDetection = await faceRecognitionService.detectFace(loginImageBuffer);

    if (!loginDetection || !loginDetection.descriptor) {
      functions.logger.info(
        `No face detected or descriptor not generated in login image for user: ${userId}.`
      );
      await admin.firestore().doc(`users/${userId}`).update({
        biometricVerified: false, // No face in login image
        biometricLoginStatus: 'no_face_detected',
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
      return null;
    }

    // Retrieve stored descriptor
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const userData = userDoc.data();
    const storedDescriptorArray = userData?.biometricDescriptor;

    if (
      !storedDescriptorArray ||
      !Array.isArray(storedDescriptorArray) ||
      storedDescriptorArray.length === 0
    ) {
      functions.logger.warn(
        `No stored biometric descriptor found for user: ${userId}. Cannot perform recognition.`
      );
      await admin.firestore().doc(`users/${userId}`).update({
        biometricVerified: false,
        biometricLoginStatus: 'no_stored_descriptor',
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
      return null;
    }

    const storedDescriptor = new Float32Array(storedDescriptorArray);
    const distance = faceRecognitionService.compareDescriptors(
      storedDescriptor,
      loginDetection.descriptor
    );

    const match = distance < recognitionThreshold;

    functions.logger.info(
      `Biometric login result for user ${userId}: Match: ${match}, Distance: ${distance.toFixed(
        4
      )}, Threshold: ${recognitionThreshold}`
    );

    if (match) {
      functions.logger.info(`Face recognized for biometric login for user: ${userId}.`);
      await admin.firestore().doc(`users/${userId}`).update({
        biometricVerified: true,
        biometricLoginStatus: 'success',
        biometricDistance: distance,
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
      functions.logger.info(
        `Firestore updated for user: ${userId} with successful biometric login attempt (face recognized).`
      );
    } else {
      functions.logger.info(`Face not recognized for biometric login for user: ${userId}.`);
      await admin.firestore().doc(`users/${userId}`).update({
        biometricVerified: false,
        biometricLoginStatus: 'failed_recognition',
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
      functions.logger.info(
        `Firestore updated for user: ${userId} with failed biometric login attempt (face not recognized).`
      );
    }
  } catch (error) {
    functions.logger.error(
      `Error during biometric login processing for user ${userId} and file ${filePath}:`,
      error
    );
    await admin
      .firestore()
      .doc(`users/${userId}`)
      .update({
        biometricDescriptor: admin.firestore.FieldValue.delete(), // Clear descriptor on error to force re-enrollment
        biometricDistance: null,
        biometricVerified: false,
        biometricError: `Biometric login error: ${error.message}`,
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      })
      .catch((firestoreError) => {
        functions.logger.error(
          `Failed to update Firestore with biometric login error for user ${userId}:`,
          firestoreError
        );
      });
    return null;
  }
  return null;
});

/**
 * Callable Cloud Function for biometric enrollment.
 * Takes a base64 image and a liveness action, performs face detection,
 * Safe Search, and stores the face descriptor in Firestore.
 */
exports.biometricEnroll = functions.https.onCall(async (data, context) => {
  // 1. Authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  const requestorUid = context.auth.uid;

  // 2. Data Validation
  const { uid, imageData, livenessAction } = data;

  if (uid !== requestorUid) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'UID in request does not match authenticated user.'
    );
  }
  if (
    !imageData ||
    typeof imageData !== 'string' ||
    !imageData.startsWith('data:image/jpeg;base64,')
  ) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid or missing imageData. Must be a base64 JPEG data URL.'
    );
  }
  if (!livenessAction || typeof livenessAction !== 'string') {
    functions.logger.warn(`Liveness action not provided or invalid for user ${uid}.`);
    // Not a critical error, but good to log
  }

  try {
    // Load Remote Config values (will only run once per instance)
    await loadRemoteConfigValues();

    // Convert base64 image data to Buffer
    const base64Image = imageData.split(',')[1];
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // --- Cloud Vision: Safe Search Detection ---
    functions.logger.info(`Performing Safe Search detection for enrollment for user: ${uid}`);
    const [safeSearchResult] = await visionClient.safeSearchDetection({
      image: { content: base64Image }
    });
    const safeSearch = safeSearchResult.safeSearchAnnotation;

    if (safeSearch) {
      const isUnsafe =
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.adult) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.spoof) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.medical) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.violence) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.racy);

      if (isUnsafe) {
        functions.logger.warn(
          `Safe Search detected potentially inappropriate content for user: ${uid} during enrollment.`,
          safeSearch
        );
        await admin.firestore().doc(`users/${uid}`).update({
          biometricEnrolled: false,
          biometricError: 'Enrollment image flagged by Safe Search',
          lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: false, message: 'Enrollment failed: Image flagged as inappropriate.' };
      }
    }

    // --- Face Recognition Service ---
    await faceRecognitionService.loadModels();
    functions.logger.info(
      `Attempting face detection and descriptor generation for enrollment for user: ${uid}`
    );
    const detection = await faceRecognitionService.detectFace(imageBuffer);

    if (!detection || !detection.descriptor) {
      functions.logger.info(
        `No face detected or descriptor not generated for enrollment for user: ${uid}.`
      );
      await admin.firestore().doc(`users/${uid}`).update({
        biometricEnrolled: false,
        biometricError: 'No face detected in enrollment image.',
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { success: false, message: 'Enrollment failed: No face detected.' };
    }

    // Acknowledge liveness action (for future advanced checks)
    functions.logger.info(`Liveness action for enrollment: ${livenessAction} for user: ${uid}`);

    // Store descriptor in Firestore
    await admin
      .firestore()
      .doc(`users/${uid}`)
      .update({
        biometricEnrolled: true,
        biometricDescriptor: Array.from(detection.descriptor), // Store as plain array
        biometricLivenessSequence: livenessAction, // Store the liveness action sequence for future validation
        biometricError: admin.firestore.FieldValue.delete(), // Clear any previous errors
        lastBiometricUpdate: admin.firestore.FieldValue.serverTimestamp()
      });

    functions.logger.info(`Biometric enrollment successful for user: ${uid}.`);
    return { success: true, message: 'Biometric enrollment successful.' };
  } catch (error) {
    functions.logger.error(`Error during biometric enrollment for user ${uid}:`, error);
    await admin
      .firestore()
      .doc(`users/${uid}`)
      .update({
        biometricEnrolled: false,
        biometricError: `Enrollment failed: ${error.message}`,
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      })
      .catch((e) =>
        functions.logger.error(`Failed to update Firestore with enrollment error for ${uid}:`, e)
      );
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An unexpected error occurred during enrollment.'
    );
  }
});

/**
 * Callable Cloud Function for biometric verification (login).
 * Takes a base64 image and a liveness action, performs face detection,
 * Safe Search, and compares the face descriptor against a stored one.
 */
exports.biometricVerify = functions.https.onCall(async (data, context) => {
  // 1. Authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  const requestorUid = context.auth.uid;

  // 2. Data Validation
  const { uid, imageData, livenessAction } = data;

  if (uid !== requestorUid) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'UID in request does not match authenticated user.'
    );
  }
  if (
    !imageData ||
    typeof imageData !== 'string' ||
    !imageData.startsWith('data:image/jpeg;base64,')
  ) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid or missing imageData. Must be a base64 JPEG data URL.'
    );
  }
  if (!livenessAction || typeof livenessAction !== 'string') {
    functions.logger.warn(`Liveness action not provided or invalid for user ${uid}.`);
  }

  try {
    // Load Remote Config values (will only run once per instance)
    await loadRemoteConfigValues();
    const recognitionThreshold = DEFAULT_RECOGNITION_THRESHOLD;

    // Convert base64 image data to Buffer
    const base64Image = imageData.split(',')[1];
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // --- Cloud Vision: Safe Search Detection ---
    functions.logger.info(`Performing Safe Search detection for verification for user: ${uid}`);
    const [safeSearchResult] = await visionClient.safeSearchDetection({
      image: { content: base64Image }
    });
    const safeSearch = safeSearchResult.safeSearchAnnotation;

    if (safeSearch) {
      const isUnsafe =
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.adult) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.spoof) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.medical) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.violence) ||
        SAFE_SEARCH_THRESHOLD.includes(safeSearch.racy);

      if (isUnsafe) {
        functions.logger.warn(
          `Safe Search detected potentially inappropriate content for user: ${uid} during verification.`,
          safeSearch
        );
        await admin.firestore().doc(`users/${uid}`).update({
          biometricVerified: false,
          biometricLoginStatus: 'image_flagged_unsafe',
          lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
        });
        return {
          success: false,
          message: 'Verification failed: Image flagged as inappropriate.',
          biometricLoginStatus: 'image_flagged_unsafe'
        };
      }
    }

    // --- Face Recognition Service ---
    await faceRecognitionService.loadModels();
    functions.logger.info(
      `Attempting face detection and descriptor generation for verification for user: ${uid}`
    );
    const loginDetection = await faceRecognitionService.detectFace(imageBuffer);

    if (!loginDetection || !loginDetection.descriptor) {
      functions.logger.info(
        `No face detected or descriptor not generated in login image for user: ${uid}.`
      );
      await admin.firestore().doc(`users/${uid}`).update({
        biometricVerified: false,
        biometricLoginStatus: 'no_face_detected',
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
      return {
        success: false,
        message: 'Verification failed: No face detected.',
        biometricLoginStatus: 'no_face_detected'
      };
    }

    // Acknowledge liveness action
    functions.logger.info(`Liveness action for verification: ${livenessAction} for user: ${uid}`);

    // Retrieve stored descriptor
    const userDoc = await admin.firestore().doc(`users/${uid}`).get();
    const userData = userDoc.data();
    const storedDescriptorArray = userData?.biometricDescriptor;

    // --- Liveness Sequence Validation ---
    const storedLivenessSequence = userData?.biometricLivenessSequence;
    if (
      !storedLivenessSequence ||
      typeof storedLivenessSequence !== 'string' ||
      storedLivenessSequence !== livenessAction
    ) {
      functions.logger.warn(
        `Liveness sequence mismatch or missing for user: ${uid}. Expected: ${storedLivenessSequence}, Received: ${livenessAction}`
      );
      await admin.firestore().doc(`users/${uid}`).update({
        biometricVerified: false,
        biometricLoginStatus: 'liveness_mismatch',
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
      return {
        success: false,
        message: 'Verification failed: Liveness check mismatch.',
        biometricLoginStatus: 'liveness_mismatch'
      };
    }

    if (
      !storedDescriptorArray ||
      !Array.isArray(storedDescriptorArray) ||
      storedDescriptorArray.length === 0
    ) {
      functions.logger.warn(
        `No stored biometric descriptor found for user: ${uid}. Cannot perform recognition.`
      );
      await admin.firestore().doc(`users/${uid}`).update({
        biometricVerified: false,
        biometricLoginStatus: 'no_stored_descriptor',
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
      return {
        success: false,
        message: 'Verification failed: No biometric profile found.',
        biometricLoginStatus: 'no_stored_descriptor'
      };
    }

    const storedDescriptor = new Float32Array(storedDescriptorArray);
    const distance = faceRecognitionService.compareDescriptors(
      storedDescriptor,
      loginDetection.descriptor
    );

    const match = distance < recognitionThreshold;

    functions.logger.info(
      `Biometric verification result for user ${uid}: Match: ${match}, Distance: ${distance.toFixed(
        4
      )}, Threshold: ${recognitionThreshold}`
    );

    if (match) {
      functions.logger.info(`Face recognized for biometric verification for user: ${uid}.`);
      await admin.firestore().doc(`users/${uid}`).update({
        biometricVerified: true,
        biometricLoginStatus: 'success',
        biometricDistance: distance,
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, message: 'Biometric verification successful.' };
    } else {
      functions.logger.info(`Face not recognized for biometric verification for user: ${uid}.`);
      await admin.firestore().doc(`users/${uid}`).update({
        biometricVerified: false,
        biometricLoginStatus: 'failed_recognition',
        biometricDistance: distance,
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
      return {
        success: false,
        message: 'Verification failed: Face not recognized.',
        biometricLoginStatus: 'failed_recognition'
      };
    }
  } catch (error) {
    functions.logger.error(`Error during biometric verification for user ${uid}:`, error);
    await admin
      .firestore()
      .doc(`users/${uid}`)
      .update({
        biometricVerified: false,
        biometricLoginStatus: 'internal_error',
        biometricError: `Verification failed: ${error.message}`,
        lastBiometricAttempt: admin.firestore.FieldValue.serverTimestamp()
      })
      .catch((e) =>
        functions.logger.error(`Failed to update Firestore with verification error for ${uid}:`, e)
      );
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An unexpected error occurred during verification.'
    );
  }
});

/**
 * Callable Cloud Function to allow a user to save an "ideal" personal location (e.g., Home, Work).
 * This location can later be used for context-aware features, such as speeding up login
 * from trusted locations.
 */
exports.saveIdealLocation = functions.https.onCall(async (data, context) => {
  // 1. Authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  const requestorUid = context.auth.uid;

  // 2. Data Validation
  const { locationName, latitude, longitude, radiusKm } = data;

  if (!locationName || typeof locationName !== 'string' || locationName.trim() === '') {
    throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid locationName.');
  }
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid latitude. Must be a number between -90 and 90.'
    );
  }
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid longitude. Must be a number between -180 and 180.'
    );
  }
  // Radius is optional, default to 0.05 km (50 meters) if not provided or invalid
  const effectiveRadiusKm = typeof radiusKm === 'number' && radiusKm >= 0 ? radiusKm : 0.05;

  const firestore = admin.firestore();
  const userDocRef = firestore.collection('users').doc(requestorUid);

  try {
    // 3. Prepare location data
    const newLocationData = {
      latitude: latitude,
      longitude: longitude,
      radiusKm: effectiveRadiusKm,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 4. Update user's idealLocations map
    // Use FieldValue.set to update a specific key within the map
    await userDocRef.update({
      [`idealLocations.${locationName.trim()}`]: newLocationData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    functions.logger.info(
      `User ${requestorUid} saved ideal location: ${locationName} at [${latitude}, ${longitude}]`
    );
    return {
      success: true,
      message: `Location '${locationName}' saved successfully.`,
      location: { name: locationName, ...newLocationData }
    };
  } catch (error) {
    functions.logger.error(`Error saving ideal location for user ${requestorUid}:`, error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An unexpected error occurred while saving the location.'
    );
  }
});
