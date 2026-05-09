<template>
  <div class="peer-terminal-container p-4">
    <div class="logic-bg"></div>
    <div class="vignette-overlay"></div>

    <header class="peer-header mb-5 text-center position-relative z-1">
      <h2 class="text-gold font-black italic uppercase tracking-tighter">PEER_VALIDATOR_TERMINAL</h2>
      <div v-if="pendingNode.id" class="status-alert text-info font-mono tiny mt-2 animate-pulse">
        SIGHTING PENDING: NODE_{{ pendingNode.id.substring(0, 12) }}
      </div>
      <div v-if="pendingNode.genesisAnchor" class="anchor-tag text-emerald-500 font-mono tiny mt-1 border border-emerald-900 d-inline-block px-2 bg-black">
        GENESIS_ANCHOR: {{ pendingNode.genesisAnchor }}
      </div>
    </header>

    <div class="handshake-view grid-layout mb-5 position-relative z-1">
      <div class="peer-stream position-relative border border-zinc-800 rounded overflow-hidden shadow-emerald bg-zinc-950">
        <video ref="peerVideo" autoplay class="video-feed grayscale"></video>
        <div class="overlay-label bg-black text-info px-2 py-1 tiny font-black">INCOMING_NODE_STREAM</div>
        <div class="biometric-overlay"></div> 
      </div>
      
      <div class="local-stream position-relative border border-gold rounded overflow-hidden bg-zinc-950">
        <video ref="localVideo" autoplay muted class="video-feed"></video>
        <div class="overlay-label bg-black text-gold px-2 py-1 tiny font-black">VALIDATOR (YOU)</div>
        <div class="scan-line"></div>
      </div>
    </div>

    <section class="logic-verification p-4 bg-zinc-950 border border-zinc-900 rounded mb-5 position-relative z-1">
      <h4 class="tiny font-black text-gold uppercase mb-4 tracking-widest d-flex justify-content-between">
        Symmetry_Verification_Protocol
        <span class="text-zinc-500">v1.6.2</span>
      </h4>
      <div class="check-item d-flex align-items-center gap-3 mb-3" v-for="check in validationChecks" :key="check.id">
        <input type="checkbox" v-model="check.verified" :id="'check-' + check.id" class="form-check-input bg-black border-zinc-700 custom-check" />
        <label :for="'check-' + check.id" class="font-mono text-white opacity-75 small cursor-pointer">{{ check.label }}</label>
      </div>
    </section>

    <section class="peer-io-transfer p-4 border border-info rounded mb-5 bg-black position-relative z-1">
      <div class="multiplier-tag tiny font-black bg-info text-black px-2 position-absolute top-0 end-0 m-2">1.5x_ACTIVE</div>
      <h3 class="text-info tiny font-black uppercase mb-4 italic">Peer-to-Peer IO$ Transit</h3>
      <div class="row g-3">
        <div class="col-md-4">
          <label class="tiny font-mono text-zinc-500 d-block mb-1">DEBIT_NODE</label>
          <input :value="fromNode" class="form-control bg-transparent border-zinc-800 text-info font-mono tiny" readonly />
        </div>
        <div class="col-md-4">
          <label class="tiny font-mono text-zinc-500 d-block mb-1">CREDIT_NODE</label>
          <input v-model="toNode" class="form-control bg-transparent border-zinc-800 text-info font-mono tiny" placeholder="PEER_UID" />
        </div>
        <div class="col-md-4">
          <label class="tiny font-mono text-zinc-500 d-block mb-1">AMOUNT_IO$</label>
          <input v-model.number="amount" type="number" class="form-control bg-transparent border-zinc-800 text-info font-mono tiny" />
        </div>
        <div class="col-12 mt-3">
          <button @click="sendPeerIOTransfer" class="btn btn-outline-info w-100 font-black btn-sm uppercase py-2">EXECUTE_TRANSIT_PULSE</button>
        </div>
      </div>
      <div v-if="transferMsg" class="transfer-msg text-center mt-3 text-success font-mono tiny animate-pulse">>> {{ transferMsg }}</div>
    </section>

    <section class="peer-list-substrate mb-5 position-relative z-1">
      <h4 class="tiny font-black text-gold uppercase mb-3 tracking-widest">Grounded_Nodes_In_Range</h4>
      <div class="peer-grid">
        <div v-for="peer in groundedPeers" :key="peer.id" class="peer-card d-flex align-items-center p-3 mb-2 bg-black border border-zinc-900 rounded">
          <div class="equity-icon-wrap me-3">
            <img :src="getPeerAsset(peer.equityTier)" alt="Tier" class="tier-img" :class="{ 'glow-sovereign': peer.equityTier >= 1000 }" />
          </div>
          <div class="peer-meta text-start">
            <div class="peer-id font-mono text-white small">NODE_{{ peer.id.substring(0, 8) }}</div>
            <div class="peer-anchor tiny font-mono text-zinc-500 italic">{{ peer.genesisAnchor || 'FLOATING' }}</div>
          </div>
          <div class="ms-auto text-end">
            <div :class="getStatusClass(peer.identityStatus)" class="tiny font-black uppercase italic">{{ peer.identityStatus || 'SIGHTED' }}</div>
            <div class="text-info font-mono tiny">{{ peer.equityTier || 0 }} IO$</div>
          </div>
        </div>
      </div>
    </section>

    <footer class="peer-footer d-flex justify-content-between align-items-center position-relative z-1">
      <button @click="rejectFriction" class="btn btn-outline-danger btn-sm font-black px-4 uppercase">REPORT_FRICTION</button>
      <button :disabled="!allChecksPassed" @click="confirmSymmetry" class="btn btn-emerald-glow px-5 py-2 font-black uppercase">
        GRANT_SYMMETRY
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebase'; // Resolved path to root
import { doc, onSnapshot, updateDoc, serverTimestamp, collection, query, where } from 'firebase/firestore';
import { useAuth } from '../composables/useAuth';

const { user } = useAuth();
const route = useRoute();

// Reactive State
const pendingNode = ref<any>({ id: '', genesisAnchor: '', equityTier: 0 });
const groundedPeers = ref<any[]>([]);
const toNode = ref('');
const amount = ref(1600);
const transferMsg = ref('');
const localVideo = ref<HTMLVideoElement | null>(null);
const localStream = ref<MediaStream | null>(null);

const fromNode = computed(() => user.value?.uid?.substring(0, 12) || 'LOADING...');

const validationChecks = ref([
  { id: 1, label: 'Spatiotemporal Anchor Verified', verified: false },
  { id: 2, label: 'Biometric Face-ID Match (Sighting)', verified: false },
  { id: 3, label: 'Intent Alignment (Directive 16)', verified: false }
]);

const allChecksPassed = computed(() => validationChecks.value.every(c => c.verified));

// Camera Logic
const initValidatorStream = async () => {
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true });
    if (localVideo.value) localVideo.value.srcObject = localStream.value;
  } catch (err) {
    console.error("HARDWARE_FRICTION:", err);
  }
};

// Asset Mapping
const getPeerAsset = (tier: any) => {
  const val = Number(tier);
  if (val >= 1000) return '/images/1000$.jpg';
  if (val >= 100) return '/images/100$.jpg';
  if (val >= 10) return '/images/10$.jpg';
  return '/images/1$.jpg';
};

const getStatusClass = (s: string) => {
  return s === 'SYMMETRY_GRANTED' ? 'text-emerald-500' : 'text-info';
};

onMounted(() => {
  initValidatorStream();
  
  const nodeId = route.query.node as string;
  if (nodeId) {
    toNode.value = nodeId;
    onSnapshot(doc(db, 'users', nodeId), (snap) => {
      if (snap.exists()) pendingNode.value = { id: nodeId, ...snap.data() };
    });
  }

  // Real-time Peer Sync
  const q = query(collection(db, 'users'), where('status', '==', 'EQUITY_GROUNDED'));
  onSnapshot(q, (snap) => {
    groundedPeers.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  });
});

async function confirmSymmetry() {
  if (!pendingNode.value.id) return;
  try {
    const userRef = doc(db, 'users', pendingNode.value.id);
    await updateDoc(userRef, {
      identityStatus: 'SYMMETRY_GRANTED',
      verifiedBy: user.value.uid,
      groundedAt: serverTimestamp()
    });
    alert('SYMMETRY_GRANTED: Node anchored.');
  } catch (e) { alert('TRANSIT_ERROR'); }
}

const sendPeerIOTransfer = () => {
  transferMsg.value = "Executing Transit Pulse...";
  setTimeout(() => {
    transferMsg.value = `SUCCESS: ${amount.value} IO$ Transferred.`;
  }, 2000);
};

function rejectFriction() { alert('FRICTION_REPORTED'); }

onUnmounted(() => {
  if (localStream.value) localStream.value.getTracks().forEach(t => t.stop());
});
</script>

<style scoped>
.peer-terminal-container { min-height: 100vh; background: #000; position: relative; overflow-x: hidden; }
.logic-bg { position: absolute; inset: 0; background: url('/images/image_19dc52.jpg') center/cover; opacity: 0.1; filter: grayscale(1); }
.vignette-overlay { position: absolute; inset: 0; background: radial-gradient(circle, transparent, #000 90%); pointer-events: none; }
.video-feed { width: 100%; height: 200px; object-fit: cover; }
.grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.tier-img { width: 40px; height: 40px; object-fit: contain; }
.glow-sovereign { filter: drop-shadow(0 0 10px rgba(197, 160, 89, 0.8)); }
.btn-emerald-glow { background: transparent; border: 1px solid #10b981; color: #10b981; transition: 0.3s; }
.btn-emerald-glow:hover:not(:disabled) { background: #10b981; color: #000; box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
.btn-emerald-glow:disabled { opacity: 0.3; cursor: not-allowed; border-color: #333; color: #333; }
.tiny { font-size: 0.6rem; letter-spacing: 1px; }
.font-black { font-weight: 900; }
</style>