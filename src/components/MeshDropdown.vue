<template>
  <div class="dropdown">
    <select v-model="selectedComponent">
      <option value="none">Select Visualization</option>
      <option value="synapse">Synapse 3D Mesh</option>
      <!-- Add more options here if needed -->
    </select>
    <component v-if="selectedComponent === 'synapse'" :is="Synapse" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Synapse from './Synapse.vue';
const selectedComponent = ref('none');
</script>

<style scoped>
.dropdown {
  margin: 2rem auto;
  width: 320px;
  text-align: center;
}
select {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #00e5ff;
  background: #001a1a;
  color: #00ff41;
  font-family: 'Space Mono', monospace;
  margin-bottom: 1rem;
}
</style>
