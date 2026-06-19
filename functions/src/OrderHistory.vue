<template>
  <div class="order-history-container">
    <h2 class="header-title">ORDER_HISTORY // MESH_TRANSACTIONS</h2>
    
    <div v-if="isLoading" class="loading-state">
      SYNCING_LEDGER_DATA...
    </div>
    
    <div v-else-if="orders.length === 0" class="empty-state">
      No transaction history found in the substrate.
    </div>
    
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          <span class="order-status" :class="order.status">{{ order.status.toUpperCase() }}</span>
        </div>
        
        <div class="order-items">
          <div v-for="(item, idx) in order.items" :key="idx" class="item-row">
            <span>{{ item.label }}</span>
            <span class="item-price">{{ item.amount }} IO$</span>
          </div>
        </div>
        
        <div class="order-footer">
          <span>Total Equity:</span>
          <span class="total-equity">{{ order.totalEquity }} IO$</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '../useAuth';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

interface OrderItem {
  id: string;
  label: string;
  amount: string | number;
  multiplier: string | number;
}

interface Order {
  id: string;
  status: string;
  totalEquity: string | number;
  items: OrderItem[];
  createdAt: any;
}

const { user } = useAuth();
const orders = ref<Order[]>([]);
const isLoading = ref(true);

const fetchOrders = async () => {
  if (!user.value) {
    isLoading.value = false;
    return;
  }

  try {
    const db = getFirestore();
    const ordersRef = collection(db, 'orders');
    
    // Fetch orders for the current user, newest first
    const q = query(
      ordersRef,
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    orders.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('Error fetching order history:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'UNKNOWN_TIME';
  // Handle Firebase Timestamps
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', 
    hour: 'numeric', minute: '2-digit'
  });
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.order-history-container { background: #000; color: #fff; padding: 2rem; border-radius: 16px; border: 1px solid #333; font-family: monospace; max-width: 800px; margin: 0 auto; }
.header-title { color: #00e5ff; font-weight: bold; font-size: 1.2rem; border-bottom: 2px solid #222; padding-bottom: 1rem; margin-bottom: 2rem; margin-top: 0; }

.loading-state, .empty-state { text-align: center; color: #888; padding: 3rem; font-style: italic; border: 1px dashed #333; border-radius: 12px; }
.loading-state { color: #ffd700; border-color: #ffd700; animation: pulse 1.5s infinite; }

.orders-list { display: flex; flex-direction: column; gap: 1.5rem; }
.order-card { background: #050505; border: 1px solid #111; padding: 1.5rem; border-radius: 12px; transition: border-color 0.2s ease; }
.order-card:hover { border-color: #333; }

.order-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #222; padding-bottom: 1rem; margin-bottom: 1rem; }
.order-date { color: #aaa; font-size: 0.9rem; }
.order-status { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; letter-spacing: 1px; }
.order-status.paid { background: rgba(0, 255, 0, 0.1); color: #00ff00; border: 1px solid #00ff00; }
.order-status.pending { background: rgba(255, 215, 0, 0.1); color: #ffd700; border: 1px solid #ffd700; }
.order-status.failed { background: rgba(255, 68, 68, 0.1); color: #ff4444; border: 1px solid #ff4444; }

.order-items { margin-bottom: 1rem; }
.item-row { display: flex; justify-content: space-between; padding: 0.5rem 0; color: #ccc; font-size: 0.95rem; }
.item-price { color: #fff; }

.order-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #222; padding-top: 1rem; color: #aaa; }
.total-equity { color: #00e5ff; font-size: 1.2rem; font-weight: bold; }

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>
