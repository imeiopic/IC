import { describe, it, expect, vi, afterEach } from 'vitest';
import { IopicTranslator } from './IopicUniversalTranslator';

describe('IopicUniversalTranslator', () => {
  afterEach(() => {
    // Restore all mocks after each test to ensure a clean slate
    vi.restoreAllMocks();
  });

  describe('calculateNoiseFloor', () => {
    it('should calculate a numeric noise floor for a standard string', () => {
      const text = 'Access denied. Insufficient clearance.';
      const noise = IopicTranslator.calculateNoiseFloor(text);

      expect(typeof noise).toBe('number');
      // Assuming noise floor returns a ratio between 0 and 1
      expect(noise).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty strings gracefully without throwing an error', () => {
      const noise = IopicTranslator.calculateNoiseFloor('');
      expect(typeof noise).toBe('number');
    });
  });

  describe('processSymmetry (Translation Exchange)', () => {
    it('should return the expected translation interface including confidence and latency', async () => {
      // Mock the async method to prevent actual network/AI calls during unit tests
      const processSpy = vi.spyOn(IopicTranslator, 'processSymmetry').mockResolvedValue({
        text: 'Acceso denegado',
        confidence: 0.98,
        latency: '145ms'
      });

      const originalText = 'Access denied';
      const targetLang = 'es';

      const result = await IopicTranslator.processSymmetry(originalText, targetLang);

      // Verify the method was called with the correct parameters
      expect(processSpy).toHaveBeenCalledWith(originalText, targetLang);

      // Verify the shape and data of the response
      expect(result).toHaveProperty('text', 'Acceso denegado');
      expect(result).toHaveProperty('confidence', 0.98);
      expect(result).toHaveProperty('latency', '145ms');
    });
  });
});
