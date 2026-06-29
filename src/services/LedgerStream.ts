import { ref } from 'vue';
import { useMeshStore } from '@/stores/meshStore';

class LedgerStreamService {
  private socket: WebSocket | null = null;
  private isConnected = ref(false);
  private mesh = useMeshStore();

  /**
   * ESTABLISH_SYNC:
   * Initializes the cross-thread bridge.
   */
  public connect(endpoint: string) {
    this.socket = new WebSocket(endpoint);
    
    this.socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      this.processIncomingLedger(payload);
    };
  }

  /**
   * PROCESS_INCOMING_LEDGER:
   * Thread-agnostic data injection. If the data belongs to a different 
   * thread, it is buffered; if it belongs to current, it is committed.
   */
  private processIncomingLedger(data: any) {
    const { targetThread, sequenceId, mutation } = data;
    
    if (targetThread === this.mesh.activeThreads) {
      this.mesh.applyMutation(mutation);
    } else {
      // Buffer the cross-thread state for local observability
      this.mesh.bufferExternalThread(targetThread, mutation);
    }
  }

  /**
   * EMIT_STATE:
   * Broadcasts a mutation to the global ledger.
   */
  public broadcast(mutation: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        threadId: this.mesh.activeThreads,
        timestamp: Date.now(),
        mutation
      }));
    }
  }
}

export const ledgerStream = new LedgerStreamService();