import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Realtime Database
export const rtdb = getDatabase(app);
export const firestore = db; // Export alias for compatibility with legacy imports

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);
export { storageRef, uploadBytes, getDownloadURL, deleteObject };

export const appCheck = null; // Initialize this with your actual App Check provider

// Initialize Functions
export const functions = getFunctions(app);

// Export pre-configured HTTPS Callables
export const biometricVerifyCallable = httpsCallable(functions, 'biometricVerify');
export const biometricEnrollCallable = httpsCallable(functions, 'biometricEnroll');
export const verify2FaCallable = httpsCallable(functions, 'verify2fa');
export const send2faCallable = httpsCallable(functions, 'send2faCode');