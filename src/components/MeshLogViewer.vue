<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useMeshStore } from '@/stores/meshStore';

const mesh = useMeshStore();
const logs = ref<any[]>([]);
const MAX_LOGS = 50;

/**
 * LOG_SUBSCRIPTION:
 * Subscribes to the ledger stream and filters for high-priority mutations.
 */
const handleNewLog = (event: any) => {
  logs.value.unshift({
    id: Date.now(),
    thread: event.threadId,
    type: event.mutation.type,
    timestamp: new Date().toLocaleTimeString()
  });

  if (logs.value.length > MAX_LOGS) logs.value.pop();
};

onMounted(() => {
  // In a real scenario, this connects to the event bus or a store subscriber
  mesh.subscribeToLedger(handleNewLog);
});

onUnmounted(() => mesh.unsubscribeFromLedger(handleNewLog));
</script>

<template>
  <div class="mesh-log-viewer">
    <div class="header">
      <span class="text-cyan-400 font-bold">LIVE_TELEMETRY_FEED</span>
      <span class="text-[10px] text-zinc-600">ACTIVE_THREADS: 16</span>
    </div>

    <div class="log-container">
      <div 
        v-for="log in logs" 
        :key="log.id" 
        class="log-entry"
        :class="{ 'text-cyan-500': log.thread === mesh.activeThreads }"
      >
        <span class="timestamp">[{{ log.timestamp }}]</span>
        <span class="thread-id">T-{{ log.thread }}</span>
        <span class="mutation-type">{{ log.type }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mesh-log-viewer { @apply w-full h-64 bg-black border border-zinc-800 p-4 font-mono text-[10px] overflow-hidden flex flex-col; }
.log-container { @apply overflow-y-auto flex-1 space-y-1 mt-2; }
.log-entry { @apply flex gap-3 text-zinc-400 border-b border-zinc-900 pb-1 hover:bg-zinc-900/50; }
.timestamp { @apply text-zinc-600; }
</style>