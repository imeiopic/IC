import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from 'firebase/app-check';

declare global {
  interface Window {
    __APP_CONFIG__?: {
      firebase?: Record<string, string>;
      useEmulator?: boolean;
      appCheckSiteKey?: string;
      appCheckDebugToken?: string | boolean;
    };
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

// Prioritize runtime window config, fallback to build-time env vars
const firebaseConfig = window.__APP_CONFIG__?.firebase || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app); // Firestore instance
const auth = getAuth(app); // Auth instance
const storage = getStorage(app); // Storage instance

// Redirect to emulator in development mode or if explicitly requested via environment variable.
// This allows 'npm run preview' builds to connect to local emulators when needed.
const useEmulator =
  window.__APP_CONFIG__?.useEmulator ??
  (import.meta.env.DEV ||
    import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' ||
    window.location.hostname === 'localhost');

if (useEmulator) {
  // Note: 'localhost' is used here.
  // If testing on physical mobile devices, use your machine's IP.
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099'); // Connect to Auth Emulator
  console.log('--- Connected to Firestore Emulator ---');
  console.log('--- Connected to Auth Emulator ---');
}

const appCheckSiteKey =
  window.__APP_CONFIG__?.appCheckSiteKey || import.meta.env.VITE_APP_CHECK_SITE_KEY;

let appCheck: AppCheck | undefined;

if (appCheckSiteKey) {
  if (useEmulator) {
    // Enable debug mode so App Check works locally with emulators
    window.FIREBASE_APPCHECK_DEBUG_TOKEN =
      window.__APP_CONFIG__?.appCheckDebugToken ||
      import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN ||
      true;
  }
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true // Refresh tokens automatically in the background
  });
}

export { app, db, auth, storage, appCheck }; // Export app, db, auth, storage, and appCheck
