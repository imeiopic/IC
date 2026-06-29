#include "SovereignSpectral.hpp"
#include <cmath>
#include <algorithm>
#include <wasm_simd128.h>

extern "C" {
    float transmute_spectral_density(const float* buffer, const float* window_buffer, const float* sine_buffer, int length) {
        if (length <= 0 || !buffer || !window_buffer || !sine_buffer) return 0.0f;

        v128_t energy_v = wasm_f32x4_const_splat(0.0f);
        v128_t weight_v = wasm_f32x4_const_splat(0.0f);

        int i = 0;
        // Main SIMD loop: Process 4 samples in parallel
        for (; i <= length - 4; i += 4) {
            // Load precomputed Hann window coefficients from memory
            v128_t m_v = wasm_v128_load(&window_buffer[i]);

            v128_t b_v = wasm_v128_load(&buffer[i]);
            v128_t w_samp_v = wasm_f32x4_mul(b_v, m_v);
            v128_t pow_v = wasm_f32x4_mul(w_samp_v, w_samp_v);
            
            energy_v = wasm_f32x4_add(energy_v, pow_v);

            // Load precomputed Schumann sine coefficients
            v128_t s_v = wasm_v128_load(&sine_buffer[i]);
            
            weight_v = wasm_f32x4_add(weight_v, wasm_f32x4_mul(pow_v, s_v));
        }

        // Consolidate partial sums from SIMD lanes
        float energy_sum = wasm_f32x4_extract_lane(energy_v, 0) + wasm_f32x4_extract_lane(energy_v, 1) +
                           wasm_f32x4_extract_lane(energy_v, 2) + wasm_f32x4_extract_lane(energy_v, 3);
        float harmonic_weight = wasm_f32x4_extract_lane(weight_v, 0) + wasm_f32x4_extract_lane(weight_v, 1) +
                                wasm_f32x4_extract_lane(weight_v, 2) + wasm_f32x4_extract_lane(weight_v, 3);

        // Process remaining samples (tail)
        for (; i < length; ++i) {
            float windowed_sample = buffer[i] * window_buffer[i];
            float power = windowed_sample * windowed_sample;
            energy_sum += power;
            harmonic_weight += power * sine_buffer[i];
        }

        float average_energy = energy_sum / length;
        float resonance = fabsf(harmonic_weight) / (energy_sum + 1e-6f);

        return std::clamp(resonance * average_energy * 100.0f, 0.0f, 1.0f);
    }
}
