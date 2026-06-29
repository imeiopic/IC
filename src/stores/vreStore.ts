import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
import { iopicWorldVRE } from '../vreModel';
import { validateCoinXResonance } from '../coinxModel';

/**
 * VRE Store: Manages the global 4D World State and monitors systemic resonance.
 * It acts as the "Root Anchor" for 16-thread synchronization.
 */
export const useVREStore = defineStore('vre', () => {
  // 1. Initialize the VRE as a reactive substrate
  const worldState = reactive(iopicWorldVRE);

  // 2. Set up the Reactive Monitor
  watch(
    () => worldState.coinxs,
    (newCoinXs) => {
      const threshold = worldState.protocols.integrityThreshold;

      // Filter for contracts that are currently ACTIVE in the exchange bus
      const activeContracts = newCoinXs.filter(cx => cx.contract.status === 'ACTIVE');

      // Evaluate if any active contract has drifted below the resonance baseline
      const driftDetected = activeContracts.some(cx => !validateCoinXResonance(cx, threshold));

      if (driftDetected) {
        // If the 16-thread bus is fractured, switch to SYNCING to protect integrity
        if (worldState.status !== 'SYNCING') {
          console.warn('[VRE_MONITOR] Resonance fracture detected in active handshakes. Reconciling bus.');
          worldState.status = 'SYNCING';
        }
      } else if (worldState.status === 'SYNCING' && activeContracts.length > 0) {
        // Automatically restore ACTIVE status if symmetry is regained
        console.log('[VRE_MONITOR] All active nodes grounded. Resuming system resonance.');
        worldState.status = 'ACTIVE';
      }
    },
    { deep: true } // Crucial: monitors properties inside the array objects
  );

  return { worldState };
});
