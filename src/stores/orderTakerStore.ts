import { defineStore } from 'pinia';
import { db } from '@/firebase'; // Assuming your firebase config is here
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export interface OrderItem { name: string; quantity: number; }
export interface Order { id: string; total: number; items: OrderItem[]; }

export const useOrderTakerStore = defineStore('orderTaker', {
  state: () => ({
    activeOrders: [] as Order[],
    isProcessing: false,
  }),

  actions: {
    // Real-time listener for the Equity Bus
    listenToPendingOrders(entityId: string) {
      const q = query(
        collection(db, 'entities', entityId, 'orders'),
        where('status', '==', 'PENDING')
      );
      
      return onSnapshot(q, (snapshot) => {
        this.activeOrders = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Order[];
      });
    },

    async groundOrder(orderId: string, amount: number, entityId: string) {
      this.isProcessing = true;
      try {
        // Dispatch to root-level order processing logic
        console.log(`[EQUITY_BUS] Grounding order ${orderId} into the IOWB Ledger.`);
        // await this.processIowbTransaction({ orderId, amount, entityId });
      } catch (err) {
        console.error("Ledger Grounding Error:", err);
      } finally {
        this.isProcessing = false;
      }
    }
  }
});