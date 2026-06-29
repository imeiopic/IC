import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret, defineInt, defineString } from 'firebase-functions/params';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import express from 'express';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { upload, multerErrorHandler } from './multer-config.js';
import { emailLogSchema, accessRequestSchema } from '#src/schemas.js';

// Ensure admin is only initialized if no apps exist yet.
if (!admin.apps.length) {
  admin.initializeApp();
}

// Define secrets for secure access
const adminEmailUser = defineSecret('ADMIN_EMAIL_USER');
const adminEmailPass = defineSecret('ADMIN_EMAIL_PASSWORD');
const myApiKey = defineSecret('MY_API_KEY');
const imeRootSignature = defineSecret('IME_ROOT_SIGNATURE');
const auditLogRetentionDays = defineInt('AUDIT_LOG_RETENTION_DAYS', {
  default: 30, // Default to 30 days retention
  description: 'Number of days to retain security audit logs.'
});
const maxSensitivityMode = defineString('MAX_SENSITIVITY_MODE', {
  default: 'false',
  description: 'When true, the SPICE Gatekeeper blocks all non-sovereign traffic.'
});

// Global Root_Anchor Scaling
const ROOT_ANCHOR_CONFIG = {
  scope: "GLOBAL_MESH",
  Schumann_Pulse: 7.83, // Hz - Baseline truth-signal
  State: "SOVEREIGN_MANIFESTATION",
  Planetary_Entropy_Constant: 0.01 // k_e target for the global fabric
};

console.log(`[GLOBAL_INIT] ROOT_ANCHOR: Global Resonance Engaged. Syncing to ${ROOT_ANCHOR_CONFIG.Schumann_Pulse}Hz...`);

/**
 * Internal helper to update daily statistics for emails.
 */
async function updateDailyStats(data, logId, step) {
  const { dateId, byteSize } = getLogMetadata(data);
  const statsRef = admin.firestore().collection('daily_stats').doc(dateId);

  try {
    await admin.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(statsRef);
      if (!doc.exists) {
        transaction.set(statsRef, {
          emailCount: Math.max(0, step),
          totalBytes: Math.max(0, step * byteSize),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        transaction.update(statsRef, {
          emailCount: admin.firestore.FieldValue.increment(step),
          totalBytes: admin.firestore.FieldValue.increment(step * byteSize),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });
  } catch (error) {
    console.error(`❌ Failed to update daily stats for ${logId}:`, error);
  }
}

// Define parameterized configuration
const apiConcurrency = defineInt('API_CONCURRENCY', {
  default: 80,
  description: 'Concurrent requests per instance'
});
const apiRegion = defineString('API_REGION', { default: 'us-east1' });

/**
 * Helper to create a Nodemailer transporter using defined secrets.
 */
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: adminEmailUser.value(),
      pass: adminEmailPass.value()
    }
  });
}

const DEFAULT_FROM = '"Iopic Protocol System" <noreply@iopic.world>';
const ADMIN_EMAIL = 'admin@iopic.world';

/**
 * Core transmission logic for protocol notifications.
 */
async function sendProtocolEmail(options) {
  const transporter = createTransporter();
  const mailOptions = {
    from: DEFAULT_FROM,
    ...options
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Extracts common log metadata (dateId, byteSize) from an event data object.
 */
function getLogMetadata(data) {
  const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
  return {
    dateId: timestamp.toISOString().split('T')[0],
    byteSize: data.byteSize || 0
  };
}

/**
 * Cloud Function to notify admins of new access requests.
 * Triggered when a document is created in 'access_requests'.
 */
export const notifyAdminOnAccessRequest = onDocumentCreated(
  {
    document: 'access_requests/{requestId}',
    secrets: [adminEmailUser, adminEmailPass]
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }
    const data = snapshot.data();

    // Validate the access request document structure
    const result = accessRequestSchema.safeParse(data);
    if (!result.success) {
      console.error(
        `❌ Notification aborted: Invalid access request structure for ${event.params.requestId}:`,
        result.error.format()
      );
      return;
    }

    const validData = result.data;

    try {
      await sendProtocolEmail({
        to: ADMIN_EMAIL,
        subject: `🚨 New Access Request: ${validData.requestedRole}`,
        html: `
        <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #d9534f;">Protocol Access Request Detected</h2>
          <p>A user has requested elevated clearance on the identity substrate.</p>
          <hr>
          <p><strong>Email:</strong> ${validData.email}</p>
          <p><strong>UID:</strong> ${validData.uid}</p>
          <p><strong>Requested Role:</strong> <span style="background: #f0ad4e; padding: 2px 5px; border-radius: 3px;">${
            validData.requestedRole
          }</span></p>
          <p><strong>Current Status:</strong> ${validData.status}</p>
          <p><strong>Timestamp:</strong> ${
            validData.timestamp ? validData.timestamp.toDate().toLocaleString() : 'N/A'
          }</p>
          <hr>
          <p style="font-size: 0.8rem; color: #777;">Process this request using the 'grant-system-claim.js' utility or via the Firebase Console.</p>
        </div>
      `
      });
      console.log(
        `✅ Notification successfully transmitted for request: ${event.params.requestId}`
      );
    } catch (error) {
      console.error('❌ Failed to transmit admin notification:', error);
    }
  }
);

/**
 * Cloud Function to notify users when their access request is approved.
 * Triggered when a document in 'access_requests' is updated.
 */
export const notifyUserOnAccessRequestUpdate = onDocumentUpdated(
  {
    document: 'access_requests/{requestId}',
    secrets: [adminEmailUser, adminEmailPass]
  },
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    // Detect the transition to 'Approved' to ensure we only send one email
    if (beforeData.status !== 'Approved' && afterData.status === 'Approved') {
      console.log(`Approval detected for ${afterData.email}. Transmitting notification...`);

      try {
        await sendProtocolEmail({
          to: afterData.email,
          subject: '✅ Protocol Access Approved',
          html: `
          <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #5cb85c;">Access Request Approved</h2>
            <p>Greetings,</p>
            <p>Your request for elevated clearance on the Iopic identity substrate has been processed successfully.</p>
            <hr>
            <p><strong>Granted Role:</strong> <span style="background: #5cb85c; color: white; padding: 2px 5px; border-radius: 3px;">${afterData.requestedRole}</span></p>
            <hr>
            <p>To initialize your new permissions, please refresh your application substrate or use the <strong>Synchronize Identity Substrate</strong> button on the Access Denied page.</p>
            <p style="font-size: 0.8rem; color: #777;">This is an automated synchronization notification from the Iopic Protocol.</p>
          </div>
        `
        });
        console.log(`✅ Approval notification successfully transmitted to: ${afterData.email}`);
      } catch (error) {
        console.error('❌ Failed to transmit user notification:', error);
      }
    } else if (beforeData.status !== 'Denied' && afterData.status === 'Denied') {
      console.log(`Denial detected for ${afterData.email}. Transmitting notification...`);

      try {
        await sendProtocolEmail({
          to: afterData.email,
          subject: '❌ Protocol Access Denied',
          html: `
          <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #d9534f;">Access Request Denied</h2>
            <p>Greetings,</p>
            <p>Your request for elevated clearance on the Iopic identity substrate has been reviewed and declined at this time.</p>
            <hr>
            <p><strong>Reason for Denial:</strong> ${
              afterData.denialReason || 'Insufficient credentials or protocol mismatch.'
            }</p>
            <hr>
            <p style="font-size: 0.8rem; color: #777;">This is an automated synchronization notification from the Iopic Protocol.</p>
          </div>
        `
        });
        console.log(`✅ Denial notification successfully transmitted to: ${afterData.email}`);
      } catch (error) {
        console.error('❌ Failed to transmit denial notification:', error);
      }
    }
  }
);

/**
 * Cloud Function to pre-aggregate daily email statistics.
 * Triggered when a document is created in 'email_logs'.
 */
export const aggregateDailyStats = onDocumentCreated('email_logs/{logId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const data = snapshot.data();

  // Validate document structure before processing
  const result = emailLogSchema.safeParse(data);
  if (!result.success) {
    console.error(
      `❌ Aggregation skipped: Invalid log structure for ${event.params.logId}:`,
      result.error.format()
    );
    return;
  }

  await updateDailyStats(result.data, event.params.logId, 1);
});

/**
 * Cloud Function to decrement daily email statistics.
 * Triggered when a document is deleted from 'email_logs'.
 */
export const decrementDailyStats = onDocumentDeleted('email_logs/{logId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const data = snapshot.data();

  // Validate document structure before processing
  const result = emailLogSchema.safeParse(data);
  if (!result.success) {
    console.warn(
      `⚠️ Decrement skipped: Could not validate deleted log ${event.params.logId}. Statistics may diverge.`
    );
    return;
  }

  await updateDailyStats(result.data, event.params.logId, -1);
});

/**
 * Cloud Function to clean up old security audit logs.
 * Runs daily at midnight UTC.
 */
export const cleanupOldAuditLogs = onSchedule(
  {
    schedule: '0 0 * * *', // Run once a day at midnight UTC
    timeZone: 'UTC',
    secrets: [], // No secrets needed for this function directly
    // Add memory/timeout if needed, e.g., memory: '256MiB', timeoutSeconds: 300
    region: apiRegion // Use the same region as the API for consistency
  },
  async (event) => {
    const retentionDays = auditLogRetentionDays.value();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`Starting audit log cleanup. Deleting logs older than ${cutoffDate.toISOString()} (${retentionDays} days).`);

    const auditLogsRef = admin.firestore().collection('security_audits');
    let query = auditLogsRef.where('timestamp', '<', cutoffDate).limit(500); // Batch delete in chunks

    let deletedCount = 0;
    while (true) {
      const snapshot = await query.get();
      if (snapshot.size === 0) {
        break; // No more documents to delete
      }

      const batch = admin.firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      deletedCount += snapshot.size;
      console.log(`Deleted ${snapshot.size} audit logs. Total deleted: ${deletedCount}`);
    }

    console.log(`Audit log cleanup complete. Total ${deletedCount} logs deleted.`);
  }
);

// ============================================================================
// SECURE EXPRESS API
// ============================================================================
const app = express();

// Trust two hops: Firebase Hosting (CDN) and the Google Cloud Load Balancer.
// This ensures that req.ip correctly resolves to the end-user's IP address
// even when the function is invoked via a Firebase Hosting rewrite.
app.set('trust proxy', 2);

const publicRouter = express.Router();
const privateRouter = express.Router();

// Middleware to automatically parse JSON request bodies
app.use(express.json());
// Middleware to automatically parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Handle /api prefix from Firebase Hosting rewrites
app.use((req, res, next) => {
  // Firebase Hosting preserves the /api prefix in the URL. 
  // We strip it here so the routers can match paths like /health or /secure-data.
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '') || '/';
  }
  next();
});

/**
 * Express Middleware to Verify Firebase Auth Tokens
 */
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach decoded token (UID, email, claims) to the request
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
  }
}

/**
 * Express Middleware to require 'admin' custom claim
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: No user session found.' });
  }

  if (req.user.admin === true) {
    next();
  } else {
    return res.status(403).json({ error: 'Forbidden: Admin clearance required.' });
  }
}

/**
 * Express Middleware to verify Firebase App Check tokens.
 */
async function verifyAppCheckToken(req, res, next) {
  const appCheckToken = req.header('X-Firebase-AppCheck');
  if (!appCheckToken) {
    return res.status(401).json({ error: 'Unauthorized: No App Check token provided.' });
  }
  try {
    await admin.appCheck().verifyToken(appCheckToken);
    next();
  } catch (err) {
    console.error('App Check verification failed:', err);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired App Check token.' });
  }
}

/**
 * Internal logic to hold the sovereign override token.
 * Initialized lazily to ensure secrets are resolved at runtime.
 */
let cachedSovereignToken = null;

/**
 * Internal helper to log security events to the 'security_audits' collection.
 */
async function logSecurityAudit(event, details) {
  try {
    await admin.firestore().collection('security_audits').add({
      event,
      ...details,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    console.error('❌ Failed to write to security_audits substrate:', err);
  }
}

/**
 * Resets the cached sovereign token.
 * This is primarily for testing purposes to ensure state isolation between tests.
 */
function resetSovereignTokenCache() {
  cachedSovereignToken = null;
}

/**
 * Internal logic to validate local root access or standard handshake.
 * Checks for a special override token used from localhost.
 */
function validateAccess(requestedToken, clientIp) {
  const currentSovereignOverrideToken = cachedSovereignToken || imeRootSignature.value();
  const LOCALHOST_IPS = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
  const isLocal = LOCALHOST_IPS.includes(clientIp);

  if (currentSovereignOverrideToken && requestedToken === currentSovereignOverrideToken) {
    if (isLocal) {
      return { authorized: true, bypass: true };
    } else {
      // CRITICAL BREACH: Token leaked outside local subnet
      console.error('SECURITY_BREACH_TOKEN_NULLIFIED: Sovereign override token used from non-local IP. Nullifying token.');
      cachedSovereignToken = 'EXPIRED_BY_BREACH'; // Nullify the token to prevent further misuse
      return { authorized: false, bypass: false, reason: 'SECURITY_BREACH_TOKEN_NULLIFIED' };
    }
  }
  return { authorized: false, bypass: false, reason: 'STANDARD_AUTH_REQUIRED' };
}

/**
 * Custom middleware for SPICE protocol gatekeeping.
 * Verifies sovereign identity based on a special override token or falls back to Firebase Auth.
 */
async function spiceGatekeeper(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  const clientIp = req.ip || req.connection.remoteAddress;
  // Capture the raw X-Forwarded-For chain for security auditing
  const forwardedFor = req.get('X-Forwarded-For') || '';
  const hopCount = forwardedFor ? forwardedFor.split(',').length : 0;
  const chainLog = forwardedFor || 'direct';

  const gateResult = validateAccess(token, clientIp);

  if (gateResult.authorized) {
    if (gateResult.bypass) {
      console.log(`[AUDIT] Sovereign Root access granted. IP: ${clientIp}, Hops: ${hopCount}, Chain: ${chainLog}`);
    }

    req.isSovereignRoot = gateResult.bypass; // true if using override token locally, false if standard auth
    return next();
  }

  if (gateResult.reason === 'STANDARD_AUTH_REQUIRED') {
    // Phase 2: Protocol Severance (Maximum Sensitivity)
    if (maxSensitivityMode.value() === 'true') {
      console.warn(`[MAX_SENSITIVITY] Blocking standard auth thread for IP: ${clientIp}. Sovereign Proof-of-Presence required.`);
      return res.status(403).json({ 
        error: 'Forbidden: Protocol Severance Active. Sovereign Proof-of-Presence required.',
        code: 'OMEGA_NOISE_BLOCKED'
      });
    }
    // If the special override token is not used or invalid,
    // proceed with standard Firebase token verification.
    // verifyFirebaseToken will call next() or send an error response.
    return verifyFirebaseToken(req, res, next);
  }

  if (gateResult.reason === 'SECURITY_BREACH_TOKEN_NULLIFIED') {
    console.error(`[CRITICAL] Token breach detected! Hops: ${hopCount}, Chain: ${chainLog}`);
    await logSecurityAudit('SOVEREIGN_TOKEN_BREACH', {
      clientIp,
      forwardedFor: chainLog,
      hopCount,
      reason: 'Sovereign override token used from non-local IP.'
    });
  }

  // If neither sovereign override nor standard auth is authorized
  console.warn(`SPICE_GATEKEEPER_DENIAL: Access denied for reason: ${gateResult.reason}`);
  return res.status(403).json({ error: `Forbidden: ${gateResult.reason}` });
}

// --- Router Configuration ---
// Apply App Check protection to every route defined on the private router
privateRouter.use(verifyAppCheckToken);

// Public Endpoints (No App Check required)
publicRouter.get('/health', (req, res) => {
  // Tell Firebase Hosting to cache this response for 60 seconds at the edge
  // and 60 seconds in the browser. This reduces function invocations.
  res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
  res.status(200).send('Substrate Healthy');
});

// Example of a high-privilege route protected by the SPICE Gatekeeper
privateRouter.post('/root-operation', spiceGatekeeper, (req, res) => {
  const status = req.isSovereignRoot ? 'LOCAL_ROOT' : 'STANDARD_USER';
  res.json({ message: `Operation executed under ${status} context.` });
});

// Apply the security middleware to specific routes
privateRouter.get('/secure-data', verifyFirebaseToken, (req, res) => {
  res.json({
    message: 'Access granted.',
    uid: req.user.uid,
    email: req.user.email
  });
});

// Apply BOTH middlewares to protect an admin-only route
privateRouter.get('/admin-data', verifyFirebaseToken, requireAdmin, (req, res) => {
  res.json({ message: 'Access granted to admin substrate.' });
});

// Example POST route handling a JSON body
privateRouter.post('/admin-action', verifyFirebaseToken, requireAdmin, (req, res) => {
  // The parsed JSON payload is now available on req.body
  const payload = req.body;

  // Process the payload...
  res.json({
    message: 'Admin action received successfully.',
    receivedData: payload
  });
});

// Example POST route handling a multipart/form-data file upload
privateRouter.post(
  '/upload-file',
  verifyFirebaseToken,
  requireAdmin,
  upload.single('file'),
  async (req, res) => {
    // Multer attaches the file to `req.file` and any extra text fields to `req.body`
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      // Get a reference to the default Cloud Storage bucket
      const bucket = admin.storage().bucket();

      // Create a unique destination path to prevent overwriting files
      const destinationPath = `uploads/${Date.now()}_${req.file.originalname}`;
      const fileRef = bucket.file(destinationPath);

      // Upload the raw buffer directly to Cloud Storage
      await fileRef.save(req.file.buffer, {
        contentType: req.file.mimetype
      });

      // Generate a signed URL that expires in 1 hour
      let downloadUrl = null;
      try {
        const [url] = await fileRef.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000, // 1 hour from now
          version: 'v4' // Use the recommended v4 signing process
        });
        downloadUrl = url;
      } catch (signErr) {
        console.error('⚠️ Signed URL generation failed (File was saved):', signErr);
        // The file is already stored safely; we avoid a 500 error to prevent redundant retries.
        // The client can still use the storagePath to retrieve the file via other means.
      }

      res.json({
        message: 'File uploaded to Cloud Storage successfully.',
        fileDetails: {
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          storagePath: destinationPath,
          downloadUrl: downloadUrl || 'SIGNING_FAILURE_IDENTITY_UNAVAILABLE'
        }
      });
    } catch (error) {
      console.error('❌ Cloud Storage operation failed:', error);
      res.status(500).json({ 
        error: 'Failed to upload file to Cloud Storage.',
        details: error.message 
      });
    }
  }
);

// Example POST route to generate a signed URL for direct-to-storage uploads
privateRouter.post('/generate-upload-url', verifyFirebaseToken, requireAdmin, async (req, res) => {
  const { filename, contentType } = req.body;

  if (!filename || !contentType) {
    return res.status(400).json({ error: 'Missing filename or contentType in request body.' });
  }

  try {
    const bucket = admin.storage().bucket();
    const destinationPath = `uploads/direct/${Date.now()}_${filename}`;
    const fileRef = bucket.file(destinationPath);

    // Generate a signed URL that allows a PUT request for 15 minutes
    const [uploadUrl] = await fileRef.getSignedUrl({
      version: 'v4',
      action: 'write', // Generates a URL specifically for uploading
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType // Enforces that the client sends this exact content type
    });

    res.json({
      message: 'Signed upload URL generated successfully.',
      uploadUrl,
      storagePath: destinationPath
    });
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate upload URL.',
      details: error.message,
      hint: 'Ensure the Service Account has the "Service Account Token Creator" role.'
    });
  }
});

// Mount the routers. Order doesn't matter here since they are distinct, 
// but typically public routes are mounted first.
app.use(publicRouter);
app.use(privateRouter);

/**
 * Error Handling Substrate
 * Specifically captures Multer validation failures and size limit breaches.
 */
app.use(multerErrorHandler);
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal Substrate Error' });
});

// Expose the Express app as a Firebase HTTP Function
// We use a middleware above to strip the "/api" prefix, keeping the routes clean
// and compatible with both Firebase Hosting and local development proxies.
export const api = onRequest(
  {
    cors: true,
    region: apiRegion,
    memory: '1GiB',
    concurrency: apiConcurrency,
    // vpcConnector: 'your-vpc-connector-name',
    // vpcConnectorEgressSettings: 'PRIVATE_RANGES_ONLY', // or "ALL_TRAFFIC"
    secrets: [myApiKey, imeRootSignature] // Explicitly grant this function access to the secrets
  }, app);

export { resetSovereignTokenCache };
