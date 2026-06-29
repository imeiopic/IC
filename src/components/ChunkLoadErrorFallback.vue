<template>
  <div class="chunk-error-overlay">
    <div class="error-container">
      <h1 class="glitch-text">SYSTEM_FRAGMENTATION</h1>
      <p>The network connection was interrupted. A critical core fragment failed to load.</p>
      
      <div class="actions">
        <button @click="handleReload" class="btn-retry">
          INITIATE_RECOVERY_RELOAD
        </button>
      </div>

      <div class="debug-info">
        CODE: ERR_CHUNK_LOAD_FAILED
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const handleReload = () => {
  // Clearing cache by reloading from the server, not the browser cache
  window.location.reload();
};
</script>

<style scoped>
.chunk-error-overlay {
  position: fixed;
  inset: 0;
  background: #000;
  color: #00e5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  font-family: 'Courier New', Courier, monospace;
}

.error-container {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
  border: 1px solid #00e5ff;
}

.glitch-text {
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 1rem;
  text-shadow: 2px 2px #ff00ff;
}

.btn-retry {
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
  padding: 1rem 2rem;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-retry:hover {
  background: #00e5ff;
  color: #000;
}

.debug-info {
  margin-top: 2rem;
  font-size: 0.6rem;
  color: #333;
}
</style>