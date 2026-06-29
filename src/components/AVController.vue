<template>
  <div
    class="p-6 bg-black text-white border-2 border-neutral-900 font-mono max-w-4xl mx-auto shadow-2xl relative select-none transition-all duration-75"
    :class="{ 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]': isBeatFlash }"
  >
    <header class="flex justify-between items-center border-b border-neutral-900 pb-3 mb-4">
      <div>
        <span class="text-[10px] text-purple-400 block tracking-wider font-bold"
          >AV_ENGINE // LAYER_1100</span
        >
        <h2 class="text-base font-black tracking-tight text-white">AVCONTROLLER.VUE</h2>
      </div>
      <div class="text-right">
        <span class="text-[10px] text-neutral-500 block">RESONANCE_STATE</span>
        <span
          :class="[
            'text-xs font-bold px-2 py-0.5 border',
            isResonanceActive
              ? 'text-emerald-400 border-emerald-900 bg-emerald-950/20'
              : 'text-neutral-500 border-neutral-900'
          ]"
        >
          {{ isResonanceActive ? '2.2x APEX_RESONANCE_ACTIVE' : '1.1x ISOLATED_STANDBY' }}
        </span>
      </div>
    </header>

    <div
      class="relative bg-neutral-950 border border-neutral-900 aspect-video w-full overflow-hidden flex items-center justify-center"
    >
      <video
        ref="videoPlayer"
        @timeupdate="onTimeUpdate"
        @ended="onMediaEnded"
        class="w-full h-full object-cover"
        :class="{ 'glitch-effect': isGlitching }"
        src="https://api.iopic.world/v1/assets/manifesto_stream.mp4"
        crossorigin="anonymous"
        preload="auto"
      ></video>
      <audio
        ref="audioNode"
        src="https://api.iopic.world/v1/assets/manifesto_voice.mp3"
        crossorigin="anonymous"
        preload="auto"
      ></audio>

      <canvas
        ref="overlayCanvas"
        class="absolute inset-0 pointer-events-none w-full h-full"
      ></canvas>

      <!-- Beat Detection Flash Overlay (for screen) -->
      <div
        v-if="isBeatFlash"
        class="absolute inset-0 bg-emerald-500/10 pointer-events-none z-20"
      ></div>

      <!-- Matrix HUD Overlay -->
      <div v-if="isPlaying" class="absolute top-4 left-4 z-10 pointer-events-none">
        <div class="bg-black/50 border border-emerald-900/50 p-3 backdrop-blur-md">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span class="text-[9px] text-emerald-500 font-black tracking-[0.2em] uppercase"
              >Matrix_HUD // Telemetry</span
            >
          </div>
          <div class="grid grid-cols-2 gap-x-6 gap-y-1">
            <div class="space-y-0.5">
              <div class="text-[8px] text-neutral-500 uppercase">LAT_COORD</div>
              <div class="text-[10px] text-white font-bold font-mono">
                {{ gpsCoords.lat.toFixed(4) }}
              </div>
            </div>
            <div class="space-y-0.5 border-l border-neutral-800 pl-4">
              <div class="text-[8px] text-neutral-500 uppercase">LNG_COORD</div>
              <div class="text-[10px] text-white font-bold font-mono">
                {{ gpsCoords.lng.toFixed(4) }}
              </div>
            </div>
            <div class="space-y-0.5 mt-1">
              <div class="text-[8px] text-neutral-500 uppercase">LOCAL_NODES</div>
              <div class="text-[10px] text-emerald-400 font-bold font-mono">
                {{ nodeCount }} / 16
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Waveform Overlay at bottom of video -->
      <div
        class="absolute bottom-12 left-0 w-full px-8 flex items-end justify-between h-8 space-x-1 opacity-60 pointer-events-none"
      >
        <div v-for="(bar, index) in waveformBars" :key="index" class="w-full h-full relative">
          <div
            class="absolute bottom-0 w-full"
            :style="{
              height: isPlaying ? `${bar}%` : '4px',
              backgroundColor: isResonanceActive ? '#10b981' : '#a855f7'
            }"
          ></div>
          <div
            v-if="isPlaying"
            class="absolute w-full h-[1px] bg-white/40"
            :style="{ bottom: `${peakBars[index]}%` }"
          ></div>
        </div>
      </div>

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
          INITIALIZE_AV_CORE
        </button>
      </div>

      <div
        class="absolute bottom-3 left-3 bg-black/60 border border-neutral-900/60 p-2 text-[9px] text-neutral-400 space-y-0.5 pointer-events-none"
      >
        <div>T.I.M.E. MARK: {{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>
        <div>BUS_VELOCITY: {{ isResonanceActive ? '2.2x RESONANCE' : '1.1x STABLE' }}</div>
        <div>SHIELD_STATUS: 100% TELEMETRY_INSULATED</div>
      </div>
    </div>

    <div
      class="p-4 bg-neutral-950 border border-neutral-900 min-h-[72px] flex items-center justify-center text-center mt-4"
    >
      <p
        :class="[
          'text-xs uppercase tracking-wide transition-all duration-200',
          activeLyric ? 'text-white font-bold' : 'text-neutral-600 font-normal'
        ]"
      >
        {{ activeLyric || '// AV_BUS_STANDBY // AWAITING_IGNITION' }}
      </p>
    </div>

    <!-- CROSSFADER_SYSTEM -->
    <div
      class="mt-4 p-3 bg-neutral-950 border border-neutral-900 grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div class="flex items-center gap-4">
        <span class="text-[9px] text-neutral-500 uppercase tracking-widest font-bold"
          >AV_CROSSFADE</span
        >
        <div class="flex-1 flex items-center gap-3">
          <span class="text-[8px] text-purple-500 font-bold">VOICE</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model.number="crossfadeValue"
            class="flex-1 accent-purple-500 bg-neutral-900 h-1 cursor-pointer appearance-none rounded-none outline-none"
          />
          <span class="text-[8px] text-emerald-500 font-bold">STREAM</span>
        </div>
        <span class="text-[10px] text-neutral-400 font-bold w-10 text-right"
          >[{{ Math.round(crossfadeValue * 100) }}%]</span
        >
      </div>

      <div
        class="flex items-center gap-4 border-t md:border-t-0 md:border-l border-neutral-900 pt-3 md:pt-0 md:pl-6"
      >
        <span class="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
          AGC_BEAT_SENSITIVITY
        </span>
        <div class="flex-1 flex items-center gap-3">
          <input
            type="range"
            min="1.1"
            max="2.5"
            step="0.05"
            v-model.number="beatSensitivity"
            class="flex-1 accent-amber-500 bg-neutral-900 h-1 cursor-pointer appearance-none rounded-none outline-none"
          />
        </div>
        <span class="text-[10px] text-amber-500 font-bold w-12 text-right">
          {{ beatSensitivity.toFixed(2) }}x</span
        >
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

      <button
        @click="toggleResonance"
        :class="[
          'w-full text-xs font-bold py-2 border tracking-wide transition-all duration-150',
          isResonanceActive
            ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400'
            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-purple-500 hover:text-purple-400'
        ]"
      >
        {{ isResonanceActive ? 'SHIFT_TO_STABLE' : 'SHIFT_RESONANCE_2.2X' }}
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useTrustStore } from '@/stores/trustStore';
import { SPICE } from '@/utils/SPICE';
import { useNodeStore } from '@/stores/nodeStore';

const videoPlayer = ref<HTMLVideoElement | null>(null);
const audioNode = ref<HTMLAudioElement | null>(null);
const overlayCanvas = ref<HTMLCanvasElement | null>(null);
const isPlaying = ref(false);
const isResonanceActive = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isBeatFlash = ref(false); // For border/overlay flash
const isGlitching = ref(false); // For video glitch effect
const beatSensitivity = ref(1.4); // Multiplier for dynamic AGC threshold
const rollingAvgLowFreq = ref(0); // Tracks baseline sub-bass loudness
const gpsCoords = ref({ lat: 41.81, lng: -81.69 });
const nodeCount = ref(16);
const crossfadeValue = ref(0.5);
const waveformBars = ref<number[]>(Array.from({ length: 28 }, () => 10));
const peakBars = ref<number[]>(Array.from({ length: 28 }, () => 0));

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array | null = null;
let animationFrameId: number | null = null;
let lastLowFreq = 0; // For beat detection
let beatFlashTimeout: ReturnType<typeof setTimeout> | null = null;
let glitchTimeout: ReturnType<typeof setTimeout> | null = null;
let hudInterval: ReturnType<typeof setInterval> | null = null;

// Watch for SPICE ignition pulse to generate a physical sound manifestation
watch(
  () => SPICE.triggerShake.value,
  (isTriggered: boolean) => {
    if (isTriggered) {
      playIgnitionSound();
    }
  }
);

const playIgnitionSound = () => {
  const ContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!audioCtx) {
    audioCtx = new ContextClass();
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  // A deep sub-bass thump: start at 60Hz and sweep down to near-zero
  osc.frequency.setValueAtTime(60, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

  gain.gain.setValueAtTime(0.7, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);
};

const trustStore = useTrustStore();
const nodeStore = useNodeStore();
const { currentHz } = storeToRefs(nodeStore);

const lyricTimeline = [
  { time: 0, text: 'IOPIC Your Future. It begins the 1st day you join.' },
  { time: 5, text: 'Because free is not believable. The noise stops here.' },
  { time: 11, text: 'Initialize self. Secure the 5. Ground your coordinates.' },
  { time: 17, text: 'Connect to peer. Lock the 10. Accelerate to 2.2x velocity.' },
  { time: 24, text: 'Bridge the external no-no. Allocate the 20. Total shield insulation.' },
  { time: 32, text: "I'm IOist, therefore I'm Real." }
];

const activeLyric = computed(() => {
  const current = currentTime.value;
  const activeLine = [...lyricTimeline].reverse().find((line) => current >= line.time);
  return activeLine ? activeLine.text : '';
});

const progressPercent = computed(() =>
  duration.value ? (currentTime.value / duration.value) * 100 : 0
);

const syncVolumes = () => {
  if (audioNode.value) audioNode.value.volume = 1 - crossfadeValue.value;
  if (videoPlayer.value) videoPlayer.value.volume = crossfadeValue.value;
};

const initWebAudio = () => {
  if (audioCtx || !audioNode.value || !videoPlayer.value) return;

  const ContextClass = window.AudioContext || (window as any).webkitAudioContext;
  audioCtx = new ContextClass();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  const voiceSource = audioCtx.createMediaElementSource(audioNode.value);
  const streamSource = audioCtx.createMediaElementSource(videoPlayer.value);

  voiceSource.connect(analyser);
  streamSource.connect(analyser);
  analyser.connect(audioCtx.destination);
};

watch(crossfadeValue, syncVolumes);

const togglePlayback = () => {
  if (!videoPlayer.value || !audioNode.value) return;

  initWebAudio();
  if (audioCtx?.state === 'suspended') void audioCtx.resume();

  if (isPlaying.value) {
    videoPlayer.value.pause();
    audioNode.value.pause();
    isPlaying.value = false;
  } else {
    Promise.all([videoPlayer.value.play(), audioNode.value.play()])
      .then(() => {
        isPlaying.value = true;

        if (!SPICE.isNoise(videoPlayer.value!.src)) {
          console.log(
            '[SPICE.ts] SHIELD_ACTIVE: Outbound telemetry nullified. Interface insulated.'
          );
        }

        duration.value = videoPlayer.value?.duration || 40;
      })
      .catch((err) => console.error('AV_ENGINE_ERROR:', err));
  }
};

const resetPlayback = () => {
  if (!videoPlayer.value || !audioNode.value) return;
  videoPlayer.value.currentTime = 0;
  audioNode.value.currentTime = 0;
  currentTime.value = 0;
  isBeatFlash.value = false;
  rollingAvgLowFreq.value = 0;
  isGlitching.value = false;
  peakBars.value = peakBars.value.map(() => 0);
  if (isPlaying.value) togglePlayback();
};

const toggleResonance = () => {
  isResonanceActive.value = !isResonanceActive.value;
  const rate = isResonanceActive.value ? 1.2 : 1.0;
  if (videoPlayer.value) videoPlayer.value.playbackRate = rate;
  if (audioNode.value) audioNode.value.playbackRate = rate;
};

const onTimeUpdate = () => {
  if (videoPlayer.value) currentTime.value = videoPlayer.value.currentTime;
};

const onMediaEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  isBeatFlash.value = false;
  rollingAvgLowFreq.value = 0;
  isGlitching.value = false;
  peakBars.value = peakBars.value.map(() => 0);
};

const scrubTimeline = (event: MouseEvent) => {
  if (!videoPlayer.value || !audioNode.value || !duration.value) return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const newTime = (clickX / rect.width) * duration.value;
  videoPlayer.value.currentTime = newTime;
  audioNode.value.currentTime = newTime;
  currentTime.value = newTime;
};

const drawVisuals = () => {
  if (!overlayCanvas.value || !videoPlayer.value || !isPlaying.value) {
    animationFrameId = requestAnimationFrame(drawVisuals);
    return;
  }
  const canvas = overlayCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const time = performance.now() * 0.001;
  const activeHz = currentHz.value * (isResonanceActive.value ? 2.2 : 1.1);

  // Real-time Frequency Analysis with Logarithmic Scaling
  if (analyser && dataArray && isPlaying.value && audioCtx) {
    analyser.getByteFrequencyData(dataArray as any);

    // Beat Detection Logic
    const lowFreqEnergy = dataArray[0];

    // AGC Calibration: Update rolling average with a small smoothing factor (alpha)
    const alpha = 0.015;
    if (rollingAvgLowFreq.value === 0) rollingAvgLowFreq.value = lowFreqEnergy;
    else rollingAvgLowFreq.value = rollingAvgLowFreq.value * (1 - alpha) + lowFreqEnergy * alpha;

    // Detect transients relative to the calibrated average track loudness
    const dynamicThreshold = rollingAvgLowFreq.value * beatSensitivity.value;
    const beatDetected = lowFreqEnergy > dynamicThreshold && lowFreqEnergy > lastLowFreq + 10;

    if (beatDetected) {
      // Trigger beat flash for border/overlay
      isBeatFlash.value = true;
      if (beatFlashTimeout) clearTimeout(beatFlashTimeout);
      beatFlashTimeout = setTimeout(() => {
        isBeatFlash.value = false;
      }, 100); // Flash duration

      // Trigger glitch effect for video
      isGlitching.value = true;
      if (glitchTimeout) clearTimeout(glitchTimeout);
      glitchTimeout = setTimeout(() => {
        isGlitching.value = false;
      }, 150); // Glitch duration
    }

    lastLowFreq = lowFreqEnergy; // Update last low frequency for next comparison

    const barCount = waveformBars.value.length;
    const numBins = analyser.frequencyBinCount;
    const sampleRate = audioCtx.sampleRate;

    const minFreq = 20; // Hz, lower bound for logarithmic scale (human hearing)
    const maxFreq = sampleRate / 2; // Nyquist frequency

    const logMinFreq = Math.log(minFreq);
    const logMaxFreq = Math.log(maxFreq);

    for (let i = 0; i < barCount; i++) {
      const logRatio = i / (barCount - 1);
      const currentLogFreq = logMinFreq + logRatio * (logMaxFreq - logMinFreq);
      const currentFreq = Math.exp(currentLogFreq);
      const binIndex = Math.floor((currentFreq / maxFreq) * numBins);
      const rawVal = dataArray[Math.min(binIndex, numBins - 1)] || 0;
      const val = (rawVal / 255) * 100;
      waveformBars.value[i] = val;

      // Peak Hold Logic with Decay
      if (val > peakBars.value[i]) {
        peakBars.value[i] = val;
      } else {
        peakBars.value[i] = Math.max(0, peakBars.value[i] - 0.8);
      }
    }
  }

  const intensity = 0.3 + (progressPercent.value / 100) * 0.7;
  for (let i = 0; i < 3; i++) {
    const progress = (time * (activeHz / 10) + i * 0.33) % 1;
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      progress * Math.max(canvas.width, canvas.height) * 0.5,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = isResonanceActive.value
      ? `rgba(16, 185, 129, ${(1 - progress) * intensity * 0.6})`
      : `rgba(168, 85, 247, ${(1 - progress) * intensity * 0.4})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  animationFrameId = requestAnimationFrame(drawVisuals);
};

const formatTime = (s: number) =>
  isNaN(s)
    ? '00:00'
    : `${Math.floor(s / 60)
        .toString()
        .padStart(2, '0')}:${Math.floor(s % 60)
        .toString()
        .padStart(2, '0')}`;

watch([isResonanceActive, isPlaying], ([res, play]: [boolean, boolean]) => {
  if (res && play) trustStore.activateApexResonance();
});

onMounted(() => {
  syncVolumes();
  animationFrameId = requestAnimationFrame(drawVisuals);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      gpsCoords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    });
  }

  hudInterval = setInterval(() => {
    if (isPlaying.value) nodeCount.value = Math.floor(Math.random() * 4) + 13;
  }, 3000);
});
onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (hudInterval) clearInterval(hudInterval);
  if (beatFlashTimeout) clearTimeout(beatFlashTimeout);
  if (glitchTimeout) clearTimeout(glitchTimeout);
  if (audioCtx) audioCtx.close();
});
</script>

<style scoped>
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

.glitch-effect {
  filter: hue-rotate(180deg) saturate(150%) contrast(120%);
  transform: translateX(2px) translateY(-2px) skewX(2deg);
  animation: glitch-flicker 0.1s infinite alternate; /* Subtle flicker during glitch */
}

@keyframes glitch-flicker {
  0% {
    transform: translate(1px, 1px) skewX(0deg);
    filter: hue-rotate(0deg);
  }
  50% {
    transform: translate(-1px, -1px) skewX(1deg);
    filter: hue-rotate(5deg);
  }
  100% {
    transform: translate(1px, 1px) skewX(0deg);
    filter: hue-rotate(0deg);
  }
}
</style>
