import multer from 'multer';

/**
 * Iopic Protocol: Multer Configuration Substrate
 * Manages file upload constraints and MIME type filtering.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`VALIDATION_ERROR: File type '${file.mimetype}' is not permitted.`));
    }
  }
});

/**
 * Middleware to handle Multer-specific errors.
 * Separates protocol breaches (size, type) from internal failures.
 */
export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Protocol Breach: File exceeds 10MB limit.' });
    }
    return res.status(400).json({ error: `Multer Protocol Error: ${err.message}` });
  }
  if (err.message && err.message.startsWith('VALIDATION_ERROR:')) {
    return res.status(400).json({ error: err.message.replace('VALIDATION_ERROR: ', '') });
  }
  next(err);
};