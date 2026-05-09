<template>
  <div class="steward-handshake-modal">
    <header>
      <h2 class="text-glow">STEWARD HANDSHAKE</h2>
      <p>
        Mutual authentication and resonance check for Root Stewards collective.
      </p>
    </header>
    <section class="handshake-status">
      <div v-for="steward in stewards" :key="steward.id" class="steward-row">
        <span class="steward-id">{{ steward.name }}</span>
        <span
          :class="['status-dot', steward.verified ? 'ok' : 'pending']"
        ></span>
        <span class="status-label">{{
          steward.verified ? "VERIFIED" : "PENDING"
        }}</span>
      </div>
    </section>
    <footer>
      <button
        @click="initiateHandshake"
        :disabled="inProgress"
        class="init-btn"
      >
        INITIATE COLLECTIVE HANDSHAKE
      </button>
      <div v-if="inProgress" class="progress-msg">Handshake in progress...</div>
      <div v-if="allVerified" class="success-msg">
        All Root Stewards verified. System Symmetry: LOCKED.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const stewards = ref([
  { id: "RS-001", name: "Ime Iopic", verified: false },
  { id: "RS-002", name: "Steward North", verified: false },
  { id: "RS-003", name: "Steward South", verified: false },
  { id: "RS-004", name: "Steward East", verified: false },
  { id: "RS-005", name: "Steward West", verified: false },
]);
const inProgress = ref(false);
const allVerified = ref(false);

// Poll backend for real-time status
let pollInterval = null;
async function fetchStewards() {
  try {
    const res = await fetch("/api/steward-handshake-status");
    const data = await res.json();
    if (Array.isArray(data.allStewards)) {
      stewards.value = data.allStewards;
      allVerified.value = data.allVerified;
    }
  } catch {}
}

onMounted(() => {
  fetchStewards();
  pollInterval = setInterval(fetchStewards, 2000);
});
onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});

// Call backend to verify this steward
const myStewardId = "RS-001"; // Ime Iopic
const initiateHandshake = async () => {
  inProgress.value = true;
  try {
    const res = await fetch("/api/steward-handshake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stewardId: myStewardId }),
    });
    const data = await res.json();
    if (Array.isArray(data.allStewards)) {
      stewards.value = data.allStewards;
      allVerified.value = data.allVerified;
    }
  } catch {}
  inProgress.value = false;
};
</script>

<style scoped>
.steward-handshake-modal {
  background: #0a0a0a;
  color: #00ff41;
  padding: 2rem;
  border: 2px solid #00ff41;
  max-width: 500px;
  margin: 2rem auto;
  font-family: "Space Mono", monospace;
}
.text-glow {
  text-shadow: 0 0 10px #00ff41;
}
.steward-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 1rem;
}
.steward-id {
  font-weight: bold;
}
.status-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-block;
  background: #444;
  border: 2px solid #222;
}
.status-dot.ok {
  background: #00ff41;
}
.status-dot.pending {
  background: #ff0041;
}
.status-label {
  font-size: 0.9rem;
}
.init-btn {
  background: #00ff41;
  color: #000;
  border: none;
  padding: 1rem 2rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 2rem;
}
.progress-msg {
  color: #00e5ff;
  margin-top: 1rem;
}
.success-msg {
  color: #00ff41;
  margin-top: 1rem;
  font-weight: bold;
}
</style>
