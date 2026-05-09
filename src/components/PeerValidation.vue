<template>
  <div class="peer-validation-modal">
    <header class="validation-header">
      <h2 class="text-glow">PEER VALIDATION TERMINAL</h2>
      <p class="status">SIGHTING PENDING: NODE_{{ pendingNode.id }}</p>
      <div v-if="pendingNode.coords">
        <span class="coords-label"
          >Coordinates: [{{ pendingNode.coords.lat?.toFixed(4) }},
          {{ pendingNode.coords.lng?.toFixed(4) }}]</span
        >
      </div>
    </header>

    <div class="handshake-view">
      <div class="peer-stream">
        <video ref="peerVideo" autoplay class="video-feed"></video>
        <div class="overlay-label">INCOMING_NODE</div>
      </div>
      <div class="local-stream">
        <video ref="localVideo" autoplay muted class="video-feed"></video>
        <div class="overlay-label">VALIDATOR (YOU)</div>
      </div>
    </div>

    <section class="logic-verification">
      <div class="check-item" v-for="check in validationChecks" :key="check.id">
        <input
          type="checkbox"
          v-model="check.verified"
          :id="'check-' + check.id"
        />
        <label :for="'check-' + check.id">{{ check.label }}</label>
      </div>
    </section>

    <footer class="validation-footer">
      <button @click="rejectFriction" class="reject-btn">
        REPORT FRICTION
      </button>
      <button
        @click="confirmSymmetry"
        :disabled="!allChecksPassed"
        class="confirm-btn"
      >
        GRANT SYMMETRY PULSE
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getApp } from "firebase/app";

const db = getFirestore(getApp());
import { useRoute } from "vue-router";
const route = useRoute();
const pendingNode = ref({ id: "", coords: "" });

// On mount, get node from query param
onMounted(() => {
  const nodeId = route.query.node;
  if (nodeId) {
    pendingNode.value.id = nodeId;
    // Optionally fetch more node info from Firestore
    onSnapshot(doc(db, "peers", nodeId), (snap) => {
      if (snap.exists()) {
        pendingNode.value = { ...pendingNode.value, ...snap.data() };
      }
    });
  }
});

const validationChecks = ref([
  { id: 1, label: "Biological Human Verified (Sight/Sound)", verified: false },
  { id: 2, label: "Intent Alignment (Directives 1-5)", verified: false },
  { id: 3, label: "Coordinate Proximity Sync", verified: false },
]);

const allChecksPassed = computed(() => {
  return validationChecks.value.every((c) => c.verified);
});

const localVideo = ref(null);
const peerVideo = ref(null);

// --- WebRTC Video Handshake Logic ---

// --- WebRTC Video Handshake Logic (Firestore Signaling) ---
let rtcConnection = null;
// ...existing code...

// --- Symmetry Unlock Logic (Cloud Function) ---
async function confirmSymmetry() {
  // Call backend function to unlock node
  try {
    const res = await fetch("/api/unlock-symmetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId: pendingNode.value.id }),
    });
    if (res.ok) {
      alert(`Node ${pendingNode.value.id} has been Grounded.`);
    } else {
      alert("Symmetry unlock failed.");
    }
  } catch (e) {
    alert("Symmetry unlock error: " + e);
  }
}

function rejectFriction() {
  alert("Friction Reported. Node remains in Logic Limbo.");
}
</script>

<style scoped>
/* ...existing styles from your snippet... */
.peer-validation-modal {
  background: #050505;
  color: #00ff41;
  padding: 2rem;
  border: 2px solid #00ff41;
  font-family: "Space Mono", monospace;
  max-width: 800px;
}
.handshake-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 2rem 0;
}
.video-feed {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #000;
  border: 1px solid #333;
}
.overlay-label {
  font-size: 0.7rem;
  background: rgba(0, 255, 65, 0.2);
  padding: 4px;
  text-align: center;
}
.logic-verification {
  background: #111;
  padding: 1.5rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}
.check-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}
.confirm-btn {
  background: #00ff41;
  color: #000;
  border: none;
  padding: 1rem 2rem;
  font-weight: bold;
  cursor: pointer;
}
.confirm-btn:disabled {
  background: #1a1a1a;
  color: #444;
}
.reject-btn {
  background: transparent;
  color: #ff0041;
  border: 1px solid #ff0041;
  padding: 1rem;
  margin-right: 15px;
  cursor: pointer;
}
</style>
