import { defineStore } from 'pinia';
import { type LedgerMutation } from '@/services/LedgerStreamService';

export type ConnectionState = 'DISCONNECTED' | 'AUTHENTICATING' | 'SYNCING' | 'ACTIVE' | 'ERROR';

export const MutationTypes = {
  BANK_CONNECTION_ESTABLISHED: 'BANK_CONNECTION_ESTABLISHED',
  ASSET_DEPOSIT_CONFIRMED: 'ASSET_DEPOSIT_CONFIRMED',
  THREAD_MIGRATION_INITIATED: 'THREAD_MIGRATION_INITIATED',
  FRACTURE_REPORTED: 'FRACTURE_REPORTED'
} as const;

export const useMeshStore = defineStore('mesh', {
  state: () => ({
    state: 'DISCONNECTED' as ConnectionState,
    nodeId: null as string | null,
    meshLatency: 0,
    activeThreads: 0,
    // Buffer for cross-thread observability
    externalThreadBuffer: [] as LedgerMutation[],
    // Listener registry for MeshLogViewer
    subscribers: [] as ((mutation: LedgerMutation) => void)[]
  }),

  actions: {
    async initiateHandshake(id: string) {
      this.state = 'AUTHENTICATING';
      try {
        this.nodeId = id;
        // Mocking handshake logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.state = 'ACTIVE';
      } catch (err) {
        this.state = 'ERROR';
        console.error('[MESH_HANDSHAKE_FRACTURE]', err);
      }
    },

    /**
     * APPLY_MUTATION: 
     * Central dispatcher for incoming ledger events.
     */
    applyMutation(mutation: LedgerMutation) {
      // Notify log viewers
      this.subscribers.forEach(sub => sub(mutation));

      switch (mutation.type) {
        case MutationTypes.BANK_CONNECTION_ESTABLISHED:
          console.log('[MESH_CORE] Banking secured');
          break;
        case MutationTypes.THREAD_MIGRATION_INITIATED:
          this.activeThreads = mutation.payload.targetThread;
          break;
        default:
          console.warn(`[MESH_CORE] Unhandled mutation: ${mutation.type}`);
      }
    },

    bufferExternalThread(threadId: number, mutation: LedgerMutation) {
      this.externalThreadBuffer.unshift({ ...mutation, targetThread: threadId });
      if (this.externalThreadBuffer.length > 50) this.externalThreadBuffer.pop();
    },

    subscribeToLedger(callback: (m: LedgerMutation) => void) {
      this.subscribers.push(callback);
    },

    unsubscribeFromLedger(callback: (m: LedgerMutation) => void) {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    },

    logEvent(type: string, payload: any) {
      console.info(`[MESH_LOG] ${type}:`, payload);
      // Optional: Send to logging service (e.g., Sentry/Datadog)
    }
  }
});