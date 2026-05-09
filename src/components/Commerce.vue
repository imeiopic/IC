<template>
  <CContainer fluid class="commerce-substrate p-4 bg-black min-vh-100 font-mono text-white">
    
    <header class="d-flex justify-content-between align-items-end mb-5 border-bottom border-zinc-800 pb-4">
      <div class="brand">
        <h1 class="text-glow text-info m-0 italic font-black display-5">Ime.COMMERCE</h1>
        <p class="tiny text-zinc-500 m-0 mt-1 uppercase tracking-widest">Global_Equity_Exchange_V1</p>
      </div>
      <div class="equity-display text-end">
        <div class="tiny text-zinc-500 mb-1">TOTAL_MESH_EQUITY</div>
        <div class="h2 text-success font-black m-0">{{ userBalance }} IO$</div>
      </div>
    </header>

    <CRow class="g-4">
      <CCol md="4">
        <CCard class="bg-zinc-900 border-info text-info shadow-glow h-100 menu-card" @click="transitTo('Buyer')">
          <CCardBody class="d-flex flex-column align-items-center justify-content-center py-5">
            <i class="bi bi-cart4 display-1 mb-3"></i>
            <h3 class="font-black italic">BUY_RESOURCES</h3>
            <p class="tiny text-center opacity-75 px-4">Access the VRE Marketplace to acquire peer-grounded assets.</p>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md="4">
        <CCard class="bg-zinc-900 border-success text-success shadow-success h-100 menu-card" @click="transitTo('Seller')">
          <CCardBody class="d-flex flex-column align-items-center justify-content-center py-5">
            <i class="bi bi-shop display-1 mb-3"></i>
            <h3 class="font-black italic">SELL_RESOURCES</h3>
            <p class="tiny text-center opacity-75 px-4">Manifest your assets into the 16-thread bus for equity transit.</p>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md="4">
        <CCard class="bg-zinc-900 border-warning text-warning shadow-warning h-100 menu-card" @click="transitTo('Order')">
          <CCardBody class="d-flex flex-column align-items-center justify-content-center py-5">
            <i class="bi bi-lightning-charge display-1 mb-3"></i>
            <h3 class="font-black italic">MESH_DEMAND</h3>
            <p class="tiny text-center opacity-75 px-4">Request core resource allocations directly from Master Control.</p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <div class="transit-log-substrate mt-5">
      <h5 class="text-zinc-500 tiny uppercase mb-3 px-2">Recent_Ledger_Artifacts</h5>
      <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-4">
        <div v-if="recentTransactions.length === 0" class="text-center py-4 opacity-25 italic">
          NO_RECENT_TRANSITS_SIGHTED
        </div>
        <div v-for="tx in recentTransactions" :key="tx.id" class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-zinc-900 last-child-border-0">
          <div class="d-flex align-items-center gap-3">
            <div :class="tx.buyerID === userId ? 'text-danger' : 'text-success'">
              <i :class="tx.buyerID === userId ? 'bi bi-arrow-down-left-circle' : 'bi bi-arrow-up-right-circle'"></i>
            </div>
            <div>
              <div class="small font-black">{{ tx.itemID }}</div>
              <div class="tiny text-zinc-600 font-mono">{{ formatDate(tx.timestamp) }}</div>
            </div>
          </div>
          <div class="font-black" :class="tx.buyerID === userId ? 'text-white' : 'text-success'">
            {{ tx.buyerID === userId ? '-' : '+' }}{{ tx.amount }} IO$
          </div>
        </div>
      </div>
    </div>

    <footer class="mt-auto pt-5 text-center opacity-25">
      <div class="tiny">"I = VR² | THE LOOP IS COMPLETE"</div>
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';

const router = useRouter();
const userBalance = ref(0);
const userId = ref(auth.currentUser?.uid);
const recentTransactions = ref<any[]>([]);

/**
 * 01_SIGHTING_LEDGER_STATE
 */
const initCommerceStream = () => {
  if (!auth.currentUser) return;

  // Sync User Equity
  onSnapshot(doc(db, 'users', auth.currentUser.uid), (snap) => {
    if (snap.exists()) userBalance.value = snap.val().iowb?.balance || 0;
  });

  // Sync Recent Transactions (Global Ledger sightings)
  const txQuery = query(
    collection(db, 'transactions'),
    where('participants', 'array-contains', auth.currentUser.uid),
    orderBy('timestamp', 'desc'),
    limit(5)
  );

  onSnapshot(txQuery, (snap) => {
    recentTransactions.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
};

const transitTo = (path: string) => router.push({ name: path });

const formatDate = (ts: any) => {
  if (!ts) return 'TRANSIT...';
  return ts.toDate().toLocaleDateString();
};

onMounted(() => initCommerceStream());
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