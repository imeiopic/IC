import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, set, connectDatabaseEmulator } from "firebase/database";
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

// 1. Core Configuration
const firebaseConfig = window.__APP_CONFIG__?.firebase || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL // ADD THIS to your .env
};

// 2. Initialize App Substrate
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 3. Manifest Service Instances
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const rtdb = getDatabase(app); // RTD Instance Grounded

// 4. Emulator Handshake
const useEmulator =
  window.__APP_CONFIG__?.useEmulator ??
  (import.meta.env.DEV ||
    import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' ||
    window.location.hostname === 'localhost');

if (useEmulator) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectDatabaseEmulator(rtdb, 'localhost', 9000); // Connect RTD to Emulator
  console.log('--- 16-THREAD EMULATORS ACTIVE: FS(8080), AUTH(9099), RTD(9000) ---');
}

// 5. App Check Integrity
const appCheckSiteKey = window.__APP_CONFIG__?.appCheckSiteKey || import.meta.env.VITE_APP_CHECK_SITE_KEY;
let appCheck: AppCheck | undefined;

if (appCheckSiteKey) {
  if (useEmulator) {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN =
      window.__APP_CONFIG__?.appCheckDebugToken ||
      import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN ||
      true;
  }
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true
  });
}

// 6. High-Velocity Pulse Export
export const broadcastPulse = (uid: string, location: object) => {
  const pulseRef = ref(rtdb, 'pulses/' + uid);
  set(pulseRef, {
    active: true,
    coords: location,
    timestamp: Date.now()
  });
};

export { app, db, auth, storage, rtdb, appCheck };