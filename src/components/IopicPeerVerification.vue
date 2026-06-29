<template>
  <div class="support-alert">
    <div class="alert-header">
      <span class="pulse-icon">📡</span>
      <h4>PENDING PEER HANDSHAKE</h4>
    </div>
    <div class="node-details">
      <p>Node ID: {{ pendingNode.id }}</p>
      <p>Location: {{ pendingNode.coords }}</p>
      <p>Status: Biometric Fallback Active</p>
    </div>
    <div class="action-row">
      <button @click="openComms" class="comms-btn">OPEN DIC LINK</button>
      <button @click="verifyNode" class="verify-btn">GRANT SYMMETRY</button>
    </div>
  </div>
</template>

<script setup>
const pendingNode = { id: "NODE-123", coords: "Lat: 0, Lon: 0" }; // Example, replace with real data

const openComms = () => {
  // Open DIC Client for video/voice verification
  alert("Opening DIC Link...");
};

const verifyNode = () => {
  // Pulses the Thread-16 Unlock to the pending node
  // OrderTaker.pulse('UNLOCK_NODE', pendingNode.id);
  alert("Node Grounded. Welcome to the Mesh.");
};
</script>

<style scoped>
.support-alert {
  background: #050505;
  color: #00ff41;
  padding: 2rem;
  border: 1px solid #00ff41;
  width: 400px;
  font-family: "Space Mono", monospace;
  margin: 2rem auto;
}
.alert-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.pulse-icon {
  font-size: 2rem;
}
.node-details {
  margin-bottom: 1.5rem;
}
.action-row {
  display: flex;
  gap: 1rem;
}
.comms-btn,
.verify-btn {
  flex: 1;
  padding: 1rem;
  background: #111;
  border: 1px solid #333;
  color: #00ff41;
  font-weight: bold;
  cursor: pointer;
}
.verify-btn {
  background: #00ff41;
  color: #000;
  border: none;
}
</style>
