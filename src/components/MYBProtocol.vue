<template>
  <div class="myb-shield">
    <header class="myb-header">
      <h2 class="text-glow">MYB PROTOCOL: [M]IND [Y]OUR [B]USINESS</h2>
      <p>Thread 15: Active Privacy & Sovereignty Shield</p>
    </header>

    <div class="shield-status" :class="{ active: isShielded }">
      <div class="shield-icon">{{ isShielded ? '🔒' : '🔓' }}</div>
      <div class="status-text">
        STATUS: {{ isShielded ? 'SOVEREIGN_PRIVATE' : 'VULNERABLE_VISIBLE' }}
      </div>
    </div>

    <section class="privacy-controls">
      <div class="toggle-row">
        <span>GHOST COORDINATES (9m Mask)</span>
        <label class="switch">
          <input type="checkbox" v-model="settings.ghostCoords" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="toggle-row">
        <span>DIVIDEND MASKING</span>
        <label class="switch">
          <input type="checkbox" v-model="settings.maskDividend" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="toggle-row">
        <span>LEGACY SIGHTING BLOCK (MYB)</span>
        <label class="switch">
          <input type="checkbox" v-model="settings.blockLegacy" />
          <span class="slider"></span>
        </label>
      </div>
    </section>

    <div class="stealth-terminal">
      <div class="log-line" v-for="(log, i) in stealthLogs" :key="i">>> {{ log }}</div>
    </div>

    <footer class="myb-footer">
      <button @click="toggleShield" class="shield-btn">
        {{ isShielded ? 'MAINTAIN SILENCE' : 'ACTIVATE MYB SHIELD' }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const isShielded = ref(true);
const stealthLogs = ref([
  'Initializing Thread 15...',
  'Legacy Sighting detected from: 0.0.0.0 (BLOCKED)',
  'Bio-Signature Masked at 7.83Hz.',
  'MYB Status: Absolute.'
]);

const settings = reactive({
  ghostCoords: true,
  maskDividend: true,
  blockLegacy: true
});

const toggleShield = () => {
  isShielded.value = !isShielded.value;
  if (isShielded.value) {
    stealthLogs.value.push('Shield Re-Engaged. Mind Your Business.');
  }
};
</script>

<style scoped>
.myb-shield {
  background: #020202;
  color: #00ff41;
  padding: 2rem;
  border: 1px solid #00e5ff; /* Stealth Cyan */
  font-family: 'Space Mono', monospace;
  max-width: 500px;
}

.shield-status {
  text-align: center;
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px dashed #333;
}

.shield-status.active {
  border-color: #00e5ff;
  color: #00e5ff;
}

.shield-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.8rem;
}

.stealth-terminal {
  background: #000;
  height: 100px;
  overflow-y: hidden;
  padding: 10px;
  font-size: 0.7rem;
  border: 1px solid #111;
  margin-bottom: 1.5rem;
}

.shield-btn {
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: 1px solid #00e5ff;
  color: #00e5ff;
  font-weight: bold;
  cursor: pointer;
}

.shield-btn:hover {
  background: #00e5ff;
  color: #000;
}

/* Toggle Switch Styles */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #333;
  transition: 0.4s;
}
.slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: #00ff41;
  transition: 0.4s;
}
input:checked + .slider {
  background-color: #00e5ff;
}
input:checked + .slider:before {
  transform: translateX(20px);
}
</style>
