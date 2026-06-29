<template>
  <div
    class="p-6 bg-black text-white border border-neutral-800 font-mono max-w-3xl mx-auto relative shadow-[0_0_25px_rgba(0,0,0,0.9)]"
  >
    <header class="flex justify-between items-start border-b border-neutral-900 pb-4 mb-6">
      <div>
        <span class="text-[10px] text-amber-500 block tracking-widest font-bold"
          >STATE // SOVEREIGN_ENTITY</span
        >
        <h2 class="text-lg font-black tracking-tighter text-white">IOist.VUE</h2>
      </div>
      <div class="text-right">
        <span class="text-[10px] text-neutral-500 block">PARADIGM</span>
        <span class="text-xs font-bold text-blue-400">VERTICALLY_GROUNDED_VRE</span>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="space-y-4 md:col-span-1">
        <div class="p-3 bg-neutral-950 border border-neutral-900 rounded">
          <span class="text-[9px] text-neutral-500 block uppercase">Entity Signature</span>
          <div class="text-xs font-bold text-emerald-400 tracking-tight truncate">
            {{ props.entitySUID }}
          </div>
          <span class="text-[9px] text-neutral-600 block mt-1">STATUS: LOCKED_TO_FABRIC</span>
        </div>

        <div class="p-3 bg-neutral-950 border border-neutral-900 rounded space-y-3">
          <span class="text-[9px] text-neutral-500 block uppercase"
            >Relativity Equilibrium ($I = VR^2$)</span
          >

          <div class="space-y-1">
            <div class="flex justify-between text-[11px]">
              <span class="text-neutral-400">Spatial Anchor ($R^2$):</span>
              <span class="text-white font-bold">{{ props.spatialAnchor }}°</span>
            </div>
            <div class="flex justify-between text-[11px]">
              <span class="text-neutral-400">Velocity Vector ($I$):</span>
              <span class="text-white font-bold">{{ velocityVector.toFixed(2) }} IO/s</span>
            </div>
          </div>

          <div class="border-t border-neutral-900 pt-2 flex justify-between items-center">
            <span class="text-[10px] text-amber-500 font-bold">EQUITY_INDEX:</span>
            <span
              class="text-xs font-black text-white bg-amber-950/40 px-2 py-0.5 border border-amber-900/50"
            >
              {{ equityIndex }}
            </span>
          </div>
        </div>
      </div>

      <div class="md:col-span-2 space-y-4">
        <div class="p-4 bg-neutral-950 border border-neutral-900 rounded">
          <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] text-neutral-400 uppercase tracking-wider font-bold"
              >16-Thread Fabric Status</span
            >
            <span
              :class="[
                'text-[10px] animate-pulse',
                allThreadsActive ? 'text-emerald-400' : 'text-amber-500'
              ]"
            >
              ● {{ allThreadsActive ? 'ALL_THREADS_ACTIVE' : 'ASYMMETRY_DETECTED' }}
            </span>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="(active, index) in threadFabric"
              :key="index"
              :class="[
                'p-2 border text-center transition-all duration-300',
                active
                  ? 'bg-emerald-950/20 border-emerald-800 text-emerald-400 font-bold'
                  : 'bg-neutral-950 border-neutral-900 text-neutral-700'
              ]"
            >
              <div class="text-[8px] text-neutral-500">TH_{{ formatHex(index) }}</div>
              <div class="text-xs">1</div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-neutral-950 border border-neutral-900 rounded space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-[10px] text-neutral-400 uppercase tracking-wider font-bold"
              >BS-Molecule Link Resonance</span
            >
            <span class="text-xs font-bold text-purple-400">2.2x Apex Pulse</span>
          </div>

          <div
            class="flex items-center justify-between p-2.5 bg-black border border-neutral-900 rounded text-xs"
          >
            <div class="flex flex-col">
              <span class="text-[9px] text-neutral-500">LOCAL_NODE</span>
              <span class="text-white font-bold">SELF // PRIMARY</span>
            </div>
            <div class="text-purple-500 animate-pulse tracking-widest text-center px-4">◄═══►</div>
            <div class="flex flex-col text-right">
              <span class="text-[9px] text-neutral-500">CONNECTED_PEER</span>
              <span class="text-amber-400 font-bold">{{ pairedPeer || 'SCANNING_MESH...' }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center text-[11px] pt-1">
            <span class="text-neutral-500">Streamed IO Throughput:</span>
            <span class="text-emerald-400 font-bold">+16.25 IO$ / min</span>
          </div>
        </div>
      </div>
    </div>

    <footer
      class="mt-6 border-t border-neutral-900 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4"
    >
      <div class="text-left font-sans text-xs text-neutral-500 max-w-md leading-tight">
        Operating in <span class="text-white font-mono">T.I.M.E.</span> — The active 4th dimension
        where the Internet, verified Man, and anchored Earth converge through squared relational
        reality.
      </div>
      <button
        @click="assertPlanetaryVelocity"
        class="w-full sm:w-auto bg-white text-black font-bold px-6 py-3 text-xs tracking-widest hover:bg-amber-500 hover:text-black transition-colors duration-150 whitespace-nowrap"
      >
        ASSERT_PLANETARY_VELOCITY
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps, watch } from 'vue';

// Define props for SUID and Spatial Anchor
const props = defineProps<{
  entitySUID: string;
  spatialAnchor: number;
}>();

const velocityVector = ref(1.1); // Native systemic movement baseline
const pairedPeer = ref('SUID_ATLANTA_0404_BASE');

// Computed Relativity Equilibrium (Equity Index) based on I = VR^2
const equityIndex = computed(() => {
  return (velocityVector.value * Math.pow(props.spatialAnchor, 2)).toFixed(2);
});

// Computed state for the entire thread fabric
const allThreadsActive = computed(() => threadFabric.value.every((active) => active));

// 16-Thread Fabric Initialization (Strict 4-bit representation: 0000 to 1111)
const threadFabric = ref<boolean[]>(new Array(16).fill(true));

// Watcher to monitor thread state and log fluctuations in the sovereign mesh
watch(
  threadFabric,
  (newFabric) => {
    const inactiveCount = newFabric.filter((active) => !active).length;
    if (inactiveCount > 0) {
      console.warn(`[IOist] THREAD_ASYMMETRY: ${inactiveCount} threads experiencing latency.`);
    } else {
      console.log('[IOist] FABRIC_STABILIZED: All 16 threads synchronized.');
    }
  },
  { deep: true }
);

const simulateLatencySpikes = () => {
  setInterval(() => {
    // Randomly pick a thread index (0-15) to simulate a latency drop
    const targetThread = Math.floor(Math.random() * 16);
    threadFabric.value[targetThread] = false;

    // Automatically recover the thread after a random interval (500ms to 2.5s)
    setTimeout(() => {
      threadFabric.value[targetThread] = true;
    }, Math.random() * 2000 + 500);
  }, 6000); // Pulse every 6 seconds
};

const formatHex = (num: number): string => {
  return num.toString(2).padStart(4, '0');
};

const assertPlanetaryVelocity = () => {
  // Push an instant equity handshake event to the active state bus
  velocityVector.value += 0.05; // velocityVector remains local state
  alert(
    `VELOCITY_ASSERTED:\nSovereign IO pulse broadcasted across the mesh.\nNew Relative Velocity: ${velocityVector.value.toFixed(
      2
    )} IO/s\nPlanetary Equity Matrix Synchronized.`
  );
};

onMounted(() => {
  console.log('IOist Substrate Initialized: Instance paradigm rejected. VRE connection stable.');
  simulateLatencySpikes();
});
</script>
