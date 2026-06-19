<template>
  <div class="spice-log-container" :class="{ 'is-visible': isVisible }">
    <div class="log-header" @click="toggleVisibility">
      <span class="log-title">SPICE.ts AUDIT LOG</span>
      <span class="toggle-icon">{{ isVisible ? '▼' : '▲' }}</span>
    </div>
    <div v-if="isVisible" class="log-content">
      <div
        v-for="(entry, index) in SPICE.log.value.slice().reverse()"
        :key="index"
        :class="['log-entry', `log-${entry.type}`]"
      >
        <span class="timestamp">[{{ entry.timestamp }}]</span>
        <span class="message">{{ entry.message }}</span>
      </div>
      <div v-if="SPICE.log.value.length === 0" class="log-empty">No SPICE.ts events yet.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SPICE } from './SPICE'; // Import the SPICE utility

const isVisible = ref(false); // Start hidden

const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
};
</script>

<style scoped>
.spice-log-container {
  position: fixed;
  bottom: 0;
  right: 20px;
  width: 350px;
  max-height: 300px;
  background-color: #1a1a1a;
  border: 1px solid #00ff41;
  color: #00ff41;
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  z-index: 1000;
  box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
  transition: transform 0.3s ease-in-out;
  transform: translateY(calc(100% - 30px)); /* Partially hidden by default */
}

.spice-log-container.is-visible {
  transform: translateY(0); /* Fully visible */
}

.log-header {
  background-color: #000;
  padding: 8px 12px;
  border-bottom: 1px solid #00ff41;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  text-transform: uppercase;
}

.log-title {
  color: #00ff41;
}

.toggle-icon {
  font-size: 12px;
  color: #00ff41;
}

.log-content {
  max-height: 250px;
  overflow-y: auto;
  padding: 5px;
  background-color: #050505;
}

.log-entry {
  padding: 3px 0;
  border-bottom: 1px dotted rgba(0, 255, 65, 0.1);
  display: flex;
  gap: 5px;
}

.log-entry:last-child {
  border-bottom: none;
}

.timestamp {
  color: #737373;
  flex-shrink: 0;
}

.message {
  flex-grow: 1;
  word-break: break-all;
}

.log-error {
  color: #ef4444; /* Red */
}

.log-warn {
  color: #fbbf24; /* Yellow */
}

.log-info {
  color: #00ff41; /* Green */
}

.log-empty {
  padding: 10px;
  text-align: center;
  color: #737373;
}
</style>
