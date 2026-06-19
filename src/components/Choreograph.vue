<template>
  <div class="p-6 bg-black text-white border border-neutral-800 font-mono max-w-2xl mx-auto">
    <header class="flex justify-between items-center border-b border-neutral-900 pb-4 mb-6">
      <div>
        <span class="text-[10px] text-neutral-500 block">THREAD_0100 // MOVEMENT_SEQUENCE</span>
        <h2 class="text-md font-bold tracking-widest text-indigo-400">CHOREOGRAPH.VUE</h2>
      </div>
      <div class="flex items-center gap-4 text-xs">
        <div>BPM: <span class="text-indigo-400 font-bold">60</span></div>
        <div class="flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span class="text-neutral-400">SEQUENCER_RUNNING</span>
        </div>
      </div>
    </header>

    <main class="space-y-4">
      <div class="bg-neutral-950 border border-neutral-900 p-4 space-y-3">
        <h3 class="text-xs font-bold text-neutral-400 mb-2">Active Sequence: Universal_Pulse_Routine</h3>
        
        <div class="flex items-center gap-3">
          <div class="w-20 text-[10px] font-bold text-neutral-500 truncate">SELF.VUE</div>
          <div class="flex-grow grid grid-cols-8 gap-1">
            <div v-for="step in 8" :key="step" 
                 :class="['h-6 border border-neutral-800 transition-colors duration-200', step <= 2 ? 'bg-indigo-950 border-indigo-500' : 'bg-neutral-900']">
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-20 text-[10px] font-bold text-neutral-500 truncate">SPICE.VUE</div>
          <div class="flex-grow grid grid-cols-8 gap-1">
            <div v-for="step in 8" :key="step" 
                 :class="['h-6 border border-neutral-800 transition-colors duration-200', step >= 3 && step <= 4 ? 'bg-cyan-950 border-cyan-500' : 'bg-neutral-900']">
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-20 text-[10px] font-bold text-neutral-500 truncate">OT.VUE</div>
          <div class="flex-grow grid grid-cols-8 gap-1">
            <div v-for="step in 8" :key="step" 
                 :class="['h-6 border border-neutral-800 transition-colors duration-200', step >= 5 && step <= 6 ? 'bg-emerald-950 border-emerald-500' : 'bg-neutral-900']">
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-20 text-[10px] font-bold text-neutral-500 truncate">EARTH.VUE</div>
          <div class="flex-grow grid grid-cols-8 gap-1">
            <div v-for="step in 8" :key="step" 
                 :class="['h-6 border border-neutral-800 transition-colors duration-200', step >= 7 ? 'bg-amber-950 border-amber-500' : 'bg-neutral-900']">
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 bg-neutral-950 border border-neutral-900 text-xs">
        <span class="text-indigo-400 font-bold block mb-1">CURRENT_BEAT_EXECUTION:</span>
        <p class="text-neutral-400 text-[11px] leading-relaxed">
          {{ currentBeatDescription }}
        </p>
      </div>
    </main>

    <footer class="mt-6 border-t border-neutral-900 pt-4 flex gap-2">
      <button 
        @click="runFullChoreography" 
        :disabled="isRunning"
        class="flex-grow bg-white text-black font-bold p-3 text-xs tracking-widest hover:bg-indigo-400 hover:text-black transition-colors duration-300 disabled:opacity-50"
      >
        {{ isRunning ? 'EXECUTING_ROUTINE...' : 'RUN_CHOREOGRAPHY_PULSE' }}
      </button>
      <button @click="resetRoutine" class="bg-neutral-900 text-neutral-500 px-4 text-xs border border-neutral-800 hover:text-white transition-colors duration-200">
        RESET
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// @ts-ignore - vuex types not properly resolved
import { useStore } from 'vuex';

const store = useStore();
const isRunning = ref(false);
const currentBeatDescription = ref('Sequencer anchored. Awaiting trigger to march the 16 threads in unified order.');

const runFullChoreography = () => {
  isRunning.value = true;
  currentBeatDescription.value = '[Beats 1-2]: Isolating core identity in Self.vue. Grounding biometric heart rate parameters.';
  
  setTimeout(() => {
    currentBeatDescription.value = '[Beats 3-4]: Initializing SPICE.vue gateway. Routing secure cryptographic handshakes through the zero-knowledge matrix.';
  }, 2000);

  setTimeout(() => {
    currentBeatDescription.value = '[Beats 5-6]: Engaging OT.vue. Processing economic equity transaction with hard-coded 1.1x / 2.2x multiplier tracking.';
  }, 4000);

  setTimeout(() => {
    currentBeatDescription.value = '[Beats 7-8]: Transitioning view to EarthToMe.vue. Executing smooth spatial zoom to lock local Cleveland cluster coordinates.';
    isRunning.value = false;
    console.log("CHOREOGRAPH: Lifecycle routine fully completed and stabilized across the Global Mesh.");
  }, 6000);
};

const resetRoutine = () => {
  isRunning.value = false;
  currentBeatDescription.value = 'Sequencer anchored. Awaiting trigger to march the 16 threads in unified order.';
};
</script>