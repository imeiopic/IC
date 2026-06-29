<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useOrderTakerStore } from '@/stores/orderTakerStore';
import { useUserStore } from '@/stores/userStore'; // Assuming a user store for entityId

const orderStore = useOrderTakerStore();
const userStore = useUserStore();

let unsubscribe: () => void;

onMounted(() => {
  if (userStore.entityId) {
    unsubscribe = orderStore.listenToPendingOrders(userStore.entityId);
  }
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const handleGrounding = (order: any) => {
  orderStore.groundOrder(order.id, order.total, userStore.entityId);
};
</script>

<template>
  <div class="order-taker-substrate">
    <div class="sighting-header">
      <h2>1010_EQUITY: Order Intake</h2>
      <p class="logic-subtext">Sighting commerce pulses for the Global Mesh.</p>
    </div>

    <div class="order-queue">
      <div v-for="order in orderStore.activeOrders" :key="order.id" class="order-node">
        <div class="order-meta">
          <span class="order-id">PULSE_{{ order.id.substring(0, 5) }}</span>
          <span class="order-amount">{{ order.total }} IO$</span>
        </div>

        <div class="order-items">
          <p v-for="item in order.items" :key="item.name">
            {{ item.quantity }}x {{ item.name }}
          </p>
        </div>

        <button 
          @click="handleGrounding(order)" 
          :disabled="orderStore.isProcessing"
          class="ground-btn"
        >
          {{ orderStore.isProcessing ? 'GROUNDING_PULSE...' : 'GROUND TRANSACTION' }}
        </button>
      </div>
    </div>

    <div v-if="orderStore.activeOrders.length === 0" class="silence-view">
      <p>Atmosphere is clear. No pending pulses.</p>
    </div>
  </div>
</template>

<style scoped>
.order-taker-substrate { background: #0f0f0f; border: 1px solid #ffd700; padding: 2rem; border-radius: 15px; font-family: monospace; }
.order-node { background: #1a1a1a; margin-bottom: 1rem; padding: 1.5rem; border-left: 4px solid #ffd700; display: flex; flex-direction: column; }
.order-meta { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.order-amount { color: #00ff00; font-size: 1.2rem; }
.ground-btn { background: #ffd700; color: #000; border: none; padding: 0.8rem; font-weight: bold; cursor: pointer; margin-top: 1rem; transition: background 0.3s; }
.ground-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.silence-view { color: #555; text-align: center; padding: 2rem; }
</style>