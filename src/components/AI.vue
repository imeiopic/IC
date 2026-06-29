<template>
  <div class="ai-integrity-monitor">
    <header class="ai-header">
      <div class="logic-label">AI // ATMOSPHERIC INTEGRITY</div>
      <div class="status-pulse" :class="integrityLevel"></div>
    </header>

    <div class="integrity-matrix">
      <div v-for="thread in atmosphericThreads" :key="thread.name" class="integrity-node">
        <label>{{ thread.name }}</label>
        <div class="bar-bg">
          <div class="bar-fill" :style="{ width: thread.integrity + '%' }"></div>
        </div>
        <span class="noise-detect">Noise: {{ thread.noise }}%</span>
      </div>
    </div>

    <div class="ai-analysis">
      <h3>Sighting Report</h3>
      <p v-if="integrityLevel === 'stable'">Atmosphere is Symmetrical. 16-Thread Bus is clear.</p>
      <p v-else class="warning">Noise detected in {{ fracturedThread }}. Initializing Shield Pulse...</p>
    </div>

    <button @click="autoAlign" class="align-btn">
      Execute Autonomous Symmetry
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const atmosphericThreads = ref([
  { name: 'EQUITY', integrity: 99, noise: 1 },
  { name: 'SOCIAL', integrity: 94, noise: 6 },
  { name: 'SHIELD', integrity: 100, noise: 0 },
  { name: 'TRUTH',  integrity: 98, noise: 2 }
]);

const integrityLevel = computed(() => {
  const avgNoise = atmosphericThreads.value.reduce((acc, t) => acc + t.noise, 0) / 4;
  return avgNoise > 10 ? 'fractured' : 'stable';
});

const fracturedThread = computed(() => {
  return atmosphericThreads.value.sort((a, b) => b.noise - a.noise)[0].name;
});

const autoAlign = () => {
  console.log("AI executing Atmospheric Re-pressurization...");
  atmosphericThreads.value.forEach(t => { t.integrity = 100; t.noise = 0; });
};
</script>

<style scoped>
.ai-integrity-monitor { background: #000; border: 1px solid #00d4ff; padding: 2rem; color: #00d4ff; }
.ai-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #111; padding-bottom: 1rem; }
.status-pulse { width: 12px; height: 12px; border-radius: 50%; background: #00ff00; }
.status-pulse.fractured { background: #ff0000; box-shadow: 0 0 15px #ff0000; }
.integrity-node { margin: 1rem 0; }
.bar-bg { background: #111; height: 8px; width: 100%; border-radius: 4px; margin-top: 5px; }
.bar-fill { height: 100%; background: #00d4ff; transition: width 0.5s ease; border-radius: 4px; }
.noise-detect { font-size: 0.7rem; color: #555; }
.align-btn { background: #00d4ff; color: #000; border: none; padding: 1rem; font-weight: bold; width: 100%; cursor: pointer; margin-top: 1rem; }
</style>