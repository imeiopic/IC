<template>
  <div class="order-tracker">
    <h2>Order Delivery Tracker</h2>
    <div v-if="order">
      <div>
        Status: <strong>{{ order.status }}</strong>
      </div>
      <div v-if="order.trackingUrl">
        <a :href="order.trackingUrl" target="_blank">Track Delivery</a>
      </div>
    </div>
    <div v-else>
      <button @click="simulateOrder">Simulate Order Process</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import orderDeliveryBus, { OrderDeliveryEvent } from './orderDeliveryBus';
import { notifyOrderStatus } from '../notifyBackend';

const order = ref<OrderDeliveryEvent | null>(null);

orderDeliveryBus.on('order-status-update', async (evt) => {
  order.value = evt;
  // Demo: trigger backend notification for each status update
  await notifyOrderStatus(
    evt.orderId,
    evt.status,
    ['email', 'sms', 'push'],
    { email: 'customer@example.com', phone: '+1234567890', pushToken: 'demo-token' }
  );
});

function simulateOrder() {
  const orderId = 'ORD-' + Math.floor(Math.random() * 10000);
  const steps: OrderDeliveryEvent[] = [
    { orderId, status: 'placed' },
    { orderId, status: 'processing' },
    { orderId, status: 'ready' },
    { orderId, status: 'out-for-delivery', trackingUrl: 'https://track.example.com/' + orderId },
    { orderId, status: 'delivered' }
  ];
  let i = 0;
  function nextStep() {
    if (i < steps.length) {
      orderDeliveryBus.emit('order-status-update', steps[i]);
      i++;
      setTimeout(nextStep, 1200);
    }
  }
  nextStep();
}
</script>

<style scoped>
.order-tracker {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  background: #f0f4f8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
}
.order-tracker a {
  color: #007bff;
  text-decoration: underline;
}
</style>
