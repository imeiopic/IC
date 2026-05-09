<template>
  <CContainer fluid class="order-portal-substrate p-4 bg-black min-vh-100 font-mono text-white">
    <header class="d-flex justify-content-between align-items-center mb-5 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-cart-plus text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">RESOURCE_REQUEST</h1>
      </div>
      <div class="equity-status tiny text-success">
        AVAILABLE_EQUITY: {{ userEquity }} IO$
      </div>
    </header>

    <CRow class="justify-content-center">
      <CCol lg="6" md="8">
        <CCard class="bg-zinc-900 border-zinc-800 text-white shadow-glow">
          <CCardHeader class="bg-zinc-800 border-0 font-black italic text-center py-3">
            03_RESOURCE_MANIFEST
          </CCardHeader>
          <CCardBody class="p-4">
            <CForm @submit.prevent="submitRequest">
              <div class="mb-4">
                <label class="tiny text-zinc-500 uppercase mb-2">Select_Resource_Thread</label>
                <CFormSelect v-model="form.type" class="bg-black border-zinc-800 text-info">
                  <option value="HARDWARE_PROVISION">HARDWARE_PROVISION</option>
                  <option value="BANDWIDTH_ALLOCATION">BANDWIDTH_ALLOCATION</option>
                  <option value="EQUITY_TRANSIT">EQUITY_TRANSIT</option>
                  <option value="SPATIAL_LOCK_SERVICE">SPATIAL_LOCK_SERVICE</option>
                </CFormSelect>
              </div>

              <div class="mb-4">
                <label class="tiny text-zinc-500 uppercase mb-2">Transit_Volume (IO$)</label>
                <CFormInput 
                  v-model.number="form.amount" 
                  type="number" 
                  class="bg-black border-zinc-800 text-success fw-bold"
                  placeholder="0.00"
                />
              </div>

              <div class="mb-4">
                <label class="tiny text-zinc-500 uppercase mb-2">Request_Note (Optional)</label>
                <CFormTextarea 
                  v-model="form.note" 
                  rows="3" 
                  class="bg-black border-zinc-800 text-white small"
                  placeholder="Briefly state the necessity of this resource..."
                ></CFormTextarea>
              </div>

              <CButton 
                type="submit" 
                color="info" 
                class="w-100 py-3 font-black italic shadow-info mt-3"
                :disabled="isSubmitting || userEquity < form.amount"
              >
                <span v-if="!isSubmitting">DISPATCH_REQUEST_PULSE</span>
                <span v-else class="vibrate">WRITING_TO_MESH...</span>
              </CButton>
              
              <p v-if="userEquity < form.amount" class="text-danger tiny text-center mt-3">
                INSUFFICIENT_EQUITY_FOR_TRANSIT
              </p>
            </CForm>
          </CCardBody>
        </CCard>

        <div class="history-substrate mt-5">
          <h5 class="text-zinc-500 tiny uppercase mb-3">Recent_Transit_Sightings</h5>
          <div v-for="req in history" :key="req.id" class="p-3 mb-2 bg-zinc-950 border border-zinc-800 rounded d-flex justify-content-between align-items-center">
            <div>
              <span class="tiny d-block opacity-50">{{ req.type }}</span>
              <span class="small font-black">{{ req.amount }} IO$</span>
            </div>
            <CBadge :color="getStatusColor(req.status)" class="text-black tiny">{{ req.status }}</CBadge>
          </div>
        </div>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db, auth } from '../firebase';
import { 
  collection, addDoc, serverTimestamp, query, 
  where, onSnapshot, orderBy 
} from 'firebase/firestore';

// LOCAL STATE
const userEquity = ref(1600);
const isSubmitting = ref(false);
const history = ref<any[]>([]);
const form = ref({
  type: 'HARDWARE_PROVISION',
  amount: 100,
  note: ''
});

/**
 * 01_SIGHTING_HISTORY
 */
const initHistoryStream = () => {
  if (!auth.currentUser) return;

  const q = query(
    collection(db, 'resource_requests'),
    where('originID', '==', auth.currentUser.uid),
    orderBy('timestamp', 'desc')
  );

  onSnapshot(q, (snapshot) => {
    history.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });
};

/**
 * 02_DISPATCH_REQUEST
 */
const submitRequest = async () => {
  if (!auth.currentUser) return;
  isSubmitting.value = true;

  try {
    await addDoc(collection(db, 'resource_requests'), {
      originID: auth.currentUser.uid,
      originEmail: auth.currentUser.email,
      originNode: auth.currentUser.uid.substring(0, 8),
      type: form.value.type,
      amount: form.value.amount,
      note: form.value.note,
      status: 'PENDING',
      timestamp: serverTimestamp()
    });

    form.value.note = '';
    alert("REQUEST_PULSE_SENT: Awaiting Master Fulfillment.");
  } catch (err) {
    console.error("TRANSIT_ERROR: Pulse failed to ground.");
  } finally {
    isSubmitting.value = false;
  }
};

const getStatusColor = (status: string) => {
  if (status === 'FULFILLED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'info';
};

onMounted(() => {
  initHistoryStream();
});
</script>

<style scoped>
.order-portal-substrate { font-family: 'Space Mono', monospace; }
.text-glow { text-shadow: 0 0 10px rgba(0, 229, 255, 0.4); }
.bg-zinc-950 { background-color: #050505; }
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.1); }
.vibrate { animation: jitter 0.1s infinite; }
@keyframes jitter {
  0% { transform: translate(1px, -1px); }
  100% { transform: translate(-1px, 1px); }
}
.tiny { font-size: 0.65rem; }
.font-black { font-weight: 900; }
.italic { font-style: italic; }
</style>