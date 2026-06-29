<template>
  <div class="mesh-spinner-container">
    <svg class="spinner-svg" viewBox="0 0 50 50">
      <circle class="mesh-ring" cx="25" cy="25" r="20" fill="none" stroke-width="2" />
      <circle class="pulse-core" cx="25" cy="25" r="8" />
    </svg>
    <div class="status-label">SYNCING_PULSE...</div>
  </div>
</template>

<style scoped>
.mesh-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.spinner-svg {
  width: 50px;
  height: 50px;
  animation: rotate 2s linear infinite;
}

.mesh-ring {
  stroke: #00e5ff;
  stroke-dasharray: 80;
  stroke-dashoffset: 60;
  animation: dash 1.5s ease-in-out infinite;
}

.pulse-core {
  fill: #00e5ff;
  animation: pulse 1.5s infinite alternate;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dashoffset: 126; }
  50% { stroke-dashoffset: 60; transform: rotate(135deg); }
  100% { stroke-dashoffset: 126; transform: rotate(450deg); }
}

@keyframes pulse {
  from { opacity: 0.3; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1.1); }
}

.status-label {
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  color: #00e5ff;
  letter-spacing: 0.1rem;
}
</style>