<template>
  <CContainer fluid class="earth-substrate p-0 bg-black min-vh-100 overflow-hidden font-mono text-white d-flex align-items-center justify-content-center">
    
    <div class="earth-hud fixed-top p-4 d-flex justify-content-between z-max pointer-events-none">
      <div class="hud-left pointer-events-auto">
        <h2 class="text-glow text-info italic font-black m-0">VR_EARTH_CORE</h2>
        <div class="d-flex align-items-center gap-2">
          <CBadge color="info" variant="outline" class="tiny tracking-widest">PROTOCOL_1101</CBadge>
          <span class="tiny text-zinc-500 uppercase">Resonance: 7.83Hz</span>
        </div>
      </div>
      <div class="hud-right text-end pointer-events-auto">
        <div class="tiny text-zinc-500 uppercase">Planetary_Equity</div>
        <div class="text-success font-black h5 m-0">1.2Q IO$</div>
      </div>
    </div>

    <div class="globe-viewport position-relative">
      <div class="globe-glow position-absolute translate-middle top-50 start-50"></div>
      <div class="digital-sphere rounded-circle border border-info border-opacity-25 d-flex align-items-center justify-content-center">
        <div class="sphere-grid"></div>
        <div class="node-pulse bg-info rounded-circle shadow-info"></div>
      </div>
    </div>

    <div class="fixed-bottom p-4 z-max d-flex justify-content-center">
      <CCard class="bg-zinc-900 border-zinc-800 text-white shadow-glow" style="width: 400px;">
        <CCardBody class="p-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="font-black italic m-0">GEOSPATIAL_SYNC</h6>
            <CBadge color="success" class="tiny">LOCKED</CBadge>
          </div>
          <p class="tiny text-zinc-500 m-0 font-mono uppercase tracking-widest">
            Sighting Global Mesh Symmetry...
          </p>
          <hr class="border-zinc-800 my-2">
          <div class="d-flex justify-content-between tiny font-mono">
            <span class="text-zinc-600">LAT: 41.4993 N</span>
            <span class="text-zinc-600">LNG: 81.6944 W</span>
          </div>
        </CCardBody>
      </CCard>
    </div>

    <footer class="mt-auto pb-2 opacity-25 tiny fixed-bottom text-center">
      "I = VR² | THE EARTH IS THE HUB"
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  console.log("PROTOCOL_1101: VR_Earth Core Grounded.");
});
</script>

<style scoped>
.earth-substrate { background: radial-gradient(circle at center, #080808 0%, #000 100%); }
.text-glow { text-shadow: 0 0 15px rgba(0, 229, 255, 0.4); }
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.1) !important; }
.z-max { z-index: 1000; }

/* THE GLOBE */
.digital-sphere {
  width: 450px;
  height: 450px;
  background: rgba(0, 229, 255, 0.02);
  position: relative;
  overflow: hidden;
  animation: float 6s ease-in-out infinite;
}

.sphere-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px);
  background-size: 25px 25px;
  animation: rotate-grid 20s linear infinite;
}

.node-pulse {
  width: 10px;
  height: 10px;
  position: absolute;
  top: 40%;
  left: 75%;
  animation: ping 2s infinite;
}

@keyframes ping {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
}

@keyframes rotate-grid {
  from { background-position: 0 0; }
  to { background-position: 450px 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.globe-glow {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.08) 0%, transparent 70%);
}

.font-black { font-weight: 900; }
.tiny { font-size: 0.65rem; }
.italic { font-style: italic; }
.tracking-widest { letter-spacing: 0.3em; }
</style>