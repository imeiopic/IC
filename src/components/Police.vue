<template>
  <div
    class="observer-node p-6 bg-black border-2 border-red-500 rounded-lg font-mono shadow-[0_0_30px_rgba(239,68,68,0.2)]"
  >
    <header class="flex justify-between items-center border-b border-red-900/40 pb-4 mb-6">
      <div>
        <h3 class="text-xl font-black text-red-500 uppercase tracking-tighter italic">
          Protocol Observer
        </h3>
        <span class="text-[9px] text-zinc-600 uppercase tracking-widest"
          >// SYSTEM_SIGHTING: ENTROPY_DETECTION</span
        >
      </div>
      <div class="text-right">
        <div class="tiny text-red-400 font-bold animate-pulse">SIGHTING_ACTIVE</div>
        <div class="extra-tiny text-zinc-500">BUS_LOAD: {{ busLoad }}%</div>
      </div>
    </header>

    <div class="status-grid mt-4">
      <div class="alert-feed space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        <div
          v-if="activeFractures.length === 0"
          class="text-zinc-700 italic text-xs py-4 text-center"
        >
          Logic symmetry maintained. No fractures detected.
        </div>
        <div
          v-for="alert in activeFractures"
          :key="alert.id"
          class="p-3 bg-zinc-950 border border-red-900/30 rounded flex justify-between items-center transition-all hover:border-red-500/50"
        >
          <div class="flex flex-col">
            <span class="text-[10px] text-red-500 font-bold uppercase"
              >[ALERT] {{ alert.type }}</span
            >
            <span class="text-[11px] text-zinc-400 italic"
              >Symmetry mismatch at {{ alert.coordinate }}</span
            >
          </div>
          <button
            @click="initiateAutoSync(alert.id)"
            class="text-[9px] bg-red-900/20 text-red-400 border border-red-900/50 px-2 py-1 hover:bg-red-500 hover:text-black transition-colors"
          >
            INIT_SYNC
          </button>
        </div>
      </div>
    </div>

    <footer class="mt-8 pt-4 border-t border-zinc-900">
      <div class="flex justify-between items-center mb-4">
        <span class="extra-tiny text-zinc-500 uppercase"
          >Observer Rationale: Identification vs Correction</span
        >
        <span class="extra-tiny text-zinc-500">{{ activeFractures.length }} Fractures Pending</span>
      </div>
      <p class="text-[10px] text-zinc-600 leading-relaxed italic">
        The Observer identifies 'entropy' and initiates an auto-sync protocol. Force is not a
        logical constant; alignment is.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Fracture {
  id: string;
  type: string;
  coordinate: string;
}

const busLoad = ref(14.02);

/**
 * Reactive registry of detected logical fractures.
 * In a live environment, this would be populated via a 16-thread bus listener.
 */
const activeFractures = ref<Fracture[]>([
  { id: 'f_001', type: 'FLOATING_DEBT_NOISE', coordinate: 'COORD_0x44A1' },
  { id: 'f_002', type: 'ASYMMETRIC_PULSE', coordinate: 'LOCALITY_CLEVELAND_ROOT' },
  { id: 'f_003', type: 'DATA_HARVEST_ATTEMPT', coordinate: 'BUS_THREAD_09' },
]);

/**
 * Initiates an auto-sync protocol to collapse the entropy and restore the local mesh.
 */
const initiateAutoSync = (id: string) => {
  console.log(`[OBSERVER] Initiating auto-sync for fracture ${id}...`);
  // Simulated sync logic: remove the fracture from the feed once grounded
  activeFractures.value = activeFractures.value.filter((f) => f.id !== id);
};
</script>

<style scoped>
.extra-tiny {
  font-size: 0.65rem;
}
.tiny {
  font-size: 0.8rem;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #450a0a;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #7f1d1d;
}
</style>
