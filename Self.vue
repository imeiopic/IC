<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGlobalMandates } from './ReusableMandate.vue';

// Integration with Global Mandates
const { entityTreasury, processSymmetryMandate } = useGlobalMandates();

// Local Sovereign Node State (Mirrors SovereignNode in Sovereign.hpp)
const suid = ref('NODE_ALPHA_001');
const threadBus = ref<Thread[]>([]);
const metabolicEnergy = ref(1000n); // Baseline 1.0 using BigInt
const saturationCycles = ref(0);
const currentPulse = ref(100);
const localBaseline = ref(50); // Minimum grounding in local quadrant
const isPhaseLocked = ref(false);

// WASM References
let worker: Worker | null = null;
let isAlive = true;
let isHeartbeatRunning = false;

const velocityMultiplier = computed(() => isPhaseLocked.value ? 2.2 : 1.1);
const velocityLabel = computed(() => isPhaseLocked.value ? '2.2x RESONANCE' : '1.1x MAINTENANCE');
const velocityPercentage = computed(() => isPhaseLocked.value ? 100 : 0);

/**
 * Formats the BigInt metabolic energy. 
 * Since 1000n = 1.0 TPE, we split the BigInt to maintain precision 
 * without falling back to standard IEEE 754 floats.
 */
const formattedEnergy = computed(() => {
  const val = metabolicEnergy.value;
  const integerPart = val / 1000n;
  const fractionalPart = val % 1000n;
  return `${integerPart.toLocaleString()}.${fractionalPart.toString().padStart(3, '0')}`;
});

/**
 * Generates the Hann window coefficients for the spectral analysis.
 * Precomputed to save CPU cycles in the WASM worker.
 */
const precomputeHannWindow = (length: number) => {
  const buffer = new SharedArrayBuffer(length * 4);
  const view = new Float32Array(buffer);
  for (let i = 0; i < length; i++) {
    view[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (length - 1)));
  }
  return buffer;
};

/**
 * Precomputes the target Schumann sine wave (7.83Hz).
 * Moves trigonometric complexity out of the high-performance WASM loop.
 */
const precomputeSchumannSine = (length: number) => {
  const buffer = new SharedArrayBuffer(length * 4);
  const view = new Float32Array(buffer);
  const SCHUMANN_TARGET = 7.83;
  for (let i = 0; i < length; i++) {
    view[i] = Math.sin(SCHUMANN_TARGET * i);
  }
  return buffer;
};

// Ring Buffer Configuration for Abstraction Worker
const FRAME_SIZE = 1024;
const RING_CAPACITY = FRAME_SIZE * 8; // 8 frames of buffer
const ringBuffer = new SharedArrayBuffer(RING_CAPACITY * 4);
const ringState = new SharedArrayBuffer(8); // [0]: HEAD, [1]: TAIL
const ringSamples = new Float32Array(ringBuffer);
const ringControls = new Int32Array(ringState);

let abstractionWorker: Worker | null = null;

// High-performance memory mapping
let energyView: BigUint64Array;
let saturationView: Uint32Array;
let threadView: Uint8Array;
let lockView: Uint8Array;
let syncView: Int32Array;

const updateUIFromSharedMemory = () => {
  if (!energyView) return;
  
  const energy = energyView[0];
  const saturation = saturationView[0];
  const phaseLocked = lockView[0] === 1;

  // Vue 3 batches these updates automatically to minimize re-renders
  metabolicEnergy.value = energy;
  saturationCycles.value = saturation;
  isPhaseLocked.value = phaseLocked;

  // Optimization: Avoid Array.from + map to reduce GC pressure during high-frequency pulses
  const threads = new Array<Thread>(16);
  for (let i = 0; i < 16; i++) {
    threads[i] = {
      index: i,
      active: threadView[i] === 1,
      value: threadView[i],
      metabolicEnergy: energy,
      saturationCycles: saturation,
      isPhaseLocked: phaseLocked,
    };
  }
  threadBus.value = threads;
};

const igniteHeartbeat = async () => {
  if (isHeartbeatRunning) return;
  isHeartbeatRunning = true;

  const SCHUMANN_INTERVAL = 1000 / 7.83;

  while (isAlive && isHeartbeatRunning) {
    if (syncView) {
      // 1. Trigger the Worker (Set syncTrigger to 1)
      Atomics.store(syncView, 0, 1);
      Atomics.notify(syncView, 0, 1);

      // 2. React to worker update without polling
      // Add a safety timeout (e.g., 500ms) to prevent indefinite waiting if the worker hangs.
      const WORKER_TIMEOUT_MS = 500; 
      const result = Atomics.waitAsync(syncView, 0, 1, WORKER_TIMEOUT_MS);
      if (result.async) {
        const waitResult = await result.value;
        if (waitResult === 'timed-out' || !isHeartbeatRunning) {
          console.error('[SOVEREIGN_CORE] Emergency: Worker timeout. Initiating recovery...');
          isHeartbeatRunning = false;
          initWorker();
          break; // Exit this loop instance
        }
      }

      // 3. Schedule the UI update in the next animation frame to prevent pulse logic from blocking paint
      requestAnimationFrame(() => {
        if (isAlive) updateUIFromSharedMemory();
      });
    }
    // 4. Throttle to Schumann frequency
    await new Promise(r => setTimeout(r, SCHUMANN_INTERVAL));
  }
};

const fractureRisk = computed(() => {
  const excess = processSymmetryMandate(currentPulse.value, localBaseline.value);
  return excess > 0 ? 'HIGH_ENTROPY' : 'STABLE_SYMMETRY';
});

const initAbstractionWorker = () => {
  abstractionWorker = new Worker(new URL('./Abstraction_Worker.ts', import.meta.url), { type: 'module' });
  
  const window = precomputeHannWindow(FRAME_SIZE);
  const sine = precomputeSchumannSine(FRAME_SIZE);

  abstractionWorker.postMessage({
    type: 'INIT_RING',
    ringBuffer,
    stateBuffer: ringState,
    windowBuffer: window,
    sineBuffer: sine,
    length: FRAME_SIZE
  });

  abstractionWorker.onmessage = (e) => {
    const { resonanceIndex } = e.data;
    // Update local resonance state or trigger 4D VRE visuals
    if (resonanceIndex > 0.8) isPhaseLocked.value = true;
  };
};

const initWorker = () => {
  if (worker) worker.terminate();
  
  worker = new Worker(new URL('./sovereign.worker.ts', import.meta.url), { type: 'module' });
  
  worker.onmessage = (e) => {
    const { type, buffer, ptr } = e.data;
    if (type === 'READY') {
      // Map fresh shared memory views
      energyView = new BigUint64Array(buffer, ptr, 1);
      saturationView = new Uint32Array(buffer, ptr + 8, 1);
      threadView = new Uint8Array(buffer, ptr + 12, 16);
      lockView = new Uint8Array(buffer, ptr + 28, 1);
      syncView = new Int32Array(buffer, ptr + 32, 1);
      
      igniteHeartbeat();
    }
  };

  worker.postMessage({ type: 'INIT' });
};

onMounted(() => {
  if (window.crossOriginIsolated) {
    initWorker();
    initAbstractionWorker();
  } else {
    const reason = !window.isSecureContext 
      ? 'Insecure Context (HTTPS required)' 
      : 'COOP/COEP Headers missing or mismatched';
    console.error(
      '[SOVEREIGN_SYSTEM] High-performance context unavailable. ' +
      `Reason: ${reason}`
    );
    isPhaseLocked.value = false;
  }
});

onUnmounted(() => {
  isAlive = false;
  worker?.terminate();
});
</script>

<template>
  <div class="self-substrate">
    <div class="header">
      <h2>Sovereign Identity: {{ suid }}</h2>
      <div class="header-badges">
        <div :class="['status-pill', fractureRisk.toLowerCase()]">{{ fractureRisk }}</div>
        <div :class="['status-pill', isPhaseLocked ? 'resonant' : 'maintenance']">
          {{ velocityLabel }}
        </div>
      </div>
    </div>

    <!-- 16-Thread Fabric Visualizer -->
    <div class="thread-grid">
      <div 
        v-for="thread in threadBus" 
        :key="thread.index" 
        :class="['thread-bit', { active: thread.active }]"
      >
        <span class="bit-index">{{ thread.index }}</span>
      </div>
    </div>

    <div class="metabolic-stats">
      <div class="stat-card">
        <label>Metabolic Velocity</label>
        <div class="value">{{ formattedEnergy }} TPE</div>
        <div class="velocity-meter">
          <div class="meter-track">
            <div class="meter-fill" :style="{ width: velocityPercentage + '%' }"></div>
          </div>
          <div class="meter-labels">
            <span>1.1x Maintenance</span>
            <span>2.2x Resonance</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <label>Saturation Cycles</label>
        <div class="value">{{ saturationCycles }} / 16</div>
        <small v-if="saturationCycles > 8">Cooling protocol imminent...</small>
      </div>
    </div>

    <div class="mandate-audit">
      <h4>Planetary Treasury Overflow: {{ entityTreasury }} IO$</h4>
      <p>Current Pulse: {{ currentPulse }} | Local Grounding: {{ localBaseline }}</p>
    </div>
  </div>
</template>

<style scoped>
.self-substrate {
  background: #0a0a0a;
  color: #00e5ff;
  padding: 20px;
  border: 1px solid #00e5ff;
  font-family: 'Courier New', Courier, monospace;
  border-radius: 4px;
  max-width: 600px;
}

.header { display: flex; justify-content: space-between; align-items: center; }
.header-badges { display: flex; gap: 10px; }

.thread-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  margin: 20px 0;
}

.thread-bit {
  height: 40px;
  border: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050505;
  transition: all 0.1s ease;
}

.thread-bit.active {
  background: #00e5ff;
  color: #000;
  box-shadow: 0 0 10px #00e5ff;
}

.bit-index {
  font-size: 10px;
}

.metabolic-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stat-card {
  background: #111;
  padding: 15px;
  border-radius: 2px;
}

.velocity-meter {
  margin-top: 12px;
}

.meter-track {
  background: #222;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid #333;
}

.meter-fill {
  background: linear-gradient(90deg, #00e5ff 0%, #7fff00 100%);
  height: 100%;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.6s ease;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
}

.meter-labels {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  margin-top: 4px;
  text-transform: uppercase;
  opacity: 0.6;
}

.status-pill { font-size: 12px; padding: 4px 8px; border-radius: 10px; border: 1px solid; }
.high_entropy { color: #ff0000; border-color: #ff0000; }
.stable_symmetry { color: #00ff00; border-color: #00ff00; }
.resonant { color: #7fff00; border-color: #7fff00; box-shadow: 0 0 5px #7fff00; }
.maintenance { color: #00e5ff; border-color: #00e5ff; opacity: 0.7; }
</style>
