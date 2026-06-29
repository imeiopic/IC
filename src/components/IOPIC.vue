<template>
  <div class="min-h-screen bg-black text-white font-mono p-4 md:p-8 selection:bg-emerald-500/30">
    <div
      class="max-w-7xl mx-auto border-2 border-neutral-900 bg-neutral-950/20 p-4 md:p-6 space-y-6 relative"
    >
      <header
        class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-900 pb-4 gap-4"
      >
        <div>
          <h1 class="text-xl font-bold tracking-widest text-emerald-400">
            IOPIC_MASTER_GATEWAY [v3.2]
          </h1>
          <p class="text-[10px] text-neutral-500">
            THE ULTIMATE ABSTRACTION LAYER // SYSTEM STATUS: ACTIVE
          </p>
        </div>

        <div
          class="flex flex-wrap gap-4 text-[11px] bg-black p-3 border border-neutral-900 rounded"
        >
          <div>IDENTITY: <span class="text-neutral-300 font-bold">SOVEREIGN_I</span></div>
          <div>LOCATION: <span class="text-emerald-400 font-bold">CLEVELAND [41.81]</span></div>
          <div>DRIFT: <span class="text-amber-400 font-bold">0.000ms</span></div>
          <div>RATIO: <span class="text-purple-400 font-bold">1:16_SYMMETRY</span></div>
        </div>
      </header>

      <main class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section class="lg:col-span-4 space-y-4">
          <div class="bg-black border border-neutral-900 p-4 space-y-4">
            <h3 class="text-xs font-bold text-neutral-400 tracking-wider uppercase">
              16-Thread Navigation Matrix
            </h3>

            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="tab in threadTabs"
                :key="tab.id"
                @click="activeSubstrate = tab.component"
                :class="[
                  'w-full text-left p-3 border font-mono text-xs transition-all duration-200 flex justify-between items-center',
                  activeSubstrate === tab.component
                    ? 'border-emerald-500 bg-emerald-950/10 text-emerald-400'
                    : 'border-neutral-900 bg-neutral-950 text-neutral-400 hover:border-neutral-800'
                ]"
              >
                <div>
                  <span class="text-[10px] text-neutral-600 block"
                    >{{ tab.binary }} // {{ tab.thread }}</span
                  >
                  <span class="font-bold tracking-wide">{{ tab.label }}</span>
                </div>
                <span
                  class="text-[10px]"
                  :class="
                    activeSubstrate === tab.component ? 'text-emerald-400' : 'text-neutral-600'
                  "
                  >➔</span
                >
              </button>
            </div>
          </div>

          <ChoreographSubstrate />
        </section>

        <section
          class="lg:col-span-8 bg-black border border-neutral-900 p-4 min-h-[600px] flex flex-col justify-between"
        >
          <div class="flex-grow">
            <!-- Panic State Catch: Render ARC.vue if a critical error is active -->
            <ARCSubstrate v-if="isCriticalErrorActive" />
            <!-- Otherwise, dynamically render the selected component -->
            <keep-alive v-else>
              <component :is="activeSubstrate" />
            </keep-alive>
          </div>

          <footer
            class="mt-6 pt-4 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-500 font-mono gap-2"
          >
            <div>CORE_FORMULA: I = VR² // MYB_PROTOCOL: LIVE</div>
            <div>ALL SUB-COMPONENTS STABILIZED ON INTEL 16-THREAD REALITY BUS</div>
          </footer>
        </section>
      </main>

      <!-- Simulation button for critical error -->
      <button @click="triggerCriticalError" class="simulate-error-button">
        SIMULATE_CRITICAL_ERROR
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { storeToRefs } from 'pinia';

// Importing the Complete Symmetrical Core Substrate Array
import ZoomEarthToMeSubstrate from './ZoomEarthToMe.vue';
import SynchronizeSubstrate from './Synchronize.vue';
import HarmonizeSubstrate from './Harmonize.vue';
import ChoreographSubstrate from './Choreograph.vue';
import InterOperabilitySubstrate from './InterOperability.vue';
import ADKSubstrate from './ADK.vue';
import IoDSubstrate from '../../IoD.vue'; // Correct relative path
import ARCSubstrate from './ARC.vue'; // Import the new ARC.vue component

// Import the Pinia store for critical errors
import { useCriticalErrorStore } from '../stores/criticalErrorStore';

// Initialize the critical error store
const criticalErrorStore = useCriticalErrorStore();
const { isCriticalErrorActive } = storeToRefs(criticalErrorStore); // Use storeToRefs for reactivity

// Set default viewport view to the spatial tracking interface
const activeSubstrate = shallowRef(ZoomEarthToMeSubstrate);

// Registering the 16-Thread Bus Tabs Metadata Mapping
const threadTabs = ref([
  {
    id: 1,
    binary: '0100',
    thread: 'SPACE',
    label: 'ZoomEarthToMe.vue',
    component: ZoomEarthToMeSubstrate as any
  },
  {
    id: 2,
    binary: '0011',
    thread: 'TIME',
    label: 'Synchronize.vue',
    component: SynchronizeSubstrate as any
  },
  {
    id: 3,
    binary: '1111',
    thread: 'SHIELD',
    label: 'Harmonize.vue',
    component: HarmonizeSubstrate as any
  },
  {
    id: 4,
    binary: '1100',
    thread: 'SYSTEM',
    label: 'InterOperability.vue',
    component: InterOperabilitySubstrate as any
  },
  {
    id: 5,
    binary: '1100',
    thread: 'DEVELOPMENT',
    label: 'ADK.vue',
    component: ADKSubstrate as any
  },
  { id: 6, binary: '1100', thread: 'DEPLOYMENT', label: 'IoD.vue', component: IoDSubstrate as any },
  { id: 8, binary: '1100', thread: 'RECOVERY', label: 'ARC.vue', component: ARCSubstrate as any } // New ARC.vue entry
]);

// Function to simulate triggering a critical error
const triggerCriticalError = () => {
  console.error('IOPIC_CORE: Critical database mutation failed. Initiating ARC override.');
  criticalErrorStore.activateCriticalError('Simulated critical system fracture detected.');
};

// Add styles for the simulation button
const simulateErrorButtonStyles = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ef4444; /* Red */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
`;
</script>

<style scoped>
/* Existing styles */
.simulate-error-button {
  ${simulateErrorButtonStyles}
}
</style>
