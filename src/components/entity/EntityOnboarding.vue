<template>
  <CContainer
    fluid
    class="onboarding-substrate bg-black min-vh-100 d-flex flex-column justify-content-center align-items-center font-mono text-white overflow-hidden"
  >
    <div class="grid-layer position-absolute inset-0 opacity-20"></div>

    <!-- Phase 0: 00:00:00_TIMEOUT -->
    <div v-if="ignitionPhase === 'TIMEOUT'" class="gate-entrance text-center animate-in z-1">
      <h2 class="text-amber-500 font-black mb-1 tracking-widest uppercase">00:00:00_TIMEOUT</h2>
      <p class="tiny text-zinc-500 mb-5 italic">
        Legacy Instance Web Detected: Processing Chaos...
      </p>

      <div
        class="stake-requirement p-4 border border-zinc-800 bg-zinc-950 rounded mb-4 shadow-glow"
      >
        <p class="extra-tiny text-info mb-2">[INITIALIZATION_STAKE_REQUIRED]</p>
        <h1 class="display-5 font-black text-white mb-0">5.00 IO$</h1>
        <p class="extra-tiny text-zinc-600 mt-2">Energy Vector for Self.vue Ignition</p>
      </div>

      <CButton color="info" class="w-100 py-3 font-black italic shadow-info" @click="startIgnition">
        EXECUTE_DAY_ONE_IGNITION
      </CButton>
    </div>

    <!-- Phase 1: 00:00:01_IGNITION -->
    <div v-else class="ignition-sequence w-100 px-4 z-1" style="max-width: 600px">
      <div class="thread-manifesto mb-4">
        <div class="d-flex justify-content-between align-items-end mb-2">
          <h4 class="text-info font-black italic m-0">00:00:01_IGNITION</h4>
          <span class="extra-tiny text-zinc-500 font-mono"
            >BUS_STATUS: {{ threadsIgnited === 16 ? 'STABILIZED' : 'SPINNING_UP' }}</span
          >
        </div>

        <!-- Bitwise 16-Thread Visual Bus -->
        <div class="thread-bus d-flex gap-1 bg-zinc-900 p-1 rounded border border-zinc-800">
          <div
            v-for="i in 16"
            :key="i"
            class="thread-line flex-grow-1"
            :class="{ ignited: threadsIgnited >= i }"
          >
            <div class="thread-pulse" v-if="threadsIgnited >= i"></div>
          </div>
        </div>
      </div>

      <!-- Terminal Log Substrate -->
      <div class="terminal-logs p-3 bg-zinc-950 border border-zinc-800 rounded font-mono shadow-sm">
        <div v-for="(log, idx) in logs" :key="idx" class="log-entry extra-tiny mb-1">
          <span class="text-zinc-600">[{{ log.timestamp }}]</span>
          <span :class="log.color" class="ms-2">{{ log.message }}</span>
        </div>
        <div
          v-if="isGrounded"
          class="completion-gate mt-4 pt-3 border-top border-zinc-800 animate-in"
        >
          <p class="text-success small font-black mb-3">
            SUCCESS // SELF_OCCUPIED // THREADS_IGNITED
          </p>
          <CButton
            color="success"
            variant="outline"
            class="w-100 py-2 font-black italic shadow-glow-success"
            @click="router.push('/virtual')"
          >
            ENTER_SOVEREIGN_MESH
          </CButton>
        </div>
      </div>
    </div>
  </CContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ValueMesh } from '../../services/ValueMesh';
import { CContainer, CButton } from '@coreui/vue';

const router = useRouter();
const ignitionPhase = ref<'TIMEOUT' | 'IGNITION'>('TIMEOUT');
const threadsIgnited = ref(0);
const isGrounded = ref(false);
const logs = ref<any[]>([]);

const addLog = (message: string, color: string = 'text-info') => {
  const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
  logs.value.push({ timestamp, message, color });
  if (logs.value.length > 10) logs.value.shift();
};

const startIgnition = async () => {
  ignitionPhase.value = 'IGNITION';
  addLog('PULLING_INITIALIZATION_STAKE_VECTOR...', 'text-amber-500');

  // Simulate 16-thread bitwise ignition
  const interval = setInterval(() => {
    if (threadsIgnited.value < 16) {
      threadsIgnited.value++;
      addLog(`THREAD_${threadsIgnited.value.toString().padStart(2, '0')}_GROUNDED`, 'text-info');
    } else {
      clearInterval(interval);
      finalizeIgnition();
    }
  }, 100);
};

const finalizeIgnition = () => {
  addLog('COMMITTING_STATE_TRANSITION...', 'text-white');

  // Utilizing ValueMesh substrate logic for the 5 IO$ Gate
  const nodeState = {
    nodeSUID: 'SELF_NODE_01',
    isInitialized: false,
    isPaired: false,
    isExternalBridgeActive: false,
    availableEnergy: 100, // Mock balance for initialization
    activeThreads: []
  };

  const result = ValueMesh.initializeSelf(nodeState);

  if (result.success) {
    addLog(result.log, 'text-success');
    addLog('DECOUPLING_FROM_LEGACY_EXTRACTION...', 'text-success');
    isGrounded.value = true;
  } else {
    addLog(`CRITICAL_FRACTURE: ${result.log}`, 'text-danger');
  }
};
</script>

<style scoped>
.onboarding-substrate {
  background: radial-gradient(circle at center, #050505 0%, #000 100%);
}
.thread-line {
  height: 80px;
  background: #111;
  position: relative;
  transition: background 0.3s ease;
  border-radius: 2px;
}
.thread-line.ignited {
  background: #00e5ff;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
}
.thread-pulse {
  position: absolute;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.8);
  top: 0;
  animation: scan-thread 2s infinite linear;
}
@keyframes scan-thread {
  0% {
    top: 0%;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}
.font-black {
  font-weight: 900;
}
.extra-tiny {
  font-size: 0.6rem;
}
.shadow-glow-success {
  box-shadow: 0 0 15px rgba(40, 167, 69, 0.3);
}
</style>
