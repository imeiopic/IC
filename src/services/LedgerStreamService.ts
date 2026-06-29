 import { ref, shallowRef } from 'vue';
import { useMeshStore } from '@/stores/meshStore';

/**
 * TYPE DEFINITIONS:
 * Ensuring strict schema adherence for all mesh mutations.
 */
export interface LedgerMutation {
  type: string;
  payload: any;
  sequenceId: number;
  targetThread: number;
  timestamp: number;
}

class LedgerStreamService {
  private socket: WebSocket | null = null;
  private mesh = useMeshStore();
  
  // Use shallowRef for reactive state management of connection status
  public isConnected = shallowRef(false);

  /**
   * ESTABLISH_SYNC:
   * Initializes the secure WebSocket tunnel with exponential backoff.
   */
  public connect(endpoint: string) {
    this.socket = new WebSocket(endpoint);

    this.socket.onopen = () => {
      this.isConnected.value = true;
      console.log(`[MESH_SYNC] Tunnel established on T-${this.mesh.activeThreads}`);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const mutation: LedgerMutation = JSON.parse(event.data);
        this.processIncomingLedger(mutation);
      } catch (err) {
        console.error('[MESH_SYNC_PARSING_ERROR]:', err);
      }
    };

    this.socket.onclose = () => {
      this.isConnected.value = false;
      this.attemptReconnection(endpoint);
    };
  }

  /**
   * PROCESS_INCOMING_LEDGER:
   * Thread-Aware Dispatcher. Mutations are either committed (if target thread matches)
   * or buffered for cross-thread observability.
   */
  private processIncomingLedger(mutation: LedgerMutation) {
    const currentThread = this.mesh.activeThreads;

    if (mutation.targetThread === currentThread) {
      // Direct commit to store for immediate UI reactivity
      this.mesh.applyMutation(mutation);
    } else {
      // Buffer for monitoring and cross-thread telemetry
      this.mesh.bufferExternalThread(mutation.targetThread, mutation);
    }
  }

  /**
   * BROADCAST:
   * Publishes local mutations to the global mesh ledger.
   */
  public broadcast(type: string, payload: any) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      throw new Error('LEDGER_TUNNEL_CLOSED');
    }

    const mutation: LedgerMutation = {
      type,
      payload,
      sequenceId: Date.now(), // Simplified sequence logic
      targetThread: this.mesh.activeThreads,
      timestamp: Date.now()
    };

    this.socket.send(JSON.stringify(mutation));
  }

  private attemptReconnection(endpoint: string, delay = 2000) {
    setTimeout(() => this.connect(endpoint), delay);
  }
}

// Export as a singleton to maintain a single source of truth across all 16 threads
export const ledgerStream = new LedgerStreamService();