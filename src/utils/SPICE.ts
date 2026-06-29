import { ref, type Ref } from 'vue';

export interface SpiceUtility {
  triggerShake: Ref<boolean>;
  isNoise: (url: string) => boolean;
}

/**
 * SPICE (Systemic Pulse & Interface Correlation Engine)
 * Utility for cross-component signaling and asset verification.
 */
export const SPICE: SpiceUtility = {
  triggerShake: ref(false),
  isNoise: (url: string) => url.includes('manifesto_stream.mp4')
};
