<template>
  <CContainer
    fluid
    class="home-substrate p-0 bg-black min-vh-100 overflow-hidden font-mono text-white d-flex align-items-center justify-content-center"
  >
    <ZoomEarthToMe 
      v-if="isZooming"
      :target-coords="[currentCoords.lat, currentCoords.lng]"
      :cluster-id="currentNodeId"
      @zoom-complete="handleZoomComplete"
    />

    <WelcomeShield v-if="showWelcomeShield" @initialized="handleWelcomeShieldInitialized" />

    <transition name="fade">
      <div
        v-if="isLoading"
        class="loading-overlay fixed-inset z-max bg-black d-flex flex-column align-items-center justify-content-center"
      >
        <div class="glitch-logo mb-4">
          <img src="/images/iologo.png" alt="IOPIC" width="120" class="img-fluid" />
        </div>
        <div class="boot-sequence tiny text-info">
          <div v-for="(line, i) in bootLines" :key="i" class="mb-1">{{ line }}</div>
        </div>
        <CSpinner color="info" size="sm" class="mt-4" />
      </div>
    </transition>

    <div v-if="!isLoading" class="portal-manifest animate-in text-center">
      <div class="hero-section mb-5">
        <h1 class="text-glow text-info italic font-black display-1 mb-0">IOPIC</h1>
        <p class="tiny tracking-widest text-zinc-500 uppercase mt-n2">The 16-Thread Reality Manifest</p>
      </div>

      <div class="action-grid d-flex flex-column gap-3 mx-auto" style="max-width: 350px">
        <CButton
          v-if="!showWelcomeShield"
          color="info"
          variant="outline"
          class="py-3 font-black italic shadow-glow"
          @click="initiateGrounding"
        >
          <i class="bi bi-shield-check me-2"></i>INITIATE_GROUNDING
        </CButton>

        <CButton v-for="action in navActions" :key="action.label"
          color="info"
          variant="outline"
          class="py-3 font-black italic shadow-glow"
          @click="router.push(action.route)"
        >
          <i :class="['bi', action.icon, 'me-2']"></i>{{ action.label }}
        </CButton>

        <CButton color="dark" class="py-2 border-zinc-800 tiny font-black text-zinc-500" @click="router.push('/manifesto')">
          READ_THE_16-THREAD_MANIFESTO
        </CButton>
      </div>

      <div class="fixed-bottom p-4 d-flex justify-content-between align-items-end pointer-events-none">
        <div class="status-left text-start pointer-events-auto">
          <div class="tiny text-zinc-600 uppercase">System_State</div>
          <div class="small font-black text-success">ACTIVE_1101</div>
          <div class="tiny text-zinc-600 uppercase mt-2">Sighting_Origin</div>
          <div class="small font-black text-info">{{ currentCountry }}</div>
        </div>
        <div class="status-right text-end pointer-events-auto">
          <div class="tiny text-zinc-600 uppercase">Activation_Date</div>
          <div class="small font-black text-info">MAY_01_2026</div>
        </div>
      </div>
    </div>

    <div class="atmosphere position-absolute inset-0 z-min pointer-events-none">
      <div class="scan-line-home"></div>
      <div class="pulse-ring"></div>
    </div>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { getMyLocation } from '../utils/getMyLocation';
import WelcomeShield from '../components/WelcomeShield.vue';
import ZoomEarthToMe from '../components/ZoomEarthToMe.vue';

const router = useRouter();
const authStore = useAuthStore();

// UI State
const showWelcomeShield = ref(true);
const isLoading = ref(true);
const isZooming = ref(false);
const bootLines = ref<string[]>([]);
let bootInterval: ReturnType<typeof setInterval>;

const currentCoords = ref({ lat: 41.81, lng: -87.62 });
const currentCountry = ref('USA');
const currentNodeId = ref('Anonymous_Node');

const navActions = [
  { label: 'ENTER_PEER_MODE', route: '/peer', icon: 'bi-people' },
  { label: 'VIEW_ENTITY_MENU', route: '/entity-menu', icon: 'bi-list-ul' },
  { label: 'PLACE_NEW_ORDER', route: '/place-order', icon: 'bi-cart-plus' },
  { label: 'TRACK_ACTIVE_ORDER', route: '/track-order', icon: 'bi-geo-alt' },
  { label: 'PAY_IO$', route: '/pay-io', icon: 'bi-wallet2' },
];

const handleWelcomeShieldInitialized = () => { showWelcomeShield.value = false; };

const startBoot = () => {
  const sequence = [
    'SIGHTING: 16-Thread Bus Initialized...',
    'PROTOCOL: 1101 Synchronizing...',
    'RESONANCE: 7.83Hz Locked...',
    'EQUITY: 1.2Q TPE Sighted...',
    'STATUS: The Noise has Stopped.'
  ];
  let count = 0;
  bootInterval = setInterval(() => {
    if (count < sequence.length) {
      bootLines.value.push(sequence[count++]);
    } else {
      clearInterval(bootInterval);
      setTimeout(() => { isLoading.value = false; }, 500);
    }
  }, 400);
};

const initiateGrounding = () => { isZooming.value = true; };

const handleZoomComplete = () => {
  isZooming.value = false;
  router.push(authStore.currentUser ? '/virtual' : '/onboarding');
};

onMounted(() => {
  startBoot();
  getMyLocation().then((loc) => { currentCoords.value = { lat: loc.lat, lng: loc.lng }; }).catch(() => {});
});

onUnmounted(() => {
  if (bootInterval) clearInterval(bootInterval);
});
</script>
<style scoped>
.home-substrate {
  background: radial-gradient(circle at center, #0a0a0a 0%, #000 100%);
}
.text-glow {
  text-shadow: 0 0 25px rgba(0, 229, 255, 0.6);
}
.shadow-glow {
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.2) !important;
}
.z-max {
  z-index: 1000;
}
.z-min {
  z-index: 1;
}
.fixed-inset {
  position: fixed;
  inset: 0;
}
.tracking-widest {
  letter-spacing: 0.5em;
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

/* ANIMATIONS */
.animate-in {
  animation: fadeInUp 1s ease-out;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.glitch-logo {
  animation: glitch 2s infinite;
}
@keyframes glitch {
  0%,
  100% {
    transform: scale(1);
    filter: hue-rotate(0deg);
  }
  50% {
    transform: scale(1.05);
    filter: hue-rotate(180deg) blur(1px);
  }
}

.scan-line-home {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 229, 255, 0.02) 50%);
  background-size: 100% 4px;
  pointer-events: none;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1px;
  height: 1px;
  background: rgba(0, 229, 255, 0.2);
  box-shadow: 0 0 100px 50px rgba(0, 229, 255, 0.1);
  border-radius: 50%;
  animation: pulse-ring 4s infinite;
}
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1000);
    opacity: 0;
  }
}
</style>