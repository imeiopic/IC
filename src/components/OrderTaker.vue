<template>
  <div class="order-taker-page">
    <h1>Order Taker</h1>
    <p>This is the Order Taker page.</p>
    <button @click="placeOrder" class="btn btn-primary mt-4">Simulate Order</button>
    <button @click="showGlobalStats" class="btn btn-outline-secondary mt-4 ms-2">
      Show Global Order Stats
    </button>
    <div class="mt-3 small text-muted">
      Open the console to see live monitoring results.<br />Global stats are MYB-compliant (no
      personal data).
    </div>
  </div>
</template>

<script setup lang="ts">
import orderFlowBus from './orderFlowBus';
// @ts-ignore
import { monitorOrder, getGlobalOrderStats } from '../../IopicOrderOverride.js';

// Demo: Simulate a live order placement
function placeOrder() {
  const order = { type: 'food', value: Math.floor(Math.random() * 20) };
  const node = { id: 'node-' + Math.floor(Math.random() * 1000) };
  orderFlowBus.emit('order-placed', { order, node });
}

// Show global stats (MYB-compliant)
function showGlobalStats() {
  const stats = getGlobalOrderStats();
  alert(
    'Global Order Flow Stats (MYB-compliant):\n' +
      'Total Orders: ' +
      stats.totalOrders +
      '\n' +
      'Total Value: ' +
      stats.totalValue +
      '\n' +
      'By Type: ' +
      JSON.stringify(stats.byType, null, 2)
  );
}

// Listen for order events and run override logic
orderFlowBus.on('order-placed', ({ order, node }) => {
  const result = monitorOrder(order, node);
  orderFlowBus.emit('order-monitored', { result, order, node });
  // For demo, log to console
  console.log('Order monitored:', { order, node, result });
});
</script>

<style scoped>
.order-taker-page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}
</style>
