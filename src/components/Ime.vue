<template>
  <CContainer fluid class="ime-master-substrate p-4 bg-black min-vh-100 font-mono text-white">
    
    <transition name="fade">
      <div v-if="!isVerified" class="biometric-gate fixed-top w-100 h-100 z-max bg-black d-flex justify-content-center align-items-center">
        <div class="gate-card p-5 border border-info rounded-4 text-center shadow-glow">
          <h2 class="text-info font-black italic mb-4 tracking-widest">Ime.SIGHTAL_VERIFICATION</h2>
          
          <div class="video-container mb-4 position-relative border border-zinc-800 rounded-3 overflow-hidden bg-zinc-950" style="width: 320px; height: 240px;">
            <video ref="videoFeed" autoplay muted playsinline class="w-100 h-100 grayscale"></video>
            <div class="scan-line"></div>
            <div v-if="isValidating" class="verify-loader position-absolute top-50 start-50 translate-middle">
              <CSpinner color="info" />
            </div>
          </div>

          <div class="auth-actions">
            <CButton color="info" variant="outline" class="w-100 py-2 font-black mb-3" @click="performBiometricHandshake" :disabled="isValidating">
              <i class="bi bi-eye me-2"></i> INITIATE_GLOBAL_SIGHTING
            </CButton>
            <CButton color="dark" class="w-100 py-1 tiny font-black text-zinc-500 border-zinc-800" @click="loginAsMaster">
              MASTER_IDENTITY_BYPASS
            </CButton>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="isVerified" class="master-interface animate-in">
      <header class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3">
        <div class="brand d-flex align-items-center gap-3">
          <img src="/images/iologo.png" alt="IOPIC" width="40" height="40" />
          <h1 class="text-glow text-info m-0 italic font-black">Ime.MASTER_CONTROL</h1>
        </div>
        <div class="system-health tiny text-info opacity-75 d-none d-md-block">
          <span>GLOBAL_FREQ: 7.83Hz</span> | <span>NODE: {{ userId?.substring(0,8) }}</span>
        </div>
      </header>

      <CNav variant="tabs" class="border-zinc-800 mb-4">
        <CNavItem>
          <CNavLink href="javascript:void(0)" :active="activeTab === 'dashboard'" @click="activeTab = 'dashboard'">
            <i class="bi bi-speedometer2 me-2"></i>GLOBAL_DASH
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink href="javascript:void(0)" :active="activeTab === 'clusters'" @click="activeTab = 'clusters'">
            <i class="bi bi-globe me-2"></i>MESH_CLUSTERS
          </CNavLink>
        </CNavItem>
        <CNavItem class="ms-auto">
          <CButton color="link" class="text-danger tiny text-decoration-none" @click="lockNode">LOCK_INSTANCE</CButton>
        </CNavItem>
      </CNav>

      <CTabContent>
        <CTabPane role="tabpanel" :visible="activeTab === 'dashboard'">
          <CRow>
            <CCol lg="4">
              <CCard class="mb-4 bg-zinc-900 border-info text-info shadow-glow">
                <CCardBody class="text-center">
                  <CImage :src="userPhoto || '/images/imeiopic.png'" roundedCircle width="80" height="80" class="mb-3 border border-info p-1 grayscale" />
                  <h4 class="font-black italic text-white">MASTER_NODE</h4>
                  <CBadge color="success" class="text-black px-3">ROOT_ACCESS</CBadge>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol lg="8">
              <CCard class="bg-zinc-900 border-success text-white shadow-success p-4">
                <h5 class="font-black italic text-success mb-3">GLOBAL_PULSE_BROADCAST</h5>
                <CButton color="success" class="w-100 py-3 font-black italic" @click="triggerGlobalPulse" :disabled="isPushing">
                  {{ isPushing ? 'TRANSMITTING...' : 'BROADCAST_UNIVERSAL_DIVIDEND' }}
                </CButton>
              </CCard>
            </CCol>
          </CRow>
        </CTabPane>

        <CTabPane role="tabpanel" :visible="activeTab === 'clusters'">
          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded">
            <h5 class="font-black italic text-info mb-3">ACTIVE_THREADS</h5>
            <p class="tiny text-zinc-500">Sighting all geographical grounding points...</p>
          </div>
        </CTabPane>
      </CTabContent>
    </div>

    <footer class="mt-auto pt-4 text-center opacity-25 tiny">
      "I = VR² | THE LOOP IS GLOBALLY COMPLETE"
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { db, auth, rtdb } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ref as dbRef, set } from 'firebase/database';

// Template State
const isVerified = ref(false);
const isValidating = ref(false);
const isPushing = ref(false);
const activeTab = ref('dashboard');
const userId = ref(auth.currentUser?.uid);
const userPhoto = ref(auth.currentUser?.photoURL);

// Hardware Refs
const videoFeed = ref<HTMLVideoElement | null>(null);
const stream = ref<MediaStream | null>(null);

const performBiometricHandshake = async () => {
  isValidating.value = true;
  // Simulate logic gate success
  setTimeout(() => {
    isVerified.value = true;
    isValidating.value = false;
  }, 1000);
};

const loginAsMaster = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  if (result.user.email === 'imeiopic@gmail.com') {
    isVerified.value = true;
  }
};

const triggerGlobalPulse = async () => {
  isPushing.value = true;
  await set(dbRef(rtdb, 'system/pulse'), { timestamp: Date.now(), freq: '7.83Hz' });
  setTimeout(() => isPushing.value = false, 2000);
};

const lockNode = () => { isVerified.value = false; };

onUnmounted(() => {
  if (stream.value) stream.value.getTracks().forEach(t => t.stop());
});
</script>

<style scoped>
.z-max { z-index: 9999; }
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.2); }
.shadow-success { box-shadow: 0 0 30px rgba(40, 167, 69, 0.2); }
.grayscale { filter: grayscale(100%); }
.scan-line {
  position: absolute; top: 0; left: 0; width: 100%; height: 4px;
  background: #00e5ff; box-shadow: 0 0 15px #00e5ff;
  animation: scan 3s linear infinite;
}
@keyframes scan { from { top: 0%; } to { top: 100%; } }
.font-black { font-weight: 900; }
.italic { font-style: italic; }
.tiny { font-size: 0.65rem; }
</style>	