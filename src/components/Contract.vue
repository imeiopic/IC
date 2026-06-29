<script setup lang="ts">
import { useContractStore } from '@/stores/contractStore';

const contractStore = useContractStore();

const handleSignature = async () => {
  await contractStore.groundContractPulse();
};
</script>

<template>
  <div class="contract-substrate" :class="{ 'locked': contractStore.isGrounded }">
    <header class="contract-header">
      <h2>1111_SHIELD: Symmetrical Covenant</h2>
      <div class="status-badge" :class="{'bg-green-900 text-green-400': contractStore.isGrounded}">
        {{ contractStore.isGrounded ? 'GROUNDED' : 'AWAITING SYMMETRY' }}
      </div>
    </header>

    <div class="terms-bus">
      <div class="term-row" v-for="(term, index) in contractStore.terms" :key="index">
        <span class="thread-id">Thread_{{ String(index + 1).padStart(2, '0') }}</span>
        <p>{{ term }}</p>
      </div>
    </div>

    <div class="signature-zone">
      <div class="party-a">
        <label>Initiating Node (01)</label>
        <div class="sig-box" :class="{ 'signed': contractStore.isInitiatorSigned }">
          {{ contractStore.isInitiatorSigned ? 'SIGHTED' : 'AWAITING' }}
        </div>
      </div>
      
      <div class="handshake-icon">🤝</div>

      <div class="party-b">
        <label>Receiving Node (02)</label>
        <div class="sig-box" :class="{ 'signed': contractStore.isReceiverSigned }">
          {{ contractStore.isReceiverSigned ? 'SIGHTED' : 'AWAITING' }}
        </div>
      </div>
    </div>

    <button 
      v-if="!contractStore.isReceiverSigned" 
      @click="handleSignature" 
      class="sign-btn"
    >
      GROUND MY SIGNATURE
    </button>
  </div>
</template>

<style scoped>
.contract-substrate { 
  background: #080808; 
  border: 2px solid #333; 
  padding: 2.5rem; 
  border-radius: 10px; 
  transition: all 0.5s ease;
}
.contract-substrate.locked { 
  border-color: #00ff00; 
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.1); 
}
.contract-header { display: flex; justify-content: space-between; align-items: center; }
.status-badge { padding: 0.25rem 0.5rem; font-size: 0.7rem; background: #222; }
.terms-bus { margin: 2rem 0; border-top: 1px solid #222; }
.term-row { display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #111; font-size: 0.9rem; }
.thread-id { color: #ffd700; font-family: monospace; font-size: 0.8rem; min-width: 80px; }
.signature-zone { display: flex; justify-content: space-around; align-items: center; margin-top: 3rem; }
.sig-box { width: 120px; height: 50px; background: #111; border: 1px dashed #444; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; }
.sig-box.signed { border: 1px solid #00ff00; color: #00ff00; }
.sign-btn { width: 100%; margin-top: 2rem; background: #ffd700; color: #000; padding: 1rem; font-weight: bold; cursor: pointer; border: none; transition: background 0.3s; }
.sign-btn:hover { background: #e6c200; }
</style>