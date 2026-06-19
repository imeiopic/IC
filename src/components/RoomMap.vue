<template>
  <div class="ideal-map-container">
    <div class="map-overlay">
      <div class="coord-display">Sighting: {{ activeSector }}</div>
      <div class="atmospheric-pressure">Bus Load: {{ busPressure }}%</div>
    </div>

    <div class="spatial-grid">
      <div 
        v-for="sector in 16" 
        :key="sector" 
        class="grid-sector"
        :class="{ 'high-pressure': getSectorPressure(sector) > 70 }"
        @mouseover="activeSector = sector"
      >
        <div 
          v-for="node in getNodesInSector(sector)" 
          :key="node.id"
          class="node-pulse"
          :style="{ transform: `scale(${node.equityWeight})` }"
          @click="sightingNode(node)"
        ></div>
      </div>
    </div>

    <div class="map-legend">
      <span><i class="dot gold"></i> Apex Node</span>
      <span><i class="dot blue"></i> Grounded Peer</span>
      <span><i class="dot pulse"></i> Active Handshake</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const activeSector = ref(0);

const busPressure = computed(() => store.state.room.totalPressure);
const nodes = computed(() => store.state.room.activeNodes);

const getNodesInSector = (sector) => {
  return nodes.value.filter(n => n.currentSector === sector);
};

const getSectorPressure = (sector) => {
  const sectorNodes = getNodesInSector(sector);
  return sectorNodes.reduce((acc, n) => acc + n.pressureContribution, 0);
};

const sightingNode = (node) => {
  console.log(`Sighting Node ${node.id}: 16-Thread Integrity Verified.`);
  store.dispatch('openNodeHandshake', node.id);
};
</script>

<style scoped>
.ideal-map-container {
  background: #000;
  border: 2px solid #222;
  position: relative;
  aspect-ratio: 1 / 1;
  padding: 10px;
}
.spatial-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 2px;
  height: 100%;
}
.grid-sector {
  border: 1px solid #111;
  background: rgba(10, 10, 10, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.grid-sector:hover {
  background: rgba(255, 215, 0, 0.05);
  border-color: #ffd700;
}
.node-pulse {
  width: 12px;
  height: 12px;
  background: #00d4ff;
  border-radius: 50%;
  box-shadow: 0 0 10px #00d4ff;
  cursor: pointer;
}
.high-pressure {
  background: rgba(255, 0, 0, 0.1);
}
</style>