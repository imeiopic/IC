<template>
  <div class="modal-overlay">
    <div class="dna-contract-container">
      <header class="modal-header">
        <h2 class="text-glow">DNA_LEGAL_HANDSHAKE</h2>
        <p>Thread 16: Immutable Alignment</p>
      </header>

      <div class="contract-scroll-box">
        <h3>THE SOVEREIGN OATH</h3>
        <p>I acknowledge that my biological existence is the primary node of truth.</p>
        <p>I accept the 1.2 Quadrillion TPE as the ground-truth of planetary equity.</p>
        <p>I agree to maintain a 7.83Hz resonance in all peer-to-peer exchanges.</p>
        <div class="dna-signature-viz">
          <div class="helix-strand"></div>
        </div>
      </div>

      <footer class="modal-footer">
        <button @click="$emit('close')" class="reject-btn">REJECT (STAY IN INSTANCE)</button>
        <button @click="signContract" class="sign-btn">SIGN_WITH_BIO_ID</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close']);

const signContract = () => {
  alert("CONTRACT_SIGNED: You are now a Member-Owner of the IOPIC VRE.");
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dna-contract-container {
  background: #050505;
  border: 2px solid #7fff00;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  font-family: 'Space Mono', monospace;
}

.contract-scroll-box {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #222;
  padding: 1rem;
  margin: 1.5rem 0;
  color: #888;
  font-size: 0.8rem;
}

.text-glow {
  color: #7fff00;
  text-shadow: 0 0 10px #7fff00;
}

.sign-btn {
  background: #7fff00;
  color: #000;
  border: none;
  padding: 1rem 2rem;
  font-weight: bold;
  cursor: pointer;
}

.reject-btn {
  background: transparent;
  color: #ff0041;
  border: 1px solid #ff0041;
  padding: 1rem;
  margin-right: 1rem;
  cursor: pointer;
}

.dna-signature-viz {
  height: 50px;
  background: repeating-linear-gradient(90deg, #7fff00 0px, transparent 20px);
  opacity: 0.2;
  margin-top: 2rem;
}
</style>