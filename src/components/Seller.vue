<template>
  <CContainer fluid class="seller-dashboard p-4 bg-black min-vh-100 font-mono text-white">
    <header
      class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3"
    >
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-shop text-warning h3 m-0"></i>
        <h1 class="text-glow text-warning m-0 italic font-black">SELLER_DASHBOARD</h1>
      </div>
      <div class="equity-status text-end">
        <span class="tiny text-zinc-500 d-block">LIQUID_EQUITY</span>
        <span class="text-success fw-bold">{{ userEquity }} IO$</span>
      </div>
    </header>

    <CRow>
      <CCol lg="12">
        <CCard class="bg-zinc-900 border-warning text-white shadow-glow">
          <CCardHeader class="font-black italic text-warning">INCOMING_ORDERS</CCardHeader>
          <CCardBody>
            <div v-if="sellerOrders.length > 0">
              <div
                v-for="order in sellerOrders"
                :key="order.id"
                class="mb-4 pb-3 border-bottom border-zinc-800"
              >
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">ORDER_ID:</span>
                  <span class="font-mono">{{ order.id.substring(0, 8) }}...</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">BUYER:</span>
                  <span class="text-info">{{ order.buyerID.substring(0, 8) }}...</span>
                </div>
                <div class="mb-2">
                  <span class="text-zinc-500 small d-block">ITEMS:</span>
                  <ul class="list-unstyled ms-3">
                    <li v-for="item in order.items" :key="item.id" class="small text-zinc-400">
                      - {{ item.name }} ({{ item.price }} IO$)
                    </li>
                  </ul>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">STATUS:</span>
                  <span
                    :class="{
                      'text-warning': order.status === 'pending',
                      'text-info': order.status === 'paid',
                      'text-success': order.status === 'shipped',
                    }"
                    >{{ order.status.toUpperCase() }}</span
                  >
                </div>
                <div class="d-flex justify-content-between fw-bold mt-2">
                  <span>TOTAL:</span>
                  <span class="text-success">{{ order.totalAmount }} IO$</span>
                </div>

                <div class="mt-3 d-flex gap-2">
                  <CButton
                    v-if="order.status === 'paid'"
                    color="info"
                    size="sm"
                    @click="updateOrderStatus(order.id, 'shipped')"
                    :disabled="isProcessing"
                    >MARK_SHIPPED</CButton
                  >
                  <CButton
                    v-if="order.status === 'shipped'"
                    color="success"
                    size="sm"
                    @click="updateOrderStatus(order.id, 'delivered')"
                    :disabled="isProcessing"
                    >MARK_DELIVERED</CButton
                  >
                  <CButton v-if="order.status === 'pending'" color="secondary" size="sm" disabled
                    >AWAITING_PAYMENT</CButton
                  >
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
import { db, auth } from '../firebase'; // Assuming firebase.ts is in the parent directory
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  where,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { useErrorStore } from '../stores/error'; // Import error store
import { useSuccessStore } from '../stores/success'; // Import success store

// SYSTEM STATE
const sellerOrders = ref<any[]>([]);
const isProcessing = ref(false);
const userEquity = ref(0);
// Composables
// Pinia Stores
const errorStore = useErrorStore();
const successStore = useSuccessStore();
// Firestore Unsubscribe functions
let ordersUnsubscribe: Unsubscribe | null = null;
let userEquityUnsubscribe: Unsubscribe | null = null;

/**
 * Initialize subscriptions for seller's orders and equity.
 */
const initSellerSubstrates = () => {
  if (!auth.currentUser) {
    errorStore.setGlobalError('AUTHENTICATION_REQUIRED: Please log in as a seller.'); // Use errorStore
    return;
  }

  // Listen for seller's orders
  ordersUnsubscribe = onSnapshot(
    query(collection(db, 'orders'), where('sellerID', '==', auth.currentUser.uid)),
    (snapshot) => {
      sellerOrders.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    (error) => {
      console.error('Error fetching seller orders:', error);
      errorStore.setGlobalError('Failed to load incoming orders.'); // Use errorStore
    }
  );

  // Listen for Seller Equity Pulse (similar to Buyer)
  userEquityUnsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
    if (doc.exists()) userEquity.value = doc.data().iowb?.balance || 0;
    else {
      userEquity.value = 0;
      errorStore.setGlobalError('USER_EQUITY_NOT_FOUND: Please ensure your profile is complete.'); // Use errorStore
    }
  });
};

/**
 * Updates the status of a specific order.
 * @param orderId The ID of the order to update.
 * @param newStatus The new status to set (e.g., 'shipped', 'delivered').
 */
const updateOrderStatus = async (orderId: string, newStatus: string) => {
  if (!auth.currentUser) {
    errorStore.setGlobalError('AUTHENTICATION_REQUIRED: Cannot update order status.');
    return;
  }

  isProcessing.value = true;
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp(), // Add a timestamp for when the status was updated
    });
    successStore.setSuccessMessage(
      `ORDER_STATUS_UPDATE_SUCCESS: Order ${orderId} status changed to ${newStatus}.`
    );
    errorStore.clearGlobalError(); // Clear any previous error
  } catch (err) {
    console.error('ORDER_STATUS_UPDATE_FRACTURE:', err);
    errorStore.setGlobalError(
      `ORDER_STATUS_UPDATE_FAILED: Noise detected during status update for order ${orderId}.`
    );
  } finally {
    isProcessing.value = false;
  }
};

onMounted(() => {
  initSellerSubstrates();
});

onUnmounted(() => {
  ordersUnsubscribe?.();
  userEquityUnsubscribe?.();
});
</script>

<style scoped>
/* Add seller-specific styles here, similar to Buyer.vue */
.seller-dashboard .text-warning {
  color: #ffc107 !important; /* Example warning color */
}
.seller-dashboard .shadow-glow {
  box-shadow: 0 0 30px rgba(255, 193, 7, 0.15) !important; /* Example glow for seller */
}
/* Re-use common styles from Buyer.vue or define new ones */
.bg-zinc-950 {
  background-color: #050505;
}
.font-black {
  font-weight: 900;
}
.fw-black {
  font-weight: 900;
}
.tiny {
  font-size: 0.65rem;
}
.italic {
  font-style: italic;
}
</style>
