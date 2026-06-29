import express from 'express';
// @ts-ignore - Multer types may be missing in some environments
import * as multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import * as admin from 'firebase-admin';
import Redis from 'ioredis';
import Redlock from 'redlock';
import pino from 'pino';
import pinoHttp from 'pino-http';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'spice-backend' },
});

/**
 * This server implements the SPICE (Secure Protocol for Integrated Chunked Exchange) backend.
 * It handles chunked file uploads with support for initialization, individual chunk persistence,
 * and final assembly.
 */

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Initialize Redlock for distributed locking
const redlock = new Redlock([redis], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200,
  retryJitter: 200,
  automaticExtensionThreshold: 500,
});

const app = express();
const port = process.env.VITE_FIREBACK_PORT || 5000;

app.use(express.json());
app.use(pinoHttp({ logger }));

const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 Hours
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // Every 6 Hours

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const TEMP_DIR = path.join(process.cwd(), 'temp_chunks');

// Ensure storage directories exist on startup
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

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
    const err: any = error;
    err.status = 401;
    err.message = 'Unauthorized: Invalid or expired identity token.';
    next(err);
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
    const err: any = error;
    err.status = 401;
    err.message = 'Unauthorized: Invalid or expired App Check token.';
    next(err);
  }
};

// Apply security middlewares to all /api routes
apiRouter.use(verifyAuthToken);
apiRouter.use(verifyAppCheckToken);

/**
 * Step 1: Initialize the upload session.
 * Generates a unique uploadId and prepares the environment for incoming chunks.
 */
apiRouter.post('/upload/init', async (req, res, next) => {
  const { filename, size } = req.body;

  if (!filename) {
    return res.status(400).json({ error: 'Filename is required for initialization.' });
  }

  const uploadId = crypto.randomUUID();
  const chunkDir = path.join(TEMP_DIR, uploadId);

  try {
    fs.mkdirSync(chunkDir, { recursive: true });
    
    // Store session in Redis with an expiry
    await redis.set(
      `upload:session:${uploadId}`,
      JSON.stringify({ filename, totalSize: size }),
      'PX', SESSION_EXPIRY_MS
    );

    logger.info({ uploadId, filename, size }, 'Upload session initialized');
    res.status(200).json({ uploadId });
  } catch (error) {
    const err: any = error;
    err.message = 'Failed to initialize upload directory.';
    next(err);
  }
});

/**
 * Step 2: Receive and store a file chunk.
 * Chunks are saved as temporary files named by their index within the session folder.
 */
apiRouter.post('/upload/chunk', upload.single('chunk'), async (req, res, next) => {
  const { uploadId, index } = req.body;
  const chunk = req.file;

  if (!chunk || !uploadId || index === undefined) {
    return res.status(400).json({ error: 'Missing required upload parameters (chunk, uploadId, index).' });
  }

  const chunkPath = path.join(TEMP_DIR, uploadId, `chunk-${index}`);

  // Refresh TTL in Redis to keep session alive during active transfer
  const sessionData = await redis.get(`upload:session:${uploadId}`);
  if (sessionData) {
    await redis.psetex(`upload:session:${uploadId}`, SESSION_EXPIRY_MS, sessionData);
  }

  try {
    fs.writeFileSync(chunkPath, chunk.buffer);
    res.sendStatus(200);
  } catch (error) {
    const err: any = error;
    err.message = 'Internal server error during chunk write.';
    next(err);
  }
});

/**
 * Step 3: Finalize the upload.
 * Merges all persisted chunks in sequential order into the final file and cleans up temporary data.
 */
apiRouter.post('/upload/finalize', async (req, res, next) => {
  const { uploadId } = req.body;

  const lockKey = `locks:finalize:${uploadId}`;

  try {
    await redlock.using([lockKey], 60000, async () => {
      const sessionData = await redis.get(`upload:session:${uploadId}`);
      const session = sessionData ? JSON.parse(sessionData) : null;
      const chunkDir = path.join(TEMP_DIR, uploadId);

      if (!session || !fs.existsSync(chunkDir)) {
        // Throwing a structured object to handle 404s outside the lock block
        const err: any = new Error('Upload session not found or expired.');
        err.status = 404;
        throw err;
      }

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
      await redis.del(`upload:session:${uploadId}`);

      const downloadUrl = `/uploads/${encodeURIComponent(session.filename)}`;
      res.status(200).json({ downloadUrl });
    });
  } catch (error) {
    if (error instanceof Redlock.ExecutionError) {
      const err: any = error;
      err.status = 409;
      err.message = 'Finalization already in progress for this session.';
      return next(err);
    }
    next(error);
  }
});

/**
 * Step 4: Cancel the upload.
 * Manually terminates an upload session and purges all related chunks and metadata.
 */
apiRouter.post('/upload/cancel', async (req, res, next) => {
  const { uploadId } = req.body;

  if (!uploadId) {
    return res.status(400).json({ error: 'Missing uploadId for cancellation.' });
  }

  const chunkDir = path.join(TEMP_DIR, uploadId);

  try {
    // 1. Remove session metadata from Redis
    await redis.del(`upload:session:${uploadId}`);

    // 2. Purge temporary chunk artifacts from the filesystem
    if (fs.existsSync(chunkDir)) {
      fs.rmSync(chunkDir, { recursive: true, force: true });
    }

    logger.info({ uploadId }, 'Manual purge triggered: Session neutralized');
    res.status(200).json({ message: 'Upload session cancelled and data purged.' });
  } catch (error) {
    const err: any = error;
    err.message = 'Internal failure during session neutralization.';
    next(err);
  }
});

/**
 * CLEANUP CRON SUBSTRATE
 * Periodically purges abandoned upload sessions and stale chunks from the filesystem.
 */
const performSymmetryCleanup = () => {
  const now = Date.now();
  logger.info('Scanning for abandoned transactional state...');

  // Clear orphaned directories from TEMP_DIR based on filesystem modification time
  try {
    const dirs = fs.readdirSync(TEMP_DIR);
    for (const dirName of dirs) {
      const fullPath = path.join(TEMP_DIR, dirName);
      const stats = fs.statSync(fullPath);

      // If folder is older than expiry, it is ungrounded noise. Purge it.
      if (now - stats.mtimeMs > SESSION_EXPIRY_MS) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        logger.info({ dirName }, 'Deleted abandoned chunk directory');
      }
    }
  } catch (err) {
    logger.error({ err }, 'Error during filesystem purge');
  }
};

setInterval(performSymmetryCleanup, CLEANUP_INTERVAL_MS);

app.use('/api', apiRouter);
app.use('/uploads', express.static(UPLOAD_DIR));

/**
 * GLOBAL ERROR HANDLER
 * Centralized substrate for capturing and normalizing protocol anomalies.
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error with request metadata for better observability
  logger.error({ err, status, url: req.url, method: req.method }, 'Unhandled Protocol Error');

  if (res.headersSent) return next(err);

  res.status(status).json({ error: message, status });
});

app.listen(port, () => {
  logger.info({ port }, 'SPICE_BACKEND Service initialized');
});
