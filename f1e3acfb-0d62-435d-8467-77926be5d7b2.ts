import express from 'express';
// @ts-ignore - Multer types may be missing in some environments
import * as multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import * as admin from 'firebase-admin';

/**
 * This server implements the SPICE (Secure Protocol for Integrated Chunked Exchange) backend.
 * It handles chunked file uploads with support for initialization, individual chunk persistence,
 * and final assembly.
 */

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();
const port = process.env.VITE_FIREBACK_PORT || 5000;

app.use(express.json());

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const TEMP_DIR = path.join(process.cwd(), 'temp_chunks');

// Ensure storage directories exist on startup
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// In-memory session store. In a production environment, use Redis or a persistent database.
const uploadSessions = new Map<string, { filename: string; totalSize: number }>();

// Multer configuration for handling multipart/form-data chunks in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

const apiRouter = express.Router();

/**
 * Middleware: Verify Firebase Auth ID Token
 */
const verifyAuthToken = async (req: any, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No identity token provided.' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('[AUTH_VERIFICATION_ERROR]:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired identity token.' });
  }
};

/**
 * Middleware: Verify Firebase App Check Token
 */
const verifyAppCheckToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const appCheckToken = req.header('X-Firebase-AppCheck');

  if (!appCheckToken) {
    return res.status(401).json({ error: 'Unauthorized: No App Check token provided.' });
  }

  try {
    await admin.appCheck().verifyToken(appCheckToken);
    next();
  } catch (error) {
    console.error('[APP_CHECK_ERROR]:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired App Check token.' });
  }
};

// Apply security middlewares to all /api routes
apiRouter.use(verifyAuthToken);
apiRouter.use(verifyAppCheckToken);

/**
 * Step 1: Initialize the upload session.
 * Generates a unique uploadId and prepares the environment for incoming chunks.
 */
apiRouter.post('/upload/init', (req, res) => {
  const { filename, size } = req.body;

  if (!filename) {
    return res.status(400).json({ error: 'Filename is required for initialization.' });
  }

  const uploadId = crypto.randomUUID();
  const chunkDir = path.join(TEMP_DIR, uploadId);

  try {
    fs.mkdirSync(chunkDir, { recursive: true });
    uploadSessions.set(uploadId, { filename, totalSize: size });
    res.status(200).json({ uploadId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize upload directory.' });
  }
});

/**
 * Entity Management: Retrieve Group state.
 */
apiRouter.get('/entity/:id', async (req, res) => {
  try {
    const doc = await admin.firestore().collection('groups').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Group substrate not found.' });
    }
    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve entity state.' });
  }
});

/**
 * Entity Management: Trigger Phase-Lock Realignment.
 */
apiRouter.post('/entity/:id/realign', async (req, res) => {
  try {
    const groupRef = admin.firestore().collection('groups').doc(req.params.id);
    await groupRef.update({
      resonanceFidelity: 1.0,
      entropyIndex: 0.0,
      threadAlignment: new Array(16).fill(true),
      lastRealigned: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, message: 'Node collective realigned to Schumann baseline.' });
  } catch (error) {
    res.status(500).json({ error: 'Realign protocol failed.' });
  }
});

/**
 * Entity Management: Update Metabolic Pulse.
 */
apiRouter.post('/entity/:id/pulse', async (req, res) => {
  const { totalPulse, localBaseline } = req.body;
  
  try {
    const groupRef = admin.firestore().collection('groups').doc(req.params.id);
    await groupRef.update({
      totalPulse,
      localBaseline,
      lastPulseUpdate: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const updatedDoc = await groupRef.get();
    res.json(updatedDoc.data());
  } catch (error) {
    res.status(500).json({ error: 'Metabolic pulse update failed.' });
  }
});

/**
 * Step 2: Receive and store a file chunk.
 * Chunks are saved as temporary files named by their index within the session folder.
 */
apiRouter.post('/upload/chunk', upload.single('chunk'), (req, res) => {
  const { uploadId, index } = req.body;
  const chunk = req.file;

  if (!chunk || !uploadId || index === undefined) {
    return res.status(400).json({ error: 'Missing required upload parameters (chunk, uploadId, index).' });
  }

  const chunkPath = path.join(TEMP_DIR, uploadId, `chunk-${index}`);

  try {
    fs.writeFileSync(chunkPath, chunk.buffer);
    res.sendStatus(200);
  } catch (error) {
    console.error(`[SERVER] Error writing chunk ${index} for session ${uploadId}:`, error);
    res.status(500).json({ error: 'Internal server error during chunk write.' });
  }
});

/**
 * Step 3: Finalize the upload.
 * Merges all persisted chunks in sequential order into the final file and cleans up temporary data.
 */
apiRouter.post('/upload/finalize', async (req, res) => {
  const { uploadId } = req.body;
  const session = uploadSessions.get(uploadId);
  const chunkDir = path.join(TEMP_DIR, uploadId);

  if (!session || !fs.existsSync(chunkDir)) {
    return res.status(404).json({ error: 'Upload session not found or expired.' });
  }

  try {
    const finalPath = path.join(UPLOAD_DIR, session.filename);
    const writeStream = fs.createWriteStream(finalPath);

    const chunks = fs.readdirSync(chunkDir).sort((a, b) => {
      return parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]);
    });

    for (const chunkFile of chunks) {
      const chunkPath = path.join(chunkDir, chunkFile);
      await pipeline(fs.createReadStream(chunkPath), writeStream, { end: false });
    }

    writeStream.end();

    // Ensure the write stream is fully finished before cleaning up
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Cleanup temporary files and session data
    fs.rmSync(chunkDir, { recursive: true, force: true });
    uploadSessions.delete(uploadId);

    const downloadUrl = `/uploads/${encodeURIComponent(session.filename)}`;

    // Record metadata in Firestore linked to the user's UID
    await admin.firestore().collection('completed_uploads').add({
      uid: (req as any).user.uid,
      filename: session.filename,
      size: session.totalSize,
      downloadUrl: downloadUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ downloadUrl });
  } catch (error) {
    console.error(`[SERVER] Finalization failed for session ${uploadId}:`, error);
    res.status(500).json({ error: 'Failed to finalize and merge file chunks.' });
  }
});

app.use('/api', apiRouter);
app.use('/uploads', express.static(UPLOAD_DIR));

app.listen(port, () => {
  console.log(`[SPICE_BACKEND] Service initialized on port ${port}`);
});
