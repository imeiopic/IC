<template>
  <CContainer fluid class="code-substrate p-4 bg-black min-vh-100 font-mono text-white">
    <header class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-terminal-fill text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">SYSTEM_CODE_IDE</h1>
      </div>
      <div class="logic-purity text-end">
        <div class="tiny text-zinc-500 uppercase">Compiler_Status</div>
        <div :class="['font-black h5 m-0', isRecompiling ? 'text-warning' : 'text-success']">
          {{ isRecompiling ? 'RECOMPILING...' : 'LOCKED_SYNC' }}
        </div>
      </div>
    </header>

    <CRow>
      <CCol lg="9">
        <CCard class="bg-zinc-950 border-zinc-800 shadow-glow overflow-hidden">
          <CCardHeader class="bg-zinc-900 border-zinc-800 d-flex justify-content-between py-2 align-items-center">
            <div class="tab-pill px-3 py-1 bg-black border-top border-info text-info tiny font-black">
              grounding_logic.ts
            </div>
            <div class="window-controls d-flex gap-2" aria-label="Editor controls">
              <span class="dot bg-danger" title="Close"></span>
              <span class="dot bg-warning" title="Minimize"></span>
              <span class="dot bg-success" title="Maximize"></span>
            </div>
          </CCardHeader>
          <CCardBody class="p-0">
            <textarea 
              v-model="codeContent"
              class="code-editor w-100 p-4 small bg-transparent text-info border-0"
              spellcheck="false"
            ></textarea>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg="3">
        <CCard class="bg-zinc-900 border-info text-white shadow-info mb-4">
          <CCardHeader class="font-black italic text-info border-zinc-800 py-3">BUS_DIAGNOSTICS</CCardHeader>
          <CCardBody>
            <CButton 
              color="info" 
              variant="outline" 
              class="w-100 py-3 font-black italic"
              @click="recompile"
              :disabled="isRecompiling"
            >
              {{ isRecompiling ? 'RECOMPILING_BUS...' : 'RECOMPILE_LOGIC' }}
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Use a reactive variable for the editor content
const codeContent = ref(`export const initiateGlobalRelease = (clusterID: string) => {
  const equityBuffer = 1.2e15;
  // ... logic
};`);

const isRecompiling = ref(false);

const recompile = async () => {
  isRecompiling.value = true;
  // Simulate API call to compiler service
  await new Promise(resolve => setTimeout(resolve, 2500));
  isRecompiling.value = false;
};
</script>

<style scoped>
.code-editor {
  height: 600px;
  resize: none;
  outline: none;
  font-family: 'Fira Code', 'Courier New', monospace;
}
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
</style>