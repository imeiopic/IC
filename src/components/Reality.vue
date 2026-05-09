<template>
  <CContainer fluid class="reality-substrate p-4 bg-black min-vh-100 font-mono text-white">
    
    <header class="d-flex justify-content-between align-items-center mb-5 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-cpu text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">REALITY_ENGINE</h1>
      </div>
      <div class="purity-sighting text-end">
        <div class="tiny text-zinc-500 uppercase">Logical_Purity_Index</div>
        <div class="text-success font-black h5 m-0">{{ purityIndex }}%</div>
      </div>
    </header>

    <CRow>
      <CCol lg="8">
        <CCard class="bg-zinc-900 border-zinc-800 text-white shadow-glow mb-4">
          <CCardHeader class="bg-zinc-800 border-0 font-black italic text-info py-2">
            ACTIVE_POLICING_LOG
          </CCardHeader>
          <CCardBody class="p-0">
            <div class="log-container p-3 bg-black" style="height: 400px; overflow-y: auto;">
              <div v-for="(log, i) in policingLogs" :key="i" class="mb-2 d-flex gap-2 tiny">
                <span class="text-zinc-700">[{{ log.time }}]</span>
                <span :class="log.status === 'VERIFIED' ? 'text-success' : 'text-warning'">
                  {{ log.status }}
                </span>
                <span class="text-zinc-400">{{ log.action }}</span>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg="4">
        <CCard class="bg-zinc-900 border-info text-white shadow-info mb-4">
          <CCardHeader class="font-black italic text-center py-3">CORE_GATES</CCardHeader>
          <CCardBody>
            <div v-for="gate in gates" :key="gate.id" class="gate-item mb-4">
              <div class="d-flex justify-content-between tiny mb-1">
                <span class="text-zinc-500 uppercase">{{ gate.id }}</span>
                <span :class="gate.locked ? 'text-success' : 'text-danger'">
                  {{ gate.locked ? 'SYNC_LOCKED' : 'DRIFT_DETECTED' }}
                </span>
              </div>
              <div class="progress-bg bg-black rounded-pill w-100" style="height: 4px;">
                <div class="progress-fill bg-info h-100" :style="{ width: gate.purity + '%' }"></div>
              </div>
            </div>

            <CButton 
              color="info" 
              variant="outline" 
              class="w-100 py-3 font-black italic mt-3 shadow-glow"
              @click="recalibrateReality"
            >
              INITIATE_LOGIC_RECALIBRATION
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <footer class="mt-auto pt-4 text-center opacity-25 tiny">
      "I = VR² | REALITY IS THE SUM OF POLICED INFORMATION"
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const purityIndex = ref(99.99);
const policingLogs = ref<any[]>([]);

const gates = ref([
  { id: 'Gate_0111_Truth', purity: 100, locked: true },
  { id: 'Gate_1101_Earth', purity: 99.8, locked: true },
  { id: 'Gate_0001_Identity', purity: 100, locked: true }
]);

const recalibrateReality = () => {
  purityIndex.value = 100;
  policingLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    status: 'VERIFIED',
    action: 'Global_Logic_Reset_Executed'
  });
};

onMounted(() => {
  setInterval(() => {
    policingLogs.value.unshift({
      time: new Date().toLocaleTimeString(),
      status: 'VERIFIED',
      action: 'Information_Substrate_Sighted_and_Policed'
    });
    if (policingLogs.value.length > 50) policingLogs.value.pop();
  }, 3000);
});
</script>

<style scoped>
.reality-substrate { font-family: 'Space Mono', monospace; }
.text-glow { text-shadow: 0 0 15px rgba(0, 229, 255, 0.4); }
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.1) !important; }
.shadow-info { box-shadow: 0 0 20px rgba(0, 229, 255, 0.3); }
.font-black { font-weight: 900; }
.tiny { font-size: 0.65rem; }
.italic { font-style: italic; }
</style>