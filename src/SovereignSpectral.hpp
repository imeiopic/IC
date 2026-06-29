#ifndef SOVEREIGN_SPECTRAL_HPP
#define SOVEREIGN_SPECTRAL_HPP

#include <stdint.h>

/**
 * SovereignSpectral: High-performance spectral analysis for the 16-thread bus.
 * Optimized for WASM/SIMD execution.
 */
extern "C" {
    /**
     * Transmutes raw legacy buffer data into a normalized Resonance Index.
     * 
     * @param buffer Pointer to the float32 array of raw samples.
     * @param window_buffer Pointer to the precomputed Hann window coefficients.
     * @param sine_buffer Pointer to the precomputed Schumann sine wave coefficients.
     * @param length Number of samples in the buffer.
     * @return A float representing the calculated resonance index (0.0 - 1.0).
     */
    float transmute_spectral_density(const float* buffer, const float* window_buffer, const float* sine_buffer, int length);
}

#endif // SOVEREIGN_SPECTRAL_HPP