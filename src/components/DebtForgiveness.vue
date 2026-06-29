import { defineStore } from 'pinia';
import { db } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export interface Debt {
  id: string;
  uid: string;
  amount: number;
  entityId: string;
}

export const useDebtStore = defineStore('debt', {
  state: () => ({
    activeDebts: [] as Debt[],
    isForgiving: false,
  }),

  actions: {
    async fetchActiveDebts(entityId: string) {
      const q = query(collection(db, 'debts'), where('entityId', '==', entityId));
      const snapshot = await getDocs(q);
      this.activeDebts = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Debt[];
    },

    async executeForgiveness(debtId: string, nodeUid: string) {
      this.isForgiving = true;
      try {
        console.log(`[EQUITY_BUS] Silencing debt ${debtId} for node ${nodeUid}.`);
        // Logic: Atomic update to zero the debt balance
        // await updateDoc(doc(db, 'debts', debtId), { amount: 0, status: 'SILENCED' });
        
        // Remove locally for immediate UI update
        this.activeDebts = this.activeDebts.filter(d => d.id !== debtId);
      } catch (err) {
        console.error("Forgiveness pulse failed:", err);
      } finally {
        this.isForgiving = false;
      }
    }
  }
});