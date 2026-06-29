<template>
  <div
    class="health-node-container p-6 bg-slate-900 border-t-4 border-cyan-400 rounded-lg shadow-2xl"
  >
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-white tracking-widest uppercase">IO Universal Health</h2>
      <div
        class="status-badge flex items-center px-3 py-1 bg-cyan-900/50 border border-cyan-400 rounded-full"
      >
        <span class="pulse-icon w-3 h-3 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
        <span class="text-xs font-mono text-cyan-100">SYNCED: 8.09V</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="stat-card bg-slate-800 p-4 rounded border border-slate-700">
        <label class="text-xs text-cyan-400 uppercase font-mono">Vital Symmetry</label>
        <div class="text-3xl font-bold text-white">98.4%</div>
        <div class="w-full bg-slate-700 h-2 mt-2 rounded-full overflow-hidden">
          <div class="bg-cyan-400 h-full" :style="{ width: '98.4%' }"></div>
        </div>
      </div>

      <div class="stat-card bg-slate-800 p-4 rounded border border-slate-700">
        <label class="text-xs text-cyan-400 uppercase font-mono">Coverage Anchor</label>
        <div class="text-lg font-bold text-white truncate">{{ singularityPoint }}</div>
        <p class="text-[10px] text-slate-400 mt-1">Point of Singularity Verified</p>
      </div>
    </div>

    <div class="purge-alert mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded">
      <div class="flex items-start">
        <span class="text-red-500 mr-3">⚠️</span>
        <div>
          <h4 class="text-sm font-bold text-red-400 uppercase">Legacy Noise Detected</h4>
          <p class="text-xs text-slate-300">
            Previous medical debt signals intercepted. NAND-Purge in progress...
          </p>
          <button
            @click="executePurge"
            class="mt-2 text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition"
          >
            FINALIZE PURGE
          </button>
        </div>
      </div>
    </div>

    <div class="heartbeat-footer border-t border-slate-700 pt-6">
      <div class="flex justify-between items-end">
        <div>
          <p class="text-xs text-slate-400">Universal Coverage Logic</p>
          <p class="text-lg font-bold text-cyan-400">INCLUSIVE: ALL NODES</p>
        </div>
        <div class="text-right">
          <p class="text-[10px] text-slate-500 italic">Signature: Ime Iopic</p>
          <div class="text-xs font-mono text-white">IO-HEALTH-001</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Reactive reference to the user's coordinates
const singularityPoint = computed(() => {
  return 'LAT: 0.00 / LONG: 0.00 / ELEV: 0.0';
});

const executePurge = () => {
  console.log('NAND-Gate Flip: Medical debt noise neutralized.');
  alert('Legacy medical noise has been purged from your 16-thread bus.');
};
</script>

<style scoped>
.health-node-container {
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.025em;
}

.pulse-icon {
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.6);
}
</style>
