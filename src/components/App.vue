<template>
  <div id="app" :class="{ 'screen-shake': SPICE.triggerShake.value }" v-if="!errorStore.isChunkLoadError">
    <!-- Global Loading Overlay -->
    <div v-if="userStore.isLoadingAuth || userStore.isLoadingRole || loadingStore.isLoading" class="global-loading-overlay">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-info font-black italic">
        {{ userStore.isLoadingAuth ? 'AUTHENTICATING_SYSTEM...' : 'LOADING_USER_PROFILE...' }}
      </p>
    </div>

    <!-- Main content, only rendered when not globally loading -->
    <div v-else-if="!currentUser">
      <CContainer
        fluid
        class="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-black text-white font-mono"
      >
        <h1 class="text-glow text-info mb-5">VRE_SYSTEM_ACCESS</h1>
        <Login v-if="!showRegister" @show-register="showRegister = true" />
        <Register v-else @show-login="showRegister = false" />
      </CContainer>
    </div>
    <div v-else>
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <CContainer fluid>
          <a class="navbar-brand text-glow text-info" href="#">VRE_NETWORK</a>
          <div class="d-flex align-items-center gap-3">
            <!-- 1111_SHIELD Status Indicator -->
            <div class="d-flex align-items-center gap-1 me-3" title="SPICE.ts Global Shield Status">
              <i
                :class="[
                  'bi',
                  SPICE.isShieldActive.value
                    ? 'bi-shield-fill-check text-success'
                    : 'bi-shield-slash text-danger',
                ]"
                style="font-size: 1.1rem"
              ></i>
              <span
                :class="[
                  'fw-bold text-uppercase',
                  SPICE.isShieldActive.value ? 'text-success' : 'text-danger',
                ]"
                style="font-size: 0.65rem; letter-spacing: 0.1em"
              >
                {{ SPICE.isShieldActive.value ? 'SHIELD_ACTIVE' : 'SHIELD_OFF' }}
              </span>
            </div>
            <CButton
              color="info"
              size="sm"
              variant="outline"
              @click="handleAnonLogin"
              :disabled="isSigningIn"
            >
              <span v-if="!isSigningIn">ANON_LOGIN</span>
              <span v-else>ACCESSING_SYSTEM...</span>
              <!-- isSigningIn is for anonymous login only -->
            </CButton>
            <span class="navbar-text me-3 text-white-50">
              USER: {{ currentUser?.uid.substring(0, 8) }}... | ROLE:
              <span class="fw-bold text-info">{{ userRole || 'N/A' }}</span>
            </span>
            <CButton
              color="primary"
              size="sm"
              variant="outline"
              @click="showProfile = true"
              class="me-2"
            >
              PROFILE
            </CButton>
            <CButton
              v-if="userStore.isBuyer"
              color="info"
              size="sm"
              variant="outline"
              @click="showRider = true"
              class="me-2"
            >
              RIDER
            </CButton>
            <CButton
              v-if="userStore.isDriver"
              color="warning"
              size="sm"
              variant="outline"
              @click="showDriver = true"
              class="me-2"
            >
              DRIVER
            </CButton>
            <CButton color="danger" size="sm" @click="signOut">LOGOUT</CButton>
          </div>
        </CContainer>
      </nav>

      <div v-if="userStore.userRole === 'buyer'">
        <Buyer />
      </div>
      <div v-else-if="userStore.userRole === 'seller'">
        <Seller />
      </div>
      <div v-else-if="userStore.userRole === 'admin'">
        <Admin />
      </div>
      <div v-else-if="showProfile">
        <Profile @close-profile="showProfile = false" />
      </div>
      <div v-else-if="showRider">
        <Rider @close-rider="showRider = false" />
      </div>
      <div v-else-if="showDriver">
        <Driver @close-driver="showDriver = false" />
      </div>
      <div v-else>
        <CContainer fluid class="text-center p-5 text-white">
          <h2 class="text-warning">ACCESS_DENIED</h2>
          <p>Unknown user role or role not set. Please contact system administrator.</p>
        </CContainer>
      </div>
      <!-- Chat Modal -->
      <ChatModal
        :isVisible="showChatModal"
        :rideId="chatModalRideId"
        @close="showChatModal = false"
      />
    </div>

    <ToastNotification />

    <!-- Recovery Protocol Substrate -->
    <div v-if="SPICE.triggerShake.value" class="container pb-5">
      <ARC />
    </div>
  </div>

  <!-- Global Chunk Load Error Fallback -->
  <div v-else>
    <ChunkLoadErrorFallback />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { auth, db } from '@/firebase';
import * as Sentry from '@sentry/vue';
import { SPICE } from './SPICE';
import {
  onAuthStateChanged,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, onSnapshot, type Unsubscribe, setDoc } from 'firebase/firestore';
import Buyer from './Buyer.vue';
import Seller from './Seller.vue';
import Admin from './Admin.vue';
import Profile from './Profile.vue';
import Login from './Login.vue';
import Rider from './Rider.vue';
import Driver from './Driver.vue';
import Register from './Register.vue';
import SPICELog from './SPICELog.vue';
import ChatModal from './ChatModal.vue';
import ToastNotification from './ToastNotification.vue';
import ARC from './ARC.vue';
import ChunkLoadErrorFallback from './ChunkLoadErrorFallback.vue'; // Import the new component
import { useUserStore } from '@stores/userStore';
import { useLoadingStore } from '@stores/loadingStore';
import { useErrorStore } from '@stores/error';
import { useSuccessStore } from '@stores/success';
import { useNotificationStore } from '@stores/notificationStore';

// Activate Software Physics Global Shield to govern all outbound fetch requests
SPICE.activateGlobalShield();

const userStore = useUserStore();
const errorStore = useErrorStore();
const loadingStore = useLoadingStore();

// Local state for UI interactions not directly part of global state
const isSigningIn = ref(false); // For anonymous login button
const showRegister = ref(false); // To toggle between login and register forms
const showProfile = ref(false); // To toggle profile page visibility
const showRider = ref(false); // To toggle rider page visibility
const showChatModal = ref(false); // To control chat modal visibility
const chatModalRideId = ref<string | null>(null); // To pass rideId to chat modal
const showDriver = ref(false); // To toggle driver page visibility
const successStore = useSuccessStore(); // Initialize success store
const notificationStore = useNotificationStore(); // Initialize notification store

// Computed properties to simplify template access
const currentUser = computed(() => userStore.currentUser);
const userRole = computed(() => userStore.userRole);

onMounted(() => {
  userStore.initializeAuth(); // Initialize auth listener from the store
  
  // Sync Sentry User Context
  watch(currentUser, (user) => {
    if (user) {
      Sentry.setUser({ id: user.uid, email: user.email || undefined });
    } else {
      Sentry.setUser(null);
    }
  }, { immediate: true });
});

onUnmounted(() => {
  userStore.clearSubscriptions(); // Clear subscriptions when App component unmounts
});

const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    errorStore.clearGlobalError();
    successStore.clearSuccessMessage(); // Clear any success messages on logout
  } catch (error) {
    console.error('Error signing out:', error);
    errorStore.setGlobalError('Failed to sign out.');
  }
};

const handleAnonLogin = async () => {
  isSigningIn.value = true;
  try {
    await firebaseSignInAnonymously(auth);
    errorStore.clearGlobalError();
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    errorStore.setGlobalError('Failed to sign in anonymously.');
  } finally {
    isSigningIn.value = false;
  }
};
</script>

<style>
/* Basic global styles for App.vue */
/* Add any global styles or import your main CSS framework here */
body {
  margin: 0;
  background-color: #000; /* Ensure black background for the whole app */
}
#app {
  font-family: 'Courier New', Courier, monospace; /* Example font */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #fff;
}
.navbar {
  background-color: #1a1a1a; /* Darker background for navbar */
  border-bottom: 1px solid #333;
}
.navbar-brand.text-glow {
  text-shadow: 0 0 5px #00e5ff, 0 0 10px #00e5ff;
}
.alert-danger {
  background-color: #4a1c1c;
  color: #ffcccc;
  border: 1px solid #721c24;
  padding: 10px;
  border-radius: 5px;
}
.text-glow {
  text-shadow: 0 0 5px rgba(0, 229, 255, 0.5), 0 0 10px rgba(0, 229, 255, 0.3);
}
.shadow-glow {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.15) !important;
}
.bg-zinc-900 {
  background-color: #1a1a1a;
}
.border-info {
  border-color: #00e5ff !important;
}

/* New styles for global success toast */
.alert-success {
  background-color: #1c4a1c;
  color: #ccffcc;
  border: 1px solid #24721c;
  padding: 10px;
  border-radius: 5px;
}

/* New styles for global loading overlay */
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85); /* Dark semi-transparent background */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Ensure it's on top of everything */
  color: #fff;
}

/* Screen Shake Software Physics Manifestation */
.screen-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
    filter: drop-shadow(2px 0px 0px rgba(255, 0, 0, 0.4))
      drop-shadow(-2px 0px 0px rgba(0, 255, 255, 0.4));
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
    filter: drop-shadow(-2px 0px 0px rgba(255, 0, 0, 0.4))
      drop-shadow(2px 0px 0px rgba(0, 255, 255, 0.4));
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
    filter: drop-shadow(4px 0px 0px rgba(255, 0, 0, 0.5))
      drop-shadow(-4px 0px 0px rgba(0, 255, 255, 0.5));
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
    filter: drop-shadow(-4px 0px 0px rgba(255, 0, 0, 0.5))
      drop-shadow(4px 0px 0px rgba(0, 255, 255, 0.5));
  }
}
</style>
