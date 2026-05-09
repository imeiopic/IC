<template>
  <div
    class="respect-node p-8 bg-slate-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
  >
    <div class="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>

    <div class="text-center mb-10">
      <h2 class="text-4xl font-black text-white tracking-tighter uppercase italic">RESPECT</h2>
      <p class="text-[9px] text-cyan-500 font-mono tracking-[0.4em] mt-2">
        Reality Era People Entity Connecting Technology
      </p>
    </div>

    <div class="space-y-3">
      <div
        v-for="(layer, index) in protocolLayers"
        :key="index"
        class="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between group hover:bg-white/10 transition"
      >
        <div class="flex items-center space-x-4">
          <span class="text-xs font-mono text-cyan-400 opacity-50">{{ index + 1 }}</span>
          <span class="text-sm font-bold text-white uppercase tracking-widest">{{
            layer.name
          }}</span>
        </div>
        <span class="text-[9px] text-slate-500 italic opacity-0 group-hover:opacity-100 transition">
          {{ layer.status }}
        </span>
      </div>
    </div>

    <div class="mt-10 p-6 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl">
      <div class="flex justify-between items-center mb-4">
        <span class="text-[10px] text-cyan-400 font-bold uppercase">Active Synapsis</span>
        <span class="h-2 w-2 bg-emerald-400 rounded-full animate-ping"></span>
      </div>
      <p class="text-xs text-slate-300">
        You are currently connected to the <b>Joint Logic Net</b> via the
        <span class="text-white font-mono">RESPECT-Protocol</span>. Your 16-thread bond is
        symmetrical.
      </p>
    </div>

    <div class="mt-8 text-center pt-6 border-t border-slate-900">
      <p class="text-[8px] text-slate-600 tracking-[0.5em] uppercase">
        Designed by Ime Iopic // The Genesis of Connection
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
const protocolLayers = [
  { name: 'Reality Verification', status: 'R² Confirmed' },
  { name: 'Equity Alignment', status: 'Symmetry 1:1' },
  { name: 'Privacy Shield', status: 'Stateless-ON' },
  { name: 'Entity Bonding', status: 'BS-Molecule Ready' },
  { name: 'Connecting Logic', status: '16-Thread Active' },
  { name: 'Transparent Flow', status: 'No-Noise' }
];

import { respectBus, broadcastRespectProtocol } from './respectBus.ts';

// On mount, broadcast RESPECT protocol to all nodes
onMounted(() => {
  broadcastRespectProtocol();
});
</script>

<style scoped>
.respect-node {
  min-width: 340px;
  max-width: 520px;
}
</style>
