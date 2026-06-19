<template>
  <div
    class="choreograph-module font-mono text-white p-4 border border-cyan-500/30 bg-neutral-950/90 shadow-lg"
  >
    <div class="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
      <div class="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase">
        Data_Movement_Choreographer // Thread_0100
      </div>
      <div class="text-[9px] text-neutral-500 animate-pulse">FLOW_OPTIMIZED: ACTIVE</div>
    </div>

    <div class="space-y-4">
      <div class="flex items-end justify-between">
        <div class="space-y-1">
          <div class="text-[8px] text-neutral-500 uppercase tracking-tighter">Throughput</div>
          <div class="text-2xl font-black italic text-white tracking-tighter leading-none">
            {{ throughput.toFixed(1) }} Tbps
          </div>
        </div>
        <div class="text-right">
          <div class="text-[8px] text-neutral-500 uppercase tracking-tighter">Latency</div>
          <div class="text-[10px] text-cyan-500 font-bold tracking-widest">
            {{ latency.toFixed(4) }}ms
          </div>
        </div>
      </div>

      <!-- Visual Data Flow Indicator -->
      <div class="relative h-1.5 bg-neutral-900 w-full overflow-hidden border border-neutral-800">
        <div
          class="absolute inset-y-0 bg-cyan-500 shadow-[0_0_10px_rgba(0,229,255,0.8)] animate-data-flow"
          style="width: 10%"
        ></div>
      </div>
    </div>

    <div class="mt-4 text-[9px] text-neutral-400 leading-relaxed text-justify">
      SYSTEM_NOTE: Data packets are routed through the 16-thread bus with zero-latency protocols.
      Deterministic pathing ensures absolute integrity and noise-free transit.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const throughput = ref(1.6); // Terabits per second
const latency = ref(0.0001); // Milliseconds
</script>

<style scoped>
@keyframes data-flow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(
      1000%
    ); /* Moves the 10% wide element 10 times its width, effectively 100% of parent width */
  }
}

.animate-data-flow {
  animation: data-flow 3s linear infinite;
}
</style>
