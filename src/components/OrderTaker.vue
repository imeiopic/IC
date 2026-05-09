<template>
  <CContainer fluid class="order-taker-substrate p-4 bg-black min-vh-100 font-mono text-white">
    <header class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-cart-check text-success h3 m-0"></i>
        <h1 class="text-glow text-success m-0 italic font-black">Ime.ORDER_TAKER</h1>
      </div>
      <div class="system-health tiny text-success opacity-75">
        <span>LEDGER_SYNC: ACTIVE</span> | <span>MESH_ID: {{ sessionId }}</span>
      </div>
    </header>

    <CRow>
      <CCol lg="8">
        <CCard class="bg-zinc-900 border-zinc-800 text-white mb-4">
          <CCardHeader class="font-black italic text-success border-zinc-800 d-flex justify-content-between">
            <span>INBOUND_RESOURCE_REQUESTS</span>
            <CBadge color="success" class="animate-pulse">LIVE_STREAM</CBadge>
          </CCardHeader>
          <CCardBody>
            <div class="order-list overflow-auto" style="max-height: 600px;">
              <div v-if="orders.length === 0" class="text-center py-5 opacity-25 italic">
                AWAITING_MESH_DEMAND...
              </div>
              <div v-for="order in orders" :key="order.id" 
                class="order-item p-3 mb-3 border border-zinc-800 rounded-3 bg-black transition-all"
                :class="{ 'border-success': selectedOrderID === order.id }"
                @click="selectOrder(order)"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <span class="badge bg-zinc-800 text-info mb-2">ID_{{ order.id.substring(0,8) }}</span>
                    <h5 class="m-0 font-black">{{ order.type }}</h5>
                    <p class="tiny text-zinc-500 m-0">ORIGIN_NODE: {{ order.originNode }}</p>
                  </div>
                  <div class="text-end">
                    <div class="text-success fw-bold">{{ order.amount }} IO$</div>
                    <div class="tiny opacity-50">{{ formatDate(order.timestamp) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg="4">
        <CCard class="bg-zinc-900 border-success text-white shadow-success sticky-top" style="top: 20px;">
          <CCardHeader class="font-black italic">TRANSIT_FULFILLMENT</CCardHeader>
          <CCardBody v-if="selectedOrder">
            <div class="detail-substrate mb-4">
              <label class="tiny text-zinc-500 uppercase">Target_Entity</label>
              <div class="p-2 bg-black border border-zinc-800 rounded mb-3 text-info small">
                {{ selectedOrder.originEmail || 'ANONYMOUS_NODE' }}
              </div>
              
              <label class="tiny text-zinc-500 uppercase">Resource_Manifest</label>
              <p class="small border-start border-success ps-3 py-2 italic">
                "{{ selectedOrder.note || 'No manifest provided.' }}"
              </p>
            </div>

            <div class="action-grid d-flex flex-column gap-2">
              <CButton color="success" class="py-3 font-black italic" @click="fulfillOrder" :disabled="isProcessing">
                <span v-if="!isProcessing">EXECUTE_FULFILLMENT</span>
                <span v-else class="vibrate">WRITING_LEDGER...</span>
              </CButton>
              <CButton color="dark" class="border-zinc-800 text-danger tiny" @click="rejectOrder">
                REJECT_TRANSIT
              </CButton>
            </div>
          </CCardBody>
          <CCardBody v-else class="text-center py-5 opacity-25">
            SELECT_ORDER_FOR_TRANSIT
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db, rtdb } from '../firebase';
import { 
  collection, query, onSnapshot, doc, updateDoc, 
  runTransaction, serverTimestamp, orderBy 
} from 'firebase/firestore';
import { ref as dbRef, set } from 'firebase/database';

// SYSTEM STATE
const orders = ref<any[]>([]);
const selectedOrder = ref<any>(null);
const selectedOrderID = ref<string | null>(null);
const isProcessing = ref(false);
const sessionId = ref('OT-' + Math.random().toString(36).substring(7).toUpperCase());

/**
 * 01_SIGHTING_INBOUND_ORDERS
 */
const initOrderStream = () => {
  const q = query(
    collection(db, 'resource_requests'), 
    orderBy('timestamp', 'desc')
  );

  onSnapshot(q, (snapshot) => {
    orders.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).filter(o => o.status === 'PENDING');
  });
};

const selectOrder = (order: any) => {
  selectedOrder.value = order;
  selectedOrderID.value = order.id;
};

/**
 * 02_EXECUTE_FULFILLMENT
 * Atomic transition of status and equity logging
 */
const fulfillOrder = async () => {
  if (!selectedOrder.value) return;
  isProcessing.value = true;

  try {
    await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'resource_requests', selectedOrder.value.id);
      
      // Update Order Status
      transaction.update(orderRef, {
        status: 'FULFILLED',
        fulfilledAt: serverTimestamp()
      });

      // Log to Global Pulse in RTD for instant peer notification
      await set(dbRef(rtdb, `pulses/orders/${selectedOrder.value.id}`), {
        status: 'COMPLETE',
        v: 8.09
      });
    });

    alert("TRANSIT_SUCCESS: Resource grounded to mesh.");
    selectedOrder.value = null;
  } catch (err) {
    console.error("FULFILLMENT_FRACTURE:", err);
  } finally {
    isProcessing.value = false;
  }
};

const rejectOrder = async () => {
  if (!selectedOrder.value) return;
  await updateDoc(doc(db, 'resource_requests', selectedOrder.value.id), {
    status: 'REJECTED'
  });
  selectedOrder.value = null;
};

const formatDate = (ts: any) => {
  if (!ts) return 'NOW';
  return ts.toDate().toLocaleTimeString();
};

onMounted(() => {
  initOrderStream();
});
</script>

<style scoped>
.text-glow { text-shadow: 0 0 10px rgba(40, 167, 69, 0.5); }
.shadow-success { box-shadow: 0 0 30px rgba(40, 167, 69, 0.15) !important; }
.order-item { cursor: pointer; transition: transform 0.2s; }
.order-item:hover { transform: scale(1.01); background: #050505; }
.vibrate { animation: jitter 0.1s infinite; }
@keyframes jitter {
  0% { transform: translate(1px, -1px); }
  100% { transform: translate(-1px, 1px); }
}
.transition-all { transition: all 0.3s ease; }
</style>
