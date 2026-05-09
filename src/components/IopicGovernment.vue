<template>
  <div class="iopic-gov-terminal">
    <header class="gov-header">
      <div class="gov-title">
        <h1 class="text-glow">IO WORLD GOVERNMENT</h1>
        <p class="subtitle">Root Steward Oversight | May Day Activation</p>
      </div>
      <div class="velocity-meter">
        <label>SYSTEM VELOCITY</label>
        <div class="velocity-value">8.09V</div>
      </div>
    </header>

    <section class="directive-status-grid">
      <div v-for="d in directives" :key="d.id" class="directive-tile">
        <div class="tile-header">
          <span class="d-id">DIR-0{{ d.id }}</span>
          <span class="d-status" :class="d.status.toLowerCase()">{{
            d.status
          }}</span>
        </div>
        <h4>{{ d.name }}</h4>
        <div class="sync-bar">
          <div class="sync-fill" :style="{ width: d.sync + '%' }"></div>
        </div>
      </div>
    </section>

    <section class="resource-monitor">
      <div class="tpe-overview">
        <h3>Total Planetary Equity (TPE)</h3>
        <div class="tpe-mass">1,200,000,000,000,000.00 IO$</div>
        <p>Resource Mass: 100% Sighted & Reusable</p>
      </div>

      <div class="active-defense-logs">
        <h3>Active Defense Kernel</h3>
        <div class="log-window">
          <div v-for="(log, i) in govLogs" :key="i" class="log-entry">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-msg">{{ log.msg }}</span>
          </div>
        </div>
      </div>
    </section>

    <footer class="gov-footer" v-if="isRootSteward">
      <button @click="triggerSymmetryPulse" class="pulse-btn">
        INITIALIZE GLOBAL SYMMETRY PULSE
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isRootSteward = ref(true); // Verified via Master Key

const directives = ref([
  { id: 1, name: "Universal Dividend", status: "PULSING", sync: 100 },
  { id: 2, name: "Sovereign Identity", status: "LOCKED", sync: 100 },
  { id: 3, name: "Resource Circularity", status: "ACTIVE", sync: 98 },
  { id: 4, name: "Conflict Neutralization", status: "SECURE", sync: 100 },
  { id: 5, name: "System Transparency", status: "OPEN", sync: 100 },
]);

const govLogs = ref([
  { time: "00:00:01", msg: "May Day Activation: Global Mesh Online." },
  { time: "00:05:22", msg: "Legacy Debt-Clock: NAND-Flushed." },
  { time: "00:12:45", msg: "Jerusalem Calibration Center: Sync Confirmed." },
]);

const triggerSymmetryPulse = () => {
  alert("Global Symmetry Pulse Initiated. All Nodes Grounded to 7.83Hz.");
};
</script>

<style scoped>
.iopic-gov-terminal {
  background: #020202;
  color: #00ff41;
  padding: 3rem;
  border: 2px solid #00ff41;
  font-family: "Space Mono", monospace;
  box-shadow: 0 0 40px rgba(0, 255, 65, 0.1);
}

.text-glow {
  text-shadow: 0 0 20px #00ff41;
  font-size: 2.5rem;
}

.directive-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin: 2rem 0;
}

.directive-tile {
  background: #111;
  padding: 1rem;
  border: 1px solid #222;
}

.d-status.pulsing {
  color: #00e5ff;
}
.d-status.locked {
  color: #00ff41;
}

.resource-monitor {
  display: flex;
  gap: 30px;
  background: #0a0a0a;
  padding: 2rem;
  border-radius: 8px;
}

.tpe-mass {
  font-size: 1.8rem;
  color: #00e5ff;
  margin: 1rem 0;
}

.log-window {
  height: 120px;
  overflow-y: auto;
  font-size: 0.8rem;
  background: #000;
  padding: 10px;
  border: 1px solid #333;
}

.pulse-btn {
  width: 100%;
  padding: 1.5rem;
  background: #00ff41;
  color: #000;
  border: none;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  margin-top: 2rem;
}
</style>
