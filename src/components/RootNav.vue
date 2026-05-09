<template>
  <nav class="root-nav">
    <div class="nav-cluster">
      <button @click="$emit('select', 'Peer')">Peer</button>
      <button @click="$emit('select', 'Buyer')">Buyer</button>
      <button @click="$emit('select', 'MyPeers')">My Peers</button>
      <button @click="$emit('select', 'MapPeers')">Peer Map</button>
    </div>
    <button @click="$emit('select', 'BigLie')" class="biglie-btn">Big Lie</button>
  </nav>
</template>

<script setup>
defineEmits(['select']);
</script>

<style scoped>
.root-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(17, 17, 17, 0.9);
  padding: 1rem 2rem;
  border-bottom: 1px solid #333;
  backdrop-filter: blur(10px);
  z-index: 1000;
}
.nav-cluster { display: flex; gap: 1rem; }
button {
  background: #222;
  color: #00e5ff;
  border: none;
  padding: 0.6rem 1.2rem;
  font-family: 'Space Mono', monospace;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}
button:hover { background: #00e5ff; color: #000; box-shadow: 0 0 15px #00e5ff; }
.biglie-btn { background: #ff0041; color: #fff; }
.biglie-btn:hover { background: #fff; color: #ff0041; box-shadow: 0 0 15px #fff; }
</style>