<template>
  <div class="onboarding-terminal">
    <header class="onboarding-header">
      <h2 class="text-glow">NODE ONBOARDING: PHASE 1</h2>
      <p>Initializing Sovereign Identity for the Virtually Real Era</p>
    </header>

    <div class="progress-bus">
      <div
        v-for="step in 5"
        :key="step"
        class="bus-bit"
        :class="{ active: currentStep >= step }"
      ></div>
    </div>

    <section v-if="currentStep === 1" class="step-container">
      <h3>01: VISUAL SYMMETRY</h3>
      <div class="biometric-capture face-scan">
        <video ref="video" autoplay playsinline class="camera-feed"></video>
        <div class="scan-overlay"></div>
        <div v-if="faceImageUrl" style="margin-top: 1rem">
          <img
            :src="faceImageUrl"
            alt="Face Preview"
            style="max-width: 100%; border: 2px solid #00ff41"
          />
        </div>
      </div>
      <button @click="captureFace" class="action-btn">SCAN FACE</button>
    </section>

    <section v-if="currentStep === 2" class="step-container">
      <h3>02: SONIC GROUNDING</h3>
      <p>Please state: "I am a Sovereign Node of the 16-Thread Reality."</p>
      <div class="voice-viz">
        <div
          v-for="i in 12"
          :key="i"
          class="voice-bar"
          :style="{ height: vol + '%' }"
        ></div>
      </div>
      <div v-if="voiceUrl" style="margin: 1rem 0">
        <audio :src="voiceUrl" controls></audio>
      </div>
      <button @click="captureVoice" class="action-btn">CALIBRATE VOICE</button>
    </section>

    <section v-if="currentStep === 3" class="step-container">
      <h3>03: KINETIC LOCK</h3>
      <div class="fingerprint-zone" @click="captureFingerprint">
        <div class="print-icon">☝️</div>
        <p v-if="supportsTouch">Place finger on sensor to ground identity</p>
        <p v-else>
          Device does not support kinetic lock. Proceeding via Multi-Factor...
        </p>
      </div>
    </section>

    <section v-if="currentStep === 4" class="step-container">
      <h3>04: CONTACT MESH SYNC</h3>
      <p>Connecting your Node to its Coordinate Peers...</p>
      <div class="contact-list">
        <div v-for="peer in detectedPeers" :key="peer.id" class="peer-item">
          <span>{{ peer.name }}</span>
          <button class="connect-btn">FORM BOND</button>
        </div>
      </div>
      <button @click="finalizeOnboarding" class="finalize-btn">
        ACKNOLDGECLEAR
      </button>
      <DnaContractModal v-if="showDnaModal" @close="showDnaModal = false" />
    </section>
  </div>
</template>

<script setup>
import DnaContractModal from "./DnaContractModal.vue";
import { ref, onMounted, watch } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { joinContactMesh, leaveContactMesh } from "./IopicContactMesh.ts";
import { doc, setDoc } from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const currentStep = ref(1);
const supportsTouch = ref("ontouchstart" in window);
const vol = ref(20);
const detectedPeers = ref([]);
const faceImageUrl = ref("");
const voiceUrl = ref("");
let meshUnsub = null;
let userId = null;
let displayName = null;
let mediaRecorder = null;
let audioChunks = [];

// Step Logics
const captureFace = async () => {
  const video = document.querySelector(".camera-feed");
  if (!video) return;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/png");
  faceImageUrl.value = dataUrl;
  // Upload to Firebase Storage
  if (userId) {
    const storage = getStorage();
    const imgRef = storageRef(storage, `onboarding/${userId}/face.png`);
    const blob = await (await fetch(dataUrl)).blob();
    await uploadBytes(imgRef, blob);
    faceImageUrl.value = await getDownloadURL(imgRef);
  }
  currentStep.value = 2;
};

const startVoiceRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioChunks = [];
  mediaRecorder = new window.MediaRecorder(stream);
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    voiceUrl.value = URL.createObjectURL(audioBlob);
    // Upload to Firebase Storage
    if (userId) {
      const storage = getStorage();
      const audioRef = storageRef(storage, `onboarding/${userId}/voice.webm`);
      await uploadBytes(audioRef, audioBlob);
      voiceUrl.value = await getDownloadURL(audioRef);
    }
  };
  mediaRecorder.start();
};

const stopVoiceRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
};

const captureVoice = () => {
  stopVoiceRecording();
  currentStep.value = 3;
};

const captureFingerprint = () => {
  currentStep.value = 4;
};

const showDnaModal = ref(false);
const finalizeOnboarding = async () => {
  if (meshUnsub && userId) {
    leaveContactMesh(userId);
    meshUnsub();
  }
  // Set onboarding flag in Firestore
  if (userId) {
    const profileRef = doc(db, "users", userId, "profile", "main");
    await setDoc(profileRef, { onboarded: true }, { merge: true });
  }
  showDnaModal.value = true;
};

// Peer discovery integration & start/stop media
watch(currentStep, (step, prev) => {
  if (step === 1 && prev !== 1) {
    // Start webcam
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const video = document.querySelector(".camera-feed");
      if (video) video.srcObject = stream;
    });
  }
  if (step === 2 && prev !== 2) {
    // Stop webcam
    const video = document.querySelector(".camera-feed");
    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      video.srcObject = null;
    }
    // Start voice recording
    startVoiceRecording();
  }
  if (step === 3 && prev !== 3) {
    // Stop voice recording
    stopVoiceRecording();
  }
  if (step === 4 && userId) {
    meshUnsub = joinContactMesh(userId, displayName, (peers) => {
      detectedPeers.value = peers;
    });
  } else if (step !== 4 && meshUnsub) {
    meshUnsub();
    meshUnsub = null;
  }
});

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId = user.uid;
      displayName = user.displayName || "Sovereign Node";
    }
  });
});
</script>

<style scoped>
.onboarding-terminal {
  background: #000;
  color: #00ff41;
  padding: 2rem;
  font-family: "Courier New", monospace;
  border: 1px solid #00ff41;
  max-width: 500px;
  margin: auto;
}
.progress-bus {
  display: flex;
  gap: 10px;
  margin: 1.5rem 0;
}
.bus-bit {
  height: 6px;
  flex: 1;
  background: #1a1a1a;
  border: 1px solid #333;
}
.bus-bit.active {
  background: #00ff41;
  box-shadow: 0 0 10px #00ff41;
}
.biometric-capture {
  width: 100%;
  height: 250px;
  background: #111;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}
.camera-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(0, 255, 65, 0.5);
  box-sizing: border-box;
  animation: scan 2s infinite;
}
.voice-viz {
  display: flex;
  gap: 5px;
  height: 50px;
  align-items: center;
  justify-content: center;
}
.voice-bar {
  width: 10px;
  background: #00ff41;
  transition: height 0.1s;
}
.action-btn,
.finalize-btn {
  width: 100%;
  padding: 1rem;
  background: #00ff41;
  color: #000;
  border: none;
  font-weight: bold;
  margin-top: 1rem;
  cursor: pointer;
}
@keyframes scan {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}
</style>
