<template>
  <CContainer fluid class="onboarding-substrate bg-black min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 font-mono text-white">
    
    <transition name="slide-down">
      <div v-if="globalInviteActive" class="invite-banner p-3 mb-4 bg-info bg-opacity-10 border border-info rounded-3 shadow-glow w-100" style="max-width: 500px;">
        <div class="d-flex align-items-center gap-3 text-start">
          <i class="bi bi-broadcast text-info h3 m-0 animate-pulse"></i>
          <div>
            <p class="text-info fw-bold small m-0 uppercase italic">Inbound_Invitation_Detected</p>
            <p class="text-white tiny m-0 opacity-75">{{ globalInviteData?.message }}</p>
            <p class="text-success tiny fw-black mt-1 m-0">GUARANTEED_EQUITY: {{ globalInviteData?.bond }} IO$</p>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="step < 5" class="terminal-header mb-5 text-center">
      <img src="/images/iologo.png" alt="IOPIC" width="60" class="mb-3" />
      <h2 class="text-info font-black italic tracking-widest m-0">ENTITY_GROUNDING_V1</h2>
      <p class="tiny text-zinc-500 mt-2">SESSION_SYNC: {{ sessionId }} | STEP_0{{ step }}</p>
    </div>

    <div v-if="step === 1" class="step-content text-center animate-in w-100" style="max-width: 500px;">
      <i class="bi bi-geo-alt text-info display-4 mb-4"></i>
      <h3 class="mb-3">01_SPATIOTEMPORAL_ANCHOR</h3>
      <p class="text-zinc-400 small mb-5">Access to the 16-thread bus requires a verified physical coordinate. Bind your node to the planetary mesh.</p>
      <CButton color="info" variant="outline" size="lg" class="w-100 font-black italic" @click="anchorSpatiotemporal" :disabled="isLoading">
        <span v-if="!isLoading">EXECUTE_ANCHOR</span>
        <CSpinner v-else size="sm" />
      </CButton>
    </div>

    <div v-if="step === 2" class="step-content text-center animate-in w-100" style="max-width: 500px;">
      <div class="video-substrate mb-4 position-relative border border-info rounded-4 overflow-hidden shadow-glow bg-zinc-950">
        <video ref="videoFeed" autoplay muted playsinline class="w-100 grayscale"></video>
        <div class="scan-line"></div>
      </div>
      <h3 class="mb-2">02_BIOMETRIC_SIGHTING</h3>
      <p class="tiny text-info opacity-75 mb-4 font-mono">SIGHTING_BUFFER: ACTIVE</p>
      <CButton color="success" variant="outline" size="lg" class="w-100 font-black italic shadow-success" @click="captureBiometricKey" :disabled="isLoading">
        <span v-if="!isLoading">INITIATE_SIGHTING</span>
        <CSpinner v-else size="sm" />
      </CButton>
    </div>

    <div v-if="step === 3" class="step-content text-center animate-in w-100" style="max-width: 500px;">
      <i class="bi bi-person-plus text-info display-4 mb-4"></i>
      <h3 class="mb-3">03_INFORMING_INSTANCE</h3>
      <p class="text-zinc-400 small mb-4">Wired peer detection. Secure the 2% profit share for the Instance that informed you.</p>
      <div class="d-flex flex-column gap-3">
        <CButton color="info" variant="outline" class="py-3 font-black" @click="openScanner">SCAN_INFORMER_QR</CButton>
        <CButton color="link" class="text-zinc-600 tiny text-decoration-none" @click="skipReferral">ORGANIC_DISCOVERY (0% FEE)</CButton>
      </div>
    </div>

    <div v-if="step === 4" class="step-content text-center animate-in w-100" style="max-width: 500px;">
      <div class="equity-pulse mb-4">
        <h1 class="display-1 text-success font-black italic m-0">1,600</h1>
        <p class="text-white tracking-widest">IO$ CYCLE_BASE</p>
      </div>
      <h3 class="mb-4">04_GROUNDING_LEDGER</h3>
      <div class="progress-substrate w-100 bg-zinc-900 rounded-pill overflow-hidden" style="height: 6px;">
        <div class="progress-bar-fill bg-success h-100" :style="{ width: groundingProgress + '%' }"></div>
      </div>
      <p class="tiny text-zinc-500 mt-3 font-mono">WRITING_TO_SUBSTRATE: {{ groundingProgress }}%</p>
    </div>

    <div v-if="step === 5" class="step-content text-center animate-in w-100" style="max-width: 500px;">
      <i class="bi bi-shield-check text-success display-1 mb-4"></i>
      <h2 class="text-white font-black italic mb-2">NODE_GROUNDED</h2>
      <p class="text-info font-mono small mb-5">EQUITY_STREAM: SYNCHRONIZED</p>
      <CButton color="info" size="lg" class="px-5 font-black" @click="enterMasterControl">ENTER_MASTER_CONTROL</CButton>
    </div>

    <footer class="mt-5 pt-5 opacity-25 font-mono tiny text-center">
      "I = VR² | THE NOISE STOPS HERE"
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { getFaceDescriptor, loadFaceModels } from '@/composables/FaceAuth';
import { getGeolocation } from '@/composables/GeoTools';
import { auth, db, rtdb } from '@/firebase';
import { CButton, CContainer, CSpinner } from '@coreui/vue';
import { ref as dbRef, onValue } from 'firebase/database';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const step = ref(1);
const isLoading = ref(false);
const groundingProgress = ref(0);
const sessionId = ref(Math.random().toString(36).substring(7).toUpperCase());

// GLOBAL INVITE STATE
const globalInviteActive = ref(false);
const globalInviteData = ref<any>(null);

// HARDWARE REFS
const videoFeed = ref<HTMLVideoElement | null>(null);
const mediaStream = ref<MediaStream | null>(null);

/**
 * 00_GLOBAL_PULSE_LISTENER
 */
const listenForGlobalInvite = () => {
  onValue(dbRef(rtdb, 'system/global_invitation'), (snapshot) => {
    const data = snapshot.val();
    if (data?.active) {
      globalInviteActive.value = true;
      globalInviteData.value = data;
    } else {
      globalInviteActive.value = false;
    }
  });
};

/**
 * 01_SPATIOTEMPORAL_ANCHOR
 */
const anchorSpatiotemporal = async () => {
  isLoading.value = true;
  try {
    const coords = await getGeolocation();
    const anchor = btoa(`LAT:${coords.lat}|LNG:${coords.lng}|TIME:${Date.now()}`);
    localStorage.setItem('genesis_anchor', anchor);
    step.value = 2;
    await initCamera();
  } catch (err) {
    alert("ANCHOR_FAILED: GPS_DATA_REQUIRED");
  } finally {
    isLoading.value = false;
  }
};

/**
 * 02_BIOMETRIC_SIGHTING
 */
const initCamera = async () => {
  try {
    await loadFaceModels();
    mediaStream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    if (videoFeed.value) videoFeed.value.srcObject = mediaStream.value;
  } catch (err) {
    console.error("CAMERA_ERROR: HARDWARE_LOCK");
  }
};

const captureBiometricKey = async () => {
  if (!videoFeed.value || !auth.currentUser) return;
  isLoading.value = true;
  try {
    const descriptor = await getFaceDescriptor(videoFeed.value);
    if (descriptor) {
      localStorage.setItem('biometric_key', JSON.stringify(Array.from(descriptor)));
      stopCamera();
      step.value = 3;
    }
  } catch (err) {
    alert("SIGHTING_ERROR: FACE_RECOGNITION_FRACTURE");
  } finally {
    isLoading.value = false;
  }
};

/**
 * 03_REFERRAL_TRANSIT
 */
const openScanner = () => router.push('/scan');
const skipReferral = () => { step.value = 4; finalizeGrounding(); };

/**
 * 04_FINALIZE_GROUNDING
 */
const finalizeGrounding = async () => {
  if (!auth.currentUser) return;
  
  // Progress Simulation (Ledger Write-pacing)
  const interval = setInterval(() => {
    groundingProgress.value += 5;
    if (groundingProgress.value >= 100) {
      clearInterval(interval);
      step.value = 5;
    }
  }, 150);

  const anchor = localStorage.getItem('genesis_anchor');
  const bioKey = JSON.parse(localStorage.getItem('biometric_key') || '[]');
  const refID = sessionStorage.getItem('referrer_instance_id') || 'ORGANIC';

  // Lock the Entity into the Firestore Substrate
  await setDoc(doc(db, 'users', auth.currentUser.uid), {
    status: 'Grounded_Node',
    genesisAnchor: anchor,
    biometricKey: bioKey,
    referrerInstanceID: refID,
    onboardingDate: serverTimestamp(),
    iowb: { balance: 1600, lastPulse: Date.now() },
    role: 'PEER',
    email: auth.currentUser.email,
    phoneNumber: auth.currentUser.phoneNumber || null
  });
};

const stopCamera = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop());
    mediaStream.value = null;
  }
};

const enterMasterControl = () => router.push('/dashboard');

onMounted(() => {
  listenForGlobalInvite();
  if (!auth.currentUser) router.push('/login');
});

onUnmounted(() => stopCamera());
</script>

<style scoped>
.grayscale { filter: grayscale(100%) contrast(1.2) brightness(0.9); transform: scaleX(-1); }
.scan-line {
  position: absolute; top: 0; left: 0; width: 100%; height: 4px;
  background: #00e5ff; box-shadow: 0 0 15px #00e5ff;
  animation: scan 4s linear infinite;
}
@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.2); }
.shadow-success { box-shadow: 0 0 30px rgba(40, 167, 69, 0.3); }
.progress-bar-fill { transition: width 0.3s ease-out; }
.animate-pulse { animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* TRANSITIONS */
.slide-down-enter-active { transition: all 0.5s ease-out; }
.slide-down-enter-from { transform: translateY(-50px); opacity: 0; }
.animate-in { animation: fadeIn 0.8s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>