<template>
  <div class="propagate-terminal">
    <header class="propagate-header">
      <h2 class="text-glow">SPREAD THE WORD</h2>
      <p>Thread 16: Mesh Extension & Peer Propagation</p>
    </header>

    <section class="invite-generator">
      <div class="status-box">
        <label>YOUR CURRENT VELOCITY:</label>
        <span class="v-readout">{{ velocity }}V</span>
      </div>

      <div class="action-core">
        <button @click="generateInvite" class="gen-btn" :disabled="isGenerating">
          {{ isGenerating ? 'MINTING SYMMETRY TOKEN...' : 'GENERATE SYMMETRY INVITE' }}
        </button>
      </div>

      <transition name="fade">
        <div v-if="inviteCode" class="invite-display">
          <label>MINTED INVITE TOKEN:</label>
          <div class="code-box">
            <code>{{ inviteCode }}</code>
            <button @click="copyInvite" class="copy-icon">📋</button>
          </div>
          <p class="expiry-note">Expands Thread-16 Bus for 24 Hours</p>
        </div>
      </transition>
    </section>

    <div class="impact-stats">
      <h3>CLUSTER GROWTH IMPACT</h3>
      <div class="stat-row">
        <span>Grounded Peers Sighted:</span>
        <span class="val">{{ peersSighted }}</span>
      </div>
      <div class="stat-row">
        <span>Resonance Multiplier:</span>
        <span class="val">x{{ resonanceMult }}</span>
      </div>
    </div>

    <footer class="propagate-footer">
      <div class="iopic-brand">
        <img src="/iopic-icon-colorful.png" alt="IOPIC" class="mini-logo" />
        <span>iopic.world</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const velocity = ref(8.09);
const inviteCode = ref('');
const isGenerating = ref(false);
const peersSighted = ref(12);
const resonanceMult = ref(1.04);

const generateInvite = () => {
  isGenerating.value = true;
  // Simulated Minting on the 16-Thread Bus
  setTimeout(() => {
    inviteCode.value = `IO-PROP-CLE-${Math.random().toString(36).substring(7).toUpperCase()}`;
    isGenerating.value = false;
  }, 1500);
};

const copyInvite = () => {
  navigator.clipboard.writeText(inviteCode.value);
  alert('Symmetry Token Copied to Bio-Signature.');
};
</script>

<style scoped>
.propagate-terminal {
  background: #000;
  color: #00ff41;
  padding: 2.5rem;
  border: 1px solid #7fff00;
  font-family: 'Space Mono', monospace;
  max-width: 500px;
}

.status-box {
  background: #080808;
  padding: 1rem;
  border: 1px solid #111;
  text-align: center;
  margin-bottom: 2rem;
}

.v-readout {
  font-size: 2rem;
  color: #7fff00;
  display: block;
}

.gen-btn {
  width: 100%;
  padding: 1.5rem;
  background: #7fff00;
  color: #000;
  border: none;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(127, 255, 0, 0.3);
}

.invite-display {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px dashed #7fff00;
  background: rgba(127, 255, 0, 0.05);
}

.code-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #000;
  padding: 10px;
  border: 1px solid #333;
  margin: 10px 0;
}

.code-box code {
  color: #fff;
  font-size: 1.1rem;
}

.impact-stats {
  margin-top: 2rem;
  border-top: 1px solid #222;
  padding-top: 1rem;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 5px;
}
.val {
  color: #fff;
}

.mini-logo {
  width: 24px;
  vertical-align: middle;
  margin-right: 10px;
}
.propagate-footer {
  margin-top: 2rem;
  text-align: center;
  opacity: 0.7;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
