<script setup lang="ts">
import { inject, computed } from 'vue';
import { useGlobalMandates } from './ReusableMandate.vue';

const globalMandates = inject<ReturnType<typeof useGlobalMandates>>('globalMandates');

const partitionedNodesList = computed(() => {
  if (!globalMandates) return [];
  return Array.from(globalMandates.partitionedNodes.value);
});

const purgeNode = (nodeId: string) => {
  if (globalMandates) {
    globalMandates.partitionedNodes.value.delete(nodeId);
    console.log(`[REM_PURGE] Node ${nodeId} metadata wiped. Ready for re-alignment.`);
  }
};
</script>

<template>
  <div class="rem-module">
    <div class="rem-header">
      <h3>REM.vue - Resonance Exclusion Module</h3>
      <div class="status-badge" :class="{ active: partitionedNodesList.length > 0 }">
        {{ partitionedNodesList.length > 0 ? 'PARTITION_ACTIVE' : 'MESH_CLEAN' }}
      </div>
    </div>

    <div v-if="partitionedNodesList.length > 0" class="exclusion-zone">
      <p class="warning-text">The following nodes have been partitioned due to Sovereignty Interruptions:</p>
      <ul>
        <li v-for="nodeId in partitionedNodesList" :key="nodeId" class="partitioned-node">
          <span class="node-id">NODE_ID: {{ nodeId }}</span>
          <button @click="purgeNode(nodeId)" class="purge-btn">PURGE & RE-ALIGN</button>
        </li>
      </ul>
    </div>
    <div v-else class="mesh-status">
      <p>No non-sovereign intent detected. 16-thread bus is secure.</p>
    </div>
  </div>
</template>

<style scoped>
.rem-module {
  background-color: #1a1a1a;
  color: #ff3b3b;
  padding: 20px;
  border: 2px solid #ff3b3b;
  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
}
.rem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ff3b3b;
  padding-bottom: 10px;
  margin-bottom: 15px;
}
.status-badge {
  padding: 4px 8px;
  border: 1px solid #555;
  font-size: 0.8em;
}
.status-badge.active {
  background-color: #ff3b3b;
  color: #fff;
  animation: pulse 1s infinite;
}
.partitioned-node {
  display: flex;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 10px;
  margin: 5px 0;
  border-left: 4px solid #ff3b3b;
}
.purge-btn {
  background: transparent;
  border: 1px solid #ff3b3b;
  color: #ff3b3b;
  cursor: pointer;
}
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
</style>