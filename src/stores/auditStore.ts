import { defineStore } from 'pinia';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  limit, 
  startAfter, 
  getCountFromServer,
  orderBy,
  type QueryDocumentSnapshot,
  type DocumentData
} from 'firebase/firestore';
import { app } from '@/firebase';

export const useAuditStore = defineStore('audit', {
  state: () => ({
    logs: [] as DocumentData[],
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    /**
     * Fetches audit logs in batches, reporting progress back to the UI.
     * This integrates directly with the prefetch directive's progress bar.
     */
    async fetchAuditLogsChunked(onProgress?: (percent: number) => void) {
      this.isLoading = true;
      this.error = null;
      try {
        const db = getFirestore(app);
        const logsCol = collection(db, 'audit_logs');

        // 1. Get total count for progress calculations.
        // getCountFromServer is optimized for performance and cost.
        const countSnapshot = await getCountFromServer(logsCol);
        const total = countSnapshot.data().count;

        if (total === 0) {
          onProgress?.(100);
          return;
        }

        const batchSize = 50;
        let fetched = 0;
        let lastDoc: QueryDocumentSnapshot | null = null;
        const results: DocumentData[] = [];

        while (fetched < total) {
          const q = lastDoc 
            ? query(logsCol, orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(batchSize))
            : query(logsCol, orderBy('timestamp', 'desc'), limit(batchSize));

          const snapshot = await getDocs(q);
          if (snapshot.empty) break;

          snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
          fetched += snapshot.size;
          lastDoc = snapshot.docs[snapshot.docs.length - 1];

          // Report the calculated percentage to the prefetch utility's globalProgress
          onProgress?.(Math.round((fetched / total) * 100));
        }

        this.logs = results;
      } catch (err: any) {
        console.error('[AUDIT_STORE] Batch fetch failed:', err);
        this.error = err.message || 'System Fracture: Failed to synchronize audit substrate.';
        // Re-throw so the prefetch utility warning system is also triggered
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    clearError() {
      this.error = null;
    }
  }
});
