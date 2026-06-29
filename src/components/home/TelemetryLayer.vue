<script setup lang="ts">
import { useTelemetryStore } from '@/stores/telemetryStore';

const telemetry = useTelemetryStore();
</script>

<template>
  <div class="telemetry-substrate">
    <header class="telemetry-header">
      <span class="sys-label">MESH_INTEGRITY_LAYER</span>
      <span class="uptime">UPTIME: {{ telemetry.globalUptime }}</span>
    </header>

    <div class="thread-mesh-grid">
      <div 
        v-for="t in telemetry.threads" 
        :key="t.threadId" 
        :class="['thread-node', t.status.toLowerCase()]"
      >
        <span class="thread-id">T-{{ t.threadId.toString().padStart(2, '0') }}</span>
        <div class="meter-bar" :style="{ height: t.load + '%' }"></div>
        <span class="latency">{{ t.latency }}ms</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.telemetry-substrate {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #333;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  color: #00ff00;
}
.thread-mesh-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}
.thread-node {
  border: 1px solid #222;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.6rem;
}
.optimal { border-color: #00ff00; }
.drifting { border-color: #ffd700; color: #ffd700; }
.locked { border-color: #ff4444; color: #ff4444; }
.meter-bar { width: 100%; background: #222; min-height: 2px; }
</style>