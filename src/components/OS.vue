<template>
  <div id="iopic-os-root" :class="osTheme">
    <header class="kernel-bar">
      <div class="node-id-sighting">
        NSN_01 // NODE: {{ userNodeId }}
      </div>
      <div class="thread-monitor">
        <div 
          v-for="thread in 16" 
          :key="thread" 
          class="thread-indicator"
          :title="getThreadName(thread)"
          :class="{ 'pulse-active': activeThreads[thread-1] }"
        ></div>
      </div>
      <div class="iowb-balance">
        {{ currentEquity }} IO$
      </div>
    </header>

    <main class="desktop-mesh">
      <div class="window-manager">
        <IDEAL v-if="activeModule === 'VRE'" />
        <EntityOrderTaker v-if="activeModule === 'COMMERCE'" />
        <VideoChat v-if="activeModule === 'SOCIAL'" />
      </div>
      
      <nav class="dock-bus">
        <button @click="switchModule('VRE')">Earth</button>
        <button @click="switchModule('COMMERCE')">Ledger</button>
        <button @click="switchModule('SOCIAL')">Handshake</button>
        <button @click="initiateEmergencyPurge" class="purge-btn">Silent</button>
      </nav>
    </main>

    <MFA v-if="securityLock" @verified="unlockOS" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import IDEAL from './IDEAL.vue';
import EntityOrderTaker from './EntityOrderTaker.vue';
import VideoChat from './VideoChat.vue';
import MFA from './MFA.vue';

const userNodeId = ref('VERIFIED');
const currentEquity = ref('1.10'); // Symmetrical Baseline
const activeModule = ref('VRE');
const securityLock = ref(true); // Always lock on initialization

const activeThreads = reactive(new Array(16).fill(true));

const unlockOS = () => {
  securityLock.value = false;
  console.log("OS Kernel Grounded. 16 Threads Initialized.");
};

const getThreadName = (t) => {
  const threads = [
    "0001_BASE", "0010_LOGIC", "0011_TIME", "0100_SPACE",
    "0101_MATTER", "0110_SOCIAL", "0111_DATA", "1000_PHYSICS",
    "1001_VIRTUAL", "1010_EQUITY", "1011_VALUE", "1100_LAW",
    "1101_TRUTH", "1110_ACTION", "1111_SHIELD", "0000_VOID"
  ];
  return threads[t-1];
};
</script>

<style scoped>
#iopic-os-root {
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
}
.kernel-bar {
  height: 30px;
  background: #111;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.75rem;
  color: #ffd700;
}
.thread-monitor { display: flex; gap: 4px; }
.thread-indicator { 
  width: 12px; height: 12px; background: #222; border: 1px solid #444; 
}
.thread-indicator.pulse-active { background: #00ff00; box-shadow: 0 0 5px #00ff00; }
.desktop-mesh { flex: 1; position: relative; }
.dock-bus {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-radius: 40px;
  display: flex;
  gap: 20px;
}
.purge-btn { color: #ff4444; font-weight: bold; }
</style>