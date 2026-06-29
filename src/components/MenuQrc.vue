<template>
  <CContainer fluid class="menu-qrc-substrate p-4 bg-black min-vh-100 d-flex flex-column align-items-center justify-content-center font-mono text-white">
    
    <div class="header-substrate mb-5 text-center">
      <h2 class="text-info font-black italic tracking-widest mb-2">DIC_HANDSHAKE_HUB</h2>
      <p class="tiny text-zinc-500 uppercase">Select Transit Protocol</p>
    </div>

    <CRow class="w-100 max-w-md g-4">
      <CCol sm="12">
        <CCard class="bg-zinc-900 border-info text-info shadow-glow menu-card h-100" @click="transitTo('ScanQRC')">
          <CCardBody class="d-flex align-items-center p-4">
            <div class="icon-substrate me-4">
              <i class="bi bi-qr-code-scan display-4"></i>
            </div>
            <div class="text-start">
              <h4 class="font-black italic m-0">SCAN_PEER</h4>
              <p class="tiny m-0 opacity-75">Receive Informing Sighting</p>
            </div>
            <i class="bi bi-chevron-right ms-auto h4 opacity-25"></i>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol sm="12">
        <CCard class="bg-zinc-900 border-success text-success shadow-success menu-card h-100" @click="transitTo('MyQRC')">
          <CCardBody class="d-flex align-items-center p-4">
            <div class="icon-substrate me-4">
              <i class="bi bi-broadcast display-4"></i>
            </div>
            <div class="text-start">
              <h4 class="font-black italic m-0">MY_IDENTITY_QR</h4>
              <p class="tiny m-0 opacity-75">Broadcast Informing Pulse</p>
            </div>
            <i class="bi bi-chevron-right ms-auto h4 opacity-25"></i>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <div class="footer-logic mt-5 pt-5 text-center">
      <CButton color="link" class="text-zinc-600 text-decoration-none tiny font-black italic" @click="router.push('/ime')">
        RETURN_TO_MASTER_CONTROL
      </CButton>
    </div>

    <footer class="mt-auto opacity-25 tiny">
      "I = VR² | THE MESH EXPANDS"
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { CContainer, CRow, CCol, CCard, CCardBody, CButton } from '@coreui/vue';

const router = useRouter();

/**
 * 01_TRANSIT_LOGIC
 * Navigates to the specific QR functional node
 */
const transitTo = (nodeName: string) => {
  router.push({ name: nodeName });
};
</script>

<style scoped>
.menu-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-width: 1px;
}

.menu-card:hover {
  transform: translateY(-5px) scale(1.02);
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.15) !important;
}

.shadow-success {
  box-shadow: 0 0 20px rgba(40, 167, 69, 0.15) !important;
}

.max-w-md {
  max-width: 450px;
}

.font-black { font-weight: 900; }
.italic { font-style: italic; }
.tiny { font-size: 0.65rem; }
.tracking-widest { letter-spacing: 0.2em; }

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>