<template>
  <div class="onboarding-view-container min-vh-100 d-flex align-items-center justify-content-center">
    <div class="modal-dialog modal-dialog-centered" style="max-width: 400px">
      <div class="modal-content bg-black border border-info text-white p-4 shadow-info">
        
        <div v-if="onboardingStep === 1" class="text-center py-4">
          <i class="bi bi-person-bounding-box text-info display-1 mb-3"></i>
          <h4 class="italic font-black">SIGHTING_REQUIRED</h4>
          <p class="font-mono small text-zinc-400">Position your face in the frame to ground your identity node.</p>
          <button class="btn btn-info w-100 py-3 font-black mt-3" :disabled="loading" @click="initCamera">
            {{ loading ? 'INITIALIZING...' : 'INITIALIZE_CAMERA' }}
          </button>
        </div>

        <div v-if="onboardingStep === 2" class="text-center">
          <div class="camera-wrap mx-auto mb-3 position-relative rounded-circle border border-info overflow-hidden shadow-info" style="width: 280px; height: 280px">
            <video ref="videoFeed" autoplay playsinline class="w-100 h-100 object-cover grayscale" style="transform: scaleX(-1)"></video>
            <div class="scan-line"></div>
          </div>
          <button class="btn btn-info w-100 py-3 font-black" :disabled="loading" @click="captureAndSighting">
            {{ loading ? 'ENCODING...' : 'CAPTURE_01_IMG' }}
          </button>
        </div>

        <div v-if="onboardingStep === 3" class="py-5 text-center">
          <div class="spinner-border text-info mb-3"></div>
          <p class="font-mono italic">SYNCING_WITH_CLUSTER_BUS...</p>
        </div>

        <div v-if="onboardingStep === 4" class="py-4">
          <h4 class="text-center italic font-black uppercase">IDENTITY_GROUNDING</h4>
          <div class="mb-3 mt-4">
            <label class="font-mono extra-tiny text-zinc-500">INPUT FULL LEGAL NAME</label>
            <input v-model="fullName" type="text" class="form-control bg-transparent border-info text-white font-mono" placeholder="Real-World Identity" />
          </div>
          <button class="btn btn-info w-100 py-3 font-black" :disabled="!fullName || loading" @click="groundIdentity">
            {{ loading ? 'GROUNDING...' : 'GROUND_IDENTITY' }}
          </button>
        </div>

        <MeshConnection v-if="onboardingStep === 5" :user-id="authStore.currentUser?.uid" @finalize="handleFinalize" />

        <button type="button" class="btn btn-link text-zinc-700 mt-2 extra-tiny" @click="abortOnboarding">ABORT_SIGHTING</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MeshConnection from '@/components/onboarding/MeshConnection.vue';
import { useAuthStore } from '@stores/authStore';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadString } from 'firebase/storage';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../firebase';
import { useError } from '../useError';
import { getMyLocation } from '../utils/getMyLocation';

const authStore = useAuthStore();
const { reportError } = useError();
const router = useRouter();

const onboardingStep = ref(1);
const loading = ref(false);
const videoFeed = ref<HTMLVideoElement | null>(null);
const stream = ref<MediaStream | null>(null);
const fullName = ref('');

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
};

const initCamera = async () => {
  loading.value = true;
  try {
    onboardingStep.value = 2;
    await nextTick();
    stream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    if (videoFeed.value) videoFeed.value.srcObject = stream.value;
  } catch (err) {
    reportError('Biometric Sighting Denied: Camera Access Required');
    onboardingStep.value = 1;
  } finally {
    loading.value = false;
  }
};

const captureAndSighting = async () => {
  if (!videoFeed.value) return;
  loading.value = true;
  
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  canvas.getContext('2d')?.drawImage(videoFeed.value, 0, 0, 600, 600);
  const imageData = canvas.toDataURL('image/jpeg');
  
  stopCamera();
  onboardingStep.value = 3;

  try {
    const fileRef = storageRef(getStorage(), `users/${authStore.currentUser?.uid}/01.img`);
    await uploadString(fileRef, imageData, 'data_url');
    setTimeout(() => { onboardingStep.value = 4; }, 1000);
  } catch (error) {
    reportError('Sighting Failure: Storage Bus Disconnected');
    onboardingStep.value = 1;
  } finally {
    loading.value = false;
  }
};

const groundIdentity = async () => {
  if (!authStore.currentUser?.uid || !fullName.value) return;
  loading.value = true;
  try {
    const location = await getMyLocation();
    await updateDoc(doc(db, 'users', authStore.currentUser.uid), {
      fullName: fullName.value,
      biometricVerified: true,
      lastSighting: serverTimestamp(),
      status: 'Grounded_Node'
    });
    onboardingStep.value = 5;
  } catch (err) {
    reportError('Grounding Fracture: Location Sighting Required');
  } finally {
    loading.value = false;
  }
};

const abortOnboarding = () => {
  stopCamera();
  router.push('/');
};

const handleFinalize = () => router.push('/');

onUnmounted(stopCamera);
</script>
<style scoped>
.onboarding-view-container {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.98);
  z-index: 1000; /* Ensure it's above other content */
}
/* Re-add any specific styles that were removed from App.vue if they are only for this modal */
.shadow-info {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.15);
}
.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: #00e5ff;
  top: 0;
  animation: scan 3s linear infinite;
  box-shadow: 0 0 15px #00e5ff;
}
@keyframes scan {
  from {
    top: 0;
  }
  to {
    top: 100%;
  }
}
.grayscale {
  filter: grayscale(100%) contrast(120%);
}
.font-mono {
  font-family: 'Space Mono', monospace;
}
.font-black {
  font-weight: 900;
}
.italic {
  font-style: italic;
}
.tiny {
  font-size: 0.65rem;
}
.extra-tiny {
  font-size: 0.5rem;
}
.bg-zinc-950 {
  background-color: #050505;
}
.bg-zinc-900 {
  background-color: #18181b;
} /* Assuming this was the intent for bg-zinc-900 */
</style>
