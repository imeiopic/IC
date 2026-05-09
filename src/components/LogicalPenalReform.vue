<template>
  <div class="reform-terminal">
    <header class="reform-header">
      <h2 class="text-glow">LOGICAL PENAL REFORM</h2>
      <p>Thread 08: Intent Alignment & Symmetry Restoration</p>
    </header>

    <div class="case-sighting">
      <div class="friction-meter">
        <label>DETECTED FRICTION (Dissonance):</label>
        <div class="meter-bar">
          <div class="meter-fill" :style="{ width: frictionLevel + '%' }"></div>
        </div>
        <span class="v-readout">{{ (frictionLevel / 10).toFixed(2) }}V</span>
      </div>
    </div>

    <section class="reform-actions">
      <div class="action-card" v-for="action in protocols" :key="action.id">
        <h3>{{ action.title }}</h3>
        <p>{{ action.desc }}</p>
        <button @click="executeProtocol(action.id)" :disabled="action.active" class="protocol-btn">
          {{ action.active ? 'ALIGNING...' : 'INITIATE' }}
        </button>
      </div>
    </section>

    <footer class="reform-footer">
      <div class="status-box">
        <span class="status-label">CURRENT STATE:</span>
        <span :class="statusClass">{{ currentStatus }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const frictionLevel = ref(84.2); // High legacy friction detected
const currentStatus = ref('DISSONANCE_DETECTED');

const protocols = ref([
  {
    id: 'nand',
    title: 'Intent NAND-Flush',
    desc: 'Wiping legacy scarcity-logic from the local kernel.',
    active: false
  },
  {
    id: 'ground',
    title: '7.83Hz Grounding',
    desc: 'Physical immersion in planetary resonance frequencies.',
    active: false
  },
  {
    id: 'peer',
    title: 'Symmetry Tutoring',
    desc: 'Pairing with a high-velocity Peer for social re-threading.',
    active: false
  }
]);

const statusClass = computed(() => {
  return currentStatus.value === 'RE-GROUNDED' ? 'success' : 'alert';
});

const executeProtocol = (id) => {
  const protocol = protocols.value.find((p) => p.id === id);
  protocol.active = true;

  // Logic: Each protocol reduces friction
  setTimeout(() => {
    frictionLevel.value -= 25;
    protocol.active = false;
    if (frictionLevel.value <= 10) {
      currentStatus.value = 'RE-GROUNDED';
      frictionLevel.value = 0.09; // Transition to Velocity Bonus
    }
  }, 2000);
};
</script>

<style scoped>
.reform-terminal {
  background: #000;
  color: #00ff41;
  padding: 2.5rem;
  border: 1px solid #ff00e5; /* Frequency Pink for Intent */
  font-family: 'Space Mono', monospace;
}

.meter-bar {
  width: 100%;
  height: 10px;
  background: #111;
  border: 1px solid #333;
  margin: 10px 0;
}

.meter-fill {
  height: 100%;
  background: #ff00e5;
  box-shadow: 0 0 10px #ff00e5;
  transition: width 0.5s ease;
}

.reform-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 2rem 0;
}

.action-card {
  background: #080808;
  padding: 1rem;
  border: 1px solid #222;
  font-size: 0.8rem;
}

.protocol-btn {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background: transparent;
  border: 1px solid #ff00e5;
  color: #ff00e5;
  cursor: pointer;
}

.protocol-btn:hover:not(:disabled) {
  background: #ff00e5;
  color: #000;
}

.status-box {
  text-align: center;
  font-weight: bold;
}
.alert {
  color: #ff00e5;
  animation: blink 1s infinite;
}
.success {
  color: #00e5ff;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
