import { vi, describe, it, expect, beforeEach } from 'vitest';
import multer from 'multer';

/**
 * Iopic Protocol: Multer Substrate Unit Tests
 * 
 * We mock 'multer' to capture the configuration object so we can test 
 * the internal fileFilter logic in isolation.
 */
let capturedOptions = null;
vi.mock('multer', () => {
  const MulterError = class extends Error {
    constructor(code) {
      super(code);
      this.code = code;
      this.name = 'MulterError';
    }
  };

  const mockMulter = vi.fn((opts) => {
    capturedOptions = opts;
    return {
      single: vi.fn(),
      array: vi.fn(),
    };
  });

  mockMulter.memoryStorage = vi.fn(() => ({ type: 'memory' }));
  mockMulter.MulterError = MulterError;

  return { default: mockMulter };
});

// Import the config after the mock is established
import { multerErrorHandler } from './multer-config.js';

describe('Multer Configuration Substrate', () => {
  describe('upload configuration (fileFilter)', () => {
    it('should permit allowed MIME types', () => {
      const cb = vi.fn();
      const mockFile = { mimetype: 'image/png' };
      
      capturedOptions.fileFilter({}, mockFile, cb);
      
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject unpermitted MIME types with a VALIDATION_ERROR', () => {
      const cb = vi.fn();
      const mockFile = { mimetype: 'application/x-msdownload' };
      
      capturedOptions.fileFilter({}, mockFile, cb);
      
      const errorArg = cb.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(Error);
      expect(errorArg.message).toContain('VALIDATION_ERROR');
      expect(errorArg.message).toContain('application/x-msdownload');
    });
  });

  describe('multerErrorHandler', () => {
    let mockRes;
    let mockNext;

    beforeEach(() => {
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      mockNext = vi.fn();
    });

    it('should return 413 for LIMIT_FILE_SIZE errors', () => {
      const err = new multer.MulterError('LIMIT_FILE_SIZE');
      
      multerErrorHandler(err, {}, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(413);
      expect(mockRes.json).toHaveBeenCalledWith({ error: expect.stringContaining('10MB limit') });
    });

    it('should return 400 for custom protocol validation errors', () => {
      const err = new Error('VALIDATION_ERROR: Access Denied');
      
      multerErrorHandler(err, {}, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access Denied' });
    });

    it('should pass through unknown errors to the next middleware', () => {
      const err = new Error('Unexpected Substrate Failure');
      
      multerErrorHandler(err, {}, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(err);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});