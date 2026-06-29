import { defineStore } from 'pinia';

export interface ThreadState {
  id: number;
  binary: string;
  name: string;
  synced: boolean;
}

export const useSyncStore = defineStore('sync', {
  state: () => ({
    isSyncing: false,
    driftAmount: 0.004,
    syncStatusText: 'Local spatial substrate [41.4993, -81.6944] matches Planetary Node Master.',
    threads: [
      { id: 1, binary: '0001', name: 'BASE_IDENTITY', synced: true },
      { id: 2, binary: '0100', name: 'SPACE_LOCALITY', synced: true },
      { id: 3, binary: '0110', name: 'SOCIAL_PEER_MESH', synced: true },
      { id: 4, binary: '1010', name: 'EQUITY_LEDGER', synced: false },
    ] as ThreadState[],
  }),

  actions: {
    async triggerPhaseSync() {
      this.isSyncing = true;
      this.syncStatusText = 'Re-routing 16-thread bus through SPICE API gateway... Stripping clock noise.';

      // Simulate handshake latency for phase locking
      await new Promise((resolve) => setTimeout(resolve, 2500));

      this.isSyncing = false;
      this.driftAmount = 0.000;
      this.threads.forEach(t => t.synced = true);
      this.syncStatusText = 'Total Phase Lock achieved. 1.1x / 2.2x operational multiplier resonance stabilized.';
      
      console.log("[SYNC_BUS] Global Mesh phase alignment fully grounded.");
    }
  }
});