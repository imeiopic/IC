<script setup lang="ts">
import { computed, ref } from 'vue';
import { calculateRepatriationRate } from './src/services/RepatriationLogic';

// In a live deployment, this would be reactive to the global mesh state
const globalNodeCount = ref(150000);

const activeRate = computed(
  () => (calculateRepatriationRate(globalNodeCount.value) * 100).toFixed(2) + '%'
);
</script>

<template>
  <div class="p-6 bg-black border border-cyan-900 text-cyan-400 font-mono shadow-2xl">
    <header class="flex justify-between items-center mb-6">
      <h3 class="text-xs font-black uppercase tracking-widest text-white">
        // REPATRIATION_CURVE_MONITOR
      </h3>
      <span class="text-[9px] px-2 py-0.5 border border-emerald-500 text-emerald-500 animate-pulse"
        >LIVE_DECAY</span
      >
    </header>

    <div class="grid grid-cols-2 gap-8">
      <div class="space-y-1">
        <span class="block text-[9px] text-neutral-500 uppercase">Current_Node_Count</span>
        <span class="text-2xl font-black tracking-tighter">{{
          globalNodeCount.toLocaleString()
        }}</span>
      </div>
      <div class="space-y-1">
        <span class="block text-[9px] text-neutral-500 uppercase">Active_Repatriation_Rate</span>
        <span class="text-2xl font-black tracking-tighter text-emerald-400">{{ activeRate }}</span>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-cyan-900/30">
      <p class="text-[9px] text-neutral-600 font-bold leading-relaxed italic">
        > SYSTEM_STATUS: ALL_BONUS_MULTIPLIERS_PURGED<br />
        > LOGIC_MODE: LINEAR_POPULATION_DECAY_ACTIVE<br />
        > INTEGRITY: 16_THREAD_SYMMETRY_VERIFIED
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Add specific scanline or flicker effects if needed for the Iopic aesthetic */
</style>
