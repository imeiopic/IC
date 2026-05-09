<template>
  <div
    class="s-node p-8 bg-gradient-to-b from-slate-900 to-rose-950 border-y-4 border-rose-400/50 rounded-3xl shadow-2xl"
  >
    <div class="flex flex-col items-center mb-10 text-center">
      <h2 class="text-4xl font-black text-white tracking-tighter uppercase italic">Seller Node</h2>
      <div class="h-1 w-24 bg-rose-400 mt-2 rounded-full"></div>
      <p class="text-[10px] text-rose-500 font-mono mt-4 tracking-[0.5em] uppercase">
        Settlement: {{ settlementStatus }}
      </p>
    </div>
    <div class="flex flex-col items-center justify-center h-40">
      <div v-if="sellerAmount !== null">
        <div class="text-lg text-white font-bold">Received: {{ sellerAmount }} IO$</div>
      </div>
      <div v-else class="text-slate-400 italic">Awaiting settlement...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import orderFlowBus from './orderFlowBus';

const sellerAmount = ref(null);
const settlementStatus = ref('IDLE');

function handleSettlement({ sellerAmount: amt }) {
  sellerAmount.value = amt;
  settlementStatus.value = 'SETTLED';
}

onMounted(() => {
  orderFlowBus.on('molecule-settled', handleSettlement);
});

onBeforeUnmount(() => {
  orderFlowBus.all.clear();
});
</script>

<style scoped>
.s-node {
  box-shadow: 0 0 100px rgba(244, 63, 94, 0.08);
}
</style>
