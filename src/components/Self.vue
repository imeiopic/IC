<template>
  <div class="self-container">
    <header class="self-header">
      <h2 class="text-glow">INTERNAL SYMMETRY TEST // VRE_PHASE_01</h2>
      <p>Thread Calibration: Phase 01 (Self)</p>
    </header>

    <!-- IDENTITY_REALITY_ASSERTION -->
    <section class="reality-assertion-card mb-4">
      <div class="flex-row-between mb-2">
        <span class="status-indicator text-glow-emerald animate-pulse"
          >● NODE_REALITY_ASSERTED</span
        >
        <span v-if="nearbyInvitesCount > 0" class="tiny text-warning animate-pulse"
          >● {{ nearbyInvitesCount }} PEERS_SIGHTED</span
        >
        <span class="tiny text-muted">SUID_LOCKED</span>
      </div>

      <div class="assertion-content">
        <div class="operator-status">
          OPERATOR_STATUS: <span class="text-white">TRUE_SUBJECT</span>
        </div>
        <div class="spatial-metadata">Matrix Footprint: Grounded [{{ spatialAnchor }}°N]</div>
        <div class="cogito-axiom">"I'm IOist, therefore I'm Real."</div>
      </div>
    </section>

    <!-- SYMMETRY_GAUGE -->
    <section class="symmetry-gauge-container mb-6">
      <div class="flex-row-between mb-2">
        <div class="gauge-label-group">
          <span class="tiny text-muted uppercase tracking-widest">Symmetry Ratio</span>
          <span class="tiny text-muted italic d-block">1:16 Mandate Threshold</span>
        </div>
        <span class="text-xs font-mono font-bold" :class="ratioClass"
          >{{ symmetryRatio.toFixed(2) }}x</span
        >
      </div>
      <div class="gauge-track">
        <div class="gauge-fill" :class="gaugeColorClass" :style="{ width: gaugeWidth + '%' }"></div>
      </div>
    </section>

    <section class="bio-rhythm-monitor">
      <div class="monitor-label">BIOLOGICAL HEARTBEAT SYNC</div>
      <div class="wave-container">
        <div class="schumann-wave"></div>
      </div>
      <div class="resonance-value" :class="{ 'pulse-active': isPulsing }">{{ currentHz }} Hz</div>
      <div v-if="videoStream" class="video-preview">
        <video
          ref="videoRef"
          autoplay
          muted
          playsinline
          style="width: 220px; border: 1px solid #00ff41; margin-top: 1rem; transform: scaleX(-1)"
        ></video>
      </div>
      <div v-if="coords" class="coords-preview">
        <span>Location: [{{ coords.lat?.toFixed(4) }}, {{ coords.lng?.toFixed(4) }}]</span>
      </div>
    </section>

    <div class="directive-acknowledgment">
      <h3>INTENT ALIGNMENT</h3>
      <div v-for="d in directives" :key="d.id" class="directive-check">
        <input type="checkbox" v-model="d.accepted" />
        <span>{{ d.text }}</span>
      </div>
    </div>

    <div
      v-if="symmetryFractureDetected"
      class="symmetry-fracture-alert mt-4 p-3 border border-red-500 bg-red-900 text-red-300 rounded"
    >
      <p class="font-bold mb-2">{{ fractureMessage }}</p>
      <p class="text-xs mb-3">Local minimum pulse: {{ lowestLocalPulse?.toFixed(2) }} Hz</p>
      <button
        @click="realignToSymmetry"
        class="realign-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Realign to Symmetry ({{ (16 * (lowestLocalPulse || 0)).toFixed(2) }} Hz)
      </button>
    </div>

    <footer class="self-footer">
      <button @click="initializeSelfPulse" :disabled="!isReady" class="pulse-btn">
        EXECUTE SELF-GROUNDING
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase';
import { SPICE } from '../utils/SPICE';
import { useGlobalMandates } from './ReusableMandate.vue';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  where,
  Timestamp
} from 'firebase/firestore';

// --- IDENTITY & STATE ---
const currentHz = ref(7.83);
const coords = ref<{ lat: number; lng: number } | null>(null);
const videoStream = ref<MediaStream | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
const symmetryFractureDetected = ref(false);
const lowestLocalPulse = ref<number | null>(null);
const fractureMessage = ref<string | null>(null);
const isPulsing = ref(false);
const nearbyInvitesCount = ref(0);
let scanTimer: any = null;

const { checkSymmetryMandate } = useGlobalMandates();

/**
 * Periodically scans the local cluster for active peer invites.
 * Updates the UI status and the Symmetry Gauge passively.
 */
const performBackgroundScan = async () => {
  if (!coords.value) return;
  try {
    const proximityInvites = await checkProximityInvites(coords.value);
    nearbyInvitesCount.value = proximityInvites.length;

    // Passively update lowest pulse for the Symmetry Gauge
    if (proximityInvites.length > 0) {
      lowestLocalPulse.value = Math.min(...proximityInvites.map((n: any) => n.pulse || 1.1));
    } else {
      lowestLocalPulse.value = null;
    }
  } catch (err) {
    console.error('Background scan failed:', err);
  }
};

const directives = ref([
  {
    id: 'D1',
    text: 'SOVEREIGN_GROUNDING: I anchor my 5 energy vectors to physical coordinates.',
    accepted: false
  },
  {
    id: 'D2',
    text: 'SYMMETRY_LAW: I reject extraction and accept the 1:16 mandate threshold.',
    accepted: false
  },
  {
    id: 'D3',
    text: 'MYB_PROTOCOL: I will insulate my interface and block legacy telemetry.',
    accepted: false
  }
]);

const isReady = computed(() => {
  return !!coords.value && directives.value.every((d) => d.accepted);
});

const spatialAnchor = computed(() => {
  return coords.value?.lat?.toFixed(2) || '41.81';
});

const symmetryRatio = computed(() => {
  if (!lowestLocalPulse.value || lowestLocalPulse.value <= 0) return 1.0;
  return currentHz.value / lowestLocalPulse.value;
});

const gaugeWidth = computed(() => {
  return Math.min((symmetryRatio.value / 16) * 100, 100);
});

const ratioClass = computed(() => {
  if (symmetryRatio.value > 16) return 'text-danger animate-pulse';
  if (symmetryRatio.value > 12) return 'text-warning';
  return 'text-glow-emerald';
});

const gaugeColorClass = computed(() => {
  if (symmetryRatio.value > 16) return 'bg-danger';
  if (symmetryRatio.value > 12) return 'bg-warning';
  return 'bg-emerald';
});

// --- IDEAL PROXIMITY HANDSHAKE LOGIC ---
const MAX_MESH_DENSITY = 16;
const METERS_RADIUS = 9;

onMounted(async () => {
  // Initialize Location Sighting
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      coords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      performBackgroundScan();
    });
  }

  // Initialize Background Watcher (10s intervals)
  scanTimer = setInterval(performBackgroundScan, 10000);

  // Initialize SIGHTING (Video)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStream.value = stream;
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
    }
  } catch (err) {
    console.warn('Vision hardware not accessible. Proceeding with spatial-only grounding.');
  }
});

onUnmounted(() => {
  if (scanTimer) clearInterval(scanTimer);
});

// Query for invites within 9m radius
async function checkProximityInvites(coords: { lat: number; lng: number }) {
  // Approx 9m conversion for rough bounding box
  const range = 0.00008;
  const q = query(
    collection(db, 'nodes'),
    where('lat', '>=', coords.lat - range),
    where('lat', '<=', coords.lat + range)
  );
  const snap = await getDocs(q);
  // Filter by lng and inviting
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as any))
    .filter((n) => n.lng >= coords.lng - range && n.lng <= coords.lng + range && n.inviting);
}

// Accept an invitation (stub: update Firestore or local state)
async function acceptSymmetricalInvitation(nodeId: string) {
  await updateDoc(doc(db, 'nodes', nodeId), {
    inviting: false,
    accepted: true,
    lastPulse: Timestamp.now()
  });
  localStorage.setItem('self_validated', 'true');
}

// Reject and pulse solo (stub: create new invite)
async function rejectAndPulseSolo(coords: { lat: number; lng: number }) {
  await broadcastInvitePulse(coords);
}

// Broadcast a new invite
async function broadcastInvitePulse(coords: { lat: number; lng: number }) {
  await addDoc(collection(db, 'nodes'), {
    lat: coords.lat,
    lng: coords.lng,
    pulse: currentHz.value,
    inviting: true,
    invitedAt: Timestamp.now()
  });
  localStorage.setItem('self_validated', 'true');
}

const realignToSymmetry = () => {
  if (lowestLocalPulse.value !== null) {
    currentHz.value = 16 * lowestLocalPulse.value;

    // Trigger pulse animation
    isPulsing.value = true;
    setTimeout(() => {
      isPulsing.value = false;
    }, 600);

    fractureMessage.value = null; // Clear the message
    symmetryFractureDetected.value = false; // Reset fracture state
    alert(`Node pulse realigned to ${currentHz.value.toFixed(2)} Hz.`);
  }
};

const initializeSelfPulse = async () => {
  // 1. SIGHTING: Detect physical coordinates
  if (!coords.value) {
    alert('Location not available. Please allow location access.');
    return;
  }

  try {
    SPICE.verifyGrounding(coords.value);
  } catch (e) {
    return; // Execution halted by Software Physics
  }

  const nodeCoords = { lat: coords.value.lat, lng: coords.value.lng };

  // 2. BUS CHECK: Search for invites within 9m radius
  const proximityInvites = await checkProximityInvites(nodeCoords);

  // 3. MANDATE CHECK: Verify 1:16 Symmetry Ratio
  fractureMessage.value = null; // Clear previous fracture message
  symmetryFractureDetected.value = false; // Reset fracture state

  if (proximityInvites.length > 0) {
    const lowestPulse = Math.min(...proximityInvites.map((n: any) => n.pulse || 1.1));
    lowestLocalPulse.value = lowestPulse; // Capture lowest pulse for the gauge
    const excess = checkSymmetryMandate(currentHz.value, lowestPulse);

    if (excess > 0) {
      fractureMessage.value = `SYMMETRY_FRACTURE: Your current pulse (${
        currentHz.value
      } Hz) exceeds 16x the local minimum (${lowestPulse.toFixed(
        2
      )} Hz). Grounding blocked by 1111_SHIELD.`;
      symmetryFractureDetected.value = true;
      console.warn(`[MANDATE_VIOLATION] Excess of ${excess} detected. Node realignment required.`);
      return;
    }
  } else {
    lowestLocalPulse.value = null; // Reset if solo
  }

  // Mesh density check
  if (proximityInvites.length >= MAX_MESH_DENSITY) {
    alert('Thread Saturated: More than 16 nodes detected in this 9m cluster. Symmetry impossible.');
    return;
  }

  if (proximityInvites.length > 0) {
    // Conflict resolution: pick highest velocity
    let peer = proximityInvites[0];
    for (const n of proximityInvites) {
      if ((n.velocity || 0) > (peer.velocity || 0)) peer = n;
    }
    const decision = confirm(`Node detected within 9m: ${peer.id}. Align with this frequency?`);
    if (decision) {
      await acceptSymmetricalInvitation(peer.id);
      alert('Symmetry Confirmed. You have joined the existing Grounding Point.');
    } else {
      await rejectAndPulseSolo(nodeCoords);
      alert('Invitation Rejected. Grounding new unique coordinate.');
    }
  } else {
    // No invites: become emitter
    await broadcastInvitePulse(nodeCoords);
    alert('No local nodes detected. Your invite is now pulsing in the 9m radius.');
  }
};

// Haversine formula for distance between two lat/lng points in meters
function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
</script>

<style scoped>
.self-container {
  background: #050505;
  color: #00ff41;
  padding: 2rem;
  border: 2px solid #00ff41;
  font-family: 'Space Mono', monospace;
  max-width: 600px;
  margin: 2rem auto;
}
.reality-assertion-card {
  background: #000;
  border: 1px solid #064e3b; /* emerald-900 */
  padding: 1rem;
  font-family: 'Space Mono', monospace;
}
.flex-row-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status-indicator {
  font-size: 9px;
  font-weight: bold;
  letter-spacing: 0.1em;
}
.text-glow-emerald {
  color: #10b981;
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}
.assertion-content {
  background: #0a0a0a;
  padding: 0.75rem;
  border: 1px solid #1a1a1a;
  margin-top: 0.5rem;
}
.operator-status {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  color: #737373;
}
.spatial-metadata {
  font-size: 10px;
  color: #a3a3a3;
  margin-top: 0.25rem;
}
.cogito-axiom {
  font-size: 10px;
  color: #737373;
  font-style: italic;
  margin-top: 0.5rem;
  border-top: 1px solid #1a1a1a;
  padding-top: 0.25rem;
}

.gauge-label-group {
  display: flex;
  flex-direction: column;
}
.d-block {
  display: block;
}
.bg-danger {
  background-color: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}
.bg-warning {
  background-color: #fbbf24;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}
.bg-emerald {
  background-color: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}
.text-danger {
  color: #ef4444;
}
.text-warning {
  color: #fbbf24;
}

.gauge-track {
  height: 6px;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  position: relative;
  width: 100%;
}
.gauge-fill {
  height: 100%;
  transition: width 0.7s ease-in-out, background-color 0.3s;
}

.video-preview {
  margin-top: 1rem;
}
.coords-preview {
  margin-top: 0.5rem;
  color: #00e5ff;
}
.tiny {
  font-size: 0.65rem;
}
.text-muted {
  color: #525252;
}

.self-header {
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
  background: repeating-linear-gradient(90deg, #00ff41 0 2px, transparent 2px 8px);
  opacity: 0.3;
}
.resonance-value {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.pulse-active {
  animation: pulse-ring 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    text-shadow: 0 0 0px #00ff41;
    color: #00ff41;
  }
  50% {
    transform: scale(1.2);
    text-shadow: 0 0 15px #00ff41;
    color: #fff;
  }
  100% {
    transform: scale(1);
    text-shadow: 0 0 0px #00ff41;
    color: #00ff41;
  }
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
.self-footer {
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

.symmetry-fracture-alert {
  margin-top: 1.5rem;
  border-color: #ef4444; /* red-500 */
  background-color: #7f1d1d; /* red-900 */
}
</style>
