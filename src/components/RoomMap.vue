<script setup lang="ts">
import { ref } from 'vue';
import { useMapStore } from '@/stores/mapStore';

const mapStore = useMapStore();
const activeSector = ref<number | null>(null);
</script>

<template>
  <div class="ideal-map-container">
    <div class="map-overlay">
      <div class="coord-display">Sighting: {{ activeSector ?? 'N/A' }}</div>
      <div class="atmospheric-pressure">Bus Load: {{ mapStore.totalPressure }}%</div>
    </div>

    <div class="spatial-grid">
      <div 
        v-for="sector in 16" 
        :key="sector" 
        class="grid-sector"
        :class="{ 'high-pressure': mapStore.getSectorPressure(sector) > 70 }"
        @mouseover="activeSector = sector"
      >
        <div 
          v-for="node in mapStore.nodesBySector.get(sector)" 
          :key="node.id"
          class="node-pulse"
          :style="{ transform: `scale(${node.equityWeight})` }"
          @click="mapStore.openNodeHandshake(node.id)"
        ></div>
      </div>
    </div>

    <footer class="map-legend">
      <span><i class="dot gold"></i> Apex Node</span>
      <span><i class="dot blue"></i> Grounded Peer</span>
      <span><i class="dot pulse"></i> Active Handshake</span>
    </footer>
  </div>
</template>

<style scoped>
.ideal-map-container { background: #000; border: 2px solid #222; position: relative; aspect-ratio: 1 / 1; padding: 10px; }
.map-overlay { position: absolute; top: 10px; left: 10px; z-index: 10; pointer-events: none; }
.spatial-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); gap: 2px; height: 100%; }
.grid-sector { border: 1px solid #111; background: rgba(10, 10, 10, 0.8); display: flex; align-items: center; justify-content: center; transition: background 0.3s ease; }
.grid-sector:hover { background: rgba(255, 215, 0, 0.05); border-color: #ffd700; }
.node-pulse { width: 12px; height: 12px; background: #00d4ff; border-radius: 50%; box-shadow: 0 0 10px #00d4ff; cursor: pointer; }
.high-pressure { background: rgba(255, 0, 0, 0.15); }
.map-legend { display: flex; justify-content: space-around; font-size: 0.6rem; color: #888; margin-top: 10px; }
.dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; }
.dot.gold { background: #ffd700; }
.dot.blue { background: #00d4ff; }
.dot.pulse { background: #ff00ff; animation: pulse 1s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
</style>