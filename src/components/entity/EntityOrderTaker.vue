<template>
  <div class="order-taker-substrate">
    <div class="sighting-header">
      <h2>1010_EQUITY: Order Intake</h2>
      <p class="logic-subtext">Sighting commerce pulses for the Global Mesh.</p>
    </div>

    <div class="order-queue">
      <div v-for="order in activeOrders" :key="order.id" class="order-node">
        <div class="order-meta">
          <span class="order-id">PULSE_{{ order.id.substring(0, 5) }}</span>
          <span class="order-amount">{{ order.total }} IO$</span>
        </div>

        <div class="order-items">
          <p v-for="item in order.items" :key="item.name">
            {{ item.quantity }}x {{ item.name }}
          </p>
        </div>

        <button @click="groundOrder(order)" class="ground-btn">
          Ground Transaction
        </button>
      </div>
    </div>

    <div v-if="activeOrders.length === 0" class="silence-view">
      <p>Atmosphere is clear. No pending pulses.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import firebase from 'firebase/app';

const store = useStore();
const activeOrders = ref([]);

const loadOrders = () => {
  firebase.firestore()
    .collection('entities')
    .doc(store.state.user.entityId)
    .collection('orders')
    .where('status', '==', 'PENDING')
    .onSnapshot(snapshot => {
      activeOrders.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
};

const groundOrder = async (order) => {
  // Execute the Symmetrical Distribution pulse
  // This automatically splits the IO$ among the 16-thread participants
  await store.dispatch('processIowbTransaction', {
    orderId: order.id,
    amount: order.total,
    entityId: store.state.user.entityId
  });
  console.log(`Order ${order.id} grounded into the IOWB Ledger.`);
};

onMounted(loadOrders);
</script>

<style scoped>
.order-taker-substrate { background: #0f0f0f; border: 1px solid #ffd700; padding: 2rem; border-radius: 15px; }
.order-node { 
  background: #1a1a1a; 
  margin-bottom: 1rem; 
  padding: 1.5rem; 
  border-left: 4px solid #ffd700;
  display: flex;
  flex-direction: column;
}
.ground-btn { 
  background: #ffd700; 
  color: #000; 
  border: none; 
  padding: 0.8rem; 
  font-weight: bold; 
  cursor: pointer;
  margin-top: 1rem;
}
.order-amount { color: #00ff00; font-family: monospace; font-size: 1.2rem; }
</style>