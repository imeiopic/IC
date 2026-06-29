<template>
  <div class="sovereign-proprietorship-node">
    <h3>{{ entityName }} // Sovereign Node</h3>
    <div class="resonance-gauge" :class="{ 'active': isSymmetric }">
      Resonance: {{ currentResonance }}Hz
    </div>
    
    <button @click="initiateEconomicAnchor">Anchor Node to Mesh</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAsyncSymmetry } from '../hooks/useAsyncSymmetry';
import { anchorToMesh } from '../services/DICClient';

const entityName = ref("My Sovereign Node");
const isSymmetric = ref(false);

const initiateEconomicAnchor = async () => {
  // Logic: Registers the node within the 16-thread global ledger
  const anchorResult = await anchorToMesh('ECONOMIC_TYPE_SOLE');
  
  // Verify symmetry before accepting any IO$ transactions
  if (anchorResult.status === 'SYMMETRIC') {
    isSymmetric.value = true;
  }
};
</script>