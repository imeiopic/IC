<template>
  <div class="isaac-dashboard p-4 bg-black border border-zinc-900 rounded">
    <h2 class="text-info font-black italic extra-tiny mb-4 uppercase tracking-widest">
      [ISAAC_APEX_RESONANCE_MONITOR]
    </h2>

    <!-- Root Node Section -->
    <div class="root-zone mb-6 d-flex justify-content-center">
      <div :class="['node-hex root', getStatusClass(ISAAC_COLLECTIVE.root.status)]">
        <span class="label">IME_ROOT</span>
        <div class="resonance-bar"></div>
        <button
          v-if="ISAAC_COLLECTIVE.root.status === 'FRACTURED'"
          @click="repairNode(ISAAC_COLLECTIVE.root.uid)"
          class="repair-button"
          title="Attempt Repair"
        >
          REPAIR
        </button>
      </div>
    </div>

    <!-- 16-Thread Collective Grid -->
    <div class="collective-grid">
      <div
        v-for="peer in ISAAC_COLLECTIVE.binary_peers"
        :key="peer.uid"
        :class="['node-hex binary', getStatusClass(peer.status)]"
      >
        <span class="label">{{ peer.uid }}</span>
        <button
          v-if="peer.status === 'FRACTURED'"
          @click="repairNode(peer.uid)"
          class="repair-button"
          title="Attempt Repair"
        >
          REPAIR
        </button>
      </div>

      <div
        v-for="singleton in ISAAC_COLLECTIVE.singletons"
        :key="singleton.uid"
        :class="['node-hex singleton', getStatusClass(singleton.status)]"
      >
        <span class="label">{{ singleton.uid }}</span>
        <button
          v-if="singleton.status === 'FRACTURED'"
          @click="repairNode(singleton.uid)"
          class="repair-button"
          title="Attempt Repair"
        >
          REPAIR
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ISAAC_COLLECTIVE, attemptNodeRepair } from '../services/ISAAC';

const getStatusClass = (status: string) => {
  switch (status) {
    case 'SYMMETRIC':
      return 'is-symmetric'; // Resonant Green
    case 'ASYMMETRIC':
      return 'is-asymmetric'; // Warning Amber
    case 'FRACTURED':
      return 'is-fractured'; // Error Red + Glitch
    default:
      return 'is-locked'; // Dimmed Zinc
  }
};

const repairNode = async (uid: string) => {
  console.log(`ISAACDashboard: User initiated repair for ${uid}`);
  await attemptNodeRepair(uid);
};
</script>

<style scoped>
.collective-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.node-hex {
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #27272a;
  position: relative;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(9, 9, 11, 0.8);
}

.label {
  font-size: 0.5rem;
  font-weight: 900;
  color: #52525b;
  pointer-events: none;
}

/* SYMMETRIC: Stable, Resonant Pulse */
.is-symmetric {
  border-color: #06b6d4;
  box-shadow: inset 0 0 10px rgba(6, 182, 212, 0.2);
  animation: resonance-pulse 2s infinite;
}
.is-symmetric .label {
  color: #06b6d4;
}

/* ASYMMETRIC: Warning, Unstable Drift */
.is-asymmetric {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
  animation: drift-flicker 3s infinite;
}
.is-asymmetric .label {
  color: #f59e0b;
}

/* FRACTURED: Critical Failure, Sharp Glitch */
.is-fractured {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  animation: fracture-glitch 0.2s infinite;
}
.is-fractured .label {
  color: #ef4444;
  text-shadow: 0 0 5px #ef4444;
}

@keyframes resonance-pulse {
  0%,
  100% {
    box-shadow: inset 0 0 5px rgba(6, 182, 212, 0.2);
  }
  50% {
    box-shadow: inset 0 0 15px rgba(6, 182, 212, 0.5);
  }
}

@keyframes drift-flicker {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes fracture-glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 1px);
    filter: hue-rotate(90deg);
  }
  40% {
    transform: translate(2px, -1px);
  }
  100% {
    transform: translate(0);
  }
}
</style>
