<script setup lang="ts">
import { useMeshStore } from '@/stores/meshStore';
const mesh = useMeshStore();
</script>

<template>
  <div class="mesh-connection-substrate">
    <div class="connection-header">
      <h2>MESH_LINK // NODE_STATUS</h2>
      <div :class="['status-indicator', mesh.state.toLowerCase()]">
        {{ mesh.state }}
      </div>
    </div>

    <div class="mesh-telemetry-grid">
      <div class="telemetry-card">
        <span class="label">THREADS_ACTIVE</span>
        <span class="value">{{ mesh.activeThreads }}/16</span>
      </div>
      <div class="telemetry-card">
        <span class="label">LATENCY</span>
        <span class="value">{{ mesh.meshLatency }}ms</span>
      </div>
    </div>

    <button 
      @click="mesh.initiateHandshake" 
      :disabled="mesh.state !== 'DISCONNECTED'"
      class="handshake-btn"
    >
      {{ mesh.state === 'DISCONNECTED' ? 'INITIATE_HANDSHAKE' : 'STABILIZING...' }}
    </button>
  </div>
</template>

<style scoped>
.mesh-connection-substrate { background: #050505; border: 1px solid #00e5ff; padding: 2rem; }
.status-indicator { font-weight: 900; letter-spacing: 2px; }
.active { color: #00ff00; text-shadow: 0 0 10px #00ff00; }
.handshake-btn { background: #00e5ff; color: #000; border: none; padding: 1rem 2rem; width: 100%; cursor: pointer; }
.handshake-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>