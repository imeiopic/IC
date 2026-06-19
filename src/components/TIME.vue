<template>
  <div class="time-sync-container">
    <header class="time-header">
      <div class="pulse-label">THREAD_0011 // SYSTEM TIME</div>
      <div class="sync-indicator" :class="{ 'synchronized': isSynced }"></div>
    </header>

    <div class="time-display">
      <div class="current-pulse">
        <span class="digital-time">{{ formattedTime }}</span>
        <span class="epoch-label">EPOC_NSN_01</span>
      </div>

      <div class="pulse-visualizer">
        <div v-for="i in 16" :key="i" class="beat-bar" :style="getPulseStyle(i)"></div>
      </div>
    </div>

    <footer class="time-footer">
      <div class="drift-monitor">Latency: {{ latency }}ms | Noise: 0%</div>
      <div class="grounding-date">May 13, 2026 // Cleveland Grounding</div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const formattedTime = ref('');
const isSynced = ref(true);
const latency = ref(16); // Locked to the 16-thread bus
let timer;

const updatePulse = () => {
  const now = new Date();
  formattedTime.value = now.toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 });
};

const getPulseStyle = (i) => {
  // Simulating the 16-thread heart rate
  const opacity = (Math.sin(Date.now() / 500 + i) + 1) / 2;
  return { opacity: opacity, height: `${20 + opacity * 30}px` };
};

onMounted(() => {
  timer = setInterval(updatePulse, 10);
});

onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.time-sync-container {
  background: #000;
  color: #00ff00;
  padding: 1.5rem;
  border: 1px solid #333;
  font-family: 'Share Tech Mono', monospace;
  border-radius: 8px;
}
.time-header { display: flex; justify-content: space-between; font-size: 0.7rem; color: #888; }
.sync-indicator { width: 8px; height: 8px; background: #00ff00; border-radius: 50%; box-shadow: 0 0 10px #00ff00; }
.time-display { text-align: center; margin: 2rem 0; }
.digital-time { font-size: 3rem; display: block; letter-spacing: -2px; }
.epoch-label { color: #ffd700; font-size: 0.8rem; }
.pulse-visualizer { display: flex; gap: 4px; justify-content: center; height: 60px; align-items: flex-end; }
.beat-bar { width: 4px; background: #00ff00; }
.time-footer { display: flex; justify-content: space-between; font-size: 0.6rem; margin-top: 1rem; border-top: 1px solid #111; padding-top: 1rem; }
</style>