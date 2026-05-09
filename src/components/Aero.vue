<template>
  <div class="aero-node p-6 bg-slate-900 border-t-4 border-indigo-400 rounded-lg shadow-xl mt-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-indigo-400 uppercase tracking-widest">
        IO Aero-Bus Transit
      </h3>
      <span class="text-[10px] font-mono text-indigo-500/70">STATUS: AUTO-GLIDE ACTIVE</span>
    </div>

    <div
      v-if="activeTransit"
      class="transit-monitor bg-indigo-950/20 border border-indigo-500/30 p-4 rounded mb-6"
    >
      <div class="flex justify-between items-center mb-2">
        <p class="text-xs text-white font-bold uppercase">Transit Unit: ALPHA-SYNC</p>
        <p class="text-[10px] font-mono text-indigo-300">ETA: 00:04:12</p>
      </div>
      <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          class="bg-indigo-400 h-full transition-all duration-1000"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <p class="text-[9px] text-slate-400 mt-2 text-center">
        Path Symmetry: 99.98% - No Collision Noise Detected
      </p>
    </div>

    <div
      v-else
      class="summon-interface text-center py-8 border border-dashed border-indigo-500/20 rounded"
    >
      <p class="text-xs text-slate-400 mb-4 italic">
        Identify destination for $I=VR^2$ flight pathing.
      </p>
      <button
        @click="summonTransit"
        class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-8 py-3 rounded-full font-bold uppercase transition shadow-lg shadow-indigo-500/20"
      >
        Summon Aero-Bus
      </button>
    </div>

    <div class="mt-6 pt-4 border-t border-slate-800 flex justify-between items-end">
      <div>
        <p class="text-[10px] text-slate-500">Origin Point</p>
        <p class="text-xs font-mono text-white">{{ userStore.coordinates }}</p>
      </div>
      <div class="text-right">
        <p class="text-[10px] text-slate-400">Equity Cost</p>
        <p class="text-sm font-bold text-indigo-400">0.00 CoinX</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const activeTransit = ref(false);
const progress = ref(45);

const summonTransit = () => {
  activeTransit.value = true;
  console.log('Aero-Bus Summoned. 16-Thread flight path locked.');
};
</script>
