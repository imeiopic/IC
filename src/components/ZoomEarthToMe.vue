<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef } from 'vue';
import { useSettingStore } from '@/composable/useSettingStore';
import { type GeoCoord } from '@/types/mesh';

/**
 * COMPONENT CONTRACT:
 * Strictly adheres to the GeoCoord interface for spatial mesh telemetry.
 */
const props = defineProps<GeoCoord>();
const emit = defineEmits<{ 'zoom-complete': [] }>();

const settings = useSettingStore();
const mapRef = ref<HTMLElement | null>(null);
const active = ref(true);
const altitude = ref(150000);
const progress = ref(0);
const statusMessage = ref('INITIALIZING_ORBITAL_LINK');

// Audio Context: shallowRef prevents reactivity overhead on the audio engine.
const audioCtx = shallowRef<AudioContext | null>(null);
let timerIds: ReturnType<typeof setTimeout>[] = [];

/**
 * AUDIO ENGINE:
 * Play sound at specified frequency. Initialized lazily upon first interaction.
 */
const playSound = (freq: number) => {
  if (settings.isMuted) return;
  if (!audioCtx.value) audioCtx.value = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const osc = audioCtx.value.createOscillator();
  const gain = audioCtx.value.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, audioCtx.value.currentTime);
  gain.gain.setValueAtTime(settings.masterVolume * 0.2, audioCtx.value.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.value.currentTime + 0.5);
  
  osc.connect(gain);
  gain.connect(audioCtx.value.destination);
  osc.start();
  osc.stop(audioCtx.value.currentTime + 0.5);
};

/**
 * SEQUENCE ENGINE:
 * Orchestrates visual and spatial telemetry updates.
 * Thread-safe: includes bounds checking for coordinate input.
 */
const runSequence = async () => {
  try {
    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const mapInstance = new Map(mapRef.value!, {
      center: { lat: 0, lng: 0 },
      zoom: 2,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      styles: [{ featureType: 'all', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
    });

    const steps = [
      { msg: 'SOLAR_CORONA_EXIT', prog: 0, zoom: 3, alt: 5000, delay: 1000, freq: 40 },
      { msg: 'ORBITAL_INSERTION', prog: 20, zoom: 6, alt: 500, delay: 1500, freq: 80 },
      { msg: 'ATMOSPHERIC_PENETRATION', prog: 55, zoom: 10, alt: 150, delay: 1000, freq: 120 },
      { msg: 'LOCAL_SUBSTRATE_FOUND', prog: 90, zoom: 15, alt: 2, delay: 1200, freq: 200 },
      { msg: 'GROUNDING_COMPLETE', prog: 100, zoom: 18, alt: 0, delay: 1000, freq: 300 }
    ];

    for (const step of steps) {
      await new Promise((resolve) => timerIds.push(setTimeout(resolve, step.delay)));
      playSound(step.freq);
      mapInstance.setZoom(step.zoom);
      
      // Thread-safe coordinate validation
      if (Math.abs(props.lat) <= 90 && Math.abs(props.lng) <= 180) {
        mapInstance.panTo({ lat: props.lat, lng: props.lng });
      }
      
      statusMessage.value = step.msg;
      progress.value = step.prog;
      altitude.value = step.alt;
    }

    timerIds.push(setTimeout(() => {
      active.value = false;
      emit('zoom-complete');
    }, 500));
  } catch (err) {
    // Propagate error to ErrorBoundary
    throw new Error(`MAP_INITIALIZATION_FAILURE: ${err}`);
  }
};

onMounted(runSequence);
onUnmounted(() => {
  timerIds.forEach(clearTimeout);
  audioCtx.value?.close();
});
</script>

<template>
  <div v-if="active" class="zoom-overlay">
    <div class="relative w-full aspect-square border-2 border-cyan-500/30 bg-zinc-950">
      <div ref="mapRef" class="absolute inset-0 w-full h-full"></div>
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="w-16 h-16 border border-white/20 rounded-full animate-ping"></div>
      </div>
    </div>
    <div class="status-panel mt-4">
      <div class="text-white text-xl font-black italic">{{ statusMessage }}</div>
      <div class="progress-bar">
        <div class="fill" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.zoom-overlay { @apply fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center; }
.progress-bar { @apply h-1 w-full bg-zinc-800 rounded-full overflow-hidden; }
.fill { @apply h-full bg-cyan-400 transition-all duration-500 ease-linear; }
</style>