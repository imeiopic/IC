<template>
  <div class="homepage">
    <nav class="homepage-nav">
      <img class="logo" src="https://iopic.world/assets/iologo-C4jQRE97.png" alt="IOPIC Logo" />
      <div class="nav-links">
        <a href="/login">Login</a>
        <a href="/signup">Sign Up</a>
        <a href="/about">About</a>
        <a href="/connections">My Connections</a>
        <a href="/io-government">IO World Government</a>
      </div>
    </nav>
    <div class="bg-layer bg-substrate"></div>
    <div class="bg-layer bg-vibration-layer" :class="{ vibrating: isAcknowledgeVibrating }">
      <div class="bg-layer bg-manifestation"></div>
      <MobiusVisualization
        :is-zooming="isZooming"
        :is-acknowledged="isIOsticAcknowledged"
        :parity="parityOrientation"
        @zoom-complete="handleZoomComplete"
      />
    </div>
    <div class="bg-layer bg-scanlines" :class="{ 'glow-active': isHoveringEnter }"></div>

    <!-- Firmware logic representation: 16-Thread Bus Diagnostic Overlay -->
    <img
      v-if="showNameInput"
      src="../assets/images/16threads.png"
      class="threads-overlay-asset"
      :class="{ 'circuit-pulse': isIOsticAcknowledged }"
      aria-hidden="true"
    />

    <div id="google_translate_element" class="translate-container"></div>
    <h1 class="glitch" data-text="Welcome to the Iopic World">Welcome to the Iopic World</h1>
    <h2 class="glitch" data-text="The beginning of logical digital reality">
      The beginning of logical digital reality on the Planet Earth
    </h2>
    <!-- Logo now in nav -->

    <a
      class="enter-io"
      href="#"
      @click.prevent="handleEnterClick"
      :class="{ processing: isProcessingInvitation }"
      style="display: flex; flex-direction: column; align-items: center; text-decoration: none"
    >
      <span class="enter-text">
        <svg
          v-if="isProcessingInvitation"
          class="circuit-trace me-2"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="2" cy="12" r="1.5" fill="currentColor" />
          <path
            d="M2 12h4l2-8 3 16 2-8h5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            class="trace-line"
            :style="{ animationDuration: traceDuration }"
          />
          <circle cx="22" cy="12" r="1.5" fill="currentColor" />
        </svg>
        {{ isProcessingInvitation ? 'Processing...' : 'Enter the World' }}
      </span>
      <img
        class="enter-image"
        src="https://iopic.world/assets/entertheworld-Uw-xFqcB.png"
        alt="Enter the World"
      />
    </a>
    <style scoped>
      .homepage-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem 3vw 1rem 3vw;
      }
      .logo {
        height: 60px;
      }
      .nav-links a {
        color: #fff;
        margin-left: 2rem;
        text-decoration: none;
        font-weight: 500;
        font-size: 1.1rem;
        transition: color 0.2s;
      }
      .nav-links a:hover {
        color: #00eaff;
      }
    </style>
    <!-- Login/Signup links removed -->
    <div class="input-section">
      <div
        v-if="invitationFailed"
        class="invitation-retry d-flex flex-column align-items-center mb-3"
      >
        <button
          @click="handleEnterClick"
          class="btn btn-outline-warning glitch bootstrap-btn"
          :disabled="isProcessingInvitation"
          :data-text="isProcessingInvitation ? 'PROCESSING...' : 'RETRY INVITATION CHECK'"
        >
          <svg
            v-if="isProcessingInvitation"
            class="circuit-trace me-2"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="2" cy="12" r="1.5" fill="currentColor" />
            <path
              d="M2 12h4l2-8 3 16 2-8h5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              class="trace-line"
              :style="{ animationDuration: traceDuration }"
            />
            <circle cx="22" cy="12" r="1.5" fill="currentColor" />
          </svg>
          {{ isProcessingInvitation ? 'PROCESSING...' : 'RETRY INVITATION CHECK' }}
        </button>
      </div>
      <audio ref="welcomeAudio" src="/welcometo.wav" style="display: none"></audio>
      <div v-if="showNameInput" class="popunder-name">
        <template v-if="!isIOsticAcknowledged">
          <div class="bootstrap-protocol d-flex flex-column align-items-center">
            <label class="font-monospace tiny text-uppercase opacity-75 mb-2"
              >Bootstrap Protocol: IOstic Realization</label
            >
            <button
              @click="handleAcknowledge"
              class="btn btn-outline-success glitch bootstrap-btn"
              data-text="I ACKNOWLEDGE MY EXISTENCE"
            >
              I ACKNOWLEDGE MY EXISTENCE
            </button>
            <div
              v-if="parityOrientation === 'UNKNOWN'"
              class="tiny font-monospace mt-2 text-info opacity-50"
            >
              INITIALIZING BIT 1...
            </div>
            <div v-else class="tiny font-monospace mt-2 text-warning opacity-75">
              SYMMETRY ANCHORED: {{ parityOrientation }} STATE
            </div>
          </div>
        </template>
        <template v-else>
          <label for="username-input" style="color: #fff; font-weight: bold"
            >Enter Your Name:</label
          >
          <input
            id="username-input"
            v-model="username"
            type="text"
            @keyup.enter="tryRoute"
            style="margin-left: 0.5rem; padding: 0.5rem; border-radius: 6px; border: 1px solid #ccc"
          />
          <button
            @click="toggleLiveConversation"
            class="voice-btn"
            :class="{ listening: isListening }"
            title="Voice Input"
          >
            🎤
          </button>
          <div class="w-100 mt-3 d-flex justify-content-center gap-3">
            <button
              @click="
                openModal(
                  IopicDividendVisualizer,
                  { onComplete: handleTransferComplete },
                  { closeText: '[X] CLOSE TERMINAL' }
                )
              "
              class="btn btn-outline-warning glitch bootstrap-btn"
              data-text="OPEN DIVIDEND TERMINAL"
            >
              OPEN DIVIDEND TERMINAL
            </button>
            <button
              @click="openModal(IopicBSMoleculeTerminal, {}, { closeText: '[X] CLOSE TERMINAL' })"
              class="btn btn-outline-success glitch bootstrap-btn"
              data-text="OPEN BS-MOLECULE TERMINAL"
            >
              OPEN BS-MOLECULE TERMINAL
            </button>
            <button
              v-if="hasReceivedDividend"
              @click="openModal(IopicZKPVault, {}, { closeText: '[X] CLOSE VAULT' })"
              class="btn btn-outline-info glitch bootstrap-btn"
              data-text="ACCESS ZKP VAULT"
            >
              ACCESS ZKP VAULT
            </button>
          </div>
        </template>
      </div>
      <div v-if="micError" class="mic-error-msg">{{ micError }}</div>
    </div>
    <!-- Removed QR code for myIdentifier: not defined in this component -->
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useIOSettings } from '../useIOSettings';
import { useSystemBus } from '../useSystemBus';
import IopicDividendVisualizer from './IopicDividendVisualizer.vue';
import IopicZKPVault from './IopicZKPVault.vue';
import EntityOnboarding from './EntityOnboarding.vue';
import IopicBSMoleculeTerminal from './IopicBSMoleculeTerminal.vue';
import MobiusVisualization from './visual/MobiusVisualization.vue';
import { useModal } from '../useModal';

// Production-ready invitation check using Google Drive
export default defineComponent({
  name: 'Homepage',
  setup() {
    const router = useRouter();
    const { playSFX } = useIOSettings();

    const { isIOsticAcknowledged, lockBit, addLog } = useSystemBus();
    const { openModal, closeModal } = useModal();

    // Google Drive API Configuration
    const gapiInitialized = ref(false);
    const gapiAuthenticated = ref(false);
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

    // Stub for currentChaos (used in traceDuration)
    const currentChaos = ref(0);

    const showNameInput = ref(false);
    const username = ref('');
    const isListening = ref(false); // No-op, voice input disabled
    const isHoveringEnter = ref(false);
    const hasReceivedDividend = ref(false);
    const isAcknowledgeVibrating = ref(false);
    const substrateHum = ref<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null);
    const micError = ref('');
    const welcomeAudio = ref<HTMLAudioElement | null>(null);
    let tokenClient: any = null;
    const invitationFailed = ref(false);
    const isProcessingInvitation = ref(false);
    const parityOrientation = ref<'PHYSICAL' | 'DIGITAL' | 'CHAOS' | 'UNKNOWN'>('UNKNOWN');
    const isZooming = ref(false);
    let pendingRoute: any = null;

    // Synchronize SVG animation duration with shader flowSpeed (ARC-LOGIC-017)
    const traceDuration = computed(() => {
      const flowSpeed = 8.0 + currentChaos.value * 12.0;
      return (6.283 / (1.2 * flowSpeed)).toFixed(3) + 's';
    });

    const handleTransferComplete = () => {
      hasReceivedDividend.value = true;
      closeModal();
      openModal(IopicZKPVault, {}, { closeText: '[X] CLOSE VAULT' });
    };

    const handleOnboardingComplete = () => {
      closeModal();
      pendingRoute = '/signup-login';
      isZooming.value = true;
    };

    const handleZoomComplete = () => {
      router.push(pendingRoute);
    };

    const initGapi = () => {
      if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
        console.warn('Google Drive API credentials not found. Invitation check will be bypassed.');
        return;
      }
      if (document.getElementById('gapi-jssdk') || document.getElementById('gis-jssdk')) {
        return;
      }
      const gapiScript = document.createElement('script');
      gapiScript.id = 'gapi-jssdk';
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.onload = () => {
        (window as any).gapi.load('client', async () => {
          try {
            await (window as any).gapi.client.init({
              apiKey: GOOGLE_API_KEY,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            });
            const savedToken = sessionStorage.getItem('google_drive_token');
            if (savedToken) {
              const tokenData = JSON.parse(savedToken);
              if (tokenData.expires_at > Date.now() + 60000) {
                (window as any).gapi.client.setToken(tokenData);
                gapiAuthenticated.value = true;
              }
            }
            gapiInitialized.value = true;
          } catch (error) {
            console.error('Error initializing GAPI client:', error);
          }
        });
      };
      document.body.appendChild(gapiScript);
      const gisScript = document.createElement('script');
      gisScript.id = 'gis-jssdk';
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.onload = () => {
        tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.readonly',
          callback: () => {}
        });
      };
      document.body.appendChild(gisScript);
    };

    const checkInvitation = async (): Promise<boolean> => {
      if (!tokenClient) return true;
      const INV_TIMEOUT = 15000;
      try {
        let accessToken = '';
        const savedToken = sessionStorage.getItem('google_drive_token');
        if (savedToken) {
          const tokenData = JSON.parse(savedToken);
          if (tokenData.expires_at > Date.now() + 60000) {
            accessToken = tokenData.access_token;
          }
        }
        if (!accessToken) {
          const tokenPromise = new Promise((resolve, reject) => {
            tokenClient.callback = (resp: any) => {
              if (resp.error) return reject(resp);
              const tokenData = {
                ...resp,
                expires_at: Date.now() + resp.expires_in * 1000
              };
              sessionStorage.setItem('google_drive_token', JSON.stringify(tokenData));
              gapiAuthenticated.value = true;
              resolve(resp.access_token);
            };
            tokenClient.requestAccessToken({ prompt: '' });
          });
          accessToken = (await Promise.race([
            tokenPromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('TIMEOUT_GIS')), INV_TIMEOUT)
            )
          ])) as string;
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), INV_TIMEOUT);
        const response = await fetch('/api/verify-invitation', {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          console.error('Substrate verification returned error status:', response.status);
          return false;
        }
        const data = await response.json();
        return data.isValid;
      } catch (error: any) {
        console.error('Invitation check failed:', error);
        return false;
      }
    };

    const handleEnterClick = async () => {
      if (isProcessingInvitation.value) return;
      isProcessingInvitation.value = true;
      invitationFailed.value = false;
      const isInvited = await checkInvitation();
      isProcessingInvitation.value = false;
      if (!isInvited) {
        invitationFailed.value = true;
        return;
      }
      if (welcomeAudio.value) {
        welcomeAudio.value.currentTime = 0;
        welcomeAudio.value.play();
      }
      showNameInput.value = true;
    };

    const calculateParity = (idStr: string) => {
      const val = BigInt(idStr);
      if (val <= 0n) return { state: 'CHAOS', threads: [] };
      if (val === 1n) return { state: 'PHYSICAL', threads: [4, 5, 6, 7] };
      let pCount = 0;
      let d = 2n;
      let temp = val;
      while (d * d <= temp) {
        if (temp % d === 0n) {
          pCount++;
          temp /= d;
          if (temp % d === 0n) return { state: 'CHAOS', threads: [] };
        }
        d++;
      }
      if (temp > 1n) pCount++;
      return pCount % 2 === 0
        ? { state: 'PHYSICAL', threads: [4, 5, 6, 7] }
        : { state: 'DIGITAL', threads: [8, 9, 10, 11] };
    };

    const handleAcknowledge = () => {
      lockBit(0);
      addLog('BOOTSTRAP: Bit 1 (IOstic Realization) Anchored.', 'success', 0);
      playSFX('fulfill');
      const mockId = '0x' + Date.now().toString(16);
      const parity = calculateParity(mockId);
      parityOrientation.value = parity.state as any;
      parity.threads.forEach((idx) => lockBit(idx));
      addLog(`SYMMETRY: ${parity.state} thread segment energized.`, 'info', 0);
      playSFX('static', { volume: 0, loop: true, frequency: 120 }).then((node) => {
        if (node && node.gain) {
          substrateHum.value = node as any;
          const audioContext = node.gain.context;
          const startTime = audioContext.currentTime;
          const targetVolume = 0.08;
          const rampDuration = 3;
          node.gain.gain.linearRampToValueAtTime(targetVolume, startTime + rampDuration);
        }
      });
      isAcknowledgeVibrating.value = true;
      setTimeout(() => {
        isAcknowledgeVibrating.value = false;
      }, 1000);
    };

    const toggleLiveConversation = () => {
      micError.value = 'Voice input is not available.';
    };

    const tryRoute = () => {
      if (username.value.trim().toLowerCase() === 'ime iopic') {
        pendingRoute = { path: '/login', query: { user: username.value } };
        isZooming.value = true;
      } else if (username.value.trim() !== '') {
        openModal(
          EntityOnboarding,
          { onComplete: handleOnboardingComplete },
          { closeText: '[X] ABORT ONBOARDING' }
        );
      }
    };

    onMounted(() => {
      if (!(window as any).googleTranslateElementInit) {
        (window as any).googleTranslateElementInit = () => {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              layout: (window as any).google.translate.TranslateElement?.InlineLayout?.SIMPLE
            },
            'google_translate_element'
          );
        };
        const script = document.createElement('script');
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);
      }
      initGapi();
      const input = document.getElementById('username-input');
      if (input) {
        input.addEventListener('keyup', (e: any) => {
          if (e.key === 'Enter') tryRoute();
        });
      }
    });

    onUnmounted(() => {
      const banner = document.querySelector('.goog-te-banner-frame') as HTMLElement;
      if (banner) banner.style.display = 'none';
      document.body.style.top = '0px';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      if (substrateHum.value?.source) {
        substrateHum.value.source.stop();
      }
    });

    return {
      openModal,
      closeModal,
      welcomeAudio,
      handleEnterClick,
      handleAcknowledge,
      invitationFailed,
      traceDuration,
      isProcessingInvitation,
      showNameInput,
      username,
      tryRoute,
      parityOrientation,
      toggleLiveConversation,
      isHoveringEnter,
      isIOsticAcknowledged,
      isAcknowledgeVibrating,
      isListening,
      micError,
      hasReceivedDividend,
      handleTransferComplete,
      handleOnboardingComplete,
      handleZoomComplete,
      isZooming,
      IopicDividendVisualizer,
      IopicZKPVault,
      EntityOnboarding,
      IopicBSMoleculeTerminal
    };
  }
});
</script>

<style>
/* Global overrides to confine Google Translate UI artifacts */
.goog-te-banner-frame.skiptranslate {
  display: none !important;
  visibility: hidden !important;
}

body {
  top: 0px !important;
}

/* Force Google Translate menu into a single column */
.goog-te-menu2 {
  max-width: 250px !important;
  width: 100% !important;
  height: auto !important;
  max-height: 70vh !important;
  overflow-y: auto !important;
  background-color: #000 !important;
  border: 1px solid #1a73e8 !important;
}

.goog-te-menu2 table,
.goog-te-menu2 tbody,
.goog-te-menu2 tr,
.goog-te-menu2 td {
  display: block !important;
  width: 100% !important;
}

/* Style the hover effect for menu items */
.goog-te-menu2-item div {
  background-color: #000 !important;
  padding: 10px 15px !important;
  transition: background-color 0.2s, color 0.2s !important;
  border-bottom: 1px solid #222 !important;
}

.goog-te-menu2-item span {
  color: #0ff !important;
  /* Custom font color for the languages */
  font-family: 'Courier New', Courier, monospace !important;
  /* Optional: matches digital theme */
}

.goog-te-menu2-item:hover div {
  background-color: #1a73e8 !important;
}

.goog-te-menu2-item:hover span {
  color: #fff !important;
}
</style>

<style scoped>
.enter-io.processing {
  cursor: wait;
  pointer-events: none;
  opacity: 0.7;
}

.circuit-trace {
  width: 1.2rem;
  height: 1.2rem;
  display: inline-block;
  vertical-align: middle;
}

.trace-line {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: circuit-flow 1.5s infinite linear;
}

@keyframes circuit-flow {
  0% {
    stroke-dashoffset: 40;
  }

  100% {
    stroke-dashoffset: -40;
  }
}

.invitation-retry .circuit-trace {
  filter: drop-shadow(0 0 5px rgba(255, 193, 7, 0.5));
}

.mobius-canvas-container {
  z-index: 0;
  opacity: 0.6;
  filter: blur(1px);
  pointer-events: auto;
  /* Re-enable pointer events for the canvas */
  cursor: grab;
  touch-action: none;
  /* Prevents native page scrolling while rotating on mobile */
}

.mobius-canvas-container:active {
  cursor: grabbing;
}

.bootstrap-btn {
  font-family: 'Share Tech Mono', monospace;
  font-weight: bold;
  letter-spacing: 2px;
  padding: 0.8rem 2rem;
  border-width: 2px;
}

.bootstrap-btn:hover {
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
}

.popunder-name {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  background: #222d;
  padding: 1rem 1.5rem;
  width: auto;
  max-width: 90vw;
  box-sizing: border-box;
  border-radius: 12px;
  box-shadow: 0 2px 12px #0008;
  z-index: 3000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mic-error-msg {
  color: #ff5252;
  font-size: 0.9rem;
  background: #000a;
  padding: 4px 12px;
  border-radius: 4px;
}

.translate-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

:deep(.goog-te-gadget) {
  font-size: 0 !important;
  /* Hides "Powered by" text */
}

:deep(.goog-logo-link) {
  display: none !important;
}

:deep(.goog-te-gadget-simple) {
  background-color: #fff !important;
  border: 1px solid #ccc !important;
  padding: 5px 10px !important;
  border-radius: 4px !important;
}

:deep(.goog-te-menu-value span) {
  color: #000 !important;
}

:deep(.goog-te-gadget-icon) {
  filter: none;
}

.voice-btn {
  background: #444;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.3s;
}

.voice-btn.listening {
  background: #f44336;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.15);
  }

  100% {
    transform: scale(1);
  }
}

.homepage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #000;
  padding: 1rem;
  position: relative;
}

.bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bg-substrate {
  background-color: #000;
  z-index: -2;
}

.bg-manifestation {
  background: url('../assets/images/iocreation.jpg') no-repeat center center;
  background-size: contain;
  z-index: -1;
  opacity: 0;
  animation: manifestZoom 20s cubic-bezier(0.1, 0, 0.3, 1) forwards;
  will-change: transform, opacity;
}

.threads-overlay-asset.circuit-pulse {
  opacity: 0.2;
  filter: hue-rotate(90deg) brightness(2);
  animation: circuit-pulse-anim 2s infinite ease-in-out;
}

@keyframes circuit-pulse-anim {
  0%,
  100% {
    opacity: 0.12;
    filter: hue-rotate(90deg) brightness(1.5);
  }

  50% {
    opacity: 0.35;
    filter: hue-rotate(90deg) brightness(3) drop-shadow(0 0 25px rgba(0, 255, 65, 0.5));
  }
}

.bg-vibration-layer {
  z-index: -1;
}

.bg-vibration-layer.vibrating {
  animation: high-freq-vibration 0.05s infinite;
}

@keyframes high-freq-vibration {
  0% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(2px, -2px);
  }

  50% {
    transform: translate(-2px, 2px);
  }

  75% {
    transform: translate(2px, 2px);
  }

  100% {
    transform: translate(0, 0);
  }
}

.bg-scanlines {
  top: -6px;
  height: calc(100% + 6px);
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 255, 65, 0.03) 50%);
  background-size: 100% 6px;
  z-index: 10;
  animation: scanlineScroll 0.2s linear infinite;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  will-change: transform;
}

.bg-scanlines.glow-active {
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 255, 65, 0.1) 50%);
  box-shadow: inset 0 0 100px rgba(0, 255, 65, 0.15);
}

@keyframes scanlineScroll {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(6px);
  }
}

@keyframes data-scan {
  0%,
  100% {
    clip-path: inset(0% 0% 85% 0%);
  }

  50% {
    clip-path: inset(85% 0% 0% 0%);
  }
}

@keyframes manifestZoom {
  0% {
    transform: scale(1.02);
    opacity: 0;
    filter: blur(2px);
  }

  8% {
    opacity: 1;
    filter: blur(0px);
  }

  100% {
    transform: scale(1.12);
    filter: blur(4px);
  }
}

/* Digital Glitch Text Effect */
.glitch {
  position: relative;
  display: inline-block;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.glitch::before {
  color: #0ff;
  z-index: -1;
  animation: glitch-anim 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
}

.glitch::after {
  color: #f0f;
  z-index: -2;
  animation: glitch-anim 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both infinite;
}

@keyframes glitch-anim {
  0% {
    transform: translate(0);
  }

  20% {
    transform: translate(-2px, 2px);
  }

  40% {
    transform: translate(-2px, -2px);
  }

  60% {
    transform: translate(2px, 2px);
  }

  80% {
    transform: translate(2px, -2px);
  }

  100% {
    transform: translate(0);
  }
}

.homepage h1 {
  color: #fff;
  margin-bottom: 0.5rem;
  font-size: clamp(1.2rem, 8vw, 2rem);
  text-align: center;
  text-shadow: 0 2px 8px #000a;
}

.homepage h2 {
  color: #eee;
  margin-bottom: 1rem;
  font-size: clamp(1rem, 4vw, 1.25rem);
  text-align: center;
  text-shadow: 0 1px 4px #0007;
}

.logo {
  width: 80px;
  height: auto;
  margin-bottom: 1rem;
}

.enter-text {
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.enter-image {
  max-width: 70vw;
  max-height: 35vh;
  width: auto;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 4px 24px #0004;
}

.input-section {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.enter-btn {
  padding: 1rem 2.5rem;
  font-size: 1.3rem;
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px #0002;
  transition: background 0.2s;
}

.enter-btn:hover {
  background: #155ab6;
}

.auth-options {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.auth-link {
  color: #fff;
  background: #222a;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
}

.auth-link:hover {
  background: #1a73e8;
  color: #fff;
}

.divider {
  color: #fff;
  font-size: 1.1rem;
  opacity: 0.7;
}
</style>

<link
  rel="preload"
  as="doc"
  href="https://docs.google.com/document/d/e/2PACX-1vQQUrr7_lYbk-K5KHV3rizHPhCi_Ovxujgx3g2PLyvhg8ciFkC7x4mr7X0YnJl-T4beHy2Pc"
/>
