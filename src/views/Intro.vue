<template>
  <div class="intro-descent w-full h-screen bg-black overflow-hidden relative font-mono">
    <!-- Orbital Layer: The Global 16-Thread Mesh -->
    <div
      class="global-layer absolute inset-0 transition-all duration-[3000ms] ease-in-out"
      :class="zoomed ? 'scale-[5] opacity-0' : 'scale-100 opacity-100'"
    >
      <div
        class="absolute inset-0 bg-[url('/images/global-mesh.jpg')] bg-cover bg-center opacity-40"
      ></div>
      <div class="mesh-overlay absolute inset-0 bg-lime-500/5 mix-blend-screen"></div>
    </div>

    <!-- Atmospheric Layer: The Legacy Cloud Noise -->
    <div
      class="cloud-layer absolute inset-0 bg-white/10 backdrop-blur-md transition-opacity duration-1000 delay-700"
      :class="zoomed ? 'opacity-0 pointer-events-none' : 'opacity-100'"
    ></div>

    <!-- Harmonic Pulse: MPEG-12 Synchronization Signal -->
    <div
      v-if="isSyncing"
      class="harmonic-pulse-container absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
    >
      <div class="pulse-ring border-4 border-lime-400 rounded-full animate-ping w-32 h-32"></div>
      <div
        class="pulse-ring border-2 border-lime-500 rounded-full animate-ping w-64 h-64 delay-150"
      ></div>
      <div
        class="sync-text text-lime-400 text-[10px] tracking-[0.5em] mt-48 uppercase font-bold animate-pulse"
      >
        MPEG-12_SYNC_LOCKED // PHASE_RES_2.2
      </div>
    </div>

    <!-- Local Layer: The Sovereign Ground (Cleveland Anchor) -->
    <div
      class="street-layer absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 delay-1000"
      :class="zoomed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
    >
      <div
        class="scanner-line absolute top-0 w-full h-[2px] bg-lime-500/30 shadow-[0_0_15px_rgba(132,204,22,0.5)] animate-scan"
      ></div>

      <div class="coordinate-readout mb-8 text-center">
        <h1 class="text-lime-400 text-5xl font-black uppercase tracking-tighter italic">
          Cleveland Grid: Online
        </h1>
        <p class="text-zinc-500 text-xs tracking-widest mt-2">
          ANCHOR_POINT: [41.4993° N, 81.6944° W] // ELEVATION: 199M
        </p>
      </div>

      <div class="onboarding-gate p-1 border border-lime-900/50 bg-zinc-950/50 backdrop-blur-sm">
        <button
          @click="startOnboarding"
          class="px-12 py-4 bg-lime-500 text-black font-black hover:bg-white transition-colors uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(132,204,22,0.3)]"
        >
          INITIATE_ONBOARDING
        </button>
      </div>

      <footer class="absolute bottom-8 text-[9px] text-zinc-700 uppercase tracking-[0.3em]">
        Sovereign Ground Established // Iopic Age Node_v1.0
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const zoomed = ref(false);
const isSyncing = ref(false);

const triggerDescent = () => {
  // Phase 1: Initiation
  setTimeout(() => {
    zoomed.value = true;
    // Phase 2: Harmonic Pulse during Cloud Break
    setTimeout(() => {
      isSyncing.value = true;
      // Phase 3: Sync completion
      setTimeout(() => {
        isSyncing.value = false;
      }, 2000);
    }, 800);
  }, 1500);
};

const startOnboarding = () => {
  router.push('/role-selection');
};

onMounted(() => {
  triggerDescent();
});
</script>

<style scoped>
.animate-scan {
  animation: scan 4s linear infinite;
}

@keyframes scan {
  0% { top: 0%; }
  100% { top: 100%; }
}

.delay-150 { animation-delay: 150ms; }
.intro-descent { background-image: radial-gradient(circle at center, #050505 0%, #000 100%); }
.mesh-overlay {
  background-image: linear-gradient(rgba(132, 204, 22, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(132, 204, 22, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>
