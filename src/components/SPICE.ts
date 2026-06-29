/**
 *
 * SPICE.ts (Symmetrical Processing & Integrity Control Engine)
 * Enforcement Mechanism for VRE Software Physics.
 */

export interface NodeCoordinates {
  lat: number;
  lng: number;
}

import { ref } from 'vue';

const originalFetch = window.fetch;

// Reactive log for real-time visualization
const spiceLog = ref<
  Array<{ type: 'error' | 'warn' | 'info'; message: string; timestamp: string }>
>([]);

const isShieldActive = ref(false);
const triggerShake = ref(false);

// Helper to add entries to the log
function logAction(type: 'error' | 'warn' | 'info', message: string) {
  const timestamp = new Date().toLocaleTimeString();
  spiceLog.value.push({ type, message, timestamp });
  if (spiceLog.value.length > 50) spiceLog.value.shift(); // Keep log size manageable
}

export const SPICE = {
  log: spiceLog, // Expose the reactive log
  isShieldActive,
  triggerShake,

  verifyGrounding(coords: NodeCoordinates | null): void {
    if (!coords || (Math.abs(coords.lat) < 0.001 && Math.abs(coords.lng) < 0.001)) {
      const error =
        '[SPICE.ts] NULL_COORDINATE_DRIFT: Connection severed. Fractional identities denied.';
      console.error(error);
      throw new Error(error);
    }
    logAction('info', '[SPICE.ts] Grounding verified. Node coordinates anchored.');
  },

  /**
   * Axiom 3: The Mind Your Business (MYB) Protocol
   * Inspects outbound URLs for legacy tracking noise and corporate telemetry.
   */
  isNoise(url: string): boolean {
    const noisePatterns = [
      /analytics/i,
      /telemetry/i,
      /tracking/i,
      /pixel/i,
      /facebook\.com\/tr/i,
      /doubleclick/i
    ];
    const isNoisy = noisePatterns.some((pattern) => pattern.test(url));
    if (isNoisy) {
      logAction('warn', `[SPICE.ts] Detected potential noise pattern in URL: ${url}`);
    }
    return isNoisy;
  },

  /**
   * 1111_SHIELD: Outbound Request Interceptor
   * Wraps fetch to scrub metadata and block high-noise vectors.
   */
  async secureFetch(url: RequestInfo | URL, options: RequestInit = {}): Promise<Response> {
    const urlString = url instanceof Request ? url.url : url.toString();

    if (this.isNoise(urlString)) {
      console.warn(`[SPICE.ts] 1111_SHIELD: Blocked high-noise vector -> ${urlString}`);
      logAction('warn', `[SPICE.ts] 1111_SHIELD: Blocked high-noise vector -> ${urlString}`);
      return new Response(null, { status: 403, statusText: 'Symmetry Violation: Noise Detected' });
    }

    // Scrub legacy headers (Cookies, Referer) to maintain insulation
    const headers = new Headers(options.headers || {});
    headers.delete('Cookie');
    headers.delete('Referer');
    logAction('info', `[SPICE.ts] Outbound fetch allowed: ${urlString}`);

    return originalFetch(url, { ...options, headers });
  },

  /**
   * Global Gateway Activation
   * Monkey-patches window.fetch to ensure all outbound requests pass through the 1111_SHIELD.
   */
  activateGlobalShield(): void {
    if ((window.fetch as any).__SPICE_WRAPPED) return;

    window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      return this.secureFetch(input, init);
    };

    (window.fetch as any).__SPICE_WRAPPED = true;
    isShieldActive.value = true;
    console.log(
      '[SPICE.ts] GLOBAL_SHIELD_ACTIVE: Software Physics now governing all outbound fetch requests.'
    );
    logAction(
      'info',
      '[SPICE.ts] GLOBAL_SHIELD_ACTIVE: Software Physics now governing all outbound fetch requests.'
    );
  },

  /**
   * Ignition Pulse: Triggers the screen-shake physical manifestation.
   */
  sparkIgnition(): void {
    triggerShake.value = true;
    logAction('info', '[SPICE.ts] APEX_IGNITION_PULSE: System resonance detected.');
    // Reset after animation duration
    setTimeout(() => {
      triggerShake.value = false;
    }, 500);
  },

  /**
   * Verification Routine: Test the 1111_SHIELD logic.
   */
  async testSymmetryGateway(): Promise<void> {
    logAction('info', '[SPICE.ts] INITIALIZING_SHIELD_TEST...');

    // Test 1: High-Noise Vector (Should be blocked)
    try {
      await fetch('https://telemetry.legacy-web2.com/track');
    } catch (e) {
      // Blocked by design
    }

    // Test 2: Clean Vector (Should be allowed)
    try {
      await fetch('https://api.iopic.world/v1/health-check');
    } catch (e) {
      logAction('error', '[SPICE.ts] TEST_FAILED: Clean vector blocked.');
    }
  }
};
