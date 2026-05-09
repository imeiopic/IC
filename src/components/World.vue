<template>
  <CContainer fluid class="exchange-substrate p-4 bg-black min-vh-100 font-mono text-white">
    
    <header class="d-flex justify-content-between align-items-center mb-5 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-arrow-left-right text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">EQUITY_EXCHANGE</h1>
      </div>
      <div class="system-sync text-end">
        <div class="tiny text-zinc-500 uppercase">Current_Cluster</div>
        <div class="text-info font-black">CLE_VRE_01</div>
      </div>
    </header>

    <CRow class="justify-content-center">
      <CCol lg="5">
        <CCard class="bg-zinc-900 border-zinc-800 shadow-glow mb-4">
          <CCardHeader class="bg-zinc-800 border-0 font-black italic text-center py-3">
            05_TRANSIT_CONFIGURATION
          </CCardHeader>
          <CCardBody class="p-4">
            
            <div class="text-center mb-4">
              <div class="tiny text-zinc-500">AVAILABLE_LEDGER_EQUITY</div>
              <div class="h3 text-success font-black">{{ userBalance }} IO$</div>
            </div>

            <div class="exchange-box p-3 bg-black border border-zinc-800 rounded-3 mb-3">
              <label class="tiny text-zinc-500 uppercase mb-2">Source_Asset</label>
              <div class="d-flex justify-content-between align-items-center">
                <CFormSelect v-model="sourceAsset" class="bg-transparent border-0 text-white font-black w-auto">
                  <option value="IO">IO$ (Grounded)</option>
                  <option value="BTC" disabled>BTC (Legacy_Lock)</option>
                  <option value="USD" disabled>USD (Noise_Lock)</option>
                </CFormSelect>
                <CFormInput 
                  v-model.number="form.amount" 
                  type="number" 
                  class="bg-transparent border-0 text-end text-info h4 m-0 p-0" 
                  placeholder="0.00"
                />
              </div>
            </div>

            <div class="transit-icon text-center my-n2 position-relative z-max">
              <div class="bg-zinc-900 d-inline-block p-2 rounded-circle border border-zinc-800">
                <i class="bi bi-chevron-down text-info"></i>
              </div>
            </div>

            <div class="exchange-box p-3 bg-black border border-zinc-800 rounded-3 mt-3">
              <label class="tiny text-zinc-500 uppercase mb-2">Target_Cluster</label>
              <div class="d-flex justify-content-between align-items-center">
                <CFormSelect v-model="form.targetCluster" class="bg-transparent border-0 text-info font-black w-auto">
                  <option value="CLE">Cleveland_01</option>
                  <option value="DET">Detroit_02</option>
                  <option value="CHI">Chicago_03</option>
                  <option value="VRE">GLOBAL_VRE_CORE</option>
                </CFormSelect>
                <div class="h4 m-0 text-success font-black">{{ calculatedTransit }}</div>
              </div>
            </div>

            <CButton 
              color="info" 
              class="w-100 py-3 font-black italic mt-4 shadow-info"
              @click="executeExchange"
              :disabled="isExchanging || form.amount <= 0 || form.amount > userBalance"
            >
              <span v-if="!isExchanging">INITIATE_CLUSTER_TRANSIT</span>
              <span v-else class="vibrate">POLICING_EXCHANGE...</span>
            </CButton>
            
            <p v-if="form.amount > userBalance" class="tiny text-danger text-center mt-2">
              INSUFFICIENT_LEDGER_EQUITY
            </p>
          </CCardBody>
        </CCard>

        <div class="metrics-grid d-flex gap-2">
          <div class="p-2 bg-zinc-900 border border-zinc-800 rounded flex-fill text-center">
            <div class="tiny text-zinc-500">TRANSIT_FEE</div>
            <div class="small font-black text-success">0.00%</div>
          </div>
          <div class="p-2 bg-zinc-900 border border-zinc-800 rounded flex-fill text-center">
            <div class="tiny text-zinc-500">SLIPPAGE_NOISE</div>
            <div class="small font-black text-info">0.0009%</div>
          </div>
        </div>
      </CCol>
    </CRow>

    <footer class="mt-auto pt-5 text-center opacity-25">
      <div class="tiny">"I = VR² | EQUITY IS FLUID"</div>
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db, auth } from '../firebase';
import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';

// SYSTEM STATE
const userBalance = ref(0);
const isExchanging = ref(false);
const sourceAsset = ref('IO');

const form = ref({
  amount: 0,
  targetCluster: 'CLE'
});

const calculatedTransit = computed(() => {
  if (form.value.amount <= 0) return '0.00';
  // 1:1 Grounded Transit logic within the 16-thread bus
  return form.value.amount.toFixed(2);
});

/**
 * 01_SIGHTING_LEDGER_STATE
 */
const initExchangeSighting = () => {
  if (auth.currentUser) {
    onSnapshot(doc(db, 'users', auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        userBalance.value = snap.data().iowb?.balance || 0;
      }
    });
  }
};

/**
 * 02_EXECUTE_EXCHANGE
 * Records the transit in the ledger and grounds the artifact
 */
const executeExchange = async () => {
  if (!auth.currentUser || form.value.amount <= 0) return;
  isExchanging.value = true;

  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', auth.currentUser!.uid);
      const logRef = doc(db, 'system/ledger/transits', `${Date.now()}_${auth.currentUser!.uid.substring(0,5)}`);
      
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw "ENTITY_NOT_FOUND";

      // Logic Check: 16-Thread verification
      const currentBalance = userSnap.data().iowb?.balance || 0;
      if (currentBalance < form.value.amount) throw "INSUFFICIENT_EQUITY";

      // Ground the Transit Artifact
      transaction.set(logRef, {
        entityID: auth.currentUser!.uid,
        amount: form.value.amount,
        source: 'CLE_VRE_01',
        target: form.value.targetCluster,
        timestamp: serverTimestamp(),
        status: 'TRANSIT_COMPLETE'
      });

      // No actual balance deduction for internal cluster moves unless changing asset type
      // Currently simulating 1:1 mesh fluidity
    });

    alert("TRANSIT_SUCCESS: Equity shifted to " + form.value.targetCluster);
    form.value.amount = 0;
  } catch (err) {
    console.error("TRANSIT_FRACTURE:", err);
    alert("TRANSIT_ERROR: Logic Policing rejected the pulse.");
  } finally {
    isExchanging.value = false;
  }
};

onMounted(() => initExchangeSighting());
</script>

<style scoped>
.exchange-substrate { font-family: 'Space Mono', monospace; }
.text-glow { text-shadow: 0 0 10px rgba(0, 229, 255, 0.4); }
.bg-zinc-950 { background-color: #050505; }
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.1) !important; }
.shadow-info { box-shadow: 0 0 20px rgba(0, 229, 255, 0.3); }

.vibrate { animation: jitter 0.1s infinite; }
@keyframes jitter {
  0% { transform: translate(1px, -1px); }
  100% { transform: translate(-1px, 1px); }
}

.z-max { z-index: 10; }
.font-black { font-weight: 900; }
.italic { font-style: italic; }
.tiny { font-size: 0.65rem; }

/* Remove arrow from number input */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>