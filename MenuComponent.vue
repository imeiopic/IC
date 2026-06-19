<template>
  <div class="action-terminal p-4 border border-zinc-800 bg-zinc-950 rounded shadow-info mx-auto w-100">
    <p class="extra-tiny text-info font-black mb-3 uppercase tracking-widest">[RESOURCE_MENU // SIGHTING_AVAILABLE_FLUX]</p>
    
    <div class="grid-layout space-y-4">
      <div 
        v-for="item in menuItems" 
        :key="item.itemId" 
        class="p-3 border border-zinc-800 bg-black rounded hover-emerald transition-all"
      >
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h3 class="tiny font-black text-white uppercase mb-0">{{ item.name }}</h3>
          <span class="extra-tiny text-info font-mono">{{ item.ioCost }} IO$</span>
        </div>
        <p class="extra-tiny text-zinc-500 italic mb-3">{{ item.description }}</p>
        
        <div class="d-flex justify-content-between align-items-center">
          <span class="extra-tiny text-zinc-600 font-mono">DENSITY_REQ: {{ item.targetDensity }}R</span>
          <CButton 
            color="info" 
            variant="outline" 
            class="extra-tiny py-1 px-3 font-black italic"
            @click="handleManifest(item)"
          >
            MANIFEST_MOLECULE
          </CButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CButton } from '@coreui/vue';
import { ref } from 'vue';
import { registry } from '../registry/OrderRegistry';
import type { FluxManifest } from '../types/flux';

const props = defineProps<{
  buyerNode: any;
  sellerNode: any;
}>();

const menuItems = ref<FluxManifest[]>([
  { 
    itemId: 'flux_01', 
    name: 'Temporal Anchor', 
    ioCost: 50, 
    targetDensity: 0.98, 
    category: 'TEMPORAL',
    description: 'Stabilizes local node clock against mesh drift.',
    tags: ['core', 'sync']
  },
  { 
    itemId: 'flux_02', 
    name: 'Resonance Calibration', 
    ioCost: 120, 
    targetDensity: 0.95,
    category: 'RESONANCE',
    description: 'Aligns 16-thread bus with Juneteenth Harmonic constants.',
    tags: ['fidelity', 'harmonic']
  }
]);

const handleManifest = (item: FluxManifest) => {
  registry.createOrder(props.buyerNode, props.sellerNode, item);
};
</script>

<style scoped>
.hover-emerald:hover {
  border-color: #00e5ff !important;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.1);
}
.grid-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
