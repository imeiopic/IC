import { ref, onMounted, onUnmounted } from 'vue';
import { doc, onSnapshot } from 'firebase/firestore';
// Import your initialized Firestore instance (adjust path as needed)
import { db } from '@/firebase';

export interface HeartbeatThread {
  threadId: number;
  status: string;
  equityAllocation: number;
}

export interface GlobalHeartbeat {
  status: string;
  systemVelocity: number;
  totalEquityTPE: number;
  threads: HeartbeatThread[];
  nandFlushComplete: boolean;
  message: string;
  initializedAt: any; // Can be typed specifically to Timestamp if imported from firebase/firestore
}

export function useGlobalHeartbeat() {
  const heartbeatData = ref<GlobalHeartbeat | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  let unsubscribe: (() => void) | null = null;

  const startListening = () => {
    isLoading.value = true;
    error.value = null;

    const heartbeatRef = doc(db, 'system_stats', 'heartbeat');

    // onSnapshot establishes a persistent websocket connection to this exact document
    unsubscribe = onSnapshot(
      heartbeatRef,
      (docSnap) => {
        if (docSnap.exists()) {
          heartbeatData.value = docSnap.data() as GlobalHeartbeat;
        } else {
          heartbeatData.value = null;
          // Handles the state before the script is triggered
          error.value = 'Holding at 0.00V. Awaiting Terminal 10.1 trigger...';
        }
        isLoading.value = false;
      },
      (err) => {
        console.error('❌ Heartbeat Connection Error:', err);
        error.value = err.message;
        isLoading.value = false;
      }
    );
  };

  onMounted(() => {
    startListening();
  });

  onUnmounted(() => {
    if (unsubscribe) unsubscribe();
  });

  return { heartbeatData, isLoading, error };
}
