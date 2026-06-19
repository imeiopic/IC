<template>
  <div v-if="active" class="zoom-overlay fixed inset-0 z-[100] bg-black flex items-center justify-center font-mono overflow-hidden">
    <!-- Retro-futuristic Scanning Grid -->
    <div class="absolute inset-0 opacity-20 pointer-events-none scanning-grid"></div>

    <div class="relative w-full max-w-2xl px-6 flex flex-col items-center">
      <!-- Telemetry Header -->
      <div class="w-full flex justify-between text-[10px] text-cyan-500 mb-2 tracking-widest border-b border-cyan-900/50 pb-1">
        <span>REF_ID: {{ nodeId.substring(0,8) }}</span>
        <span>VELOCITY: {{ (altitude * 12).toFixed(0) }}m/s</span>
        <span>COORD: {{ lat.toFixed(4) }}N, {{ lng.toFixed(4) }}E</span>
      </div>

      <!-- Main Zoom Viewport -->
      <div class="relative w-full aspect-square border-2 border-cyan-500/30 bg-zinc-950 overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.1)]">
        <!-- Animated Map Texture (Simulated Zoom) -->
        <div 
          class="absolute inset-0 earth-surface bg-no-repeat bg-center"
          :style="zoomStyle"
        ></div>
        
        <!-- Reticle Overlay -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-16 h-16 border border-white/20 rounded-full animate-ping"></div>
          <div class="absolute w-full h-[1px] bg-cyan-500/20"></div>
          <div class="absolute h-full w-[1px] bg-cyan-500/20"></div>
          <div class="text-[8px] text-cyan-400 mt-20 uppercase font-black tracking-tighter">
            LOCKING_VECTOR_PRIMARY
          </div>
        </div>
      </div>

      <!-- Status Log -->
      <div class="mt-8 text-center">
        <div class="text-white text-xl font-black italic mb-2 tracking-tighter">
          {{ statusMessage }}
        </div>
        <div class="h-1 w-64 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-cyan-400 transition-all duration-300 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const props = defineProps<{
  lat: number;
  lng: number;
  nodeId: string;
}>();

const emit = defineEmits(['zoom-complete']);

const active = ref(true);
const altitude = ref(10000); // Simulated altitude in km
const progress = ref(0);
const statusMessage = ref('ESTABLISHING_ORBITAL_LINK');

const zoomStyle = computed(() => ({
  backgroundImage: `url('/assets/images/vre-topography.jpg')`, // Placeholder for stylized map
  transform: `scale(${1 + (100 - progress.value) * 0.15})`,
  filter: `blur(${Math.max(0, 10 - progress.value / 10)}px) hue-rotate(${progress.value}deg)`,
  opacity: progress.value / 100
}));

const runSequence = async () => {
  // Stage 1: Handshake
  await new Promise(r => setTimeout(r, 800));
  statusMessage.value = 'IDENTIFYING_SOVEREIGN_NODE';
  progress.value = 20;

  // Stage 2: Atmosphere Entry
  await new Promise(r => setTimeout(r, 1000));
  statusMessage.value = 'ATMOSPHERIC_PENETRATION';
  progress.value = 55;
  altitude.value = 150;

  // Stage 3: Convergence
  await new Promise(r => setTimeout(r, 1200));
  statusMessage.value = 'LOCAL_SUBSTRATE_FOUND';
  progress.value = 90;
  altitude.value = 2;

  // Stage 4: Grounding
  await new Promise(r => setTimeout(r, 1000));
  statusMessage.value = 'GROUNDING_COMPLETE';
  progress.value = 100;

  await new Promise(r => setTimeout(r, 500));
  active.value = false;
  emit('zoom-complete');
};

onMounted(() => {
  runSequence();
});
</script>

<style scoped>
.zoom-overlay {
  background: radial-gradient(circle at center, #050505 0%, #000 100%);
}

.scanning-grid {
  background-image: 
    linear-gradient(to right, #00e5ff 1px, transparent 1px),
    linear-gradient(to bottom, #00e5ff 1px, transparent 1px);
  background-size: 40px 40px;
}

.earth-surface {
  background-size: cover;
  transition: transform 4s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.zoom-overlay::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(0, 229, 255, 0.1);
  animation: scanline 4s linear infinite;
  pointer-events: none;
}

.tracking-tighter {
  letter-spacing: -0.05em;
}

.italic {
  font-style: italic;
}
</style>