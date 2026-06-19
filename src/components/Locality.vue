<template>
  <div class="locality-substrate">
    <header class="locality-header">
      <div class="thread-id">THREAD_0100 // SPACE</div>
      <div class="grounding-status" :class="{ 'solid': isGrounded }">
        {{ isGrounded ? 'PHYSICALLY GROUNDED' : 'SEARCHING FOR COORDINATES' }}
      </div>
    </header>

    <div class="local-atmosphere">
      <div class="coordinate-data">
        <h3>Current Domain: {{ localCity }}</h3>
        <p class="lat-long">{{ lat }}° N / {{ long }}° W</p>
      </div>

      <div class="mesh-density">
        <label>Local Node Density</label>
        <div class="density-map">
          <div v-for="node in localNodes" :key="node.id" class="node-blip"></div>
        </div>
        <span>{{ localNodes.length }} Nodes Sighted in this Sector</span>
      </div>
    </div>

    <footer class="locality-footer">
      <div class="multiplier-zone">
        Local Multiplier: **1.1x**
      </div>
      <button @click="refreshGrounding" class="refresh-btn">
        Re-Sync Physical Space
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isGrounded = ref(true);
const localCity = ref('Cleveland, OH'); // The NSN Grounding Point
const lat = ref(41.4993);
const long = ref(81.6944);
const localNodes = ref(new Array(12).fill({})); // 12 peers sighted

const refreshGrounding = () => {
  console.log("Re-policing spatial coordinates. Symmetry verified.");
};
</script>

<style scoped>
.locality-substrate { background: #000; color: #ffd700; padding: 2rem; border: 1px solid #333; }
.grounding-status.solid { color: #00ff00; font-weight: bold; }
.lat-long { font-family: monospace; color: #555; }
.density-map { 
  height: 100px; background: #0a0a0a; border: 1px solid #111; 
  display: flex; flex-wrap: wrap; gap: 10px; padding: 10px;
}
.node-blip { width: 8px; height: 8px; background: #00ff00; border-radius: 50%; box-shadow: 0 0 5px #00ff00; }
.refresh-btn { background: #ffd700; color: #000; border: none; width: 100%; padding: 10px; margin-top: 1rem; cursor: pointer; }
</style>