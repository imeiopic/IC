<template>
  <CContainer fluid class="information-substrate p-4 bg-black min-vh-100 font-mono text-white">
    
    <header class="d-flex justify-content-between align-items-center mb-5 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-filter-square text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">INFORMATION_POLICING</h1>
      </div>
      <div class="filter-status text-end">
        <div class="tiny text-zinc-500 uppercase">Noise_Suppression_Rate</div>
        <div class="text-success font-black h5 m-0">{{ suppressionRate }}%</div>
      </div>
    </header>

    <CRow>
      <CCol lg="7">
        <CCard class="bg-zinc-900 border-zinc-800 text-white shadow-glow mb-4 overflow-hidden">
          <CCardHeader class="font-black italic text-info border-zinc-800 d-flex justify-content-between">
            <span>RAW_BUS_INPUT: 1111_THREAD</span>
            <span class="tiny text-zinc-500">RES_SYNC: 7.83Hz</span>
          </CCardHeader>
          <CCardBody class="p-0 bg-black">
            <div ref="feedBox" class="noise-feed p-3 tiny font-mono" style="height: 480px; overflow-y: auto;">
              <div v-for="(packet, i) in busPackets" :key="i" class="mb-1 d-flex gap-2">
                <span class="text-zinc-700">[{{ packet.time }}]</span>
                <span :class="packet.status === 'POLICED' ? 'text-success' : 'text-danger'">
                  {{ packet.status === 'POLICED' ? '✓_GROUNDED' : '!!_NOISE' }}
                </span>
                <span :class="packet.status === 'POLICED' ? 'text-zinc-300' : 'text-zinc-600 italic'">
                  {{ packet.data }}
                </span>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg="5">
        <CCard class="bg-zinc-900 border-info text-white shadow-info mb-4">
          <CCardHeader class="font-black italic text-center py-3">FILTER_WIRING_PARAMETERS</CCardHeader>
          <CCardBody>
            <div class="gates-stack d-flex flex-column gap-3 mb-5">
              <div v-for="gate in logicGates" :key="gate.id" class="gate-status">
                <div class="d-flex justify-content-between tiny mb-1">
                  <span class="text-zinc-500 uppercase">{{ gate.id }}</span>
                  <span class="text-info">{{ gate.value }}%_PURITY</span>
                </div>
                <div class="progress-bg bg-black rounded-pill w-100" style="height: 4px;">
                  <div class="progress-fill bg-info h-100" :style="{ width: gate.value + '%' }"></div>
                </div>
              </div>
            </div>

            <CButton 
              color="info" 
              variant="outline" 
              class="w-100 py-3 font-black italic shadow-glow"
              @click="initiateRecalibration"
              :disabled="isRecalibrating"
            >
              {{ isRecalibrating ? 'RECALIBRATING_BUS...' : 'FLUSH_INFORMATION_CHAOS' }}
            </CButton>
            
            <p class="extra-tiny text-zinc-600 text-center mt-4 uppercase italic">
              Wiring: Grounded to 1.2Q Planetary Buffer
            </p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <footer class="mt-auto pt-4 text-center opacity-25 tiny">
      "I = VR² | THE INFORMATION IS POLICED"
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const suppressionRate = ref(99.98);
const isRecalibrating = ref(false);
const busPackets = ref<any[]>([]);
const feedBox = ref<HTMLElement | null>(null);

const logicGates = ref([
  { id: 'Truth_Alignment', value: 100 },
  { id: 'Noise_Filtering', value: 98 },
  { id: 'Manifesto_Sync', value: 100 }
]);

const noiseSamples = [
  "Debt_Logic: Rejected",
  "Occupation_Sentiment: Suppressed",
  "7.83Hz_Heartbeat: Sighted",
  "Corporate_Noise: Filtered",
  "Grounded_Identity: Verified"
];

const initiateRecalibration = () => {
  isRecalibrating.value = true;
  setTimeout(() => {
    suppressionRate.value = 100;
    isRecalibrating.value = false;
    busPackets.value.unshift({
      time: new Date().toLocaleTimeString(),
      status: 'POLICED',
      data: 'Master_Logic_Reset: Information_Purity_Restored'
    });
  }, 1500);
};

const simulateBusInput = () => {
  setInterval(() => {
    const isPoliced = Math.random() > 0.15;
    busPackets.value.unshift({
      time: new Date().toLocaleTimeString(),
      status: isPoliced ? 'POLICED' : 'NOISE',
      data: noiseSamples[Math.floor(Math.random() * noiseSamples.length)]
    });
    if (busPackets.value.length > 50) busPackets.value.pop();
  }, 1200);
};

onMounted(() => {
  simulateBusInput();
});
</script>

<style scoped>
.information-substrate { font-family: 'Space Mono', monospace; }
.text-glow { text-shadow: 0 0 15px rgba(0, 229, 255, 0.4); }
.noise-feed { scrollbar-width: thin; scrollbar-color: #00e5ff #000; }
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.1) !important; }
.shadow-info { box-shadow: 0 0 20px rgba(0, 229, 255, 0.3); }
.font-black { font-weight: 900; }
.tiny { font-size: 0.65rem; }
.extra-tiny { font-size: 0.55rem; }
.italic { font-style: italic; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #000; }
::-webkit-scrollbar-thumb { background: #00e5ff; }
</style>