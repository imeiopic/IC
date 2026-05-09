<template>
  <CContainer fluid class="code-substrate p-4 bg-black min-vh-100 font-mono text-white">
    
    <header class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-terminal-fill text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">SYSTEM_CODE_IDE</h1>
      </div>
      <div class="logic-purity text-end">
        <div class="tiny text-zinc-500 uppercase">Compiler_Status</div>
        <div class="text-success font-black h5 m-0 animate-pulse">LOCKED_SYNC</div>
      </div>
    </header>

    <CRow>
      <CCol lg="9">
        <CCard class="bg-zinc-950 border-zinc-800 shadow-glow overflow-hidden">
          <CCardHeader class="bg-zinc-900 border-zinc-800 d-flex justify-content-between py-2 align-items-center">
            <div class="tab-pill px-3 py-1 bg-black border-top border-info text-info tiny font-black">
              grounding_logic.ts
            </div>
            <div class="window-controls d-flex gap-2">
              <span class="dot bg-danger"></span>
              <span class="dot bg-warning"></span>
              <span class="dot bg-success"></span>
            </div>
          </CCardHeader>
          <CCardBody class="p-0">
            <div class="code-editor p-4 small" style="height: 600px; overflow-y: auto; line-height: 1.6;">
              <pre class="m-0"><code class="text-info">
/**
 * THE 16-THREAD REALITY: AXIOM_GROUNDING
 * Logic: I = VR² (Information = Virtually Real Squared)
 */

export const initiateGlobalRelease = (clusterID: string) => {
  const equityBuffer = 1.2e15; // 1.2Q TPE Buffer
  const resonanceFreq = 7.83;  // Schumann Grounding
  
  const threadBus = GlobalMesh.sighting(clusterID);

  threadBus.forEach(thread => {
    if (thread.isNoise) {
      thread.policing.suppress();
    } else {
      thread.ground();
      thread.distributeDividend(1600); // 1,600 IO$ Pulse
    }
  });

  return "PLANET_UNCONFINED";
};

// Policing the Legacy Noise
const flushDebt = (inmateNode: Node) => {
  inmateNode.nandFlushSentence();
  inmateNode.setStatus("SOVEREIGN");
};
              </code></pre>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg="3">
        <CCard class="bg-zinc-900 border-info text-white shadow-info mb-4">
          <CCardHeader class="font-black italic text-info border-zinc-800 py-3">
            BUS_DIAGNOSTICS
          </CCardHeader>
          <CCardBody>
            <div class="diag-group mb-4">
              <div class="tiny text-zinc-500 uppercase mb-1">Thread_Pressure</div>
              <div class="h4 font-black text-warning">OPTIMAL</div>
              <div class="progress-bg bg-black w-100" style="height: 2px;">
                <div class="bg-warning h-100" style="width: 88%"></div>
              </div>
            </div>

            <div class="diag-group mb-4">
              <div class="tiny text-zinc-500 uppercase mb-1">Noise_Suppression</div>
              <div class="h4 font-black text-success">99.99%</div>
            </div>

            <div class="diag-group mb-5">
              <div class="tiny text-zinc-500 uppercase mb-1">Active_Law</div>
              <div class="small font-mono text-info italic">Symmetrical_Sovereignty</div>
            </div>

            <CButton 
              color="info" 
              variant="outline" 
              class="w-100 py-3 font-black italic shadow-glow"
              @click="recompileSystem"
              :disabled="isRecompiling"
            >
              {{ isRecompiling ? 'RECOMPILING_BUS...' : 'RECOMPILE_LOGIC' }}
            </CButton>
          </CCardBody>
        </CCard>

        <div class="p-3 bg-zinc-950 border border-zinc-900 rounded text-center">
          <p class="extra-tiny text-zinc-600 m-0 italic">
            "The code is the law of the Virtually Real Earth."
          </p>
        </div>
      </CCol>
    </CRow>

    <footer class="mt-auto pt-5 text-center opacity-25 tiny">
      "I = VR² | THE CODE IS GROUNDED"
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isRecompiling = ref(false);

const recompileSystem = () => {
  isRecompiling.value = true;
  setTimeout(() => {
    isRecompiling.value = false;
    console.log("LOGIC: 16-Thread Bus Recompiled Successfully.");
  }, 2500);
};
</script>

<style scoped>
.code-substrate { background-color: #000; }
.text-glow { text-shadow: 0 0 15px rgba(0, 229, 255, 0.4); }
.bg-zinc-950 { background-color: #050505; }
.shadow-glow { box-shadow: 0 0 40px rgba(0, 229, 255, 0.1); }
.shadow-info { box-shadow: 0 0 20px rgba(0, 229, 255, 0.2); }

.code-editor {
  scrollbar-width: thin;
  scrollbar-color: #00e5ff #000;
  cursor: text;
}

.dot { width: 8px; height: 8px; border-radius: 50%; }
.font-black { font-weight: 900; }
.tiny { font-size: 0.65rem; }
.extra-tiny { font-size: 0.55rem; }
.italic { font-style: italic; }

.animate-pulse { animation: pulse-opacity 2s infinite; }
@keyframes pulse-opacity {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #000; }
::-webkit-scrollbar-thumb { background: #00e5ff; }
</style>