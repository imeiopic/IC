

<script setup lang="ts">
import { ref, watch } from 'vue';

// Example reactive threadData (replace with your actual state management)
const threadData = ref({
  activeConnections: 0,
  orderTakerActive: false
});

// HUD state update logic
function updateHUDState(data: { activeConnections: number; orderTakerActive: boolean }) {
  // People HUD
  const people = document.getElementById('hud-people');
  if (people) {
    if (data.activeConnections > 0) {
      people.style.opacity = '1';
      people.classList.add('pulse-glow-cyan');
    } else {
      people.style.opacity = '0.5';
      people.classList.remove('pulse-glow-cyan');
    }
  }
  // Commerce HUD
  const commerce = document.getElementById('hud-commerce');
  if (commerce) {
    if (data.orderTakerActive) {
      commerce.classList.add('proximity-alert');
    } else {
      commerce.classList.remove('proximity-alert');
    }
  }
}

// Example: Watch for changes (replace with your actual state management)
watch(threadData, (val) => updateHUDState(val), { deep: true });
</script>

<template>
  <div>
    <!-- HUD Overlay -->
    <div id="hud-people" style="position:fixed;top:24px;right:24px;z-index:1000;opacity:0.5;transition:opacity 0.3s;">
      <img src="/src/assets/images/myworld.png" alt="People" style="width:48px;height:48px;" />
    </div>
    <div id="hud-commerce" style="position:fixed;bottom:24px;right:24px;z-index:1000;border:4px solid #00ffff;border-radius:50%;width:56px;height:56px;display:flex;align-items:center;justify-content:center;transition:border-color 0.3s;">
      <img src="/src/assets/images/entertheworld.png" alt="Commerce" style="width:40px;height:40px;" />
    </div>
    <router-view />
  </div>
</template>
