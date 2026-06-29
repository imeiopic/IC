<template>
  <CContainer fluid class="seller-dashboard p-4 bg-black min-vh-100 font-mono text-white">
    <header class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-shop text-warning h3 m-0"></i>
        <h1 class="text-glow text-warning m-0 italic font-black">SELLER_DASHBOARD</h1>
      </div>
      <div class="equity-status text-end">
        <span class="tiny text-zinc-500 d-block">LIQUID_EQUITY</span>
        <span class="text-success fw-bold">{{ userEquity.toFixed(2) }} IO$</span>
      </div>
    </header>

    <CRow>
      <CCol lg="12">
        <CCard class="bg-zinc-900 border-warning text-white shadow-glow">
          <CCardHeader class="font-black italic text-warning">INCOMING_ORDERS</CCardHeader>
          <CCardBody>
            <div v-if="sellerOrders.length > 0">
              <div v-for="order in sellerOrders" :key="order.id" class="mb-4 pb-3 border-bottom border-zinc-800">
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">ORDER_ID:</span>
                  <span class="font-mono">{{ order.id.slice(-8) }}</span>
                </div>
                <div class="mb-2">
                  <span class="text-zinc-500 small d-block">ITEMS:</span>
                  <ul class="list-unstyled ms-3">
                    <li v-for="item in order.items" :key="item.id" class="small text-zinc-400">
                      {{ item.name }} - {{ item.price.toFixed(2) }} IO$
                    </li>
                  </ul>
                </div>
                
                <div class="mt-3 d-flex gap-2">
                  <CButton v-if="order.status === 'paid'" color="info" size="sm" @click="handleStatusUpdate(order.id, 'shipped')" :disabled="isProcessing">MARK_SHIPPED</CButton>
                  <CButton v-if="order.status === 'shipped'" color="success" size="sm" @click="handleStatusUpdate(order.id, 'delivered')" :disabled="isProcessing">MARK_DELIVERED</CButton>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 opacity-25">NO_INCOMING_ORDERS</div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, where, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import { useErrorStore } from '@/stores/error';
import { useSuccessStore } from '@/stores/success';
import type { Order } from '@/types/order';

const sellerOrders = ref<Order[]>([]);
const isProcessing = ref(false);
const userEquity = ref(0);
const errorStore = useErrorStore();
const successStore = useSuccessStore();

let ordersUnsubscribe: Unsubscribe | null = null;

const initSubstrates = () => {
  const user = auth.currentUser;
  if (!user) return;

  ordersUnsubscribe = onSnapshot(
    query(collection(db, 'orders'), where('sellerID', '==', user.uid)),
    (snapshot) => {
      sellerOrders.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    },
    (err) => {
      console.error('Subscription Fracture:', err);
      errorStore.setGlobalError('Failed to synchronize order substrate.');
    }
  );
};

const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
  isProcessing.value = true;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    successStore.setSuccessMessage(`ORDER ${orderId.slice(-4)}: TRANSITIONED TO ${newStatus.toUpperCase()}`);
  } catch (err) {
    errorStore.setGlobalError('SYNCHRONIZATION_FAILED: Verify network stability.');
  } finally {
    isProcessing.value = false;
  }
};

onMounted(initSubstrates);
onUnmounted(() => ordersUnsubscribe?.());
</script>