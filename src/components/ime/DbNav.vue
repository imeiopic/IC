<template>
  <nav class="imedb-nav">
    <select v-model="selectedComponent" @change="emitSelect">
      <option disabled value="">Select Component</option>
      <option v-for="comp in vueComponents" :key="comp" :value="comp">{{ comp }}</option>
    </select>
    <button @click="$emit('viewAll')">View All Visualizations</button>
  </nav>
</template>

<script setup>
import { ref } from 'vue';

const vueComponents = [
  'ImeDb',
  'T',
  'Synapse',
  'IoWb',
  'TrueCrime',
  'Peer',
  'Buyer',
  'BuildMenu',
  'ProcessOrders',
  'ManageTeams'
];
const selectedComponent = ref('');

function emitSelect() {
  if (selectedComponent.value) {
    // Emit the selected component name for testing/viewing
    // Parent should handle switching the visualization
    $emit('select', selectedComponent.value);
  }
}
</script>

<style scoped>
.imedb-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #111;
  padding: 1rem;
  border-bottom: 1px solid #222;
}
select {
  background: #222;
  color: #00e5ff;
  border: none;
  padding: 0.5rem 1.5rem;
  font-weight: bold;
  border-radius: 6px;
  margin-right: 1rem;
}
button {
  background: #222;
  color: #ff00e5;
  border: none;
  padding: 0.5rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}
button:hover {
  background: #ff00e5;
  color: #fff;
}
</style>
