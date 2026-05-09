<template>
  <CContainer fluid class="buyer-substrate p-4 bg-black min-vh-100 font-mono text-white">
    <header class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-bag-check text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">VRE_MARKETPLACE</h1>
      </div>
      <div class="equity-status text-end">
        <span class="tiny text-zinc-500 d-block">LIQUID_EQUITY</span>
        <span class="text-success fw-bold">{{ userEquity }} IO$</span>
      </div>
    </header>

    <CRow>
      <CCol lg="8">
        <div class="search-substrate mb-4">
          <CFormInput 
            v-model="searchQuery" 
            placeholder="FILTER_BY_ENTITY_OR_RESOURCE..." 
            class="bg-zinc-950 border-zinc-800 text-info font-mono"
          />
        </div>

        <CRow class="g-4">
          <CCol v-for="item in filteredMarket" :key="item.id" md="6" xl="4">
            <CCard class="bg-zinc-900 border-zinc-800 h-100 item-card transition-all">
              <CCardBody class="d-flex flex-column">
                <div class="d-flex justify-content-between mb-3">
                  <CBadge color="dark" class="border border-zinc-700 text-zinc-400 tiny">
                    {{ item.category }}
                  </CBadge>
                  <span class="text-success fw-black">{{ item.price }} IO$</span>
                </div>
                <h5 class="font-black italic mb-2">{{ item.name }}</h5>
                <p class="tiny text-zinc-500 mb-4">{{ item.description }}</p>
                
                <div class="mt-auto pt-3 border-top border-zinc-800 d-flex justify-content-between align-items-center">
                  <span class="tiny font-mono opacity-50">NODE: {{ item.sellerNode }}</span>
                  <CButton 
                    color="info" 
                    size="sm" 
                    variant="outline" 
                    class="font-black px-3"
                    @click="initiatePurchase(item)"
                    :disabled="userEquity < item.price"
                  >
                    ACQUIRE
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CCol>

      <CCol lg="4">
        <CCard class="bg-zinc-900 border-info text-white shadow-glow sticky-top" style="top: 20px;">
          <CCardHeader class="font-black italic text-info">ACQUISITION_LEDGER</CCardHeader>
          <CCardBody v-if="selectedItem">
            <div class="item-summary mb-4">
              <h4 class="text-info font-black mb-1">{{ selectedItem.name }}</h4>
              <p class="small italic text-zinc-400">"{{ selectedItem.description }}"</p>
            </div>

            <div class="transit-details p-3 bg-black rounded border border-zinc-800 mb-4">
              <div class="d-flex justify-content-between small mb-2">
                <span class="text-zinc-500">SUBTOTAL</span>
                <span>{{ selectedItem.price }} IO$</span>
              </div>
              <div class="d-flex justify-content-between small mb-2">
                <span class="text-zinc-500">MESH_FEE (0%)</span>
                <span>0.00 IO$</span>
              </div>
              <hr class="border-zinc-800">
              <div class="d-flex justify-content-between fw-bold text-success">
                <span>TOTAL_TRANSIT</span>
                <span>{{ selectedItem.price }} IO$</span>
              </div>
            </div>

            <CButton 
              color="info" 
              class="w-100 py-3 font-black italic shadow-info"
              @click="executePurchase"
              :disabled="isProcessing"
            >
              <span v-if="!isProcessing">CONFIRM_ACQUISITION</span>
              <span v-else class="vibrate">POLICING_TRANSIT...</span>
            </CButton>
          </CCardBody>
          <CCardBody v-else class="text-center py-5 opacity-25">
            SELECT_MARKET_RESOURCE_FOR_SIGHTING
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db, auth } from '../firebase';
import { 
  collection, query, onSnapshot, doc, 
  runTransaction, serverTimestamp, where 
} from 'firebase/firestore';

// SYSTEM STATE
const userEquity = ref(0);
const searchQuery = ref('');
const marketItems = ref<any[]>([]);
const selectedItem = ref<any>(null);
const isProcessing = ref(false);

/**
 * 01_SIGHTING_MARKET_AND_EQUITY
 */
const initMarketSubstrate = () => {
  // Listen for global market items
  onSnapshot(collection(db, 'marketplace'), (snapshot) => {
    marketItems.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });

  // Listen for User Equity Pulse
  if (auth.currentUser) {
    onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) userEquity.value = doc.data().iowb?.balance || 0;
    });
  }
};

const filteredMarket = computed(() => {
  return marketItems.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const initiatePurchase = (item: any) => {
  selectedItem.value = item;
};

/**
 * 02_EXECUTE_PURCHASE
 * Atomic P2P Equity Transit
 */
const executePurchase = async () => {
  if (!selectedItem.value || !auth.currentUser) return;
  isProcessing.value = true;

  try {
    await runTransaction(db, async (transaction) => {
      const buyerRef = doc(db, 'users', auth.currentUser!.uid);
      const sellerRef = doc(db, 'users', selectedItem.value.sellerID);
      const purchaseLogRef = doc(collection(db, 'transactions'));

      const buyerSnap = await transaction.get(buyerRef);
      const sellerSnap = await transaction.get(sellerRef);

      if (buyerSnap.data()?.iowb.balance < selectedItem.value.price) {
        throw "INSUFFICIENT_EQUITY";
      }

      // 1. Deduct from Buyer
      transaction.update(buyerRef, {
        'iowb.balance': buyerSnap.data()?.iowb.balance - selectedItem.value.price
      });

      // 2. Add to Seller
      transaction.update(sellerRef, {
        'iowb.balance': (sellerSnap.data()?.iowb.balance || 0) + selectedItem.value.price
      });

      // 3. Log Transit Artifact
      transaction.set(purchaseLogRef, {
        buyerID: auth.currentUser!.uid,
        sellerID: selectedItem.value.sellerID,
        itemID: selectedItem.value.id,
        amount: selectedItem.value.price,
        timestamp: serverTimestamp(),
        status: 'TRANSIT_COMPLETE'
      });
    });

    alert("ACQUISITION_SUCCESS: Equity transited, resource grounded.");
    selectedItem.value = null;
  } catch (err) {
    console.error("TRANSIT_FRACTURE:", err);
    alert("TRANSIT_FAILED: Noise detected in the ledger.");
  } finally {
    isProcessing.value = false;
  }
};

onMounted(() => {
  initMarketSubstrate();
});
</script>

<style scoped>
.item-card { cursor: pointer; border-radius: 12px; }
.item-card:hover { border-color: #00e5ff !important; transform: translateY(-5px); }
.bg-zinc-950 { background-color: #050505; }
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.15) !important; }
.font-black { font-weight: 900; }
.fw-black { font-weight: 900; }
.tiny { font-size: 0.65rem; }
.italic { font-style: italic; }
.vibrate { animation: jitter 0.1s infinite; }
@keyframes jitter {
  0% { transform: translate(1px, -1px); }
  100% { transform: translate(-1px, 1px); }
}
</style>