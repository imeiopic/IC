<template>
  <div class="ot-component p-6 bg-neutral-900 text-white font-mono border border-neutral-800">
    <h2 class="text-lg font-bold text-blue-400 mb-4">OT.vue (Operational Thread)</h2>
    <div class="status-display p-4 bg-neutral-950 border border-neutral-800 rounded mb-4">
      <p class="text-sm text-neutral-400">Current Operational Status:</p>
      <p
        :class="[
          'text-xl font-bold',
          isApexResonanceActive ? 'text-emerald-400' : 'text-amber-500',
        ]"
      >
        {{
          isApexResonanceActive ? '2.2x MUTUAL APEX RESONANCE ACTIVE' : 'STANDARD 1.1x MULTIPLIER'
        }}
      </p>
      <p v-if="isApexResonanceActive" class="text-xs text-emerald-300 mt-2">
        Enhanced transaction processing and data flow enabled.
      </p>
      <p v-else class="text-xs text-amber-300 mt-2">
        Awaiting verified binary trust handshake for resonance activation.
      </p>
    </div>
    <div class="transaction-info text-sm text-neutral-300 mb-6">
      <p>Transaction fees: <span class="text-purple-400">0% (VRE Edict_11)</span></p>
      <p>
        Maintenance Multiplier:
        <span class="text-blue-400">{{ currentMultiplier }}x</span>
      </p>
    </div>

    <!-- Symmetrical Node Split Calculation -->
    <div class="symmetrical-split-section p-4 bg-neutral-950 border border-neutral-800 rounded">
      <h3 class="text-md font-bold text-purple-400 mb-3">SYMMETRICAL NODE SPLIT (1/16)</h3>
      <div class="flex items-center gap-3 mb-3">
        <label for="transactionAmount" class="text-neutral-400 text-xs"
          >Hypothetical Transaction Amount:</label
        >
        <input
          id="transactionAmount"
          type="number"
          v-model.number="hypotheticalTransactionAmount"
          min="0"
          step="0.01"
          class="bg-black border border-neutral-700 p-1 text-amber-400 text-right w-32 focus:outline-none focus:border-purple-500 text-xs"
        />
        <span class="text-neutral-300 text-xs">IO$</span>
      </div>

      <div v-if="hypotheticalTransactionAmount > 0" class="space-y-2">
        <p class="text-neutral-300 text-xs">
          Initial Equity Pulse:
          <span class="text-emerald-400 font-bold"
            >{{ hypotheticalTransactionAmount.toFixed(2) }} IO$</span
          >
        </p>
        <p class="text-neutral-300 text-xs">
          Finders Fee (1/16th):
          <span class="text-purple-400 font-bold">{{ findersFee.toFixed(2) }} IO$</span>
        </p>
        <p class="text-neutral-500 text-[10px] italic mt-2">
          OT_ENGINE: Finders fee locked at pure 1/16 symmetry. No floating decimal noise detected.
        </p>
      </div>
      <div v-else>
        <p class="text-neutral-500 text-xs italic">Enter an amount to see the symmetrical split.</p>
      </div>
    </div>

    <footer class="mt-6 pt-4 border-t border-neutral-900">
      <button
        @click="simulateTransactionError"
        class="w-full bg-red-500 text-black font-bold p-3 text-xs tracking-widest hover:bg-red-600 transition-colors duration-300"
      >
        SIMULATE_TRANSACTION_FRACTURE
      </button>
    </footer>
    <!-- Further OT.vue specific logic would go here -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia'; // Ensure pinia is installed
import { useTrustStore } from '@/stores/trustStore';
import { useCriticalErrorStore } from '@/stores/criticalErrorStore';

const trustStore = useTrustStore();
// Destructure the state property reactively using storeToRefs
const { isApexResonanceActive } = storeToRefs(trustStore);
// Initialize the critical error store
const criticalErrorStore = useCriticalErrorStore(); // Import the critical error store
// Removed stray 'n;' character
const hypotheticalTransactionAmount = ref(100.0); // Default value

// Computed property for the current multiplier
const currentMultiplier = computed(() => (isApexResonanceActive.value ? 2.2 : 1.1));

// Function to calculate the finders fee based on the prompt's specification
const calculateFindersFee = (baseEquityPulse: number): number => {
  // Enforcing the 1:16 Architecture Ratio
  const symmetricalFee = baseEquityPulse / 16;
  return symmetricalFee; // Returns exact 6.25% structural parity
};

// Computed property for the finders fee
const findersFee = computed(() => {
  if (hypotheticalTransactionAmount.value <= 0) return 0;
  return calculateFindersFee(hypotheticalTransactionAmount.value);
});

// Log statement as requested by the prompt
console.log(
  'OT_ENGINE: Finders fee locked at pure 1/16 symmetry. No floating decimal noise detected.'
);

// Function to simulate a transaction error that triggers ARC.vue
const simulateTransactionError = () => {
  console.error('OT_ENGINE: Transaction processing fracture detected! Initiating ARC override.');
  criticalErrorStore.activateCriticalError(
    'Transaction processing failed due to ungrounded data. ARC.vue engaged.'
  );
};
</script>

<style scoped>
/* Removed empty ruleset for .ot-component as per warning */

/* Fix for removing spin buttons from number input */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0; /* Safari and Chrome */
}
/* Add standard appearance property for compatibility and Firefox */
input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
  -webkit-appearance: none; /* Safari and Chrome */
  appearance: textfield; /* Standard property */
}
</style>
