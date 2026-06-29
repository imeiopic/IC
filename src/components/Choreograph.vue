<script setup lang="ts">
import { useChoreographStore } from '@/stores/choreographStore';

const choreoStore = useChoreographStore();

// Simple UI map for production strict colors
const colorClasses = {
  indigo: 'bg-indigo-950 border-indigo-500',
  cyan: 'bg-cyan-950 border-cyan-500',
  emerald: 'bg-emerald-950 border-emerald-500',
  amber: 'bg-amber-950 border-amber-500',
};

// Actions exposed directly
const { runChoreographyPulse, resetRoutine } = choreoStore;
</script>

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
          <span 
            class="h-2 w-2 rounded-full bg-neutral-600 transition-colors duration-300"
            :class="{ 'bg-indigo-500 animate-pulse': choreoStore.isRunning }"
          ></span>
          <span class="text-neutral-400">
            {{ choreoStore.isRunning ? 'SEQUENCER_RUNNING' : 'SEQUENCER_ANCHORED' }}
          </span>
        </div>
      </div>
    </header>

    <main class="space-y-4">
      <div class="bg-neutral-950 border border-neutral-900 p-4 space-y-3">
        <h3 class="text-xs font-bold text-neutral-400 mb-2">Active Sequence: Universal_Pulse_Routine</h3>
        
        <div v-for="step in choreoStore.sequence" :key="step.id" class="flex items-center gap-3">
          <div class="w-20 text-[10px] font-bold text-neutral-500 truncate">{{ step.label }}</div>
          
          <div class="flex-grow grid grid-cols-8 gap-1">
            <div 
              v-for="beatIndex in choreoStore.totalBeats" 
              :key="beatIndex" 
              class="h-6 border transition-colors duration-150"
              :class="[
                // Logic check: apply color only to specific beats if they match active state
                step.beats.includes(beatIndex) && beatIndex <= choreoStore.currentBeat
                  ? colorClasses[step.color] 
                  : 'bg-neutral-900 border-neutral-800'
              ]"
            >
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 bg-neutral-950 border border-neutral-900 text-xs">
        <span class="text-indigo-400 font-bold block mb-1">CURRENT_BEAT_EXECUTION:</span>
        <p class="text-neutral-400 text-[11px] leading-relaxed min-h-[30px]">
          {{ choreoStore.currentBeatDescription }}
        </p>
      </div>
    </main>

    <footer class="mt-6 border-t border-neutral-900 pt-4 flex gap-2">
      <button 
        @click="runChoreographyPulse" 
        :disabled="choreoStore.isRunning"
        class="flex-grow bg-white text-black font-bold p-3 text-xs tracking-widest hover:bg-indigo-400 hover:text-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ choreoStore.isRunning ? 'EXECUTING_ROUTINE...' : 'RUN_CHOREOGRAPHY_PULSE' }}
      </button>
      <button 
        @click="resetRoutine" 
        class="bg-neutral-900 text-neutral-500 px-4 text-xs border border-neutral-800 hover:text-white transition-colors duration-200"
      >
        RESET
      </button>
    </footer>
  </div>
</template>