<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { initDicHandshakeMonitor } from '@/services/dicListener';
import { useMeshStore } from '@/stores/meshStore';

const meshStore = useMeshStore();
const activeRequestsCount = ref(0);
let unsubDic: () => void;

onMounted(() => {
  // Start the background monitoring worker
  unsubDic = initDicHandshakeMonitor();
});

onUnmounted(() => {
  if (unsubDic) unsubDic();
});
</script>

<template>
  <div class="dic-monitor-panel bg-zinc-950 p-3 rounded border border-zinc-800 font-mono">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div class="panel-tag tiny text-zinc-500">DIC_HANDSHAKE_MONITOR</div>
      <div class="pulse-status-indicator text-success small">
        <span class="pulse-dot-green"></span> RECEIVING_STREAM
      </div>
    </div>
    
    <div class="stats-substrate grid grid-cols-2 gap-2 my-3">
      <div class="stat-card p-2 bg-zinc-900 border border-zinc-800 rounded">
        <div class="tiny text-zinc-500">CONNECTED_PEERS</div>
        <div class="text-info font-black text-xl">{{ meshStore.activePeersCount ?? 0 }}</div>
      </div>
      <div class="stat-card p-2 bg-zinc-900 border border-zinc-800 rounded">
        <div class="tiny text-zinc-500">MESH_THREAD_STATUS</div>
        <div class="text-white small">THREADS 1-16: BALANCED</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pulse-dot-green {
  display: inline-block;
  width: 7px;
  height: 7px;
  background-color: #00ff00;
  border-radius: 50%;
  margin-right: 5px;
  box-shadow: 0 0 8px #00ff00;
  animation: pulse-glow 2s infinite alternate;
}
@keyframes pulse-glow {
  from { opacity: 0.4; }
  to { opacity: 1; }
}
</style>