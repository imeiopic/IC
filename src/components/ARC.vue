<template>
  <div
    class="p-6 bg-black text-red-500 border-2 border-red-900 font-mono max-w-2xl mx-auto shadow-[0_0_30px_rgba(239,68,68,0.15)]"
  >
    <header class="flex justify-between items-center border-b border-red-900/60 pb-4 mb-6">
      <div>
        <span class="text-[10px] text-red-700 block animate-pulse">▲ CRITICAL_FAIL_SAFE_LAYER</span>
        <h2 class="text-md font-bold tracking-widest text-red-400">
          ARC.VUE // ARCHITECTURE_RECOVERY
        </h2>
      </div>
      <div class="text-right text-xs bg-red-950/40 px-2 py-1 border border-red-900/50 rounded">
        SYSTEM_SHIELD: <span class="font-bold text-white">HARD_LOCKED</span>
      </div>
    </header>

    <main class="space-y-4 text-xs">
      <div class="p-4 bg-neutral-950 border border-neutral-900 space-y-2 text-neutral-400">
        <p>
          <span class="text-red-500 font-bold">RECOVERY_STATUS:</span> Isolated Node Substrate
          Active.
        </p>
        <p>
          <span class="text-red-500 font-bold">ISOLATION_TARGET:</span> CLEVELAND [41.81] Grounding
          Anchor.
        </p>
        <p class="text-[11px] leading-relaxed text-neutral-500">
          When the bus detects ungrounded data pollution, the Master Viewport collapses. Use this
          console to manually purge memory leaks and force structural re-alignment.
        </p>
      </div>

      <section class="space-y-3 bg-neutral-950 border border-neutral-900 p-4">
        <h3 class="font-bold text-neutral-300">Core Cache Saturation</h3>

        <div class="space-y-1">
          <div class="flex justify-between text-[10px] text-neutral-500">
            <span>Thread Bus Buffer (Entropy Level)</span>
            <span class="text-red-400 font-bold">{{ entropyLevel }}%</span>
          </div>
          <div class="w-full bg-neutral-900 h-1 rounded overflow-hidden">
            <div
              :style="{ width: `${entropyLevel}%` }"
              class="bg-red-500 h-full transition-all duration-500"
            ></div>
          </div>
        </div>

        <div class="space-y-1">
          <div class="flex justify-between text-[10px] text-neutral-500">
            <span>SPICE.vue Cryptographic Integrity</span>
            <span class="text-emerald-400 font-bold">100% SECURE</span>
          </div>
          <div class="w-full bg-neutral-900 h-1 rounded overflow-hidden">
            <div class="bg-emerald-500 h-full w-full"></div>
          </div>
        </div>
      </section>
    </main>
    
    <div 
      ref="terminal"
      class="mt-4 p-2 border border-red-700 bg-red-950/50 text-red-300 text-xs h-32 overflow-y-auto font-mono"
    >
      <div v-for="(msg, index) in systemMessages" :key="index" class="mb-1">
        <span class="text-red-600 mr-2">>></span> {{ msg }}
      </div>
      <div v-if="isPurging" class="animate-pulse">_</div>
    </div>

    <footer class="mt-6 border-t border-neutral-900 pt-4 grid grid-cols-2 gap-3">
      <button
        @click="purgeEcosystemCache"
        :disabled="isPurging"
        class="bg-neutral-950 border border-red-900/60 text-red-400 font-bold p-3 text-xs tracking-wider hover:bg-red-950 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {{ isPurging ? 'FLUSHING_BUS...' : 'PURGE_MEM_CACHE' }}
      </button>
      <button
        @click="forceSystemRealign"
        :disabled="isPurging"
        class="bg-white text-black font-bold p-3 text-xs tracking-widest hover:bg-red-500 hover:text-black transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        FORCE_HARD_RESET
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import { SPICE } from './SPICE';
import { useChunkedUpload } from '../useChunkedUpload';

const entropyLevel = ref(84); // Simulated data congestion spike
const isPurging = ref(false);
const systemMessages = ref<string[]>([]);
const terminal = ref<HTMLElement | null>(null);

const { savedSessionMetadata, cancelUpload } = useChunkedUpload();

const addLog = (msg: string) => {
  systemMessages.value.push(msg);
  // Auto-scroll to bottom of terminal
  nextTick(() => {
    if (terminal.value) {
      terminal.value.scrollTop = terminal.value.scrollHeight;
    }
  });
};

let entropyInterval: ReturnType<typeof setInterval>;

onMounted(() => {
  addLog('SYSTEM: Initializing Architecture Recovery Protocol...');
  purgeEcosystemCache();

  // Simulate gradual entropy accumulation after initial purge
  entropyInterval = setInterval(() => {
    if (!isPurging.value && entropyLevel.value < 90) {
      entropyLevel.value += Math.random() > 0.7 ? 1 : 0;
    }
  }, 2000);
});

onUnmounted(() => clearInterval(entropyInterval));

const purgeEcosystemCache = () => {
  isPurging.value = true;
  addLog('ARC_ENGINE: Flushing all ungrounded transactional state anomalies...');

  // Check for and clear stuck chunked upload sessions
  if (savedSessionMetadata.value) {
    const sessionId = savedSessionMetadata.value.uploadId;
    addLog(`ARC_ENGINE: Stuck upload session [${sessionId}] detected. Terminating...`);
    cancelUpload(sessionId);
    addLog('ARC_ENGINE: Upload session metadata successfully purged.');
  }

  setTimeout(() => {
    entropyLevel.value = 0;
    isPurging.value = false;
    addLog('ARC_ENGINE: State memory cache fully scrubbed.');
    addLog('SYSTEM: Grounding anchor re-established at R=1.0.');
  }, 1500);
};

const forceSystemRealign = () => {
  addLog('ARC_ENGINE: Triggering master hardware-software sync...');
  addLog('SYSTEM: Pushing layout back to core 16-Thread Bus.');

  // Clear the system instability flag before hard reset
  SPICE.triggerShake.value = false;

  // Hard reload or state re-route back to primary ZoomEarthToMe component
  window.location.reload();
};
</script>
