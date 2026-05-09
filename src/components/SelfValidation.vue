<template>
  <div class="self-val-container">
    <header class="val-header">
      <h2 class="text-glow">INTERNAL SYMMETRY TEST</h2>
      <p>Thread Calibration: Phase 01 (Self)</p>
    </header>

    <section class="bio-rhythm-monitor">
      <div class="monitor-label">BIOLOGICAL HEARTBEAT SYNC</div>
      <div class="wave-container">
        <div class="schumann-wave"></div>
      </div>
      <div class="resonance-value">{{ currentHz }} Hz</div>
      <div v-if="videoStream" class="video-preview">
        <video
          ref="videoRef"
          autoplay
          muted
          playsinline
          style="
            width: 220px;
            border: 1px solid #00ff41;
            margin-top: 1rem;
            transform: scaleX(-1);
          "
        ></video>
      </div>
      <div v-if="coords" class="coords-preview">
        <span
          >Location: [{{ coords.lat?.toFixed(4) }},
          {{ coords.lng?.toFixed(4) }}]</span
        >
      </div>
    </section>

    <div class="directive-acknowledgment">
      <h3>INTENT ALIGNMENT</h3>
      <div v-for="d in directives" :key="d.id" class="directive-check">
        <input type="checkbox" v-model="d.accepted" />
        <span>{{ d.text }}</span>
      </div>
    </div>

    <footer class="val-footer">
      <button
        @click="initializeSelfPulse"
        :disabled="!isReady"
        class="pulse-btn"
      >
        EXECUTE SELF-GROUNDING
      </button>
    </footer>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { db } from "../firebase";
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";

const currentHz = ref(7.83);

// --- IDEAL PROXIMITY HANDSHAKE LOGIC ---
const MAX_MESH_DENSITY = 16;

// Haversine formula for distance between two lat/lng points in meters

// Query for invites within 9m radius
async function checkProximityInvites(coords) {
  const range = 0.00008; // ~9 meters in degrees
  const q = query(
    collection(db, "nodes"),
    where("lat", ">=", coords.lat - range),
    where("lat", "<=", coords.lat + range),
  );
  const snap = await getDocs(q);
  // Filter by lng and inviting
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter(
      (n) =>
        n.lng >= coords.lng - range &&
        n.lng <= coords.lng + range &&
        n.inviting,
    );
}

// Accept an invitation (stub: update Firestore or local state)
async function acceptSymmetricalInvitation(nodeId) {
  await updateDoc(doc(db, "nodes", nodeId), {
    inviting: false,
    accepted: true,
  });
  localStorage.setItem("self_validated", "true");
}

// Reject and pulse solo (stub: create new invite)
async function rejectAndPulseSolo(coords) {
  await broadcastInvitePulse(coords);
}

// Broadcast a new invite
async function broadcastInvitePulse(coords) {
  await addDoc(collection(db, "nodes"), {
    lat: coords.lat,
    lng: coords.lng,
    inviting: true,
    invitedAt: Date.now(),
  });
  localStorage.setItem("self_validated", "true");
}

const initializeSelfPulse = async () => {
  // 1. SIGHTING: Detect physical coordinates
  if (!coords.value) {
    alert("Location not available. Please allow location access.");
    return;
  }
  const nodeCoords = { lat: coords.value.lat, lng: coords.value.lng };

  // 2. BUS CHECK: Search for invites within 9m radius
  const proximityInvites = await checkProximityInvites(nodeCoords);

  // Mesh density check
  if (proximityInvites.length >= MAX_MESH_DENSITY) {
    alert("Thread Saturated: More than 16 nodes detected in this 9m cluster.");
    return;
  }

  if (proximityInvites.length > 0) {
    // Conflict resolution: pick highest velocity
    let peer = proximityInvites[0];
    for (const n of proximityInvites) {
      if ((n.velocity || 0) > (peer.velocity || 0)) peer = n;
    }
    const decision = confirm(
      `Node detected within 9m: ${peer.id}. Align with this frequency?`,
    );
    if (decision) {
      await acceptSymmetricalInvitation(peer.id);
      alert(
        "Symmetry Confirmed. You have joined the existing Grounding Point.",
      );
    } else {
      await rejectAndPulseSolo(nodeCoords);
      alert("Invitation Rejected. Grounding new unique coordinate.");
    }
  } else {
    // No invites: become emitter
    await broadcastInvitePulse(nodeCoords);
    alert(
      "No local nodes detected. Your invite is now pulsing in the 9m radius.",
    );
  }
};
const METERS_RADIUS = 9;

// Haversine formula for distance between two lat/lng points in meters
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
</script>

<style scoped>
.self-val-container {
  background: #050505;
  color: #00ff41;
  padding: 2rem;
  border: 2px solid #00ff41;
  font-family: "Space Mono", monospace;
  max-width: 600px;
  margin: 2rem auto;
}
.video-preview {
  margin-top: 1rem;
}
.coords-preview {
  margin-top: 0.5rem;
  color: #00e5ff;
}
.val-header {
  margin-bottom: 2rem;
}
.bio-rhythm-monitor {
  margin-bottom: 2rem;
}
.wave-container {
  height: 40px;
  background: #111;
  margin: 1rem 0;
  border-radius: 8px;
}
.schumann-wave {
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    #00ff41 0 2px,
    transparent 2px 8px
  );
  opacity: 0.3;
}
.resonance-value {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}
.directive-acknowledgment {
  margin-bottom: 2rem;
}
.directive-check {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.val-footer {
  text-align: right;
}
.pulse-btn {
  background: #00ff41;
  color: #000;
  border: none;
  padding: 1rem 2rem;
  font-weight: bold;
  cursor: pointer;
}
.pulse-btn:disabled {
  background: #1a1a1a;
  color: #444;
}
</style>
