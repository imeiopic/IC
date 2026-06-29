import { ref, markRaw } from 'vue';
import * as Sentry from '@sentry/vue';

// Types for Governance
export type ShieldStatus = 'ACTIVE' | 'BYPASSED' | 'ERROR';
export interface Policy {
  blockedPatterns: RegExp[];
  whitelistedOrigins: string[];
}

// 1. Immutable Security Policy
const POLICY: Policy = {
  blockedPatterns: [
    /analytics/i, /telemetry/i, /tracking/i, /pixel/i,
    /doubleclick/i, /facebook\.com/i, /sentry\.io\/api\/[0-9]+\/envelope/i // Ignore sentry itself
  ],
  whitelistedOrigins: [window.location.origin, 'https://api.iopic.world']
};

const isShieldActive = ref<ShieldStatus>('ACTIVE');
const triggerShake = ref(false);

/**
 * PRODUCTION GOVERNANCE: 
 * Centralized logic to enforce integrity without local mock artifacts.
 */
export const SPICE = {
  isShieldActive,
  triggerShake,

  isNoise(url: string): boolean {
    const isBlocked = POLICY.blockedPatterns.some((pattern) => pattern.test(url));
    const isWhitelisted = POLICY.whitelistedOrigins.some((origin) => url.startsWith(origin));
    return isBlocked && !isWhitelisted;
  },

  activateGlobalShield(): void {
    if ((window.fetch as any).__SPICE_WRAPPED) return;

    // Patch Fetch
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = input instanceof Request ? input.url : input.toString();
      
      if (this.isNoise(url)) {
        Sentry.captureMessage(`[SPICE] Blocked noise vector: ${url}`, 'warning');
        return new Response(null, { status: 403, statusText: 'Forbidden: Sovereignty Policy' });
      }
      return originalFetch(input, init);
    };

    // Patch XHR (Essential for older Firebase SDK methods)
    const originalXHR = window.XMLHttpRequest;
    (window as any).XMLHttpRequest = class extends originalXHR {
      open(method: string, url: string, ...args: any[]) {
        if (SPICE.isNoise(url)) {
          Sentry.captureMessage(`[SPICE] XHR Blocked: ${url}`, 'warning');
          return; 
        }
        super.open(method, url, ...args as any);
      }
    };

    (window.fetch as any).__SPICE_WRAPPED = true;
    isShieldActive.value = 'ACTIVE';
  },

  sparkIgnition(): void {
    triggerShake.value = true;
    setTimeout(() => triggerShake.value = false, 500);
  }
};