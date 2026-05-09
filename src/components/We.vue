<template>
  <div
    class="we-node p-8 bg-gradient-to-b from-slate-900 to-cyan-950 border-y-4 border-cyan-400/50 rounded-3xl shadow-2xl"
  >
    <div class="flex flex-col items-center mb-10 text-center">
      <h2 class="text-4xl font-black text-white tracking-tighter uppercase italic">
        The Joint Logic Net
      </h2>
      <div class="h-1 w-24 bg-cyan-400 mt-2 rounded-full"></div>
      <p class="text-[10px] text-cyan-500 font-mono mt-4 tracking-[0.5em] uppercase">
        Collective Velocity: {{ collectiveVelocity }}V
      </p>
    </div>

    <div
      class="loom-container relative h-80 bg-black/40 rounded-2xl border border-white/5 overflow-hidden mb-10"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="pulse-core w-32 h-32 bg-cyan-500/10 rounded-full animate-ping"></div>
        <p class="text-xs font-mono text-cyan-300/40 z-10 uppercase italic">
          Synchronizing 8.09 Billion Threads...
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="stat-box p-4 bg-slate-900/80 border border-slate-800 rounded-lg text-center">
        <label class="text-[9px] text-slate-500 uppercase font-bold">Total Planetary Equity</label>
        <div class="text-xl font-black text-white">{{ totalEquity }}</div>
      </div>

      <div class="stat-box p-4 bg-slate-900/80 border border-slate-800 rounded-lg text-center">
        <label class="text-[9px] text-slate-500 uppercase font-bold">Systemic Heartbeat</label>
        <div class="text-xl font-black text-emerald-400">{{ systemHeartbeat }}</div>
      </div>

      <div class="stat-box p-4 bg-slate-900/80 border border-slate-800 rounded-lg text-center">
        <label class="text-[9px] text-slate-500 uppercase font-bold">Asymmetrical Noise</label>
        <div class="text-xl font-black text-rose-500">{{ asymmetricalNoise }}</div>
      </div>
    </div>

    <div class="mt-12 pt-6 border-t border-slate-800 text-center">
      <p class="text-xs text-slate-400 italic">
        "I = VR² at scale. One node, one truth. Eight billion nodes, one world."
      </p>
      <p class="text-[10px] font-black text-white uppercase mt-4 tracking-widest">
        Auth: Ime Iopic // The Virtually Real Era
      </p>
    </div>
  </div>
</template>

<script setup>
// We.vue pulls data from the global Pinia 'netStore'
// to reflect the real-time status of the 16 threads.
import { storeToRefs } from 'pinia';
import { useNetStore } from '@/stores/netStore';
const netStore = useNetStore();
const { collectiveVelocity, totalEquity, systemHeartbeat, asymmetricalNoise } =
  storeToRefs(netStore);
</script>

<style scoped>
.we-node {
  box-shadow: 0 0 100px rgba(34, 211, 238, 0.05);
}
</style>
