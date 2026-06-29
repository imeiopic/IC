<template>
  <div 
    class="sovereign-signature tw-p-6 tw-bg-black/60 tw-border tw-border-bs-info/20 tw-rounded-lg tw-font-terminal tw-shadow-info"
    @mouseenter="showVolumeControls"
    @mouseleave="autoHideVolume"
  >
    <!-- Resonance Header -->
    <div class="tw-flex tw-justify-between tw-items-center tw-mb-6">
      <div class="tw-flex tw-flex-col">
        <span class="tw-text-[10px] tw-text-bs-info/50 tw-tracking-widest">SIGNATURE_TYPE</span>
        <span class="tw-text-white tw-font-bold">SOVEREIGN_RESONANCE</span>
      </div>
      <div
        :class="[
          isResonating ? 'tw-status-pill-cyan-400 tw-animate-pulse' : 'tw-status-pill-red-500',
          'tw-cursor-pointer hover:tw-opacity-80 tw-transition-opacity'
        ]"
        @click="resync"
        title="Manual Resync"
      >
        {{ isResonating ? 'ACTIVE_ANCHOR' : 'AWAITING_SYNC' }}
      </div>
    </div>

    <!-- Frequency Display -->
    <div class="tw-space-y-4">
      <div class="tw-flex tw-justify-between tw-items-end">
        <span class="tw-text-xs tw-text-gray-500">RES_FREQUENCY</span>
        <span
          class="tw-text-2xl tw-text-cyan-400 tw-leading-none tw-transition-all tw-duration-300 tw-inline-block"
          :class="{ 'tw-brightness-150 tw-scale-105': isFlashing }"
        >
          {{ displayFrequency }}<span class="tw-text-xs tw-ml-1">Hz</span>
        </span>
      </div>

      <!-- Visualizer Bar -->
      <div class="tw-h-1.5 tw-w-full tw-bg-gray-900 tw-rounded-full tw-overflow-hidden">
        <div
          class="tw-h-full tw-bg-cyan-500 tw-transition-all tw-duration-700 tw-ease-in-out"
          :style="{ width: resonancePercentage + '%' }"
        ></div>
      </div>

      <div class="tw-flex tw-justify-between tw-text-[10px] tw-text-gray-600">
        <span>0.00</span>
        <span>BASELINE: 7.83Hz</span>
        <span>10.00</span>
      </div>
    </div>

    <!-- Audio Feedback Control -->
    <div 
      class="tw-mt-6 tw-flex tw-flex-col tw-gap-1 tw-transition-opacity tw-duration-500"
      :class="showVolume ? 'tw-opacity-100' : 'tw-opacity-0 tw-pointer-events-none'"
    >
      <div class="tw-flex tw-justify-between tw-items-center">
        <span class="tw-text-[10px] tw-text-gray-500 tw-tracking-widest">FEEDBACK_VOLUME</span>
        <span class="tw-text-[10px] tw-text-cyan-400/60 tw-font-mono">{{ Math.round(volume * 1000) }}%</span>
      </div>
      <input
        type="range" min="0" max="0.1" step="0.001"
        v-model.number="volume"
        class="tw-w-full tw-h-1 tw-bg-gray-800 tw-rounded-lg tw-appearance-none tw-cursor-pointer tw-accent-cyan-400"
      />
    </div>

    <!-- Node Metadata -->
    <div class="tw-mt-6 tw-pt-4 tw-border-t tw-border-white/5 tw-grid tw-grid-cols-2 tw-gap-4">
      <div>
        <span class="tw-block tw-text-[10px] tw-text-gray-500">NODE_ID</span>
        <span class="tw-text-xs tw-text-white">NSN_ROOT_001</span>
      </div>
      <div class="tw-text-end">
        <span class="tw-block tw-text-[10px] tw-text-gray-500">MESH_ALIGNMENT</span>
        <span class="tw-text-xs tw-text-white">7.83_BASELINE_LOCKED</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { transmuteLegacyData } from '../utils/AbstractionLayer';

const baseFrequency = 7.83;
const currentDrift = ref(0);
const isFlashing = ref(false);
const volume = ref(0.05);
const showVolume = ref(false);

// Simulate real-time phase alignment with the Schumann baseline
let syncInterval: ReturnType<typeof setInterval>;
let volumeTimer: ReturnType<typeof setTimeout> | null = null;

const showVolumeControls = () => {
  showVolume.value = true;
  if (volumeTimer) clearTimeout(volumeTimer);
};

const autoHideVolume = () => {
  if (volumeTimer) clearTimeout(volumeTimer);
  volumeTimer = setTimeout(() => {
    showVolume.value = false;
  }, 2500);
};

onMounted(() => {
  syncInterval = setInterval(() => {
    // Simulate micro-fluctuations in resonance
    currentDrift.value = (Math.random() - 0.5) * 0.15;
  }, 1500);
});

onUnmounted(() => {
  clearInterval(syncInterval);
  if (volumeTimer) clearTimeout(volumeTimer);
});

const playSyncSound = () => {
  if (volume.value <= 0) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1); // Drop pitch

    gainNode.gain.setValueAtTime(volume.value, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1); // Fade out

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.warn('Audio feedback failed', e);
  }
};

const resync = (legacyPayload?: Record<string, any>) => {
  currentDrift.value = 0;
  isFlashing.value = true;
  playSyncSound();

  if (legacyPayload) {
    const harmonic = transmuteLegacyData(legacyPayload);
    console.log(`[SOVEREIGN_BRIDGE] Transmutation complete. Status: ${harmonic.state}`);
    // Potential for additional logic to adjust visualizers based on harmonic.threadMapping
  }

  setTimeout(() => {
    isFlashing.value = false;
  }, 300);
};

const displayFrequency = computed(() => (baseFrequency + currentDrift.value).toFixed(3));

// Verify sovereignty by flow: alignment within a tight threshold of the Earth baseline
const isResonating = computed(() => Math.abs(parseFloat(displayFrequency.value) - baseFrequency) < 0.05);

const resonancePercentage = computed(() => ((baseFrequency + currentDrift.value) / 10) * 100);
</script>