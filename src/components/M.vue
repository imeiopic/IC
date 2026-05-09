<template>
  <div
    class="m-node p-8 bg-gradient-to-b from-slate-900 to-emerald-950 border-y-4 border-emerald-400/50 rounded-3xl shadow-2xl"
  >
    <div class="flex flex-col items-center mb-10 text-center">
      <h2 class="text-4xl font-black text-white tracking-tighter uppercase italic">
        Molecule Processor
      </h2>
      <div class="h-1 w-24 bg-emerald-400 mt-2 rounded-full"></div>
      <p class="text-[10px] text-emerald-500 font-mono mt-4 tracking-[0.5em] uppercase">
        Split Logic: {{ splitStatus }}
      </p>
    </div>
    <div class="flex flex-col items-center justify-center h-40">
      <div v-if="moleculeResult">
        <div class="text-lg text-white font-bold">
          Seller: {{ moleculeResult.sellerAmount }} IO$
        </div>
        <div class="text-lg text-emerald-400 font-bold">
          Lubricant: {{ moleculeResult.lubricant }} IO$
        </div>
      </div>
      <div v-else class="text-slate-400 italic">Awaiting molecule split...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import orderFlowBus from './orderFlowBus';

const moleculeResult = ref(null);
const splitStatus = ref('IDLE');

function handleSplit({ sellerAmount, lubricant, order }) {
  moleculeResult.value = { sellerAmount, lubricant };
  splitStatus.value = 'SETTLED';
}

onMounted(() => {
  orderFlowBus.on('molecule-settled', handleSplit);
});

onBeforeUnmount(() => {
  orderFlowBus.all.clear();
});
</script>

<style scoped>
.m-node {
  box-shadow: 0 0 100px rgba(16, 185, 129, 0.08);
}
</style>
