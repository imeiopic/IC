<template>
  <div class="order-substrate min-vh-100 bg-black text-white p-4 font-mono">
    <div class="container max-w-4xl mx-auto">
      <header class="mb-5 border-b border-zinc-800 pb-3">
        <h1 class="text-info font-black italic tracking-tighter">APEX_HANDSHAKE_MONITOR</h1>
        <div class="d-flex justify-content-between extra-tiny text-zinc-500">
          <span>[SYSTEM_ID: {{ nodeStore.nodeState.stabilityIndex > 0 ? 'ACTIVE' : 'IDLE' }}]</span>
          <span>STABILITY_VERSION: 2.0.0</span>
        </div>
      </header>

      <div class="row g-4 align-items-center">
        <!-- Visual Gauge -->
        <div class="col-12 col-md-6">
          <div class="stability-gauge-container p-5 border border-zinc-800 rounded bg-zinc-950 position-relative overflow-hidden">
            <div class="gauge-ring" :style="{ '--progress': gaugeProgress }"></div>
            <div class="gauge-content text-center position-relative z-1">
              <div class="extra-tiny text-zinc-500 mb-1">STABILITY_INDEX (I)</div>
              <div class="display-4 font-black text-glow" :class="stabilityColor">
                {{ nodeStore.nodeState.stabilityIndex.toFixed(4) }}
              </div>
              <div class="extra-tiny mt-2" :class="stabilityColor">
                {{ stabilityStatus }}
              </div>
            </div>
            <!-- Animated scanline effect -->
            <div class="scanline"></div>
          </div>
        </div>

        <!-- Physics Engine Output -->
        <div class="col-12 col-md-6">
          <div class="physics-card h-100 p-4 border border-zinc-800 rounded bg-black d-flex flex-column justify-content-center">
            <h3 class="tiny font-black text-info mb-4 border-b border-zinc-900 pb-2">PHYSICS_ENGINE_LOG</h3>
            
            <div class="space-y-4">
              <div class="mt-4 p-3 bg-zinc-950 border border-zinc-900 rounded">
                <div class="extra-tiny text-info italic mb-1">EQUATION_OF_TRUTH:</div>
                <div class="tiny font-black">I = V * R²</div>
                <div class="extra-tiny text-zinc-600 mt-2">
                  Grounding peer connection. Quantifying temporal handshake frequency and node resistance based on the multiplier constant.
                </div>
              </div>
              
              <div v-if="trustStore.isApexResonanceActive" class="mt-3">
                <div class="extra-tiny text-warning font-black">
                  [!] MUTUAL_APEX_RESONANCE_DETECTION: 2.2x
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-meta mt-5 pt-4 border-t border-zinc-900">
        <div class="d-flex justify-content-between align-items-center">
          <div class="extra-tiny text-zinc-600">
            INITIALIZATION_STAKE: {{ nodeStore.initializationStakeValue }} IO$
          </div>
          <div class="extra-tiny text-info">
            GCP_SUBSTRATE_SYMMETRY: VERIFIED
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNodeStore } from '@/stores/nodeStore';
import { useTrustStore } from '@/stores/trustStore';

const nodeStore = useNodeStore();
const trustStore = useTrustStore();

const gaugeProgress = computed(() => {
  // Normalize I for the visualization. Assuming 1.0 is peak stability for the gauge.
  return Math.min(nodeStore.nodeState.stabilityIndex * 100, 100);
});

const stabilityStatus = computed(() => {
  const I = nodeStore.nodeState.stabilityIndex;
  if (I >= 0.8) return 'PHASE_LOCK_OPTIMAL';
  if (I >= 0.4) return 'GROUNDING_STABLE';
  if (I > 0) return 'RESONANCE_DRIFT_DETECTED';
  return 'AWAITING_PHYSICS_COMMIT';
});

const stabilityColor = computed(() => {
  const I = nodeStore.nodeState.stabilityIndex;
  if (I >= 0.8) return 'text-success';
  if (I >= 0.4) return 'text-info';
  return 'text-warning';
});
</script>

<style scoped>
.order-substrate {
  background: radial-gradient(circle at center, #0a0a0a 0%, #000 100%);
}

.stability-gauge-container {
  box-shadow: inset 0 0 50px rgba(0, 229, 255, 0.05);
}

.text-glow {
  text-shadow: 0 0 15px currentColor;
}

.scanline {
  width: 100%;
  height: 2px;
  background: rgba(0, 229, 255, 0.2);
  position: absolute;
  top: 0;
  left: 0;
  animation: scan 3s linear infinite;
}

@keyframes scan {
  from { top: 0; }
  to { top: 100%; }
}
</style>