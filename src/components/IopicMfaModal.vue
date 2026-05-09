<template>
  <div class="mfa-overlay">
    <div class="mfa-card">
      <header class="mfa-header">
        <h3 class="text-glow">KINETIC FALLBACK: MULTI-FACTOR</h3>
        <p>Grounding identity via secondary logic gate.</p>
      </header>

      <div v-if="!challengeActive" class="method-select">
        <button @click="startPeerVerification" class="method-btn">
          <span>PEER HANDSHAKE</span>
          <small>Ask a Symmetrical Contact to verify you</small>
        </button>
        <button @click="startLogicPulse" class="method-btn">
          <span>LOGIC KEY PULSE</span>
          <small>Time-based code from secondary device</small>
        </button>
      </div>

      <div v-else class="challenge-area">
        <div class="logic-code-display">
          <input
            v-for="(bit, i) in 6"
            :key="i"
            v-model="mfaBits[i]"
            maxlength="1"
            class="bit-input"
            @input="focusNext($event, i)"
          />
        </div>
        <div class="timer-bar">
          <div class="timer-fill" :style="{ width: timerWidth + '%' }"></div>
        </div>
      </div>

      <footer class="mfa-footer">
        <button @click="cancelMfa" class="cancel-btn">RESET THREAD</button>
        <button v-if="challengeActive" @click="verifyMfa" class="verify-btn">
          VERIFY SYMMETRY
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const challengeActive = ref(false);
const mfaBits = ref(["", "", "", "", "", ""]);
const timerWidth = ref(100);

const startPeerVerification = () => {
  // Trigger Peer Handshake flow (notify stewards)
  challengeActive.value = true;
  startTimer();
};

const startLogicPulse = () => {
  challengeActive.value = true;
  startTimer();
};

const focusNext = (el, i) => {
  if (el.target.value && i < 5) {
    el.target.nextElementSibling.focus();
  }
};

const startTimer = () => {
  timerWidth.value = 100;
  const interval = setInterval(() => {
    timerWidth.value -= 1;
    if (timerWidth.value <= 0) clearInterval(interval);
  }, 300);
};

const verifyMfa = () => {
  const code = mfaBits.value.join("");
  if (code === "161616") {
    // Example: Logic of the 16-thread bus
    alert("Symmetry Confirmed. Node Grounded.");
  } else {
    alert("Friction Detected. Logic Mismatch.");
  }
};

const cancelMfa = () => {
  challengeActive.value = false;
  mfaBits.value = ["", "", "", "", "", ""];
  timerWidth.value = 100;
};
</script>

<style scoped>
.mfa-card {
  background: #050505;
  color: #00ff41;
  padding: 2rem;
  border: 1px solid #00ff41;
  width: 400px;
  font-family: "Space Mono", monospace;
}

.method-btn {
  width: 100%;
  padding: 1rem;
  background: #111;
  border: 1px solid #333;
  color: #00ff41;
  margin-bottom: 10px;
  text-align: left;
  cursor: pointer;
}

.method-btn:hover {
  border-color: #00ff41;
  background: #0a0a0a;
}

.logic-code-display {
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;
}

.bit-input {
  width: 45px;
  height: 60px;
  background: #000;
  border: 1px solid #00ff41;
  color: #00ff41;
  text-align: center;
  font-size: 1.5rem;
}

.timer-bar {
  height: 4px;
  background: #111;
  width: 100%;
}
.timer-fill {
  height: 100%;
  background: #ff0041;
  transition: width 0.3s linear;
}

.verify-btn {
  width: 100%;
  padding: 1rem;
  background: #00ff41;
  color: #000;
  border: none;
  font-weight: bold;
}
</style>
