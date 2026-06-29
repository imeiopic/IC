import { defineStore } from 'pinia';
import { db } from '@/firebase';
import { 
  collection, query, where, onSnapshot, 
  runTransaction, doc, serverTimestamp 
} from 'firebase/firestore';

export interface MarketItem {
  id: string;
  name: string;
  price: number;
  sellerID: string;
  category: string;
  description: string;
}

export const useMarketStore = defineStore('market', {
  state: () => ({
    marketItems: [] as MarketItem[],
    buyerOrders: [] as any[],
    isProcessing: false,
    wsConnected: false,
    socket: null as WebSocket | null,
  }),

  actions: {
    // --- WebSocket Stream Handling ---
    initLedgerStream() {
      this.socket = new WebSocket('wss://ledger.iopic.mesh');
      
      this.socket.onopen = () => { this.wsConnected = true; };
      
      this.socket.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.type === 'TX_CONFIRMED') {
          console.log(`[LEDGER_PULSE] Transaction ${payload.txId} grounded.`);
        }
      };

      this.socket.onclose = () => { 
        this.wsConnected = false;
        setTimeout(this.initLedgerStream, 5000); // Auto-reconnect
      };
    },

    // --- Market Subscription ---
    subscribeToMarket(sellerId: string | null = null) {
      const colRef = collection(db, 'marketplace');
      const q = sellerId ? query(colRef, where('sellerID', '==', sellerId)) : colRef;
      
      return onSnapshot(q, (snap) => {
        this.marketItems = snap.docs.map(d => ({ 
          id: d.id, 
          ...d.data() 
        })) as MarketItem[];
      });
    },

    // --- Atomic IOWB Transaction ---
    async executePurchase(item: MarketItem, buyerId: string) {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        await runTransaction(db, async (tx) => {
          const buyerRef = doc(db, 'users', buyerId);
          const sellerRef = doc(db, 'users', item.sellerID);
          const txLogRef = doc(collection(db, 'transactions'));

          const [bSnap, sSnap] = await Promise.all([tx.get(buyerRef), tx.get(sellerRef)]);
          const bBal = bSnap.data()?.iowb?.balance || 0;

          if (bBal < item.price) throw new Error('INSUFFICIENT_EQUITY');

          // Execute atomic state update
          tx.update(buyerRef, { 'iowb.balance': bBal - item.price });
          tx.update(sellerRef, { 'iowb.balance': (sSnap.data()?.iowb?.balance || 0) + item.price });
          tx.set(txLogRef, { 
            ...item, 
            buyerID: buyerId, 
            status: 'COMPLETED',
            timestamp: serverTimestamp() 
          });
        });

        // Pulse the ledger via WebSocket
        this.socket?.send(JSON.stringify({ type: 'TX_REQUEST', itemID: item.id }));
        
      } catch (err: any) {
        console.error("[EQUITY_BUS] Transit Fracture:", err.message);
        throw err;
      } finally {
        this.isProcessing = false;
      }
    }
  }
});