import { db } from '@/firebase';
import { MeshManager } from '@/services/MeshManager';
import { collection, onSnapshot, orderBy, query, Timestamp, where, QueryConstraint } from 'firebase/firestore';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface CollectiveAnchor {
  id: string;
  name: string;
  multiplier: number;
  description: string;
  locality?: string;
  stake: number;
  images: string[];
  default_price: string;
  active: boolean;
  lastSync: Timestamp | null;
  metadata: Record<string, any> & {
    stabilityIndex?: number;
    consecutiveHandshakes?: number;
  };
}

export const useAnchorsStore = defineStore('anchors', () => {
  const anchors = ref<CollectiveAnchor[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  let unsubscribe: (() => void) | null = null;
  let syncTimeout: ReturnType<typeof setTimeout> | null = null;
  const pendingSyncIds = new Set<string>();

  /**
   * Establishes a real-time stream with the Collective Anchor registry.
   * Peer discovery triggers the automated grounding protocol.
   */
  const fetchAnchors = (locality?: string) => {
    loading.value = true;

    const constraints: QueryConstraint[] = [orderBy('multiplier', 'desc')];
    if (locality) {
      constraints.unshift(where('locality', '==', locality));
    }

    const q = query(collection(db, 'anchors'), ...constraints);

    unsubscribe = onSnapshot(q, (snapshot) => {
      // Identify specific changes to optimize background grounding
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          pendingSyncIds.add(change.doc.id);
        }
      });

      anchors.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CollectiveAnchor));

      loading.value = false;

      // Automated Mesh Integration: Background stability calculation
      performBackgroundMeshSync();
    }, (err) => {
      console.error('[ANCHOR_STORE] Sync Error:', err);
      error.value = "[CRITICAL_SYNC_FAILURE]: " + err.message;
      loading.value = false;
    });
  };

  /**
   * Background Grounding Protocol
   * Evaluates newly discovered peers and commits stability indices back to the mesh.
   */
  const performBackgroundMeshSync = () => {
    if (syncTimeout) clearTimeout(syncTimeout);

    syncTimeout = setTimeout(async () => {
      const STALE_THRESHOLD_MS = 300000; // 5 minutes
      const now = Date.now();

      // Capture the IDs that triggered this sync and clear the set for new arrivals
      const idsToSync = Array.from(pendingSyncIds);
      pendingSyncIds.clear();

      for (const id of idsToSync) {
        const anchor = anchors.value.find(a => a.id === id);
        if (!anchor) continue;

        const lastHandshake = (anchor.lastSync as any)?.toMillis?.() || 0;
        
        // If the node lacks a stability index or is stale, ground it in the background
        if (!anchor.metadata.stabilityIndex || (now - lastHandshake > STALE_THRESHOLD_MS)) {
          try {
            console.log(`[MESH_MANAGER] Background grounding initiated for: ${anchor.name}`);
            await MeshManager.syncNode(
              anchor.id,
              anchor.multiplier,
              anchors.value.length,
              anchor.metadata.consecutiveHandshakes || 0,
              anchor.lastSync
            );
          } catch (e) {
            console.warn(`[MESH_MANAGER] Automated grounding failed for ${anchor.id}:`, e);
          }
        }
      }
      syncTimeout = null;
    }, 2000); // 2 second debounce to prevent excessive Firestore writes during rapid discovery
  };

  const stopSync = () => {
    if (unsubscribe) unsubscribe();
    if (syncTimeout) {
      clearTimeout(syncTimeout);
      syncTimeout = null;
    }
    pendingSyncIds.clear();
  };

  return { anchors, loading, error, fetchAnchors, stopSync };
});
