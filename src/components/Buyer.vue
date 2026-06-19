<template>
  <CContainer fluid class="buyer-substrate p-4 bg-black min-vh-100 font-mono text-white">
    <header
      class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3"
    >
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

        <!-- Seller Connection / Menu Filtering -->
        <div
          class="seller-connection-substrate mb-4 p-3 bg-zinc-900 border border-zinc-800 rounded"
        >
          <div class="d-flex gap-2 mb-2">
            <CFormInput
              v-model="sellerSearchQuery"
              placeholder="CONNECT_TO_SELLER_ID (IDEAL/QR/NAME)..."
              class="bg-zinc-950 border-zinc-800 text-info font-mono flex-grow-1"
            />
            <CButton
              color="info"
              variant="outline"
              @click="connectToSeller"
              :disabled="!sellerSearchQuery.trim()"
              >CONNECT</CButton
            >
            <CButton
              v-if="connectedSellerId"
              color="danger"
              variant="outline"
              @click="disconnectSeller"
              >DISCONNECT</CButton
            >
          </div>
          <p v-if="connectedSellerId" class="small text-zinc-500 m-0">
            VIEWING_MENU_FOR: <span class="text-info fw-bold">{{ connectedSellerId }}</span>
          </p>
        </div>

        <CRow class="g-4">
          <CCol v-for="item in currentMarketView" :key="item.id" md="6" xl="4">
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

                <div
                  class="mt-auto pt-3 border-top border-zinc-800 d-flex justify-content-between align-items-center"
                >
                  <span class="tiny font-mono opacity-50">NODE: {{ item.sellerID }}</span>
                  <CButton
                    color="info"
                    size="sm"
                    v-if="!connectedSellerId"
                    variant="outline"
                    class="font-black px-3"
                    @click="initiatePurchase(item)"
                    :disabled="userEquity < item.price || isProcessing"
                  >
                    ACQUIRE
                  </CButton>
                  <CButton
                    color="success"
                    size="sm"
                    v-else
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
        <CCard class="bg-zinc-900 border-info text-white shadow-glow sticky-top" style="top: 20px">
          <CCardHeader class="font-black italic text-info">ACQUISITION_LEDGER</CCardHeader>
          <!-- Direct Acquisition Ledger -->
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
              <hr class="border-zinc-800" />
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

        <!-- Shopping Cart -->
        <CCard
          v-if="connectedSellerId"
          class="bg-zinc-900 border-success text-white shadow-glow mt-4"
        >
          <CCardHeader class="font-black italic text-success">ORDER_CART</CCardHeader>
          <CCardBody>
            <div v-if="cartItems.length > 0">
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-zinc-800"
              >
                <span class="small text-zinc-400">{{ item.name }}</span>
                <div class="d-flex align-items-center gap-2">
                  <span class="small text-success fw-bold">{{ item.price }} IO$</span>
                  <CButton color="danger" size="sm" variant="outline" @click="removeFromCart(item)"
                    >REMOVE</CButton
                  >
                </div>
              </div>
              <div class="d-flex justify-content-between fw-bold text-success mt-3">
                <span>CART_TOTAL</span>
                <span>{{ cartTotal }} IO$</span>
              </div>
              <CButton
                color="success"
                class="w-100 py-3 font-black italic shadow-success mt-4"
                @click="placeOrder"
                :disabled="isProcessing || cartItems.length === 0 || !userStore.isAuthenticated"
              >
                <span v-if="!isProcessing">PLACE_ORDER</span>
                <span v-else class="vibrate">TRANSMITTING_ORDER...</span>
              </CButton>
            </div>
            <div v-else class="text-center py-4 opacity-25">ADD_ITEMS_TO_CART</div>
          </CCardBody>
        </CCard>

        <!-- Buyer Orders -->
        <CCard
          v-if="auth.currentUser"
          class="bg-zinc-900 border-warning text-white shadow-glow mt-4"
        >
          <CCardHeader class="font-black italic text-warning">ACTIVE_ORDERS</CCardHeader>
          <CCardBody>
            <div v-if="buyerOrders.length > 0">
              <div
                v-for="order in buyerOrders"
                :key="order.id"
                class="mb-3 pb-3 border-bottom border-zinc-800"
              >
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">ORDER_ID:</span>
                  <span class="font-mono">{{ order.id.substring(0, 8) }}...</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">SELLER:</span>
                  <span class="text-info">{{ order.sellerID }}</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">STATUS:</span>
                  <span
                    :class="{
                      'text-warning': order.status === 'pending',
                      'text-success': order.status === 'paid',
                    }"
                    >{{ order.status.toUpperCase() }}</span
                  >
                </div>
                <div class="d-flex justify-content-between fw-bold mt-2">
                  <span>TOTAL:</span>
                  <span class="text-success">{{ order.totalAmount }} IO$</span>
                </div>
                <CButton
                  v-if="order.status === 'pending'"
                  color="success"
                  size="sm"
                  class="w-100 mt-2"
                  @click="payForOrder(order)"
                  <!--
                  Ensure
                  userStore.userEquity
                  is
                  used
                  in
                  disabled
                  check
                  --
                >
                  :disabled="isProcessing || userEquity < order.totalAmount" >PAY_ORDER</CButton
                >
              </div>
            </div>
            <div v-else class="text-center py-4 opacity-25">
              NO_ACTIVE_ORDERS
              <div class="mt-4">
                <p class="small text-zinc-500">WANT_TO_SELL_RESOURCES?</p>
                <CButton color="warning" size="sm" variant="outline" @click="requestSellerRole"
                  >REQUEST_SELLER_ROLE</CButton
                >
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
  where,
  addDoc,
  type Unsubscribe,
} from 'firebase/firestore'; // Import addDoc for role requests
import { useUserStore } from '../stores/userStore'; // Import user store
import { useErrorStore } from '../stores/error'; // Import error store
import { type User } from 'firebase/auth';

// SYSTEM STATE
const userEquity = ref(0);
const searchQuery = ref('');
const sellerSearchQuery = ref('');
const marketItems = ref<any[]>([]);
const sellerMenu = ref<any[]>([]); // New state for seller-specific menu
const selectedItem = ref<any>(null);
const connectedSellerId = ref<string | null>(null); // New state for connected seller
const cartItems = ref<any[]>([]); // New state for shopping cart
const buyerOrders = ref<any[]>([]); // New state for buyer's orders
const isProcessing = ref(false);
// Pinia Stores
import { useSuccessStore } from '../stores/success'; // Import success store
const userStore = useUserStore();
const errorStore = useErrorStore();

// Firestore Unsubscribe functions
let marketplaceUnsubscribe: Unsubscribe | null = null;
let userEquityUnsubscribe: Unsubscribe | null = null;
let sellerMenuUnsubscribe: Unsubscribe | null = null; // Declare sellerMenuUnsubscribe
const successStore = useSuccessStore(); // Initialize success store

/**
 * 01_SIGHTING_MARKET_AND_EQUITY
 */
const initMarketSubstrate = () => {
  // Listen for global market items
  marketplaceUnsubscribe = onSnapshot(collection(db, 'marketplace'), (snapshot) => {
    marketItems.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  });

  // Watch for user equity from the store
  watch(
    () => userStore.userEquity,
    (newEquity: number) => {
      userEquity.value = newEquity;
    },
    { immediate: true }
  );

  // Watch for changes in auth.currentUser from the store
  // This ensures initOrdersSubscription is called when user logs in/out
  // Watch for changes in auth.currentUser from the store
  watch(
    () => userStore.currentUser,
    (newUser: User | null) => {
      // If user changes, re-initialize orders subscription
      if (newUser) initOrdersSubscription();
    }
  );
};

// New function to initialize orders subscription
let ordersUnsubscribe: Unsubscribe | null = null; // Declare ordersUnsubscribe
const initOrdersSubscription = () => {
  if (auth.currentUser) {
    ordersUnsubscribe = onSnapshot(
      // Use userStore.currentUser.uid
      query(collection(db, 'orders'), where('buyerID', '==', userStore.currentUser!.uid)),
      (snapshot) => {
        buyerOrders.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      },
      (error) => {
        console.error('Error fetching buyer orders:', error);
        errorStore.setGlobalError('Failed to load active orders.');
      }
    );
  }
};

// Computed property to determine which market view to show
const currentMarketView = computed(() => {
  if (connectedSellerId.value) {
    return sellerMenu.value.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  } else {
    return marketItems.value.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
});

// This computed property is now redundant if currentMarketView is used everywhere.
// Keeping it for now, but it could be removed if currentMarketView fully replaces its usage.
// const filteredMarket = computed(() => {
//   return marketItems.value.filter(
//     (item) =>
//       item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//       item.category.toLowerCase().includes(searchQuery.value.toLowerCase())
//   );
// });

// Function to subscribe to a specific seller's menu
const subscribeToSellerMenu = (sellerID: string) => {
  sellerMenuUnsubscribe = onSnapshot(
    query(collection(db, 'marketplace'), where('sellerID', '==', sellerID)),
    (snapshot) => {
      sellerMenu.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    (error) => {
      console.error('Error fetching seller menu:', error);
    }
  );
};

// New computed property for cart total
const cartTotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price, 0);
});

// New functions for seller connection
const connectToSeller = () => {
  const sellerIdToConnect = sellerSearchQuery.value.trim();
  if (sellerIdToConnect) {
    if (marketplaceUnsubscribe !== null) {
      marketplaceUnsubscribe();
      marketplaceUnsubscribe = null;
    }
    connectedSellerId.value = sellerIdToConnect;
    subscribeToSellerMenu(sellerIdToConnect); // Subscribe to seller's specific menu
    initMarketSubstrate(); // Re-initialize subscriptions to switch to seller's menu
    selectedItem.value = null; // Clear any direct acquisition selection
  }
};

const disconnectSeller = () => {
  connectedSellerId.value = null;
  sellerSearchQuery.value = '';
  sellerMenu.value = [];
  cartItems.value = []; // Clear cart when disconnecting
  if (sellerMenuUnsubscribe) {
    sellerMenuUnsubscribe(); // Unsubscribe from seller's menu
    sellerMenuUnsubscribe = null;
  }
  initMarketSubstrate(); // Re-initialize subscriptions to switch back to global market
};
const initiatePurchase = (item: any) => {
  selectedItem.value = item;
};

/**
 * 02_EXECUTE_PURCHASE
 * Atomic P2P Equity Transit
 */
const executePurchase = async () => {
  if (!selectedItem.value || !userStore.isAuthenticated) {
    errorStore.setGlobalError('ACQUISITION_FRACTURE: No item selected or user not authenticated.');
    return;
  }
  if (connectedSellerId.value) {
    // If connected to a seller, direct acquisition is not the primary flow.
    errorStore.setGlobalError(
      'ACQUISITION_FRACTURE: Please use the cart for orders when connected to a seller.'
    );
    return;
  }
  if (selectedItem.value.sellerID === userStore.currentUser!.uid) {
    errorStore.setGlobalError('ACQUISITION_FRACTURE: Cannot acquire your own resource.');
    return;
  }
  isProcessing.value = true;

  try {
    await runTransaction(db, async (transaction) => {
      const buyerRef = doc(db, 'users', auth.currentUser!.uid);
      const sellerRef = doc(db, 'users', selectedItem.value.sellerID); // Use selectedItem.value.sellerID
      const purchaseLogRef = doc(collection(db, 'transactions'));

      const buyerSnap = await transaction.get(buyerRef);
      const sellerSnap = await transaction.get(sellerRef);

      if ((buyerSnap.data()?.iowb.balance || 0) < selectedItem.value.price) {
        throw 'INSUFFICIENT_EQUITY';
      }

      // 1. Deduct from Buyer
      transaction.update(buyerRef, {
        'iowb.balance': (buyerSnap.data()?.iowb.balance || 0) - selectedItem.value.price,
      });

      // 2. Add to Seller
      transaction.update(sellerRef, {
        'iowb.balance': (sellerSnap.data()?.iowb.balance || 0) + selectedItem.value.price,
      });

      // 3. Log Transit Artifact
      transaction.set(purchaseLogRef, {
        buyerID: userStore.currentUser!.uid,
        sellerID: selectedItem.value.sellerID,
        itemID: selectedItem.value.id,
        amount: selectedItem.value.price,
        timestamp: serverTimestamp(),
        status: 'TRANSIT_COMPLETE',
      });
    });

    // Use a success message system if available, or just clear error
    // For now, we'll just clear any global error and indicate success implicitly
    // globalSuccess.value = "ACQUISITION_SUCCESS: Equity transited, resource grounded.";
    successStore.setSuccessMessage('ACQUISITION_SUCCESS: Equity transited, resource grounded.');
    errorStore.clearGlobalError();
    console.log('ACQUISITION_SUCCESS: Equity transited, resource grounded.');
    selectedItem.value = null;
  } catch (err) {
    console.error('TRANSIT_FRACTURE:', err);
    errorStore.setGlobalError(
      `TRANSIT_FAILED: ${
        err === 'INSUFFICIENT_EQUITY' ? 'Insufficient equity.' : 'Noise detected in the ledger.'
      }`
    );
  } finally {
    isProcessing.value = false;
  }
};

// New functions for cart and orders (removed redundant auth.currentUser check, as it's implied by connectedSellerId)
const addToCart = (item: any) => {
  // Removed redundant auth.currentUser check, as it's implied by connectedSellerId
  if (!connectedSellerId.value) {
    // Ensure connected to a seller
    errorStore.setGlobalError(
      'ORDER_FRACTURE: Please connect to a seller first to add items to cart.'
    );
    return;
  }
  if (item.sellerID !== connectedSellerId.value) {
    errorStore.setGlobalError('ORDER_FRACTURE: Item does not belong to the connected seller.');
    return;
  }
  cartItems.value.push(item);
};

const removeFromCart = (itemToRemove: any) => {
  cartItems.value = cartItems.value.filter((item) => item.id !== itemToRemove.id);
};

const placeOrder = async () => {
  if (!userStore.isAuthenticated || !connectedSellerId.value || cartItems.value.length === 0) {
    errorStore.setGlobalError(
      'ORDER_FRACTURE: User not authenticated, no seller connected, or cart is empty.'
    );
    return;
  }

  isProcessing.value = true;
  try {
    await runTransaction(db, async (transaction) => {
      const orderRef = doc(collection(db, 'orders'));
      const orderTotal = cartTotal.value;

      // Create the order document
      transaction.set(orderRef, {
        buyerID: userStore.currentUser!.uid,
        sellerID: connectedSellerId.value,
        items: cartItems.value.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
        })),
        totalAmount: orderTotal,
        status: 'pending', // Initial status
        timestamp: serverTimestamp(),
      });
    });

    console.log('ORDER_SUCCESS: Order placed successfully.');
    successStore.setSuccessMessage('ORDER_SUCCESS: Order placed successfully.');
    cartItems.value = []; // Clear cart after placing order
    errorStore.clearGlobalError(); // Clear any previous error
  } catch (err) {
    console.error('ORDER_FRACTURE:', err);
    errorStore.setGlobalError('ORDER_FAILED: Noise detected during order placement.');
  } finally {
    isProcessing.value = false;
  }
};

const payForOrder = async (order: any) => {
  // Ensure userStore.userEquity is used in disabled check
  if (!userStore.isAuthenticated || !order || order.status !== 'pending') {
    errorStore.setGlobalError('PAYMENT_FRACTURE: Invalid order or order not pending.');
    return;
  }
  if (userStore.userEquity < order.totalAmount) {
    // Use userStore.userEquity
    errorStore.setGlobalError('PAYMENT_FRACTURE: Insufficient equity for this order.');
    return;
  }

  isProcessing.value = true;
  try {
    await runTransaction(db, async (transaction) => {
      const buyerRef = doc(db, 'users', userStore.currentUser!.uid);
      const sellerRef = doc(db, 'users', order.sellerID); // Use order.sellerID
      const orderRef = doc(db, 'orders', order.id);

      // Deduct from Buyer
      const buyerSnap = await transaction.get(buyerRef); // Get buyer's current equity atomically
      if ((buyerSnap.data()?.iowb.balance || 0) < order.totalAmount) throw 'INSUFFICIENT_EQUITY';
      transaction.update(buyerRef, {
        'iowb.balance': buyerSnap.data()?.iowb.balance - order.totalAmount,
      });
      // Add to Seller
      const sellerSnap = await transaction.get(sellerRef);
      transaction.update(sellerRef, {
        'iowb.balance': (sellerSnap.data()?.iowb.balance || 0) + order.totalAmount,
      });
      // Update order status
      transaction.update(orderRef, { status: 'paid', paidAt: serverTimestamp() });
    });
    successStore.setSuccessMessage('PAYMENT_SUCCESS: Order paid successfully.');
    errorStore.clearGlobalError();
    console.log('PAYMENT_SUCCESS: Order paid successfully.');
  } catch (err) {
    console.error('PAYMENT_FRACTURE:', err);
    errorStore.setGlobalError(
      `PAYMENT_FAILED: ${
        err === 'INSUFFICIENT_EQUITY'
          ? 'Insufficient equity.'
          : 'Noise detected during payment transit.'
      }`
    );
  } finally {
    isProcessing.value = false;
  }
};

const requestSellerRole = async () => {
  if (!userStore.isAuthenticated) {
    errorStore.setGlobalError('AUTHENTICATION_REQUIRED: Please log in to request a seller role.');
    return; // Ensure user is authenticated
  }

  try {
    await addDoc(collection(db, 'roleRequests'), {
      // Use userStore.currentUser.uid and email
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email, // Store email for easier admin review
      requestedRole: 'seller',
      status: 'pending', // pending, approved, denied
      timestamp: serverTimestamp(),
    });
    successStore.setSuccessMessage('SELLER_ROLE_REQUEST_INITIATED: Awaiting system approval.');
    console.log(
      `SELLER_ROLE_REQUEST_INITIATED: User ${auth.currentUser?.uid} requested seller role.`
    );
    errorStore.setGlobalError('SELLER_ROLE_REQUEST_INITIATED: Awaiting system approval.');
  } catch (error) {
    console.error('Error requesting seller role:', error);
    errorStore.setGlobalError('SELLER_ROLE_REQUEST_FAILED: Could not submit request.');
  }
};

onMounted(() => {
  initMarketSubstrate();
  initOrdersSubscription(); // Initialize orders subscription on mount
});

onUnmounted(() => {
  marketplaceUnsubscribe?.();
  userEquityUnsubscribe?.();
  sellerMenuUnsubscribe?.(); // Unsubscribe from seller menu
  ordersUnsubscribe?.(); // Unsubscribe from orders
});
</script>

<style scoped>
.item-card {
  cursor: pointer;
  border-radius: 12px;
}
.item-card:hover {
  border-color: #00e5ff !important;
  transform: translateY(-5px);
}
.bg-zinc-950 {
  background-color: #050505;
}
.shadow-glow {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.15) !important;
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
.vibrate {
  animation: jitter 0.1s infinite;
}
@keyframes jitter {
  0% {
    transform: translate(1px, -1px);
  }
  100% {
    transform: translate(-1px, 1px);
  }
}
</style>
