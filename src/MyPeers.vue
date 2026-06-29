<template>
  <div class="peer-mesh-container p-6 lg:p-10 text-white min-h-screen bg-black">
    <header class="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-zinc-800 pb-8">
      <div class="header-text">
        <h1 class="text-4xl font-black italic tracking-tighter uppercase text-white">Peer_Mesh</h1>
        <p class="text-emerald-500 font-mono text-xs tracking-widest">SIGHTING_MODE: GLOBAL_ACTIVE</p>
      </div>

      <div class="global-actions flex flex-wrap gap-3 justify-center">
        <button @click="triggerGlobal('VOICE_BROADCAST')" class="btn-mesh bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20">
          <i class="bi bi-broadcast-pin"></i> TALK_TO_ALL
        </button>
        <button @click="triggerGlobal('MESSAGE_ALL')" class="btn-mesh bg-zinc-800 hover:bg-zinc-700">
          <i class="bi bi-chat-quote-fill"></i> MSG_TO_ALL
        </button>
        <button @click="showAddModal = true" class="btn-mesh border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
          <i class="bi bi-person-plus-fill"></i> ADD_PEER
        </button>
      </div>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="peer in peers" 
        :key="peer.id"
        :class="['peer-card transition-all duration-300', { 'selected-peer': selectedPeerId === peer.id }]"
        @click="selectedPeerId = peer.id"
      >
        <div class="flex items-center gap-4 mb-6">
          <div class="face-sighting w-20 h-20 rounded-full border-2 border-emerald-500 p-1 bg-zinc-900">
            <img :src="peer.facePic || '/images/default-face.jpg'" class="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all">
          </div>
          <div class="overflow-hidden">
            <h3 class="font-bold text-xl truncate uppercase tracking-tighter">{{ peer.name }}</h3>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-[10px] font-mono text-zinc-500">SIGHTED_NODE: {{ peer.location }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button @click.stop="engage(peer, 'Video')" class="action-btn" title="Video Call"><i class="bi bi-camera-video-fill"></i></button>
          <button @click.stop="engage(peer, 'Voice')" class="action-btn" title="Voice Call"><i class="bi bi-mic-fill"></i></button>
          <button @mousedown.stop="startPTT(peer)" @mouseup.stop="stopPTT" class="action-btn ptt-btn" title="Walky-Talky">
            <i class="bi bi-radioactive"></i>
          </button>
          <button @click.stop="engage(peer, 'Chat')" class="action-btn" title="Message"><i class="bi bi-chat-right-dots-fill"></i></button>
          <button @click.stop="locatePeer(peer)" class="action-btn" title="Locate"><i class="bi bi-geo-alt-fill"></i></button>
          <button @click.stop="openTransfer(peer)" class="action-btn text-emerald-400 border border-emerald-900/50" title="Transfer IO$">
            <i class="bi bi-currency-exchange"></i>
          </button>
        </div>

        <div class="flex justify-between items-center mt-6 pt-4 border-t border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-600">IO$ BAL: {{ peer.balance }}</span>
          <div class="flex gap-3">
            <button @click.stop="openSettings(peer)" class="text-zinc-500 hover:text-white"><i class="bi bi-sliders"></i></button>
            <button @click.stop="confirmDelete(peer)" class="text-zinc-700 hover:text-red-500"><i class="bi bi-x-square-fill"></i></button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showTransferModal" class="modal-overlay fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-zinc-900 border border-emerald-500/30 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 class="text-2xl font-black italic mb-2 text-white">TRANSFER_IO$</h2>
        <p class="text-zinc-500 text-xs font-mono mb-6 uppercase">Target: {{ activeTarget?.name }}</p>
        <input type="number" v-model="transferAmount" class="w-full bg-black border border-zinc-800 p-4 rounded font-mono text-emerald-500 text-2xl mb-4" placeholder="0.00">
        <div class="flex gap-4">
          <button @click="executeTransfer" class="flex-1 bg-emerald-600 p-3 rounded font-bold uppercase italic text-white">Confirm_Pulse</button>
          <button @click="showTransferModal = false" class="flex-1 border border-zinc-700 p-3 rounded font-bold uppercase italic text-zinc-500">Abort</button>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 class="text-2xl font-black italic mb-2 text-white uppercase">Add_To_Mesh</h2>
        <p class="text-zinc-500 text-xs font-mono mb-6 italic">Enter Sovereign Peer Identifier</p>
        <input v-model="newPeerId" class="w-full bg-black border border-zinc-800 p-3 rounded font-mono text-white mb-4" placeholder="NODE_ID_OR_EMAIL">
        <div class="flex gap-4">
          <button @click="addPeer" class="flex-1 bg-emerald-600 p-3 rounded font-bold uppercase italic text-white">SIGHT_PEER</button>
          <button @click="showAddModal = false" class="flex-1 border border-zinc-700 p-3 rounded font-bold uppercase italic text-zinc-500">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="isPTTActive" class="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 px-8 py-3 rounded-full font-black italic animate-pulse z-50 shadow-lg text-white">
      VOICE_STREAM_OPEN: {{ activeTarget?.name }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../firebase'; // Corrected relative path
import { collection, query, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../useAuth';

const router = useRouter();
const { user } = useAuth();

// State Management
const peers = ref([]);
const selectedPeerId = ref(null);
const showTransferModal = ref(false);
const showAddModal = ref(false);
const isPTTActive = ref(false);
const activeTarget = ref(null);
const transferAmount = ref(0);
const newPeerId = ref('');

// Real-time Mesh Listener
onMounted(() => {
  if (user.value) {
    const q = query(collection(db, `users/${user.value.uid}/peers`));
    onSnapshot(q, (snapshot) => {
      peers.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
  }
});

// Logic Handlers
const triggerGlobal = (action) => alert(`SYSTEM_NOTICE: Initiating ${action} across all threads.`);
const engage = (peer, type) => alert(`SIGHTING: ${type} request sent to ${peer.name}`);
const startPTT = (peer) => { activeTarget.value = peer; isPTTActive.value = true; };
const stopPTT = () => { isPTTActive.value = false; };

const openTransfer = (peer) => {
  activeTarget.value = peer;
  showTransferModal.value = true;
};

const executeTransfer = async () => {
  if (transferAmount.value <= 0) return;
  // This would trigger a cloud function to ensure 16-thread transaction security
  alert(`TRANSACTION_COMPLETE: ${transferAmount.value} IO$ sent to ${activeTarget.value.id}`);
  showTransferModal.value = false;
  transferAmount.value = 0;
};

const locatePeer = (peer) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      alert(`SIGHTING: Peer ${peer.name} is synced at [${peer.location}]. 
      Your current coordinates: ${position.coords.latitude}, ${position.coords.longitude}`);
      
      router.push({ path: '/map-peers', query: { target: peer.id } });
    });
  }
};

// Inside MyPeers.vue
const addPeer = async () => {
  // Logic to add peer to Firestore...
  
  // Logical Gate: If this is the first peer in the mesh, route to IoD
  if (peers.value.length === 0) {
    alert("FIRST_PEERING_SIGHTED: Moving to IoD Substrate.");
    router.push('/iod');
  } else {
    alert(`SIGHTING: Peer ${newPeerId.value} added to Mesh.`);
  }
  showAddModal.value = false;
  newPeerId.value = '';
};
const confirmDelete = async (peer) => {
  if (confirm(`PURGE_PEER: Are you sure you want to delete ${peer.name}?`)) {
    // Logic to remove peer from Firestore
    console.log(`Purging node: ${peer.id}`);
  }
};

const openSettings = (peer) => alert(`SETTINGS: Adjusting permissions for ${peer.id}`);
</script>

<style scoped>
.btn-mesh { @apply px-6 py-3 rounded font-mono text-[10px] font-black transition-all flex items-center gap-3 uppercase; }
.peer-card { @apply bg-zinc-900 border border-zinc-800 p-6 rounded-2xl cursor-pointer hover:shadow-2xl hover:shadow-emerald-900/10; }
.selected-peer { @apply border-emerald-500 ring-2 ring-emerald-500/20 bg-zinc-800/50; }
.action-btn { @apply flex items-center justify-center p-4 rounded-xl bg-black hover:bg-emerald-600 hover:text-white transition-all text-xl text-zinc-400 border border-zinc-900; }
.ptt-btn:active { @apply bg-red-600 text-white scale-95; }
.face-sighting img { filter: sepia(0.5) hue-rotate(90deg) brightness(0.8) contrast(1.2); }
.face-sighting:hover img { filter: none; }
</style>