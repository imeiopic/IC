<template>
  <Navbar />
  <CContainer fluid class="home-substrate p-0 bg-black min-vh-100 d-flex flex-column align-items-center font-mono position-relative">
    <div class="grid-background position-absolute inset-0"></div>

    <!-- Telemetry Layer -->
    <TelemetryLayer v-if="!showWelcomeShield" />

    <!-- Anchor Core -->
    <div class="anchor-core text-center position-relative z-1 pt-5">
      <div class="logo-pulse mb-5">
        <img src="/images/iologo.png" alt="IOPIC" class="main-logo shadow-glow" />
      </div>
      <h1 class="text-glow text-info italic font-black display-3 tracking-widest mb-2">IOPIC</h1>
      <p class="text-white small tracking-widest uppercase mb-5 opacity-75">
        The Day The Noise Stopped
      </p>
    </div>

    <!-- System Terminal Gate -->
    <div class="action-terminal p-4 border border-zinc-800 bg-zinc-950 rounded shadow-info mx-auto mb-5" style="max-width: 400px">
      <SystemBootGate 
        :user="user" 
        @request-bond="handleBondRequest" 
      />
    </div>

    <!-- Modals & Global Overlays -->
    <WelcomeShield v-if="showWelcomeShield" @initialized="showWelcomeShield = false" />
    
    <BondingModal 
      v-model:visible="showBondModal" 
      :suid="peerSuidToBond" 
      @confirm="executeBondInjection" 
    />

    <footer class="position-absolute bottom-0 w-100 p-4 text-center">
      <div class="d-flex justify-content-center gap-5 tiny text-zinc-600 font-mono italic">
        <span>FREQ: 7.83Hz</span>
        <span>BUS: 16_THREADS</span>
        <span>BUFFER: 1.2Q TPE</span>
      </div>
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import Navbar from '@components/Navbar.vue';
import { CContainer } from '@coreui/vue';

// Sub-components
import TelemetryLayer from '@/components/home/TelemetryLayer.vue';
import SystemBootGate from '@/components/home/SystemBootGate.vue';
import WelcomeShield from '@components/WelcomeShield.vue';
import BondingModal from '@/components/home/BondingModal.vue';

const { user } = useAuth();
const showWelcomeShield = ref(true);
const showBondModal = ref(false);
const peerSuidToBond = ref('');

// Orchestration Handlers
const handleBondRequest = (suid: string) => {
  peerSuidToBond.value = suid;
  showBondModal.value = true;
};

const executeBondInjection = async () => {
  // Logic from your DirectPeerLink service
  showBondModal.value = false;
  // Trigger API call via Pinia store or service
};
</script>