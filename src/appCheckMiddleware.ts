import * as admin from 'firebase-admin';
import type { Request, Response, NextFunction } from 'express';
import { validateServerEnv } from './env';

// Initialize Admin SDK using the validated environment
const env = validateServerEnv();

if (!admin.apps.length) {
  const useEmulator =
    process.env.APP_CHECK_EMULATOR_HOST || env.VITE_FIREBASE_PROJECT_ID.startsWith('demo-');

  if (useEmulator) {
    admin.initializeApp({
      projectId: env.VITE_FIREBASE_PROJECT_ID,
    });
    console.log(
      `[APP_CHECK_MIDDLEWARE] Initialized in Emulator mode for project: ${env.VITE_FIREBASE_PROJECT_ID}`
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: env.VITE_FIREBASE_PROJECT_ID,
    });
  }
}

/**
 * Express middleware to verify the Firebase App Check token.
 * Expects the 'X-Firebase-AppCheck' header as defined in c:\IO\IC\api.ts
 */
export const verifyAppCheckToken = async (req: Request, res: Response, next: NextFunction) => {
  const appCheckToken = req.header('X-Firebase-AppCheck');

  if (!appCheckToken) {
    return res.status(401).json({ error: 'App Check token is missing' });
  }

  try {
    // verifyToken returns a DecodedAppCheckToken on success
    const decodedToken = await admin.appCheck().verifyToken(appCheckToken);

    // Optionally attach the decoded token to the request for further logic
    (req as any).appCheckToken = decodedToken;

    return next();
  } catch (err) {
    console.error('App Check verification failed:', err);
    return res.status(403).json({ error: 'Unauthorized: Invalid App Check token' });
  }
};
