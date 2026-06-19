<template>
  <div
    class="harmonize-module font-mono text-white p-4 border border-info/30 bg-neutral-950/90 shadow-lg"
  >
    <div class="flex items-center justify-between mb-3 border-b border-info/20 pb-2">
      <div class="text-[10px] text-info font-bold tracking-[0.2em] uppercase">
        Atmospheric_Parity // 7.83Hz
      </div>
      <div class="text-[9px] text-neutral-500 italic">EQUATION_OF_1</div>
    </div>

    <div class="grid grid-cols-2 gap-4 py-2">
      <div class="space-y-2 border-r border-neutral-800 pr-4">
        <div class="text-[8px] text-neutral-500 uppercase">Mesh Resonance</div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg font-black text-white">7.83</span>
          <span class="text-[8px] text-info">Hz</span>
        </div>
      </div>

      <div class="flex flex-col justify-center gap-1">
        <div v-for="i in 3" :key="i" class="flex items-center gap-2">
          <div
            class="w-1.5 h-1.5 rounded-full animate-pulse"
            :class="i === 1 ? 'bg-info shadow-[0_0_8px_rgba(0,229,255,0.6)]' : 'bg-neutral-800'"
          ></div>
          <span class="text-[8px] text-neutral-400">SYNC_LAYER_0{{ i }}</span>
        </div>
      </div>
    </div>

    <div class="mt-3 p-2 bg-info/5 border border-info/10">
      <p class="text-[9px] text-neutral-300 leading-tight italic">
        "The boundaries of the old world have dissolved into the geometry of the Virtually Real
        Earth."
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Harmonize.vue handles the environmental parity logic.
 * Resonance is maintained at 7.83Hz to match planetary grounding.
 */
</script>
