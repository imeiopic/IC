<template>
  <CContainer fluid class="communication-substrate p-4 bg-black min-vh-100 font-mono text-white">
    
    <header class="d-flex justify-content-between align-items-center mb-5 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-broadcast-pin text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">PEER_RESONANCE</h1>
      </div>
      <div class="connection-status text-end">
        <div class="tiny text-zinc-500 uppercase">Resonance_Frequency</div>
        <div class="text-success font-black h5 m-0 animate-pulse">7.83Hz_LOCKED</div>
      </div>
    </header>

    <CRow>
      <CCol lg="4">
        <CCard class="bg-zinc-900 border-zinc-800 text-white shadow-glow mb-4">
          <CCardHeader class="font-black italic text-info border-zinc-800 bg-zinc-800 py-2">
            ACTIVE_THREADS
          </CCardHeader>
          <CCardBody class="p-0 overflow-auto" style="max-height: 500px;">
            <div 
              v-for="peer in activePeers" 
              :key="peer.id" 
              class="peer-item p-3 border-bottom border-zinc-950 transition-all"
              :class="{ 'bg-info bg-opacity-10': activePeerId === peer.id }"
              @click="selectPeer(peer)"
            >
              <div class="d-flex justify-content-between align-items-center">
                <div class="small font-black">{{ peer.displayName || peer.id.substring(0,8) }}</div>
                <div class="tiny text-zinc-600">SYNC</div>
              </div>
              <div class="tiny text-zinc-500 text-truncate">ID: {{ peer.id.substring(0,12) }}</div>
            </div>
            <div v-if="activePeers.length === 0" class="p-4 text-center tiny text-zinc-600 italic">
              SEARCHING_FOR_GROUNDED_NODES...
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg="8">
        <CCard class="bg-zinc-900 border-info text-white shadow-info mb-4 h-100 min-vh-50">
          <CCardHeader class="bg-zinc-800 border-0 font-black italic d-flex justify-content-between py-3">
            <span v-if="activePeer">THREAD: {{ activePeer.displayName || activePeer.id.substring(0,8) }}</span>
            <span v-else>SELECT_PEER_TO_SIGHT</span>
            <span class="tiny text-info">ENCRYPTION: 16_THREAD_AES</span>
          </CCardHeader>
          
          <CCardBody class="d-flex flex-column" style="height: 450px;">
            <div ref="chatBox" class="message-feed flex-grow-1 overflow-auto p-3 bg-black rounded mb-3">
              <div v-for="(msg, i) in messages" :key="i" 
                class="message mb-3 d-flex flex-column"
                :class="msg.sender === userId ? 'align-items-end' : 'align-items-start'"
              >
                <div class="tiny text-zinc-600 mb-1 font-mono">NODE_{{ msg.sender.substring(0,4) }}</div>
                <div class="message-bubble p-2 rounded-2 small" 
                  :style="msg.sender === userId ? 'background: #00e5ff; color: #000;' : 'background: #1a1a1a; color: #fff;'"
                >
                  {{ msg.content }}
                </div>
              </div>
              <div v-if="!activePeerId" class="h-100 d-flex align-items-center justify-content-center opacity-25 italic small">
                AWAITING_RESONANCE_HANDSHAKE
              </div>
            </div>

            <div class="input-substrate d-flex gap-2">
              <CFormInput 
                v-model="newMessage" 
                @keyup.enter="dispatchPulse"
                placeholder="TRANSMIT_PULSE..." 
                class="bg-black border-zinc-800 text-info font-mono"
                :disabled="!activePeerId"
              />
              <CButton color="info" class="font-black italic" @click="dispatchPulse" :disabled="!activePeerId">
                SEND
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <footer class="mt-auto pt-4 text-center opacity-25 tiny">
      "I = VR² | THE MESH IS SPEAKING"
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

// STATE
const userId = ref(auth.currentUser?.uid || 'GUEST');
const activePeerId = ref<string | null>(null);
const activePeer = ref<any>(null);
const activePeers = ref<any[]>([]);
const messages = ref<any[]>([]);
const newMessage = ref('');
const chatBox = ref<HTMLElement | null>(null);

/**
 * 01_SIGHTING_PEER_RESONANCE
 */
const initCommStream = () => {
  // Sighting active mesh peers (Grounded Nodes only)
  const q = query(collection(db, 'users'), where('status', '==', 'Grounded_Node'));
  onSnapshot(q, (snap) => {
    activePeers.value = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(p => p.id !== userId.value);
  });
};

const selectPeer = (peer: any) => {
  activePeerId.value = peer.id;
  activePeer.value = peer;
  subscribeToThread(peer.id);
};

const subscribeToThread = (peerId: string) => {
  const threadId = [userId.value, peerId].sort().join('_');
  const q = query(
    collection(db, 'messages'),
    where('threadId', '==', threadId),
    orderBy('timestamp', 'asc')
  );
  
  onSnapshot(q, (snap) => {
    messages.value = snap.docs.map(doc => doc.data());
    scrollToBottom();
  });
};

const dispatchPulse = async () => {
  if (!newMessage.value.trim() || !activePeerId.value) return;

  const threadId = [userId.value, activePeerId.value].sort().join('_');
  
  await addDoc(collection(db, 'messages'), {
    threadId,
    sender: userId.value,
    content: newMessage.value,
    timestamp: serverTimestamp()
  });

  newMessage.value = '';
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }
};

onMounted(() => initCommStream());
</script>

<style scoped>
.peer-item { cursor: pointer; border-left: 3px solid transparent; }
.peer-item:hover { background: rgba(0, 229, 255, 0.05); }
.peer-item.bg-info { border-left-color: #00e5ff; }
.message-feed { scrollbar-width: thin; scrollbar-color: #00e5ff #000; }
.text-glow { text-shadow: 0 0 15px rgba(0, 229, 255, 0.4); }
.shadow-info { box-shadow: 0 0 30px rgba(0, 229, 255, 0.1) !important; }
.font-black { font-weight: 900; }
.tiny { font-size: 0.65rem; }
.italic { font-style: italic; }
.min-vh-50 { min-height: 50vh; }
</style>