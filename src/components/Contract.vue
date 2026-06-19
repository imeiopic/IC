<template>
  <div class="contract-substrate" :class="{ 'locked': isGrounded }">
    <div class="contract-header">
      <h2>1111_SHIELD: Symmetrical Covenant</h2>
      <div class="status-badge">{{ isGrounded ? 'GROUNDED' : 'AWAITING SYMMETRY' }}</div>
    </div>

    <div class="terms-bus">
      <div class="term-row" v-for="(term, index) in terms" :key="index">
        <span class="thread-id">Thread_{{ index + 1 }}</span>
        <p>{{ term }}</p>
      </div>
    </div>

    <div class="signature-zone">
      <div class="party-a">
        <label>Initiating Node (01)</label>
        <div class="sig-box" :class="{ 'signed': sigA }">{{ sigA ? 'SIGHTED' : 'AWAITING' }}</div>
      </div>
      
      <div class="handshake-icon">🤝</div>

      <div class="party-b">
        <label>Receiving Node (02)</label>
        <div class="sig-box" :class="{ 'signed': sigB }">{{ sigB ? 'SIGHTED' : 'AWAITING' }}</div>
      </div>
    </div>

    <button 
      v-if="!userHasSigned" 
      @click="pulseSignature" 
      class="sign-btn"
    >
      Ground My Signature
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const sigA = ref(true); // Initiator has already sighted
const sigB = ref(false);
const isGrounded = computed(() => sigA.value && sigB.value);

const terms = ref([
  "Commitment to the 1:16 Ratio within this collaboration.",
  "Automatic 1.1x atmospheric distribution on all shared equity.",
  "Dispute resolution via the 16-thread logic bus."
]);

const pulseSignature = async () => {
  // Trigger the 1111_SHIELD MFA Handshake
  console.log("Initiating Multi-Thread Verification...");
  sigB.value = true;
  await store.dispatch('groundContractPulse', { contractId: 'NSN_01_CONTRACT' });
};
</script>

<style scoped>
.contract-substrate { background: #080808; border: 2px solid #333; padding: 2.5rem; border-radius: 10px; }
.contract-substrate.locked { border-color: #00ff00; box-shadow: 0 0 20px rgba(0, 255, 0, 0.1); }
.terms-bus { margin: 2rem 0; border-top: 1px solid #222; }
.term-row { display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #111; }
.thread-id { color: #ffd700; font-family: monospace; font-size: 0.8rem; min-width: 80px; }
.signature-zone { display: flex; justify-content: space-around; align-items: center; margin-top: 3rem; }
.sig-box { width: 120px; height: 50px; background: #111; border: 1px dashed #444; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; }
.sig-box.signed { border: 1px solid #00ff00; color: #00ff00; }
.sign-btn { width: 100%; margin-top: 2rem; background: #ffd700; color: #000; padding: 1rem; font-weight: bold; cursor: pointer; border: none; }
</style>