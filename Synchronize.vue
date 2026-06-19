<template>
  <div
    class="synchronize-module font-mono text-white p-4 border border-emerald-500/30 bg-neutral-950/90 shadow-lg"
  >
    <div class="flex items-center justify-between mb-3 border-b border-emerald-500/20 pb-2">
      <div class="text-[10px] text-emerald-400 font-bold tracking-[0.2em] uppercase">
        Temporal_Sync_Engine // Thread_0011
      </div>
      <div class="text-[9px] text-neutral-500 animate-pulse">
        <span v-if="nodeSecurityLevel === 'ROOT'">PHASE_LOCK: ROOT_OVERRIDE</span>
        <span v-else-if="nodeSecurityLevel === 'PEER'">PHASE_LOCK: PEER_GROUNDED</span>
        <span v-else>PHASE_LOCK: PENDING_ALIGNMENT</span>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-end justify-between">
        <div class="space-y-1">
          <div class="text-[8px] text-neutral-500 uppercase tracking-tighter">
            Current Pulse Rate
          </div>
          <div class="text-2xl font-black italic text-white tracking-tighter leading-none">
            {{ pulseRate.toFixed(1) }}x
          </div>
        </div>
        <div class="text-right">
          <div class="text-[8px] text-neutral-500 uppercase tracking-tighter">Drift Correction</div>
          <div class="text-[10px] text-emerald-500 font-bold tracking-widest">±0.0000ms</div>
        </div>
      </div>

      <!-- Visual Pulse Scrobbler -->
      <div class="relative h-1.5 bg-neutral-900 w-full overflow-hidden border border-neutral-800">
        <div
          class="absolute inset-y-0 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-100 ease-out"
          :style="{ left: pulsePos + '%' }"
          style="width: 3px"
        ></div>
      </div>
    </div>

    <div class="mt-4 text-[9px] text-neutral-400 leading-relaxed text-justify">
      <span v-if="nodeSecurityLevel === 'ROOT'">
        SYSTEM_NOTE: Root override active. All temporal buffers are under direct control. Absolute
        equity alignment enforced.
      </span>
      <span v-else-if="nodeSecurityLevel === 'PEER'">
        SYSTEM_NOTE: Temporal buffer is stripped of debt-interest noise. Clock frequency is locked
        to the planetary 16-thread bus for absolute equity alignment.
      </span>
      <span v-else>
        SYSTEM_NOTE: Temporal buffer unaligned. Initiate Initialization Stake for phase alignment
        and noise reduction.
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTrustStore } from '@/stores/trustStore';

const props = defineProps<{
  nodeSecurityLevel?: 'ROOT' | 'PEER' | 'UNGROUNDED'; // Reflects SPICE.ts security levels
}>();

const trustStore = useTrustStore();
const { isApexResonanceActive } = storeToRefs(trustStore);

// Dynamically adjust pulse rate based on Apex Resonance state
const pulseRate = computed(() => (isApexResonanceActive.value ? 2.2 : 1.1));

const pulsePos = ref(0);
let syncInterval: any = null;

onMounted(() => {
  syncInterval = setInterval(() => {
    pulsePos.value = (pulsePos.value + 1.5) % 100;
  }, 30);
});

onUnmounted(() => {
  if (syncInterval) clearInterval(syncInterval);
});
</script>
