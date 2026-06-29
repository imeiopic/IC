import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useErrorStore } from './error';

export interface Order {
  id: string;
  status: 'pending' | 'paid' | 'shipped';
  totalAmount: number;
}

export const useOrderStore = defineStore('orderStore', () => {
  // 1. Reactive State
  const orders = ref<Order[]>([]);
  const isLoading = ref(false);
  const errorStore = useErrorStore();

  // 2. Getters
  const pendingOrders = computed(() => 
    orders.value.filter(o => o.status === 'pending')
  );

  // 3. Actions (Async with Error Boundaries)
  async function fetchOrders(sellerId: string) {
    isLoading.value = true;
    try {
      const q = query(collection(db, 'orders'), where('sellerID', '==', sellerId));
      const snapshot = await getDocs(q);
      orders.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (err) {
      console.error('[Store_Fracture]:', err);
      errorStore.setGlobalError('Failed to synchronize orders.');
    } finally {
      isLoading.value = false;
    }
  }

  return { orders, isLoading, pendingOrders, fetchOrders };
});