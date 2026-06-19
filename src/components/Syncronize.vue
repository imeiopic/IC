<template>
  <div class="p-6 bg-black text-white border border-neutral-800 font-mono max-w-xl mx-auto">
    <header class="flex justify-between items-center border-b border-neutral-900 pb-4 mb-4">
      <div>
        <span class="text-[10px] text-neutral-500 block">THREAD_0011 // TIME_SYNC</span>
        <h2 class="text-md font-bold tracking-widest text-amber-400">SYNCHRONIZE.VUE</h2>
      </div>
      <div class="text-right">
        <span class="text-[10px] text-neutral-500 block">PHASE_DRIFT</span>
        <span class="text-xs font-bold text-emerald-400">{{ driftAmount }}ms</span>
      </div>
    </header>

    <main class="space-y-6">
      <div class="flex flex-col items-center justify-center p-6 bg-neutral-950 border border-neutral-900 relative overflow-hidden">
        <div :class="[
          'w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-1000',
          isSyncing ? 'animate-spin border-t-amber-400 border-r-neutral-800 border-b-neutral-800 border-l-neutral-800' : 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
        ]">
          <span class="text-xs font-bold" :class="isSyncing ? 'text-amber-400' : 'text-emerald-400'">
            {{ isSyncing ? 'ALIGNING' : 'LOCKED' }}
          </span>
        </div>
        <p class="text-[11px] text-neutral-400 mt-4 tracking-tight text-center">
          {{ syncStatusText }}
        </p>
      </div>

    <div class="space-y-2 text-xs">
        <div v-for="thread in threadStates" :key="thread.id" class="flex justify-between items-center p-2 bg-neutral-950 border border-neutral-900">
          <div class="flex items-center gap-2">
            <span class="text-neutral-600">{{ thread.binary }}</span>
            <span class="text-neutral-300 font-bold">{{ thread.name }}</span>
          </div>
          <span :class="thread.synced ? 'text-emerald-400' : 'text-amber-500 animate-pulse'">
            {{ thread.synced ? '● SYNCHRONIZED' : '○ PENDING_PHASE' }}
          </span>
        </div>
      </div>
    </main>

    <footer class="mt-6 border-t border-neutral-900 pt-4">
      <button 
        @click="triggerPhaseSync" 
        :disabled="isSyncing"
        class="w-full bg-white text-black font-bold p-3 text-xs tracking-widest hover:bg-amber-400 hover:text-black transition-colors duration-300 disabled:opacity-50"
      >
        {{ isSyncing ? 'EXECUTING_TOTAL_PHASE_LOCK...' : 'INITIALIZE_TOTAL_SYNC' }}
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const isSyncing = ref(false);
const driftAmount = ref(0.004);
const syncStatusText = ref('Local spatial substrate [41.4993, -81.6944] matches Planetary Node Master.');

const threadStates = ref([
  { id: 1, binary: '0001', name: 'BASE_IDENTITY', synced: true },
  { id: 2, binary: '0100', name: 'SPACE_LOCALITY', synced: true },
  { id: 3, binary: '0110', name: 'SOCIAL_PEER_MESH', synced: true },
  { id: 4, binary: '1010', name: 'EQUITY_LEDGER', synced: false }
]);

const triggerPhaseSync = () => {
  isSyncing.value = true;
  syncStatusText.value = 'Re-routing 16-thread bus through SPICE API gateway... Stripping clock noise.';
  
  setTimeout(() => {
    isSyncing.value = false;
    driftAmount.value = 0.000;
    threadStates.value[3].synced = true; // Equity ledger locks in
    syncStatusText.value = 'Total Phase Lock achieved. 1.1x / 2.2x operational multiplier resonance stabilized.';
    console.log("SYNCHRONIZE: Global Mesh phase alignment fully grounded.");
  }, 2500);
};
</script>