<template>
  <div class="onboarding-terminal">
    <header class="onboarding-header">
      <h2 class="text-glow">NODE_INITIALIZATION: PHASE_01</h2>
      <p>Thread-4: Aligning Sovereign Identity</p>
    </header>

    <div class="progress-bus">
      <div v-for="step in 4" :key="step" class="bus-bit" :class="{ active: currentStep >= step }"></div>
    </div>

    <section v-if="currentStep === 1" class="step-container">
      <h3>01: VISUAL_SYMMETRY (3-BLINK_LOCK)</h3>
      <div class="biometric-capture">
        <video ref="videoElement" autoplay playsinline class="camera-feed"></video>
        <div class="scan-overlay"></div>
      </div>
      <button @click="captureFace" class="action-btn">SIGHT SOVEREIGN FACE</button>
    </section>

    <section v-if="currentStep === 2" class="step-container">
      <h3>02: SONIC_GROUNDING (7.83Hz)</h3>
      <p class="instruction">State: "I am a Sovereign Node of the 16-Thread Reality."</p>
      <div class="voice-viz">
        <div v-for="i in 12" :key="i" class="voice-bar" :style="{ height: vol + (i % 3 * 10) + '%' }"></div>
      </div>
      <button @click="finalizeVoice" class="action-btn">LOCK SONIC IDENTITY</button>
    </section>

    <section v-if="currentStep === 3" class="step-container">
      <h3>03: KINETIC_LOCK (GROUNDING)</h3>
      <div class="fingerprint-zone" @click="captureFingerprint">
        <div class="print-icon">☝️</div>
        <p>{{ supportsTouch ? 'Place finger on sensor to ground identity' : 'Bypass Kinetic: Multi-Factor Sighted' }}</p>
      </div>
    </section>

    <section v-if="currentStep === 4" class="step-container">
      <h3>04: CONTACT_MESH_SYNC</h3>
      <div class="contact-list">
        <div v-for="peer in detectedPeers" :key="peer.id" class="peer-item">
          <span>{{ peer.name }}</span>
          <button class="connect-btn">BOND</button>
        </div>
      </div>
      <button @click="finalizeOnboarding" class="finalize-btn">ACKNOWLEDGE_CLEAR</button>
    </section>

    <DnaContractModal v-if="showDnaModal" @close="showDnaModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const currentStep = ref(1);
const videoElement = ref(null);
const vol = ref(20);
const supportsTouch = ref("ontouchstart" in window);
const detectedPeers = ref([]);
const showDnaModal = ref(false);

let userId = null;
let stream = null;
let audioContext = null;
let analyser = null;

// --- STEP 1: FACE SIGHTING ---
const initCamera = async () => {
  await nextTick();
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  if (videoElement.value) videoElement.value.srcObject = stream;
};

const captureFace = async () => {
  const canvas = document.createElement("canvas");
  canvas.width = videoElement.value.videoWidth;
  canvas.height = videoElement.value.videoHeight;
  canvas.getContext("2d").drawImage(videoElement.value, 0, 0);
  
  const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
  if (auth.currentUser) {
    const storage = getStorage();
    const fileRef = storageRef(storage, `nodes/${auth.currentUser.uid}/face.png`);
    await uploadBytes(fileRef, blob);
  }
  
  stopStreams();
  currentStep.value = 2;
};

// --- STEP 2: SONIC SYNC ---
const initAudioViz = async () => {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  
  const updateVol = () => {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    vol.value = (data.reduce((a, b) => a + b) / data.length) * 2;
    if (currentStep.value === 2) requestAnimationFrame(updateVol);
  };
  updateVol();
};

const finalizeVoice = () => {
  stopStreams();
  currentStep.value = 3;
};

const captureFingerprint = () => {
  currentStep.value = 4;
};

const stopStreams = () => {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
};

const finalizeOnboarding = async () => {
  if (auth.currentUser) {
    await setDoc(doc(db, "users", auth.currentUser.uid), { 
      onboarded: true,
      groundedAt: new Date().toISOString()
    }, { merge: true });
  }
  showDnaModal.value = true;
};

watch(currentStep, (newStep) => {
  if (newStep === 1) initCamera();
  if (newStep === 2) initAudioViz();
});

onMounted(() => {
  onAuthStateChanged(auth, (user) => { if (user) userId = user.uid; });
  initCamera();
});
</script>