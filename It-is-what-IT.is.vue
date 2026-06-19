<script setup lang="ts">
import { computed } from 'vue';
import { calculateMobius } from './mobius-helpers.cjs';

interface Props {
  inputSubject: string;
  protocolId: string; // BigInt string
  entropyThreshold?: number;
}

const props = withDefaults(defineProps<Props>(), {
  entropyThreshold: 0,
});

/**
 * IT-IS-WHAT-IT-IS Logic:
 * If the Möbius value is 0 (Chaos), and we exceed the threshold, it is filtered.
 * Otherwise, it is acknowledged as an Immutable Constant (IT).
 */
const stateResolution = computed(() => {
  const n = BigInt(props.protocolId);
  const mu = calculateMobius(n);

  // In the Iopic system, mu === 0 represents systemic chaos/entropy.
  if (mu === 0) {
    return {
      label: 'ENTROPIC_VARIABLE',
      action: 'FILTER_LEAK',
      message: 'Data rejected: Potential node-collapse trigger detected.',
    };
  }

  return {
    label: 'IMMUTABLE_CONSTANT',
    action: 'ANCHOR_IT',
    message: 'State acknowledged. No metabolic resource allocated for resistance.',
  };
});
</script>

<template>
  <div class="acceptance-gate p-4 border border-amber-500 bg-black rounded shadow-lg">
    <h2 class="text-amber-500 text-lg font-bold uppercase tracking-widest">
      INPUT_VALIDATED: {{ inputSubject }}
    </h2>
    <p class="font-mono text-xs text-amber-200 opacity-70">STATUS: {{ stateResolution.label }}</p>
    <div
      class="logic-gate mt-4 p-2 bg-amber-900/20 border-l-2 border-amber-500 text-amber-100 font-mono text-sm"
    >
      {{ stateResolution.message }}
    </div>
  </div>
</template>
