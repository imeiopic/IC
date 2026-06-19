<script setup lang="ts">
import { inject, ref, onMounted } from 'vue';

// Assume globalMandates is provided at a higher level (e.g., OS.vue)
const globalMandates = inject('globalMandates');

// Reactive state for demonstration
const mfaCodeInput = ref('');
const verificationStatus = ref('');
const nodeSecretKey = ref<Uint8Array | null>(null);
const generatedMfaCode = ref('');

// Simulate a node's secret key (should be securely stored and managed in a real app)
// For AES-128, it needs to be 16 bytes.
const generateRandomSecretKey = (): Uint8Array => {
  const key = new Uint8Array(16); // 16 bytes for AES-128
  crypto.getRandomValues(key); // Use Web Crypto API for secure random bytes
  return key;
};

onMounted(() => {
  // Initialize a secret key for the node on component mount
  nodeSecretKey.value = generateRandomSecretKey();
  console.log("Node's Secret Key (for demo):", Array.from(nodeSecretKey.value));
});

/**
 * Simulates an attempt to sight/harvest/move sensory data.
 * This action requires a valid 6-Digit Handshake (MFA).
 */
const attemptSighting = () => {
  if (!globalMandates) {
    verificationStatus.value = 'Error: Global Mandates not loaded.';
    console.error(verificationStatus.value);
    return;
  }
  if (!nodeSecretKey.value) {
    verificationStatus.value = 'Error: Node secret key not initialized.';
    console.error(verificationStatus.value);
    return;
  }

  verificationStatus.value = 'Attempting 6-Digit Handshake verification...';

  const isHandshakeValid = globalMandates.checkSovereignSightingMandate(
    mfaCodeInput.value,
    nodeSecretKey.value
  );

  if (isHandshakeValid) {
    verificationStatus.value = 'SUCCESS: 6-Digit Handshake valid. Sensory data access granted.';
    console.log('Sovereign Sighting Mandate UPHELD.');
  } else {
    verificationStatus.value = 'FAILURE: Invalid 6-Digit Handshake. Access DENIED.';
    console.warn('Sovereign Sighting Mandate VIOLATED.');
  }
};

/**
 * Generates a new MFA code for the current time step (for testing purposes).
 */
const generateTestMfaCode = () => {
  if (globalMandates && nodeSecretKey.value) {
    generatedMfaCode.value = globalMandates.generateMfaCode(nodeSecretKey.value);
    console.log('Generated MFA Code:', generatedMfaCode.value);
  } else {
    generatedMfaCode.value = 'Error generating code.';
  }
};
</script>

<template>
  <div class="sovereign-sighting-test">
    <h3>Sovereign Sighting Mandate Test</h3>
    <p>This component simulates an attempt to access a node's sensory data.</p>
    <p>A 6-Digit Handshake (MFA) is required.</p>

    <input type="text" v-model="mfaCodeInput" placeholder="Enter 6-Digit MFA Code" maxlength="6" />
    <button @click="attemptSighting">Attempt Sighting</button>
    <p>Verification Status: {{ verificationStatus }}</p>

    <hr />
    <h4>For Testing/Demo:</h4>
    <button @click="generateTestMfaCode">Generate Current MFA Code</button>
    <p v-if="generatedMfaCode">Use this code: <strong>{{ generatedMfaCode }}</strong></p>
  </div>
</template>

<style scoped>
.sovereign-sighting-test {
  border: 1px solid #FFC107;
  padding: 15px;
  margin: 10px 0;
  background-color: #fff8e1;
  border-radius: 8px;
}
h3 {
  color: #FFA000;
}
button {
  background-color: #FFC107;
  color: black;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}
button:hover {
  background-color: #FFB300;
}
input[type="text"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 180px;
}
</style>
