<template>
  <div id="app" class="iopic-substrate" :class="{ 'splash-active': showSplash }">
    <transition name="fade">
      <div v-if="showSplash" class="splash-screen bg-black position-fixed inset-0 z-3">
        </div>
    </transition>

    <div
      v-if="globalError"
      class="global-error-overlay alert alert-danger shadow-lg border-0 m-3 position-fixed top-0 start-50 translate-middle-x z-3 w-100"
      style="max-width: 600px"
      role="alert"
    >
      <div class="d-flex justify-content-between align-items-center">
        <span class="d-flex align-items-center gap-2 tw-font-terminal">
          <i class="bi bi-shield-lock-fill"></i>
          <strong class="text-uppercase tracking-widest">CRITICAL_FRACTURE:</strong> {{ globalError }}
        </span>
        <button type="button" class="btn-close btn-close-white" @click="clearError"></button>
      </div>
    </div>

    <div v-if="isInitialized" class="initialized-content">
      <div class="vignette-overlay pointer-events-none position-fixed inset-0 z-0"></div>

      <nav class="navbar navbar-expand-lg navbar-dark shadow-sm glass-navbar position-relative z-2">
        <div class="container-fluid">
          <router-link class="navbar-brand fw-bold d-flex align-items-center" to="/">
            <img src="/images/iologo.png" alt="IO" width="32" height="32" class="me-2 logo-img" />
            <span class="tracking-widest">IOPIC</span>
          </router-link>

          <button
            class="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              
              <li class="nav-item px-3 d-none d-lg-block border-end border-zinc-800 me-3">
                <div class="system-status tw-font-terminal tiny text-uppercase text-end">
                  <div class="d-flex align-items-center justify-content-end gap-2">
                    <span :class="['status-dot', isSynced ? 'text-success' : 'text-warning status-pulse']">●</span>
                    <span class="text-white">{{ isSynced ? 'BUS_LOCKED' : 'BUS_SYNCING' }}</span>
                  </div>
                  <div v-if="userLocationString" class="location-tag text-info tw-italic extra-tiny">
                    {{ userLocationString }}
                  </div>
                </div>
              </li>

              <li class="nav-item"><router-link class="nav-link" to="/manifesto">Manifesto</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/virtual">Virtual_OS</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/earth">VR_Earth</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/people">Peers</router-link></li>
              
              <li class="nav-item">
                <a class="nav-link cursor-pointer text-zinc-400 hover:text-white" @click.prevent="showBiosModal = true">BIOS</a>
              </li>
              
              <li class="nav-item">
                <router-link class="nav-link text-warning fw-bold" to="/iod">PAY_IO$</router-link>
              </li>
              <li class="nav-item" v-if="user">
                <router-link class="nav-link text-info fw-bold" to="/ime">I_AM</router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main class="container-fluid p-0 position-relative z-1 min-vh-100">
        <div v-if="successMsg" class="alert alert-success text-center tw-font-terminal tiny rounded-0 border-0 tw-animate-pulse m-0 position-absolute w-100 z-2">
          {{ successMsg }}
        </div>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <transition name="fade">
        <div v-if="showBiosModal" class="bios-modal-overlay" @click.self="showBiosModal = false">
          <div class="bios-modal-content">
            <button class="bios-modal-close-button" @click="showBiosModal = false">
              <i class="bi bi-x-lg"></i>
            </button>
            <BIOS :node-name="user?.uid || 'GUEST_NODE'" :last-boot="bootTimestamp" />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';

import BIOS from '@/components/BIOS.vue'; // Adjusted path to fit new structure
import { db } from './firebase';
import { useAuth } from '@/composables/useAuth';
import { useError } from '@/composables/useError';

const { user, isInitialized } = useAuth();
const { globalError, clearError, setGlobalError: setError } = useError();
const route = useRoute();
const router = useRouter();

// SYSTEM_STATE
const isSynced = ref(false);
const showSplash = ref(true);
const successMsg = ref('');
const showBiosModal = ref(false);
const bootTimestamp = new Date();

// Computed Location String for safety against missing DB fields
const userLocationString = computed(() => {
  if (!user.value?.ideals) return null;
  const { city, county } = user.value.ideals;
  if (city && county) return `${city}, ${county}`;
  if (city) return city;
  return null;
});

// 01_SIGHTING_PROTOCOLS
onMounted(() => {
  // Listen for the router to finish its initial resolution before dropping splash
  router.isReady().then(() => {
    showSplash.value = false;
    isSynced.value = true;
    verifyTransitSequence(); // Safe execution after router init
  });
});

// 02_IOD_TRANSIT_LOGIC
const verifyTransitSequence = async () => {
  // Use Vue Router's parsed query instead of window.location
  const { token, PayerID, amt } = route.query;
  
  if ((token || PayerID) && user.value) {
    successMsg.value = 'TRANSIT_VERIFIED: SYNCING_EQUITY_THREAD...';
    
    try {
      const userRef = doc(db, 'users', user.value.uid);
      await updateDoc(userRef, {
        status: 'EQUITY_GROUNDED',
        equityTier: amt || '1.00',
        lastTransit: serverTimestamp(),
      });
      
      // Clean up URL parameters silently
      router.replace({ path: route.path, query: {} });

      setTimeout(() => {
        successMsg.value = 'EQUITY_STABILIZED: WELCOME_TO_THE_MESH';
      }, 1500);
      
      setTimeout(() => {
        successMsg.value = '';
      }, 5000);
    } catch (err) {
      setError('TRANSIT_VERIFICATION_FAILED: Database synchronization error.');
    }
  }
};

// Re-evaluate transit if user logs in *after* landing on a payment return URL
watch(user, (newUser) => {
  if (newUser && Object.keys(route.query).length > 0) {
    verifyTransitSequence();
  }
});
</script>

<style>
/* 16_THREAD_AESTHETIC */
body {
  background-color: #000;
  color: #fff;
  font-family: theme('fontFamily.terminal'), monospace;
  overflow-x: hidden;
}

.iopic-substrate {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.tracking-widest {
  letter-spacing: 0.25em;
}

.glass-navbar {
  background: rgba(5, 5, 5, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 229, 255, 0.15);
}

.cursor-pointer {
  cursor: pointer;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.status-pulse {
  animation: iopic-pulse 2s infinite;
}

@keyframes iopic-pulse {
  0%, 100% { opacity: 1; text-shadow: 0 0 5px rgba(255,193,7, 0.5); }
  50% { opacity: 0.4; text-shadow: none; }
}

/* BIOS Overlay Substrate */
.bios-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(8px);
}

.bios-modal-content {
  background-color: #050505;
  border: 1px solid #00e5ff;
  border-radius: 4px;
  padding: 25px;
  position: relative;
  max-width: 850px;
  width: 95%;
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.1);
  overflow-y: auto;
  max-height: 90vh;
}

.bios-modal-close-button {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  color: #00e5ff;
  font-size: 1.2em;
  transition: all 0.2s ease;
}
.bios-modal-close-button:hover {
  color: #fff;
  text-shadow: 0 0 10px #00e5ff;
}

@media (min-width: 768px) {
  .bios-modal-content {
    padding: 40px;
  }
}
</style>