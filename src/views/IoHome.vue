<template>
  <CContainer
    fluid
    class="home-substrate p-0 bg-black min-vh-100 overflow-hidden font-mono text-white d-flex align-items-center justify-content-center"
  >
    <!-- Cinematic Transition Layer -->
    <ZoomEarthToMe 
      v-if="isZooming"
      :targetCoords="[currentCoords.lat, currentCoords.lng]"
      :clusterId="currentNodeId"
      @zoom-complete="handleZoomComplete"
    />

    <!-- WelcomeShield component, shown initially and dismissed by user action -->
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
        <p class="tiny tracking-widest text-zinc-500 uppercase mt-n2">
          The 16-Thread Reality Manifest
        </p>
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

        <!-- New button for Peer Mode -->
        <CButton
          color="info"
          variant="outline"
          class="py-3 font-black italic shadow-glow"
          @click="router.push('/peer')"
        >
          <i class="bi bi-people me-2"></i>ENTER_PEER_MODE
        </CButton>

        <!-- New functionality buttons for entity interaction -->
        <!-- These buttons will navigate to dedicated views for each function -->
        <CButton
          color="info"
          variant="outline"
          class="py-3 font-black italic shadow-glow"
          @click="router.push('/entity-menu')"
        >
          <i class="bi bi-list-ul me-2"></i>VIEW_ENTITY_MENU
        </CButton>

        <CButton
          color="info"
          variant="outline"
          class="py-3 font-black italic shadow-glow"
          @click="router.push('/place-order')"
        >
          <i class="bi bi-cart-plus me-2"></i>PLACE_NEW_ORDER
        </CButton>

        <CButton
          color="info"
          variant="outline"
          class="py-3 font-black italic shadow-glow"
          @click="router.push('/track-order')"
        >
          <i class="bi bi-geo-alt me-2"></i>TRACK_ACTIVE_ORDER
        </CButton>

        <CButton
          color="info"
          variant="outline"
          class="py-3 font-black italic shadow-glow"
          @click="router.push('/pay-io')"
        >
          <i class="bi bi-wallet2 me-2"></i>PAY_IO$
        </CButton>

        <CButton
          color="dark"
          class="py-2 border-zinc-800 tiny font-black text-zinc-500"
          @click="router.push('/manifesto')"
        >
          READ_THE_16-THREAD_MANIFESTO
        </CButton>
      </div>

      <div
        class="fixed-bottom p-4 d-flex justify-content-between align-items-end pointer-events-none"
      >
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
import WelcomeShield from '@/components/mesh/WelcomeShield.vue';
import ZoomEarthToMe from '@/components/spatial/ZoomEarthToMe.vue';
import { auth } from '@/firebase';
import { getMyLocation } from '@/utils/getMyLocation';
import { useAuthStore } from '@stores/authStore';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const showWelcomeShield = ref(true); // Control visibility of the WelcomeShield
const router = useRouter();
const isLoading = ref(true);
const isZooming = ref(false);
const currentCoords = ref({ lat: 41.81, lng: -87.62 }); // Default coordinates
const currentCountry = ref('USA'); // Default country
const currentNodeId = ref('Anonymous_Node');
const bootLines = ref<string[]>([]);
const authStore = useAuthStore();

const handleWelcomeShieldInitialized = () => {
  showWelcomeShield.value = false;
};

const rawBootSequence = [
  'SIGHTING: 16-Thread Bus Initialized...',
  'PROTOCOL: 1101 Synchronizing...',
  'RESONANCE: 7.83Hz Locked...',
  'EQUITY: 1.2Q TPE Sighted...',
  'STATUS: The Noise has Stopped.'
];

/**
 * 01_BOOT_SEQUENCE_SIMULATION
 */
const startBoot = () => {
  let count = 0;
  const interval = setInterval(() => {
    if (count < rawBootSequence.length) {
      bootLines.value.push(rawBootSequence[count]);
      count++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        isLoading.value = false;
        // After boot sequence, if the shield is still active, show it.
        // Otherwise, if it was already dismissed (e.g., by direct URL access), proceed.
      }, 500); // Reduced timeout for quicker transition to shield or main content
    }
  }, 400);
};

/**
 * 02_INITIATE_GROUNDING
 * Checks if the entity is already sighted; if not, transits to Onboarding
 */
const initiateGrounding = () => {
  isZooming.value = true;
};

/**
 * Executes actual navigation after the zoom sequence completes
 */
const handleZoomComplete = () => {
  isZooming.value = false;
  if (authStore.currentUser) {
    router.push('/virtual');
  } else {
    router.push('/onboarding');
  }
};

onMounted(() => {
  startBoot();

  // Pre-fetch geolocation for the zoom sequence
  getMyLocation()
    .then((location) => {
      currentCoords.value = { lat: location.lat, lng: location.lng };
      currentCountry.value = location.country;
    })
    .catch(() => {
      // Keep default coordinates if location fails
    });
  }

  if (auth.currentUser) {
    currentNodeId.value = auth.currentUser.uid;
  }
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