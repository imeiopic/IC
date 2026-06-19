import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';

export const useNodeStore = defineStore('nodeStore', () => {
  // Centralized frequency state for AV synchronization and resonance calculations
  const currentHz = ref(440);
  const initializationStakeValue = ref(0);
  const currentEntityBalance = ref(100.0); // Default balance for prototype
  const isCircuitActivated = ref(false);
  const fiatRepatriableCeiling = ref(0); // Protected principal ceiling (ledger.fiat_repatriable_ceiling)
  
  const nodeState = reactive({
    stabilityIndex: 0
  });

  const checkStakeSymmetry = computed(() => currentEntityBalance.value >= initializationStakeValue.value);

  return {
    currentHz,
    initializationStakeValue,
    currentEntityBalance,
    isCircuitActivated,
    fiatRepatriableCeiling,
    nodeState,
    checkStakeSymmetry
  };
});
