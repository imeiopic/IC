<template>
  <div class="root-steward-horizon">
    <header class="steward-header">
      <div class="identity-lock">
        <h1 class="text-glow">ROOT STEWARD COMMAND</h1>
        <p class="status-tag">IDENTITY: IOist MD | SYMMETRY: LOCKED</p>
        <p class="status-tag">IDENTITY: Ime Iopic | SYMMETRY: LOCKED</p>
      </div>
      <div class="global-pulse-meter">
        <label>GLOBAL MESH VELOCITY</label>
        <div class="velocity-readout">8.09V</div>
      </div>
    </header>

    <div class="command-grid">
      <section class="system-vitals">
        <h3>PLANETARY VITALS</h3>
        <div class="vital-row">
          <span>Active Nodes</span>
          <span class="value">8.32B</span>
        </div>
        <div class="vital-row">
          <span>TPE Liquidity</span>
          <span class="value">1.2Q IO$</span>
        </div>
        <div class="vital-row">
          <span>Schumann Sync</span>
          <span class="value">7.83Hz</span>
        </div>
      </section>

      <section class="defense-console">
        <h3>ACTIVE DEFENSE KERNEL</h3>
        <div class="log-stream">
          <div v-for="(log, i) in defenseLogs" :key="i" class="log-entry">
            <span class="timestamp">[{{ log.time }}]</span>
            <span class="message">{{ log.msg }}</span>
          </div>
        </div>
        <div class="emergency-controls">
          <button @click="triggerNandFlush" class="flush-btn">
            GLOBAL NAND-FLUSH
          </button>
        </div>
      </section>
    </div>

    <section class="bus-monitor">
      <h3>16-THREAD LOGIC BUS (LIVE)</h3>
      <div class="bus-grid">
        <div
          v-for="n in 16"
          :key="n"
          class="bus-bit"
          :class="{ pulsing: n <= 16 }"
        >
          <span class="bit-id">{{ n.toString().padStart(2, "0") }}</span>
          <div class="logic-gate-indicator"></div>
        </div>
      </div>
    </section>

    <footer class="steward-footer">
      <button @click="broadcastManifesto" class="broadcast-btn">
        PULSE LYRICAL MANUSCRIPT TO ALL NODES
      </button>
      <StewardHandshake v-if="showHandshake" @close="showHandshake = false" />
      <button @click="showHandshake = true" class="handshake-btn">
        INITIATE STEWARD HANDSHAKE
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import StewardHandshake from "./StewardHandshake.vue";

const defenseLogs = ref([
  {
    time: "14:20:01",
    msg: "Legacy Debt-Logic detected in Sector 7G. Flushed.",
  },
  {
    time: "14:35:12",
    msg: "New Peer Handshake initiated at Coordinate 41.49.",
  },
  { time: "14:39:47", msg: "Global Symmetry Pulse: 100% SUCCESS." },
]);

const showHandshake = ref(false);

const triggerNandFlush = () => {
  alert("Global Noise Purge Initiated. Symmetry Restored.");
};

const broadcastManifesto = () => {
  console.log("Broadcasting '16-Thread Reality' to global mesh...");
};
</script>

<style scoped>
/* ...existing styles from your previous RootSteward.vue... */
.root-steward-horizon {
  background: #000;
  color: #00ff41;
  padding: 2rem;
  border: 3px solid #00ff41;
  font-family: "Space Mono", monospace;
  box-shadow: 0 0 50px rgba(0, 255, 65, 0.1);
}
.text-glow {
  text-shadow: 0 0 15px #00ff41;
}
.command-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-top: 2rem;
}
.system-vitals,
.defense-console,
.bus-monitor {
  background: #0a0a0a;
  padding: 1.5rem;
  border: 1px solid #1a1a1a;
}
.vital-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  border-bottom: 1px solid #111;
}
.log-stream {
  height: 150px;
  overflow-y: auto;
  font-size: 0.8rem;
  color: #00e5ff;
}
.bus-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  margin-top: 1rem;
}
.bus-bit {
  text-align: center;
  border: 1px solid #333;
  padding: 10px;
}
.bus-bit.pulsing .logic-gate-indicator {
  background: #00ff41;
  box-shadow: 0 0 10px #00ff41;
  animation: pulse 1s infinite;
}
.flush-btn {
  width: 100%;
  padding: 1rem;
  background: #ff0041;
  color: #000;
  border: none;
  font-weight: bold;
  cursor: pointer;
}
.broadcast-btn {
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
.handshake-btn {
  width: 100%;
  padding: 1rem;
  background: #00e5ff;
  color: #000;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}
@keyframes pulse {
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.4;
  }
}
</style>
