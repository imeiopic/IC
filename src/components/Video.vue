<template>
  <div
    class="p-6 bg-black text-white border-2 border-neutral-900 font-mono max-w-4xl mx-auto shadow-2xl relative select-none"
  >
    <header class="flex justify-between items-center border-b border-neutral-900 pb-3 mb-4">
      <div>
        <span class="text-[10px] text-purple-400 block tracking-wider font-bold"
          >AV_ENGINE // LAYER_0100</span
        >
        <h2 class="text-base font-black tracking-tight text-white">VIDEO.VUE</h2>
      </div>
      <div class="text-right">
        <span class="text-[10px] text-neutral-500 block">PROTOCOL_STATE</span>
        <span
          :class="[
            'text-xs font-bold px-2 py-0.5 border',
            isProtocolActive
              ? 'text-emerald-400 border-emerald-900 bg-emerald-950/20'
              : 'text-neutral-500 border-neutral-900'
          ]"
        >
          {{ isProtocolActive ? 'MIND_YOUR_BUSINESS_ACTIVE' : 'STANDBY_CORE' }}
        </span>
      </div>
    </header>

    <div
      class="relative bg-neutral-950 border border-neutral-900 aspect-video w-full overflow-hidden flex items-center justify-center"
    >
      <video
        ref="videoPlayer"
        @timeupdate="onTimeUpdate"
        @ended="onVideoEnded"
        class="w-full h-full object-cover"
        src="https://api.iopic.world/v1/assets/manifesto_stream.mp4"
        preload="auto"
      ></video>
      <canvas
        ref="overlayCanvas"
        class="absolute inset-0 pointer-events-none w-full h-full"
      ></canvas>

      <div
        v-if="!isPlaying"
        class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center space-y-4"
      >
        <div class="space-y-1">
          <h3 class="text-sm font-black text-white tracking-widest uppercase">
            THE 16-THREAD REALITY
          </h3>
          <p class="text-[10px] text-amber-500 tracking-tight uppercase">
            THE DAY THE NOISE STOPPED & FUTURE BEGINS
          </p>
        </div>
        <button
          @click="togglePlayback"
          class="bg-white text-black text-xs font-bold px-6 py-2.5 tracking-widest hover:bg-emerald-400 transition-colors"
        >
          INITIALIZE_AV_STREAM
        </button>
      </div>

      <div
        class="absolute bottom-3 left-3 bg-black/60 border border-neutral-900/60 p-2 text-[9px] text-neutral-400 space-y-0.5 pointer-events-none"
      >
        <div>T.I.M.E. MARK: {{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>
        <div>BUS_VELOCITY: {{ isProtocolActive ? '2.2x RESONANCE' : '1.1x ISOLATED' }}</div>
        <div>SHIELD_STATUS: 100% TELEMETRY_INSULATED</div>
      </div>
    </div>

    <footer class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <div class="flex gap-2">
        <button
          @click="togglePlayback"
          class="flex-1 bg-neutral-950 border border-neutral-800 text-xs font-bold py-2 hover:bg-neutral-900 hover:text-emerald-400 transition-colors"
        >
          {{ isPlaying ? 'PAUSE_STREAM' : 'RESUME_STREAM' }}
        </button>
        <button
          @click="resetPlayback"
          class="bg-neutral-950 border border-neutral-800 text-xs font-bold px-3 py-2 hover:bg-neutral-900 hover:text-red-400 transition-colors"
        >
          RESET
        </button>
      </div>

      <div class="flex items-center gap-3 bg-neutral-950 border border-neutral-900 p-2 h-full">
        <span class="text-[9px] text-neutral-500">PROGRESS</span>
        <div
          class="flex-1 bg-neutral-900 h-1.5 relative overflow-hidden cursor-pointer"
          @click="scrubTimeline"
        >
          <div
            class="bg-purple-500 h-full transition-all duration-100"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <span class="text-[10px] font-bold text-white">{{ Math.round(progressPercent) }}%</span>
      </div>

      <div>
        <button
          @click="toggleProtocol"
          :class="[
            'w-full text-xs font-bold py-2 border tracking-wide transition-all duration-150',
            isProtocolActive
              ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400'
              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-purple-500 hover:text-purple-400'
          ]"
        >
          {{ isProtocolActive ? 'DISENGAGE_MYB_SHIELD' : 'ASSERT_MIND_YOUR_BUSINESS' }}
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useTrustStore } from '@/stores/trustStore';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useNodeStore } from '../stores/nodeStore';

// Element Selectors and Reactive Parameters
const videoPlayer = ref<HTMLVideoElement | null>(null);
const overlayCanvas = ref<HTMLCanvasElement | null>(null);
const isPlaying = ref(false);
const isProtocolActive = ref(false);
const currentTime = ref(0);
const duration = ref(0);
let animationFrameId: number | null = null;

const trustStore = useTrustStore();
const nodeStore = useNodeStore();
const { currentHz } = storeToRefs(nodeStore);

// Frequency Visualization Engine
const drawRipple = () => {
  if (!overlayCanvas.value || !videoPlayer.value) {
    animationFrameId = requestAnimationFrame(drawRipple);
    return;
  }

  const canvas = overlayCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Coordinate Synchronization
  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isPlaying.value) {
    const time = performance.now() * 0.001;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseHz = currentHz.value; // Core frequency from shared store
    const multiplier = isProtocolActive.value ? 2.2 : 1.1;
    const activeHz = baseHz * multiplier;

    // Intensify ripples based on video progression (0.3 base + 0.7 growth)
    const intensityModifier = 0.3 + (progressPercent.value / 100) * 0.7;

    // Generate 3 expanding resonance rings
    for (let i = 0; i < 3; i++) {
      const offset = i * 0.33;
      const progress = (time * (activeHz / 10) + offset) % 1;
      const radius = progress * (Math.max(canvas.width, canvas.height) * 0.5);
      const alpha = (1 - progress) * intensityModifier;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = isProtocolActive.value
        ? `rgba(16, 185, 129, ${alpha * 0.6})` // Emerald Resonance
        : `rgba(168, 85, 247, ${alpha * 0.4})`; // Purple Isolated
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  animationFrameId = requestAnimationFrame(drawRipple);
};

onMounted(() => {
  animationFrameId = requestAnimationFrame(drawRipple);
});

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});

// Global Connection: Enable 2.2x Resonance during active playback protocol
watch([isProtocolActive, isPlaying], ([protocol, playing]) => {
  if (protocol && playing) {
    console.log('AV_ENGINE: Protocol synchronization triggered. Engaging global resonance.');
    trustStore.activateApexResonance();
  }
});

// Symmetrical Math Allocations
const progressPercent = computed(() => {
  if (!duration.value) return 0;
  return (currentTime.value / duration.value) * 100;
});

// Control Logic: Playback Handshaking
const togglePlayback = () => {
  if (!videoPlayer.value) return;

  if (isPlaying.value) {
    videoPlayer.value.pause();
    isPlaying.value = false;
  } else {
    videoPlayer.value
      .play()
      .then(() => {
        isPlaying.value = true;
        // Engaging video stream implicitly verifies system scale bounds
        duration.value = videoPlayer.value?.duration || 0;
      })
      .catch((err) => {
        console.error('AV_SUBSTRATE_ERROR: Media pipeline blocked by browser sandbox.', err);
      });
  }
};

const resetPlayback = () => {
  if (!videoPlayer.value) return;
  videoPlayer.value.currentTime = 0;
  currentTime.value = 0;
  if (isPlaying.value) {
    videoPlayer.value.pause();
    isPlaying.value = false;
  }
};

// Protocol Engine: Mind Your Business Mode
const toggleProtocol = () => {
  isProtocolActive.value = !isProtocolActive.value;
  console.log(`MYB_PROTOCOL: State flipped to ${isProtocolActive.value ? 'ENFORCED' : 'STANDBY'}.`);
};

// Pipeline Updates
const onTimeUpdate = () => {
  if (!videoPlayer.value) return;
  currentTime.value = videoPlayer.value.currentTime;
};

const onVideoEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  console.log('AV_ENGINE: Stream cycle completed. Zero residual playback artifacts retained.');
};

// Basic Time Matrix Formatter
const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Manual Scrub Mechanic
const scrubTimeline = (event: MouseEvent) => {
  if (!videoPlayer.value || !duration.value) return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const width = rect.width;
  const newTime = (clickX / width) * duration.value;

  videoPlayer.value.currentTime = newTime;
  currentTime.value = newTime;
};
</script>
