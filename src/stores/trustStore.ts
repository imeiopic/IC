import { defineStore } from 'pinia';

export const useTrustStore = defineStore('trust', {
  state: () => ({
    isApexResonanceActive: false,
    // You might want to store the SUID of the connected node here as well
    // connectedApexNodeId: null as string | null,
  }),
  actions: {
    /**
     * Activates the 2.2x Mutual Apex Resonance.
     * This is called when a binary trust handshake is successfully verified.
     */
    activateApexResonance() {
      this.isApexResonanceActive = true;
      console.log('TRUST_STORE: 2.2x Mutual Apex Resonance Activated.');
    },
  },
});
