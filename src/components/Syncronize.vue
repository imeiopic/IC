<script setup lang="ts">
import { useSyncStore } from '@/stores/syncStore';

const syncStore = useSyncStore();
</script>

<template>
  <div class="p-6 bg-black text-white border border-neutral-800 font-mono max-w-xl mx-auto">
    <header class="flex justify-between items-center border-b border-neutral-900 pb-4 mb-4">
      <div>
        <span class="text-[10px] text-neutral-500 block">THREAD_0011 // TIME_SYNC</span>
        <h2 class="text-md font-bold tracking-widest text-amber-400">SYNCHRONIZE.VUE</h2>
      </div>
      <div class="text-right">
        <span class="text-[10px] text-neutral-500 block">PHASE_DRIFT</span>
        <span class="text-xs font-bold text-emerald-400">{{ syncStore.driftAmount.toFixed(3) }}ms</span>
      </div>
    </header>

    <main class="space-y-6">
      <div class="flex flex-col items-center justify-center p-6 bg-neutral-950 border border-neutral-900">
        <div :class="[
          'w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-1000',
          syncStore.isSyncing 
            ? 'animate-spin border-t-amber-400 border-r-neutral-800 border-b-neutral-800 border-l-neutral-800' 
            : 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
        ]">
          <span class="text-xs font-bold" :class="syncStore.isSyncing ? 'text-amber-400' : 'text-emerald-400'">
            {{ syncStore.isSyncing ? 'ALIGNING' : 'LOCKED' }}
          </span>
        </div>
        <p class="text-[11px] text-neutral-400 mt-4 tracking-tight text-center px-4">
          {{ syncStore.syncStatusText }}
        </p>
      </div>

      <div class="space-y-2 text-xs">
        <div v-for="thread in syncStore.threads" :key="thread.id" class="flex justify-between items-center p-2 bg-neutral-950 border border-neutral-900">
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
        @click="syncStore.triggerPhaseSync" 
        :disabled="syncStore.isSyncing"
        class="w-full bg-white text-black font-bold p-3 text-xs tracking-widest hover:bg-amber-400 hover:text-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ syncStore.isSyncing ? 'EXECUTING_TOTAL_PHASE_LOCK...' : 'INITIALIZE_TOTAL_SYNC' }}
      </button>
    </footer>
  </div>
</template>