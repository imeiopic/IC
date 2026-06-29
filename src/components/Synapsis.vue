// src/components/Synapsis.vue
<template>
  <div class="synapsis-node p-4 bg-indigo-950 border border-cyan-400/30 rounded-xl shadow-lg">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-xs font-black text-cyan-300 uppercase tracking-widest">Synapsis Tunnel</h3>
      <span class="text-[10px] text-cyan-400">{{ status }}</span>
    </div>
    <div class="text-[10px] text-slate-400 mb-2">
      Entangling I-Atom (Buyer) with VR²-Atom (Seller)...
    </div>
    <div class="flex items-center gap-2">
      <span class="font-mono text-cyan-300">{{ order?.buyer?.id || 'Buyer' }}</span>
      <span class="text-cyan-500">⇄</span>
      <span class="font-mono text-indigo-300">{{ order?.seller?.id || 'Seller' }}</span>
    </div>
    <div class="mt-3">
      <button v-if="status === 'ENTANGLING'" @click="triggerProximity" class="btn btn-cyan w-full">
        Trigger Proximity
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import orderFlowBus from './orderFlowBus';

const props = defineProps({ order: Object });
const status = ref('ENTANGLING');

function triggerProximity() {
  status.value = 'PROXIMITY';
  orderFlowBus.emit('proximity-trigger', { order: props.order });
}

onMounted(() => {
  // Could simulate handshake delay here
});
</script>

<style scoped>
.synapsis-node {
  min-width: 260px;
}
.btn-cyan {
  background: #06b6d4;
  color: #fff;
  border-radius: 6px;
  padding: 6px 0;
  font-size: 11px;
  font-weight: bold;
}
.btn-cyan:hover {
  background: #0891b2;
}
</style>
