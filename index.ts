import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} from 'firebase-functions/v2/firestore';
import { defineSecret, defineInt, defineString } from 'firebase-functions/params';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { GeoPoint, FieldValue } from 'firebase-admin/firestore';
import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import busboy from 'busboy';
import nodemailer from 'nodemailer';
import multer from 'multer';
import { adminActionSchema } from './src/schemas';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// --- Scaling & Configuration Parameters ---
const apiConcurrency = defineInt('API_CONCURRENCY', { default: 80 });
const apiRegion = defineString('API_REGION', { default: 'us-east1' });

// Define secrets for secure access
const adminEmailUser = defineSecret('ADMIN_EMAIL_USER');
const adminEmailPass = defineSecret('ADMIN_EMAIL_PASSWORD');
const myApiKey = defineSecret('MY_API_KEY');

// Apply global scaling options to all v2 functions
setGlobalOptions({
  region: apiRegion,
  concurrency: apiConcurrency,
});

// ============================================================================
// SECURE EXPRESS API
// ============================================================================
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Validation Middleware & Schemas ---

/**
 * Centralized Zod validation middleware.
 * Transforms and validates req.body, req.query, or req.params.
 */
const validate =
  (schema: { body?: z.ZodTypeAny; query?: z.ZodTypeAny; params?: z.ZodTypeAny }) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query);
      if (schema.params) req.params = schema.params.parse(req.params);
      next();
    } catch (error: any) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_FAILED',
        details: error.errors,
      });
    }
  };

// --- SPICE Sovereign Override Logic ---
let currentSovereignOverrideToken = process.env.IME_ROOT_SIGNATURE;

/**
 * Internal logic to validate local root access or standard handshake.
 */
function validateAccess(requestedToken: string | undefined, clientIp: string) {
  const LOCALHOST_IPS = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
  const isLocal = LOCALHOST_IPS.includes(clientIp);

  if (currentSovereignOverrideToken && requestedToken === currentSovereignOverrideToken) {
    if (isLocal) {
      return { authorized: true, bypass: true };
    } else {
      // CRITICAL BREACH: Token leaked outside local subnet
      currentSovereignOverrideToken = undefined;
      return { authorized: false, bypass: false, reason: 'SECURITY_BREACH_TOKEN_NULLIFIED' };
    }
  }
  return { authorized: false, bypass: false, reason: 'STANDARD_AUTH_REQUIRED' };
}

/**
 * Express Middleware: The SPICE Gatekeeper
 */
async function spiceGatekeeper(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  const clientIp = req.ip || req.connection.remoteAddress;

  const gateResult = validateAccess(token, clientIp);

  if (gateResult.authorized) {
    req.isSovereignRoot = gateResult.bypass;
    return next();
  }

  if (gateResult.reason === 'STANDARD_AUTH_REQUIRED') {
    return verifyFirebaseToken(req, res, next);
  }

  const err: any = new Error(`Forbidden: ${gateResult.reason}`);
  err.status = 403;
  err.code = 'SPICE_GATEKEEPER_DENIAL';
  return next(err);
}

/**
 * Express Middleware to Verify Firebase Auth Tokens
 */
async function verifyFirebaseToken(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err: any = new Error('Unauthorized: No token provided.');
    err.status = 401;
    err.code = 'AUTH_TOKEN_MISSING';
    return next(err);
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    error.status = 401;
    error.code = 'AUTH_TOKEN_INVALID';
    next(error);
  }
}

/**
 * Middleware to require 'admin' custom claim
 */
function requireAdmin(req: any, res: Response, next: NextFunction) {
  if (req.user?.admin === true) {
    next();
  } else {
    const err: any = new Error('Forbidden: Admin clearance required.');
    err.status = 403;
    err.code = 'ADMIN_ACCESS_DENIED';
    next(err);
  }
}

/**
 * Middleware Factory: Enforces a cooldown period for a specific action collection.
 * This allows sharing rate-limiting logic across different protocol endpoints.
 */
const enforceCooldown =
  (collectionName: string, cooldownMs: number = 24 * 60 * 60 * 1000) =>
  async (req: any, res: Response, next: NextFunction) => {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized: User context required.' });

    const docRef = db.collection(collectionName).doc(uid);

    try {
      const isRateLimited = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        if (doc.exists) {
          const lastAction = doc.data()?.lastAction;
          if (lastAction && typeof lastAction.toMillis === 'function') {
            if (Date.now() - lastAction.toMillis() < cooldownMs) {
              return true; // User is rate limited
            }
          }
        }
        transaction.set(docRef, { lastAction: FieldValue.serverTimestamp() }, { merge: true });
        return false; // Proceed
      });

      if (isRateLimited) {
        const hours = (cooldownMs / (60 * 60 * 1000)).toFixed(1).replace(/\.0$/, '');
        const err: any = new Error(`Too Many Requests: ${hours}-hour cooldown is active.`);
        err.status = 429;
        err.code = 'RATE_LIMIT_ACTIVE';
        return next(err);
      }
      next();
    } catch (error: any) {
      error.status = 500;
      error.code = 'RATE_LIMIT_VERIFICATION_FAILED';
      next(error);
    }
  };

// --- Routes ---
app.post('/root-operation', spiceGatekeeper, validate({}), (req: any, res) => {
  const status = req.isSovereignRoot ? 'LOCAL_ROOT' : 'STANDARD_USER';
  res.json({ message: `Operation executed under ${status} context.` });
});

app.get(
  '/secure-data',
  verifyFirebaseToken,
  enforceCooldown('secure_data_access', 60 * 60 * 1000),
  validate({}),
  (req: any, res: Response) => {
    res.json({ message: 'Access granted.', uid: req.user.uid, email: req.user.email });
  }
);

/**
 * upload-file: Streams a multipart/form-data file directly to Cloud Storage.
 * This replaces the base64-based Callable to support large file substrates
 * without exceeding memory limits.
 */
app.post('/upload-file', verifyFirebaseToken, requireAdmin, (req: any, res: Response, next: NextFunction) => {
  const metadata: Record<string, string> = {};
  const bb = busboy({ headers: req.headers });

  bb.on('field', (name: string, val: string) => {
    metadata[name] = val;
  });

  bb.on('file', (name: string, file: any, info: any) => {
    const { filename, mimeType } = info;
    const destinationPath = `uploads/${Date.now()}_${filename}`;
    const bucket = admin.storage().bucket();
    const fileRef = bucket.file(destinationPath);

    const stream = fileRef.createWriteStream({
      metadata: { contentType: mimeType },
    });

    file.pipe(stream);

    stream.on('finish', async () => {
      try {
        const [downloadUrl] = await fileRef.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000, // 1 hour
          version: 'v4',
        });
        res.json({ success: true, downloadUrl, destinationPath });
      } catch (error: any) {
        error.status = 500;
        error.code = 'SIGNED_URL_GENERATION_FAILED';
        next(error);
      }
    });

    stream.on('error', (err: any) => {
      err.status = 500;
      err.code = 'UPLOAD_STREAM_ERROR';
      next(err);
    });
  });

  bb.on('error', (err: any) => {
    err.status = 400;
    err.code = 'BUSBOY_PARSE_ERROR';
    next(err);
  });

  req.pipe(bb);
});
app.get('/admin-data', verifyFirebaseToken, requireAdmin, validate({}), (req, res) => {
  res.json({ message: 'Access granted to admin substrate.' });
});

app.post(
  '/admin-action',
  verifyFirebaseToken,
  requireAdmin,
  enforceCooldown('admin_actions'),
  validate({ body: adminActionSchema }),
  (req, res) => {
    res.json({ message: 'Admin action received successfully.', receivedData: req.body });
  }
);

/**
 * Executes a restricted daily action, enforcing a 24-hour cooldown period.
 * This matches the constraint logic defined for the 'daily_actions' collection.
 */
app.post(
  '/daily-action',
  verifyFirebaseToken,
  enforceCooldown('daily_actions'),
  validate({}),
  (req: any, res: Response) => {
    // Core protocol logic goes here
    res.json({ status: 'success', message: 'Daily action executed. Cooldown period initiated.' });
  }
);

/**
 * Global Error Handler
 * Catches unhandled errors across all Express routes and middlewares.
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[GLOBAL_API_ERROR]', err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    status: 'error',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred within the protocol API.',
  });
});

/**
 * Expose the Express app as a Firebase HTTP Function v2
 */
export const api = onRequest(
  {
    cors: true,
    memory: '1GiB',
    secrets: [adminEmailUser, adminEmailPass, myApiKey],
  },
  app
);

// ============================================================================
// CALLABLE FUNCTIONS
// ============================================================================

/**
 * generateUploadUrl: Generates a signed URL for direct-to-storage uploads.
 * Replaces the Express /generate-upload-url route for better isolation.
 */
export const generateUploadUrl = onCall(async (request) => {
  // Validate Admin Clearance
  if (!request.auth || !request.auth.token.admin) {
    throw new HttpsError('permission-denied', 'Admin clearance required for protocol uplink.');
  }

  const { filename, contentType, sessionId, chunkIndex, sha256Hash } = request.data;
  if (!filename || !contentType || !sessionId || chunkIndex === undefined || !sha256Hash) {
    throw new HttpsError('invalid-argument', 'Missing required chunking parameters or sha256Hash.');
  }

  try {
    const bucket = admin.storage().bucket();
    const destinationPath = `uploads/chunks/${sessionId}/${filename}.part_${chunkIndex}`;
    const fileRef = bucket.file(destinationPath);

    // Generate a signed URL that allows a PUT request for 15 minutes
    const [uploadUrl] = await fileRef.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType,
      extensionHeaders: {
        'x-goog-hash': `sha256=${sha256Hash}`
      }
    });

    return { uploadUrl, storagePath: destinationPath };
  } catch (error: any) {
    console.error('GENERATE_UPLOAD_URL: Error generating signed URL:', error);
    throw new HttpsError('internal', 'Failed to generate signed upload URL.', error.message);
  }
});

/**
 * getUploadStatus: Checks which chunks have already been uploaded for a session.
 * Allows the client to resume an upload after a refresh or network failure.
 */
export const getUploadStatus = onCall(async (request) => {
  if (!request.auth || !request.auth.token.admin) {
    throw new HttpsError('permission-denied', 'Admin clearance required.');
  }

  const { sessionId, filename } = request.data;
  if (!sessionId || !filename) {
    throw new HttpsError('invalid-argument', 'Missing sessionId or filename.');
  }

  try {
    const bucket = admin.storage().bucket();
    const prefix = `uploads/chunks/${sessionId}/`;
    
    // List all files in the session's chunk directory
    const [files] = await bucket.getFiles({ prefix });
    
    // Extract chunk indices from filenames (e.g., "filename.ext.part_4")
    const uploadedIndices = files
      .map(file => {
        const match = file.name.match(/\.part_(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((index): index is number => index !== null);

    return { uploadedIndices };
  } catch (error: any) {
    console.error('GET_UPLOAD_STATUS_ERROR:', error);
    throw new HttpsError('internal', 'Failed to retrieve upload status.', error.message);
  }
});

/**
 * saveUrbanAnchor Cloud Function
 *
 * Role: Persists a resolved urban anchor to the user's Firestore entity list.
 * This function is called by the client-side MunicipleMesh.vue component
 * via the callFirebaseFunction utility, ensuring secure, server-side data persistence.
 *
 * Parameters:
 *   - userId: The SUID of the user (string).
 *   - name: The name of the resolved urban anchor (string).
 *   - lat: The latitude coordinate of the anchor (number).
 *   - lng: The longitude coordinate of the anchor (number).
 *
 * Returns:
 *   - { success: boolean, message?: string, entityId?: string }
 */
export const saveUrbanAnchor = onCall(async (request) => {
  // 1. Authenticate the request: Ensure the user is logged in.
  if (!request.auth) {
    console.error('SAVE_URBAN_ANCHOR: Unauthorized access attempt. No authentication context.');
    throw new HttpsError('unauthenticated', 'Node not sighted. Authentication required.');
  }

  const { userId, name, lat, lng } = request.data;

  // 2. Validate input data
  if (!userId || !name || typeof lat !== 'number' || typeof lng !== 'number') {
    console.error('SAVE_URBAN_ANCHOR: Invalid input data provided.', { userId, name, lat, lng });
    throw new HttpsError('invalid-argument', 'Missing or invalid anchor data.');
  }

  // Ensure the userId from the request matches the authenticated user's UID
  if (request.auth.uid !== userId) {
    console.error('SAVE_URBAN_ANCHOR: Mismatched user ID. Attempted to save for another user.', {
      authUid: request.auth.uid,
      requestedUserId: userId,
    });
    throw new HttpsError('permission-denied', 'Cannot save anchor for another user.');
  }

  try {
    const userEntitiesRef = db.collection('users').doc(userId).collection('entities');
    const newEntityRef = await userEntitiesRef.add({
      name,
      type: 'UrbanAnchor_Entity', // Categorize as an Urban Anchor
      role: 'owner', // The user creating it is the owner
      operationalStatus: 'GROUNDED', // Initial status for a newly saved anchor
      coordinates: new GeoPoint(lat, lng), // Store as GeoPoint for geospatial queries
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log(
      `SAVE_URBAN_ANCHOR: Urban anchor "${name}" grounded for user ${userId}. Entity ID: ${newEntityRef.id}`
    );
    return {
      success: true,
      message: 'Urban anchor successfully grounded.',
      entityId: newEntityRef.id,
    };
  } catch (error: any) {
    console.error('SAVE_URBAN_ANCHOR: Failed to persist urban anchor to Firestore:', error);
    throw new HttpsError('internal', 'Failed to ground urban anchor.', error.message);
  }
});

// ============================================================================
// FIRESTORE TRIGGERS
// ============================================================================

/**
 * Persistent transporter instance to leverage connection pooling across invocations.
 */
let mailTransporter: nodemailer.Transporter | null = null;

/**
 * Internal helper to send protocol emails.
 */
async function sendProtocolEmail(options: nodemailer.SendMailOptions) {
  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: adminEmailUser.value(),
        pass: adminEmailPass.value(),
      },
    });
  }

  await mailTransporter.sendMail({
    from: '"Iopic Protocol System" <noreply@iopic.world>',
    ...options,
  });
}

/**
 * notifyAdminOnAccessRequest: Notify admins of new access requests.
 */
export const notifyAdminOnAccessRequest = onDocumentCreated(
  {
    document: 'access_requests/{requestId}',
    secrets: [adminEmailUser, adminEmailPass],
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    try {
      await sendProtocolEmail({
        to: 'admin@iopic.world',
        subject: `🚨 New Access Request: ${data.requestedRole}`,
        html: `<p>A user (${data.email}) has requested ${data.requestedRole} clearance.</p>`,
      });
    } catch (error) {
      console.error('❌ Failed to transmit admin notification:', error);
    }
  }
);

/**
 * notifyUserOnAccessRequestUpdate: Notify users of approval/denial.
 */
export const notifyUserOnAccessRequestUpdate = onDocumentUpdated(
  {
    document: 'access_requests/{requestId}',
    secrets: [adminEmailUser, adminEmailPass],
  },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    if (!beforeData || !afterData) return;

    if (beforeData.status !== 'Approved' && afterData.status === 'Approved') {
      await sendProtocolEmail({
        to: afterData.email,
        subject: '✅ Protocol Access Approved',
        html: `<p>Your request for ${afterData.requestedRole} has been approved.</p>`,
      });
    }
  }
);

/**
 * Internal helper for statistics aggregation.
 */
async function updateDailyStats(data: any, step: number) {
  const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
  const dateId = timestamp.toISOString().split('T')[0];
  const byteSize = data.byteSize || 0;
  const statsRef = db.collection('daily_stats').doc(dateId);

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(statsRef);
    if (!doc.exists) {
      transaction.set(statsRef, {
        emailCount: Math.max(0, step),
        totalBytes: Math.max(0, step * byteSize),
        lastUpdated: FieldValue.serverTimestamp(),
      });
    } else {
      transaction.update(statsRef, {
        emailCount: FieldValue.increment(step),
        totalBytes: FieldValue.increment(step * byteSize),
        lastUpdated: FieldValue.serverTimestamp(),
      });
    }
  });
}

export const aggregateDailyStats = onDocumentCreated('email_logs/{logId}', async (event) => {
  const data = event.data?.data();
  if (data) await updateDailyStats(data, 1);
});

export const decrementDailyStats = onDocumentDeleted('email_logs/{logId}', async (event) => {
  const data = event.data?.data();
  if (data) await updateDailyStats(data, -1);
});
