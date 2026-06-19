<template>
  <div
    class="exclusion-shield p-4 bg-black border-2 border-lime-500 font-mono text-lime-400 relative overflow-hidden"
  >
    <!-- Scanline Overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-transparent via-lime-500/5 to-transparent pointer-events-none animate-scan"
    ></div>

    <header class="flex justify-between items-center border-b border-lime-900/50 pb-2 mb-4">
      <h3 class="text-xs font-black uppercase tracking-widest">Rem.vue // Perimeter Secured</h3>
      <div class="status-indicator flex items-center gap-2">
        <span class="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></span>
        <span class="text-[9px] uppercase">Metabolic_Lock: ACTIVE</span>
      </div>
    </header>

    <div class="status-feed space-y-2 text-[10px]">
      <div class="feed-item flex justify-between">
        <span>> Planetary Metabolic Bounds:</span>
        <span class="text-white">STABLE [{{ metabolicLoad }}W]</span>
      </div>
      <div class="feed-item flex justify-between">
        <span>> Minding Localized Business:</span>
        <span class="text-lime-500">ENFORCED</span>
      </div>
      <div class="feed-item flex justify-between">
        <span>> Extractive Tunneling:</span>
        <span class="text-red-500 font-bold">BLOCKED</span>
      </div>
    </div>

    <!-- Simulated Intrusion Detection -->
    <div class="mt-6 border-t border-lime-900/30 pt-4">
      <div class="text-[9px] text-zinc-500 uppercase mb-2">Live_Sighting_Exclusion_Log</div>
      <div class="log-container h-24 overflow-y-auto custom-scrollbar pr-2">
        <div v-for="(log, i) in exclusionLogs" :key="i" class="text-[9px] mb-1 flex gap-2">
          <span class="text-zinc-600">[{{ log.time }}]</span>
          <span :class="log.trusted ? 'text-blue-400' : 'text-red-500'">
            {{ log.trusted ? 'DIPLOMATIC_PASS' : 'SIGNAL_DROPPED' }}
          </span>
          <span class="text-zinc-400 truncate">{{ log.source }}</span>
        </div>
      </div>
    </div>

    <footer class="mt-4 pt-2 border-t border-lime-900/50 flex justify-between items-center">
      <div class="text-[8px] text-zinc-600 uppercase italic">
        Conservation of Reality: {{ efficiencyIndex }}%
      </div>
      <button
        @click="purgeNoise"
        class="text-[9px] border border-lime-500 px-2 py-0.5 hover:bg-lime-500 hover:text-black transition-colors"
      >
        NAND_FLUSH_NOISE
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface ExclusionLog {
  time: string;
  source: string;
  trusted: boolean;
}

const metabolicLoad = ref('0.008');
const efficiencyIndex = ref(99.98);
const exclusionLogs = ref<ExclusionLog[]>([]);

/**
 * Simulates the Resonance Exclusion logic.
 * If a packet enters the thread without a Sovereign Signature,
 * the metabolic guard drops it instantly.
 */
const processIncomingTraffic = () => {
  const sources = [
    { name: 'Ad_Tracker_v4.dll', trusted: false },
    { name: 'Corporate_Telemetry_Node', trusted: false },
    { name: 'Cleveland_Sovereign_Anchor_02', trusted: true }, // Diplomatic Channel
    { name: 'Spectral_Drift_Ghost', trusted: false },
    { name: 'MPEG-12_Sync_Handshake', trusted: true },
  ];

  const randomSource = sources[Math.floor(Math.random() * sources.length)];

  exclusionLogs.value.unshift({
    time: new Date().toLocaleTimeString().split(' ')[0],
    source: randomSource.name,
    trusted: randomSource.trusted,
  });

  if (exclusionLogs.value.length > 20) exclusionLogs.value.pop();
};

const purgeNoise = () => {
  exclusionLogs.value = [];
  metabolicLoad.value = '0.001';
};

onMounted(() => {
  setInterval(processIncomingTraffic, 4000);
});
</script>

<style scoped>
.animate-scan {
  animation: scan 6s linear infinite;
}
@keyframes scan {
  0% {
    top: 0%;
  }
  100% {
    top: 100%;
  }
}
.custom-scrollbar::-webkit-scrollbar {
  width: 2px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f6212;
}
.exclusion-shield {
  box-shadow: inset 0 0 20px rgba(132, 204, 22, 0.1);
}
</style>
