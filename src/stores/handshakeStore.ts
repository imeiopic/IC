import { defineStore } from 'pinia';
import { db } from '@/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';

export const useHandshakeStore = defineStore('handshake', {
  state: () => ({
    activeHandshakes: [] as any[],
    isProcessing: false,
    error: null as string | null,
  }),

  actions: {
    async requestPeerHandshake(targetUid: string) {
      this.isProcessing = true;
      this.error = null;

      try {
        // Logic to push handshake request to Firestore
        await addDoc(collection(db, 'handshakes'), {
          targetUid,
          status: 'pending',
          createdAt: serverTimestamp(),
        });
      } catch (err: any) {
        this.error = 'Handshake transmission failed: ' + err.message;
      } finally {
        this.isProcessing = false;
      }
    },

    // Optional: Real-time listener to track handshake status
    subscribeToHandshakes(userId: string) {
      const q = query(
        collection(db, 'handshakes'),
        where('targetUid', '==', userId)
      );

      onSnapshot(q, (snapshot) => {
        this.activeHandshakes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });
    }
  }
});