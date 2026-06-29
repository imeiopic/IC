<template>
  <div class="slides-sanctum p-4 min-vh-100 d-flex justify-content-center align-items-center">
    <CCard class="slides-substrate shadow-lg border-0 overflow-hidden">
      <CCardBody class="p-0 position-relative">
        
        <div class="slides-viewport bg-black d-flex justify-content-center align-items-center">
          <transition name="sighting-fade" mode="out-in">
            <div :key="currentIndex" class="slide-item w-100 h-100 d-flex justify-content-center align-items-center p-3">
              <CImage 
                :src="slideImages[currentIndex]" 
                class="img-fluid grounded-image shadow-gold"
                alt="Iopic Visual Sighting"
              />
            </div>
          </transition>
        </div>

        <div class="slides-metadata position-absolute bottom-0 w-100 p-4 d-flex justify-content-between align-items-end">
          <div class="sighting-info font-mono tiny text-gold uppercase">
            <div>SIGHTING_ID: SLD-{{ (currentIndex + 1).toString().padStart(2, '0') }}</div>
            <div>COORDINATE: {{ currentCoordinate }}</div>
          </div>
          <div class="sighting-timer">
            <div class="timer-bar bg-gold" :style="{ width: progress + '%' }"></div>
            <div class="tiny text-gold font-black italic mt-2">TRANSIT_VELOCITY: 0.33Hz</div>
          </div>
        </div>

        <div class="border-gold-top"></div>
        <div class="border-gold-bottom"></div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { CCard, CCardBody, CImage } from '@coreui/vue';

/**
 * THE SLIDE SUBSTRATE
 * Note: These paths assume images are in src/assets/slides/
 * and Vite handles the asset resolution.
 */
const slideImages = [
  new URL('../assets/slides/01.png', import.meta.url).href,
  new URL('../assets/slides/02.png', import.meta.url).href,
  new URL('../assets/slides/03.png', import.meta.url).href,
  new URL('../assets/slides/04.png', import.meta.url).href,
  new URL('../assets/slides/05.png', import.meta.url).href,
  new URL('../assets/slides/06.png', import.meta.url).href,
  new URL('../assets/slides/07.png', import.meta.url).href,
  new URL('../assets/slides/08.png', import.meta.url).href,
  new URL('../assets/slides/09.png', import.meta.url).href,
];

const currentIndex = ref(0);
const progress = ref(0);
const currentCoordinate = ref('CLE-CLUSTER-01');
let slideInterval: any = null;
let progressInterval: any = null;

const startSighting = () => {
  // 3-Second Transit Logic
  slideInterval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % slideImages.length;
    progress.value = 0; // Reset progress bar on change
    updateCoordinate();
  }, 3000);

  // Smooth Progress Bar (60fps)
  progressInterval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += (100 / 180); // 3 seconds = 180 frames at 60Hz
    }
  }, 16.67);
};

const updateCoordinate = () => {
  const codes = ['CLE-NODE', 'LDN-NODE', 'JRS-NODE', 'TOK-NODE'];
  currentCoordinate.value = `${codes[currentIndex.value % codes.length]}-${Math.floor(10 + Math.random() * 90)}`;
};

onMounted(() => {
  startSighting();
});

onUnmounted(() => {
  clearInterval(slideInterval);
  clearInterval(progressInterval);
});
</script>

<style scoped>
.slides-sanctum {
  background: radial-gradient(circle at center, #111 0%, #000 100%);
}

.slides-substrate {
  background-color: #050505;
  border: 1px solid #c5a059 !important; /* Gold Frame */
  width: 1280px;
  height: 720px;
  max-width: 95vw;
  max-height: 53.4vw; /* Maintain 16:9 Aspect Ratio */
}

.slides-viewport {
  height: 720px;
  position: relative;
}

.grounded-image {
  max-height: 600px;
  border: 1px solid rgba(197, 160, 89, 0.2);
  padding: 10px;
  background: #000;
}

.shadow-gold {
  box-shadow: 0 0 30px rgba(197, 160, 89, 0.1);
}

/* TRANSITION: SIGHTING FADE */
.sighting-fade-enter-active,
.sighting-fade-leave-active {
  transition: opacity 0.8s ease, transform 1.2s ease;
}

.sighting-fade-enter-from {
  opacity: 0;
  transform: scale(0.98);
}

.sighting-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

/* PROGRESS & METADATA */
.slides-metadata {
  z-index: 10;
  background: linear-gradient(to top, #000 0%, transparent 100%);
}

.sighting-timer {
  width: 200px;
  text-align: right;
}

.timer-bar {
  height: 2px;
  transition: width 0.016s linear;
  box-shadow: 0 0 10px #c5a059;
}

.border-gold-top, .border-gold-bottom {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #c5a059, transparent);
  opacity: 0.5;
}

.border-gold-top { top: 20px; }
.border-gold-bottom { bottom: 20px; }

.text-gold { color: #c5a059 !important; }
.bg-gold { background-color: #c5a059 !important; }
.tiny { font-size: 0.65rem; }
.font-black { font-weight: 900; }
.font-mono { font-family: 'Space Mono', monospace; }
.italic { font-style: italic; }
.uppercase { text-transform: uppercase; }
</style>