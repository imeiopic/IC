<template>
  <CContainer fluid class="commerce-substrate p-4 bg-black min-vh-100 font-mono text-white">
    <div class="equity-display text-end">
      <div class="tiny text-zinc-500 mb-1">TOTAL_MESH_EQUITY</div>
      <div class="h2 text-success font-black m-0">
        {{ loadingBalance ? '...' : userBalance.toLocaleString() }} IO$
      </div>
    </div>

    <div class="transit-log-substrate mt-5">
      <h5 class="text-zinc-500 tiny uppercase mb-3 px-2">Recent_Ledger_Artifacts</h5>
      <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-4">
        <div v-if="loadingTx" class="text-center py-4 italic">SYNCING_LEDGER...</div>
        <div v-else-if="recentTransactions.length === 0" class="text-center py-4 opacity-25 italic">
          NO_RECENT_TRANSITS_SIGHTED
        </div>
        
        <div v-for="tx in recentTransactions" :key="tx.id" class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-zinc-900">
          <div class="d-flex align-items-center gap-3">
            <div :class="tx.buyerID === userId ? 'text-danger' : 'text-success'">
              <i :class="tx.buyerID === userId ? 'bi bi-arrow-down-left-circle' : 'bi bi-arrow-up-right-circle'"></i>
            </div>
            <div>
              <div class="small font-black">{{ tx.itemID || 'UNKNOWN_ITEM' }}</div>
              <div class="tiny text-zinc-600 font-mono">{{ formatDate(tx.timestamp) }}</div>
            </div>
          </div>
          <div class="font-black" :class="tx.buyerID === userId ? 'text-white' : 'text-success'">
            {{ tx.buyerID === userId ? '-' : '+' }}{{ tx.amount?.toLocaleString() || 0 }} IO$
          </div>
        </div>
      </div>
    </div>
  </CContainer>
</template>

<script setup lang="ts">
import { auth, db } from '@/firebase';
import { doc, onSnapshot, query, collection, where, orderBy, limit, Unsubscribe } from 'firebase/firestore';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface Transaction {
  id: string;
  itemID: string;
  timestamp: any;
  buyerID: string;
  amount: number;
}

const router = useRouter();
const userBalance = ref(0);
const loadingBalance = ref(true);
const loadingTx = ref(true);
const userId = auth.currentUser?.uid;
const recentTransactions = ref<Transaction[]>([]);

let unsubBalance: Unsubscribe;
let unsubTx: Unsubscribe;

const initCommerceStream = () => {
  if (!userId) return;

  // Sync Balance
  unsubBalance = onSnapshot(doc(db, 'users', userId), (snap) => {
    if (snap.exists()) {
      userBalance.value = snap.data().iowb?.balance || 0;
    }
    loadingBalance.value = false;
  });

  // Sync Ledger
  const txQuery = query(
    collection(db, 'transactions'),
    where('participants', 'array-contains', userId),
    orderBy('timestamp', 'desc'),
    limit(5)
  );

  unsubTx = onSnapshot(txQuery, (snap) => {
    recentTransactions.value = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
    loadingTx.value = false;
  });
};

onMounted(initCommerceStream);

// Vital for Production: Prevent memory leaks
onUnmounted(() => {
  if (unsubBalance) unsubBalance();
  if (unsubTx) unsubTx();
});

const transitTo = (path: string) => router.push({ name: path });
const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString() : 'SYNCING...';
</script>
<style scoped>
.text-glow { text-shadow: 0 0 15px rgba(0, 229, 255, 0.3); }
.menu-card { 
  cursor: pointer; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
}
.menu-card:hover { 
  transform: translateY(-10px); 
  background-color: #050505 !important;
}
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.1) !important; }
.shadow-success { box-shadow: 0 0 30px rgba(40, 167, 69, 0.1) !important; }
.shadow-warning { box-shadow: 0 0 30px rgba(255, 193, 7, 0.1) !important; }
.bg-zinc-950 { background-color: #050505; }
.last-child-border-0:last-child { border-bottom: 0 !important; }
.tiny { font-size: 0.65rem; }
.font-black { font-weight: 900; }
.italic { font-style: italic; }
</style>