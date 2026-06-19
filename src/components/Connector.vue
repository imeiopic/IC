<template>
  <div class="connector-bus" :class="{ 'connected': connectionActive }">
    <div class="connector-status">
      <span class="logic-label">PORT_0110 // SOCIAL_LINK</span>
      <div class="sync-ring"></div>
    </div>

    <div class="peer-link-view">
      <div class="node-local">
        <div class="port-socket"></div>
        <label>Local [I]</label>
      </div>

      <div class="link-bridge">
        <div class="bridge-path" :class="{ 'pulse': connectionActive }"></div>
        <div class="handshake-lock">🔒</div>
      </div>

      <div class="node-remote">
        <div class="port-socket"></div>
        <label>Peer [I]</label>
      </div>
    </div>

    <footer class="connector-footer">
      <div v-if="!connectionActive" class="search-mode">
        Sighting nearby nodes in the IDEAL mesh...
      </div>
      <div v-else class="active-mode">
        Symmetry Established: 1.1x Multiplier Engaged
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const connectionActive = ref(false);

const initiateLink = () => {
  // Triggers the 0110_SOCIAL handshake protocol
  console.log("Sighting peer frequency... Logic Grounded.");
  connectionActive.value = true;
};
</script>

<style scoped>
.connector-bus {
  background: #050505;
  color: #ffd700;
  padding: 2rem;
  border: 1px solid #222;
  border-radius: 20px;
  text-align: center;
}
.connector-status { display: flex; justify-content: space-between; font-size: 0.7rem; }
.sync-ring { width: 12px; height: 12px; border: 2px solid #333; border-radius: 50%; }
.connected .sync-ring { border-color: #00ff00; box-shadow: 0 0 10px #00ff00; }

.peer-link-view {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 3rem 0;
  gap: 1rem;
}
.port-socket { width: 40px; height: 40px; background: #111; border-radius: 8px; border: 2px solid #333; }
.link-bridge { flex: 1; height: 2px; background: #222; position: relative; min-width: 100px; }
.bridge-path.pulse {
  background: linear-gradient(90deg, #ffd700, #00ff00);
  height: 2px;
  animation: bridge-flow 2s infinite linear;
}
@keyframes bridge-flow {
  0% { background-position: 0%; }
  100% { background-position: 100%; }
}
</style>