<template>
  <div class="home-page">
    <div class="vignette-overlay"></div>

    <nav class="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm glass-navbar">
      <div class="container">
        <CTooltip content="Return to IO Home" placement="bottom">
          <router-link class="navbar-brand fw-bold d-flex align-items-center" to="/">
            <img :src="ioLogo" alt="IO Logo" width="32" height="32" class="me-2 logo-img" />
            IOPIC
          </router-link>
        </CTooltip>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="nav nav-tabs border-0 mx-auto justify-content-center mb-2 mb-lg-0">
            <CDropdown variant="nav-item" :popper="true">
              <CDropdownToggle
                class="nav-link"
                style="cursor: pointer"
                :class="{ active: route.path === '/' }"
              >
                Home
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem @click="router.push('/')">IO Home</CDropdownItem>
                <CDropdownItem @click="router.push('/io-org')">IO.org Substrate</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
            <li class="nav-item">
              <router-link class="nav-link" to="/manifesto">Manifesto</router-link>
            </li>
            <li class="nav-item" v-if="user">
              <router-link class="nav-link" to="/peers">My Peers</router-link>
            </li>
            <li class="nav-item d-none d-md-flex align-items-center px-2">
              <div class="system-status font-monospace tiny text-uppercase">
                <span
                  :class="['status-dot', isSynced ? 'text-success' : 'text-warning status-pulse']"
                  >●</span
                >
                <span class="ms-1">{{ isSynced ? 'Bus: Synced' : 'Bus: Syncing' }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="container text-center py-5 position-relative z-1">
      <div class="global-counter my-5">
        <div
          class="d-inline-block p-4 border border-emerald-500/30 bg-zinc-900/50 rounded-3xl backdrop-blur-md"
        >
          <p class="text-zinc-500 font-mono tiny mb-0 uppercase tracking-widest">
            GLOBAL_NODES_SIGHTED
          </p>
          <div class="d-flex align-items-center justify-content-center gap-3">
            <span class="display-3 font-black italic text-white">{{ formattedNodeCount }}</span>
            <div class="pulse-ring bg-emerald-500"></div>
          </div>
          <p class="text-emerald-500 font-mono tiny mt-2 mb-0">
            TRANSIT_VELOCITY: 16_THREADS_SYNCED
          </p>
        </div>
      </div>

      <div class="quick-links my-4 d-flex flex-wrap gap-3 justify-content-center">
        <router-link class="btn btn-outline-primary" to="/io-org">IO.org Substrate</router-link>
        <router-link class="btn btn-outline-primary" to="/logical-truth">Logical Truth</router-link>
        <router-link class="btn btn-success" to="/it">Logical Digital Real IT</router-link>
        <button class="btn btn-warning fw-bold" @click="show16ThreadStory = true">
          THE 16-THREAD REALITY: The Day the Noise Stopped
        </button>
      </div>
    </main>

    <div
      v-if="onboardingStep > 0"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.9)"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark border border-emerald-500 text-white p-4">
          <div class="text-center">
            <h3 class="italic font-black uppercase">Sovereign_Onboarding</h3>
            <p class="text-zinc-500 font-mono tiny">01.INITIALIZATION // FACE-ID SIGHTING</p>
          </div>

          <div v-if="onboardingStep === 1" class="step-1 text-center py-4">
            <i class="bi bi-person-bounding-box text-emerald-500 display-1"></i>
            <p class="mt-3 font-mono">
              Position your face in the frame to ground your identity node.
            </p>
            <button class="btn btn-primary w-100 py-3" @click="initCamera">
              Initialize Camera
            </button>
          </div>

          <div v-if="onboardingStep === 2" class="step-2 py-4 text-center">
            <div
              class="camera-wrap mx-auto mb-3 position-relative rounded-circle border border-emerald-500 overflow-hidden"
              style="width: 280px; height: 280px"
            >
              <video
                ref="videoFeed"
                autoplay
                playsinline
                class="w-100 h-100 object-cover grayscale"
              ></video>
              <div class="scan-line"></div>
            </div>
            <canvas ref="captureCanvas" width="600" height="600" class="d-none"></canvas>
            <button class="btn btn-success w-100 py-3 font-black" @click="captureAndSighting">
              SIGHT_IDENTITY (01.img)
            </button>
          </div>

          <div v-if="onboardingStep === 3" class="step-3 py-5 text-center">
            <div class="spinner-border text-emerald-500 mb-3"></div>
            <p class="font-mono italic">SYNCING_WITH_CLEVELAND_CLUSTER...</p>
          </div>

          <button type="button" class="btn btn-link text-zinc-500 mt-3" @click="abortOnboarding">
            Abort_Protocol
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadString } from 'firebase/storage';
import { useAuth } from './useAuth';
import { useRouter, useRoute } from 'vue-router';
// @ts-ignore
import ioLogo from './assets/images/icon.png';
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CTooltip } from '@coreui/vue';

const { user, logout: authLogout } = useAuth();
const router = useRouter();
const route = useRoute();

const isSynced = ref(false);
const show16ThreadStory = ref(false);
const onboardingStep = ref(0);
const nodeCount = ref(849202);

// Hardware Refs
const videoFeed = ref<HTMLVideoElement | null>(null);
const captureCanvas = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);

const startOnboarding = () => {
  onboardingStep.value = 1;
};

const initCamera = async () => {
  onboardingStep.value = 2;
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    if (videoFeed.value) videoFeed.value.srcObject = stream.value;
  } catch (err) {
    alert('Camera Access Required');
    onboardingStep.value = 1;
  }
};

const captureAndSighting = async () => {
  if (!videoFeed.value || !captureCanvas.value) return;
  const context = captureCanvas.value.getContext('2d');
  context?.drawImage(videoFeed.value, 0, 0, 600, 600);
  const imageData = captureCanvas.value.toDataURL('image/jpeg');

  stopCamera();
  await performSighting(imageData);
};

const performSighting = async (imageData: string) => {
  if (!user.value?.uid) {
    onboardingStep.value = 1;
    return;
  }

  onboardingStep.value = 3;
  const storage = getStorage();
  const fileRef = storageRef(storage, `users/${user.value.uid}/01.img`);

  try {
    await uploadString(fileRef, imageData, 'data_url');
    const userRef = doc(db, 'users', user.value.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.data()?.biometricVerified) {
        unsubscribe();
        onboardingStep.value = 0;
        router.push('/peers');
      }
    });
  } catch (error) {
    onboardingStep.value = 1;
  }
};

const stopCamera = () => {
  if (stream.value) stream.value.getTracks().forEach((t) => t.stop());
};

const abortOnboarding = () => {
  stopCamera();
  onboardingStep.value = 0;
};

const logout = async () => {
  await authLogout();
  router.push('/');
};

onMounted(() => {
  const statsRef = doc(db, 'system', 'global_stats');
  onSnapshot(statsRef, (doc) => {
    if (doc.exists()) nodeCount.value = doc.data().totalNodes;
  });
  setTimeout(() => (isSynced.value = true), 1000);
});

const formattedNodeCount = computed(() => new Intl.NumberFormat().format(nodeCount.value));

onUnmounted(() => stopCamera());
</script>

<style scoped>
/* All your styles from before go here... */
.home-page {
  min-height: 100vh;
  background: url('/images/iopicworld.jpg') center center/cover no-repeat fixed;
  position: relative;
  overflow-x: hidden;
}
.vignette-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, transparent 20%, rgba(0, 0, 0, 0.8) 100%);
  pointer-events: none;
}
.glass-navbar {
  background-color: rgba(10, 10, 10, 0.7) !important;
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.scan-line {
  width: 100%;
  height: 2px;
  background: #00ff41;
  box-shadow: 0 0 15px #00ff41;
  position: absolute;
  animation: scan 2s infinite linear;
  z-index: 2;
}
@keyframes scan {
  0% {
    top: 0%;
  }
  100% {
    top: 100%;
  }
}
</style>
