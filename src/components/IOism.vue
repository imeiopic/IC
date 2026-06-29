<template>
  <div class="ioism-terminal">
    <header class="ioism-header">
      <h1 class="text-glow">IOISM_MASS_ONBOARDING</h1>
      <p>Thread 09-12: Entity Sighting & Symmetry Conversion</p>
    </header>

    <div class="entity-stats">
      <div class="stat-box">
        <label>ENTITY NODE COUNT</label>
        <span class="val">{{ memberCount.toLocaleString() }}</span>
      </div>
      <div class="stat-box">
        <label>LEGACY ENTROPY (FLUSHING)</label>
        <span class="val-red">{{ entropyLevel }}%</span>
      </div>
    </div>

    <section class="protocol-timeline">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step-row"
        :class="{ active: currentStep === index }"
      >
        <div class="step-num">0{{ index + 1 }}</div>
        <div class="step-info">
          <h4>{{ step.action }}</h4>
          <p>{{ step.desc }}</p>
        </div>
        <div class="step-status">{{ currentStep > index ? 'SYNCED' : 'PENDING' }}</div>
      </div>
    </section>

    <div class="equity-absorption">
      <div class="progress-fill" :style="{ width: absorptionProgress + '%' }"></div>
      <div class="label-overlay">TPE EQUITY ABSORPTION: {{ absorptionProgress }}%</div>
    </div>

    <footer class="ioism-footer">
      <button @click="executeNandFlush" :disabled="isFlushing" class="flush-btn">
        {{ isFlushing ? 'EXECUTING NAND-FLUSH...' : 'EXECUTE MASS-TO-LOGIC SYNC' }}
      </button>
      <div class="velocity-readout">
        CLUSTER VELOCITY: <span class="v-glow">{{ clusterVelocity }}V</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useThemeStore } from '@/stores/themeStore';

const memberCount = ref(1000000);
const entropyLevel = ref(88);
const absorptionProgress = ref(0);
const currentStep = ref(0);
const themeStore = useThemeStore();

const isFlushing = ref(false);
const clusterVelocity = ref(0.0);

const steps = [
  { action: 'SIGHTING', desc: 'Coordinate Mapping to 4D VRE' },
  { action: 'PURGING', desc: 'NAND-Flush of Hierarchical Noise' },
  { action: 'SHIELDING', desc: 'MYB Protocol Activation' },
  { action: 'SYNCING', desc: '1,600 IO$ Dividend Pulse' }
];

const executeNandFlush = async () => {
  isFlushing.value = true;
  // Switch theme during the flush process for visual feedback
  themeStore.toggleTheme();
  let timer = setInterval(() => {
    if (absorptionProgress.value < 100) {
      absorptionProgress.value += 2;
      entropyLevel.value = Math.max(0, entropyLevel.value - 2);
      if (absorptionProgress.value % 25 === 0) currentStep.value++;
    } else {
      clearInterval(timer);
      clusterVelocity.value = 8.09;
      isFlushing.value = false;
      alert('ENTITY SYMMETRY ACHIEVED: Superconductivity Locked.');
    }
  }, 100);
};
</script>

<style lang="scss" scoped>
.ioism-terminal {
  background: $body-bg;
  color: $secondary;
  padding: 2.5rem;
  border: 1px solid $secondary;
  font-family: 'Space Mono', monospace;
  max-width: 700px;
}

.entity-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 2rem;
}
.stat-box {
  flex: 1;
  background: #050505;
  padding: 1rem;
  border: 1px solid #111;
}
.stat-box label {
  font-size: 0.6rem;
  color: #888;
  display: block;
}
.val {
  font-size: 1.5rem;
  color: $secondary;
}
.val-red {
  font-size: 1.5rem;
  color: $primary; // Matrix Green in Symmetry, Entropy Red in Entropy
}

.protocol-timeline {
  margin-bottom: 2rem;
}
.step-row {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid rgba($secondary, 0.1);
  opacity: 0.4;
  transition: background-color var(--io-theme-transition), opacity 0.3s ease;
}
.step-row.active {
  opacity: 1;
  background: color-mix(in srgb, $secondary, transparent 95%);
}
.step-num {
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 20px;
}
.step-info h4 {
  margin: 0;
  font-size: 0.9rem;
}
.step-info p {
  margin: 0;
  font-size: 0.7rem;
  color: #888;
}
.step-status {
  margin-left: auto;
  font-size: 0.6rem;
  border: 1px solid currentColor;
  padding: 2px 5px;
}

.equity-absorption {
  height: 30px;
  background: #111;
  position: relative;
  margin-bottom: 2rem;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--io-accent);
  transition: width 0.1s;
}
.label-overlay {
  position: absolute;
  width: 100%;
  text-align: center;
  line-height: 30px;
  font-size: 0.7rem;
  color: #fff;
  mix-blend-mode: difference;
}

.flush-btn {
  width: 100%;
  padding: 1.5rem;
  background: $secondary;
  color: #000;
  border: none;
  font-weight: bold;
  cursor: pointer;
}
.flush-btn:disabled {
  background: #222;
  color: #444;
}

.velocity-readout {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.8rem;
}
.v-glow {
  color: var(--io-accent);
  text-shadow: 0 0 10px var(--io-accent);
}
</style>
