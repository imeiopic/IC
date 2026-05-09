<template>
  <nav class="e-nav">
    <button @click="$emit('select', 'BuildMenu')">Build Menu</button>
    <button @click="$emit('select', 'ProcessOrders')">Process Orders</button>
    <button @click="$emit('select', 'ManageTeams')">Manage Teams</button>
  </nav>
</template>

<script setup>
// Emits 'select' event with the selected tab/component name
</script>

<style scoped>
.e-nav {
  display: flex;
  gap: 1rem;
  background: #111;
  padding: 1rem;
  border-bottom: 1px solid #222;
}
button {
  background: #222;
  color: #7fff00;
  border: none;
  padding: 0.5rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}
button:hover {
  background: #7fff00;
  color: #000;
}
</style>
