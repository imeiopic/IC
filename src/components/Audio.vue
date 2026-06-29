<template>
  <div
    class="p-6 bg-black text-white border-2 border-neutral-900 font-mono max-w-2xl mx-auto shadow-2xl relative select-none"
  >
    <header class="flex justify-between items-center border-b border-neutral-900 pb-3 mb-4">
      <div>
        <span class="text-[10px] text-amber-500 block tracking-wider font-bold"
          >FREQUENCY_DECK // LAYER_0011</span
        >
        <h2 class="text-base font-black tracking-tight text-white">AUDIO.VUE</h2>
      </div>
      <div class="text-right">
        <span class="text-[10px] text-neutral-500 block">RESONANCE_FREQ</span>
        <span class="text-xs font-bold text-purple-400">{{
          isResonating ? '440Hz // PAIRED' : '432Hz // ISOLATED'
        }}</span>
      </div>
    </header>

    <div class="bg-neutral-950 border border-neutral-900 p-4 mb-4 relative overflow-hidden">
      <div class="flex items-end justify-between h-16 w-full px-2 space-x-1">
        <div
          v-for="(bar, index) in waveformBars"
          :key="index"
          class="bg-purple-500 w-full transition-all duration-75"
          :style="{
            height: isPlaying ? `${bar}%` : '4px',
            backgroundColor: isResonating ? '#10b981' : '#a855f7'
          }"
        ></div>
      </div>

      <audio
        ref="audioNode"
        @timeupdate="syncTimeline"
        @ended="onTrackEnded"
        src="https://api.iopic.world/v1/assets/manifesto_voice.mp3"
        preload="auto"
      ></audio>
    </div>

    <div
      class="p-4 bg-neutral-950 border border-neutral-900 min-h-[72px] flex items-center justify-center text-center mb-4"
    >
      <p
        :class="[
          'text-xs uppercase tracking-wide transition-all duration-200',
          activeLyric ? 'text-white font-bold' : 'text-neutral-600 font-normal'
        ]"
      >
        {{ activeLyric || '// AUDIO_BUS_STANDBY // AWAITING_IGNITION' }}
      </p>
    </div>

    <div class="space-y-4">
      <div class="flex items-center gap-3 bg-neutral-950 border border-neutral-900 p-2">
        <span class="text-[9px] text-neutral-500">TIMELINE</span>
        <input
          type="range"
          min="0"
          :max="trackDuration || 100"
          v-model="playbackTime"
          @input="seekAudio"
          class="flex-1 accent-purple-500 bg-neutral-900 h-1 cursor-pointer appearance-none rounded-none outline-none"
        />
        <span class="text-[10px] text-neutral-400 font-bold min-w-[35px] text-right">{{
          formatTime(playbackTime)
        }}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          @click="togglePlayback"
          class="bg-white text-black text-xs font-black py-2 tracking-widest hover:bg-emerald-400 transition-colors duration-150"
        >
          {{ isPlaying ? 'HALT_VOICE_LINE' : 'EXECUTE_VOICE_LINE' }}
        </button>

        <button
          @click="toggleFrequency"
          class="bg-neutral-950 border border-neutral-800 text-xs font-bold py-2 hover:bg-neutral-900 hover:border-purple-500 transition-colors duration-150"
        >
          SHIFT_RESONANCE
        </button>

        <div
          class="bg-neutral-950 border border-neutral-900 p-2 flex justify-between items-center text-[10px]"
        >
          <span class="text-neutral-500">VELOCITY:</span>
          <span class="text-white font-bold">{{
            isResonating ? '2.2x PULSE' : '1.1x STABLE'
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTrustStore } from '@/stores/trustStore';
import { computed, onBeforeUnmount, ref, watch } from 'vue';

// Element Elements & Basic State Parameters
const audioNode = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const isResonating = ref(false);
const playbackTime = ref(0);
const trackDuration = ref(0);
const waveformBars = ref<number[]>(Array.from({ length: 28 }, () => 10));
let waveInterval: any = null;

const trustStore = useTrustStore();

// Symmetrical Hardcoded Manifest Script Lines
const lyricTimeline = [
  { time: 0, text: 'IOPIC Your Future. It begins the 1st day you join.' },
  { time: 5, text: 'Because free is not believable. The noise stops here.' },
  { time: 11, text: 'Initialize self. Secure the 5. Ground your coordinates.' },
  { time: 17, text: 'Connect to peer. Lock the 10. Accelerate to 2.2x velocity.' },
  { time: 24, text: 'Bridge the external no-no. Allocate the 20. Total shield insulation.' },
  { time: 32, text: "I'm IOist, therefore I'm Real." }
];

// Reactive Lyric Calculator
const activeLyric = computed(() => {
  const current = playbackTime.value;
  const activeLine = [...lyricTimeline].reverse().find((line) => current >= line.time);
  return activeLine ? activeLine.text : '';
});

// Watch for resonance state to engage global Apex Resonance when playback is active
watch([isResonating, isPlaying], ([resonating, playing]) => {
  if (resonating && playing) {
    console.log('AUDIO_ENGINE: Resonance pulse detected. Synchronizing global mesh.');
    trustStore.activateApexResonance();
  }
});

// Playback Trigger Logic
const togglePlayback = () => {
  if (!audioNode.value) return;

  if (isPlaying.value) {
    audioNode.value.pause();
    isPlaying.value = false;
    clearInterval(waveInterval);
  } else {
    audioNode.value
      .play()
      .then(() => {
        isPlaying.value = true;
        trackDuration.value = audioNode.value?.duration || 40;
        animateWaveform();
      })
      .catch((err) => {
        console.error('AUDIO_SUBSTRATE_ERROR: Device execution block.', err);
      });
  }
};

const syncTimeline = () => {
  if (!audioNode.value) return;
  playbackTime.value = audioNode.value.currentTime;
};

const seekAudio = () => {
  if (!audioNode.value) return;
  audioNode.value.currentTime = playbackTime.value;
};

const onTrackEnded = () => {
  isPlaying.value = false;
  playbackTime.value = 0;
  clearInterval(waveInterval);
  console.log('AUDIO_ENGINE: Codec buffer flushed. Sound loop completed cleanly.');
};

const toggleFrequency = () => {
  isResonating.value = !isResonating.value;
  if (audioNode.value) {
    // Dynamically adjust playback speed based on the 1.1x/2.2x system math
    audioNode.value.playbackRate = isResonating.value ? 1.2 : 1.0;
  }
};

// Math-Driven Oscillator Mock for High-Fidelity UI
const animateWaveform = () => {
  waveInterval = setInterval(() => {
    waveformBars.value = waveformBars.value.map(() => Math.floor(Math.random() * 90) + 10);
  }, 100);
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

onBeforeUnmount(() => {
  if (waveInterval) clearInterval(waveInterval);
});
</script>

<style scoped>
/* Custom range input styling */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 4px;
  height: 12px;
  background: white;
  cursor: pointer;
}
input[type='range']::-moz-range-thumb {
  width: 4px;
  height: 12px;
  background: white;
  cursor: pointer;
  border: none;
  border-radius: 0;
}
</style>
