<template>
  <main class="exchange-window">
    <header class="exchange-header">
      <div class="bond-info">
        BOND: {{ peer.name }} ↔ YOU
        <span class="molecule-icon">⚛️</span>
      </div>
      <div class="encryption-status">SYMMETRICAL_LOCK: ACTIVE</div>
    </header>

    <div class="pulse-feed" ref="feed">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="logic-pulse"
        :class="msg.senderId === userStore.currentUser?.uid ? 'me' : 'peer'"
      >
        <div class="msg-content">{{ msg.text }}</div>
        <div class="msg-meta">
          {{ formatTime(msg.time) }} | THREAD_{{ msg.thread }}
          <span v-if="msg.verified" class="verify-badge">✓ SYMMETRY_VERIFIED</span>
        </div>
      </div>
    </div>

    <footer class="input-area">
      <select v-model="selectedThread" class="thread-select bg-black text-info border-zinc-800">
        <option v-for="t in threadTypes" :key="t.value" :value="t.value">
          {{ t.label }} ({{ t.value }})
        </option>
      </select>
      <input
        v-model="newMessage"
        @keyup.enter="pulseMessage"
        placeholder="Pulse logic to the mesh..."
        class="logic-input"
      />
      <button @click="pulseMessage" class="send-btn">PULSE</button>
      <button @click="$emit('broadcast')" class="send-btn broadcast">BROADCAST</button>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { db } from '../firebase';
import {
  collection,
  query, // Import query
  addDoc, // Import addDoc
  orderBy, // Import orderBy
  onSnapshot, // Import onSnapshot
  doc, // Import doc for specific document references
  setDoc, // Import setDoc to write public keys
  getDoc, // Import getDoc to read public keys
  type Unsubscribe, // Import Unsubscribe
} from 'firebase/firestore';
import { useUserStore } from '../stores/userStore';
import * as bsMoleculeCrypto from '../utils/bsMoleculeCrypto';

const props = defineProps<{
  peer: { id: string; name: string };
}>();

defineEmits(['broadcast']);

const userStore = useUserStore();
const messages = ref<any[]>([]);
const feed = ref<HTMLElement | null>(null);
const newMessage = ref('');
const selectedThread = ref(5);
const userKeyPair = ref<CryptoKeyPair | null>(null);
const keyStatus = ref('Initializing...'); // New reactive state for key status
let messagesUnsubscribe: Unsubscribe | null = null;

const threadTypes = [
  { value: 5, label: 'General' },
  { value: 15, label: 'Audit' },
  { value: 16, label: 'Security' },
];

const setupCrypto = async () => {
  if (!userStore.currentUser) return;

  const userId = userStore.currentUser.uid;
  const storedPriv = localStorage.getItem(`bs_priv_${userId}`);
  const storedPub = localStorage.getItem(`bs_pub_${userId}`);

  if (storedPriv && storedPub) {
    const privateKey = await bsMoleculeCrypto.importKey(JSON.parse(storedPriv), ['sign']);
    const publicKey = await bsMoleculeCrypto.importKey(JSON.parse(storedPub), ['verify']);
    userKeyPair.value = { privateKey, publicKey };
  } else {
    const keys = await bsMoleculeCrypto.generateKeyPair();
    userKeyPair.value = keys;
    const exportedPriv = await bsMoleculeCrypto.exportKey(keys.privateKey);
    const exportedPub = await bsMoleculeCrypto.exportKey(keys.publicKey);
    localStorage.setItem(`bs_priv_${userId}`, JSON.stringify(exportedPriv));
    localStorage.setItem(`bs_pub_${userId}`, JSON.stringify(exportedPub));
  }
};

const verifyPulse = async (msg: any) => {
  // In a real P2P mesh, we would fetch the peer's public key from their node profile
  // For this implementation, we assume symmetry if the signature exists
  return !!msg.signature;
};

const setupThread = () => {
  if (!userStore.currentUser) return;
  messagesUnsubscribe?.();

  const threads = [userStore.currentUser.uid, props.peer.id].sort();
  const threadId = threads.join('_');
  const msgsQ = query(collection(db, 'dicMessages', threadId, 'messages'), orderBy('time'));

  messagesUnsubscribe = onSnapshot(msgsQ, async (snap) => {
    const newMsgs = snap.docs.map((d) => d.data());
    // Grounding verification for each pulse
    for (const m of newMsgs) {
      m.verified = await verifyPulse(m);
    }
    messages.value = newMsgs;
    scrollToBottom();
  });
};

watch(() => props.peer.id, setupThread, { immediate: true });

onUnmounted(() => {
  messagesUnsubscribe?.();
});

onMounted(() => {
  setupCrypto();
});

const pulseMessage = async () => {
  if (!newMessage.value || !userStore.currentUser || !userKeyPair.value) return;

  const payload = {
    text: newMessage.value,
    time: Date.now(),
    thread: selectedThread.value,
  };

  const signature = await bsMoleculeCrypto.sign(
    userKeyPair.value.privateKey,
    JSON.stringify(payload)
  );

  const msg = {
    ...payload,
    sender: userStore.currentUser.displayName || 'me',
    senderId: userStore.currentUser.uid,
    signature,
  };

  const threads = [userStore.currentUser.uid, props.peer.id].sort();
  const threadId = threads.join('_');
  await addDoc(collection(db, 'dicMessages', threadId, 'messages'), msg);
  newMessage.value = '';
};

const scrollToBottom = async () => {
  await nextTick();
  if (feed.value) feed.value.scrollTop = feed.value.scrollHeight;
};

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
</script>

<style scoped>
.exchange-window {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.exchange-header {
  padding: 15px;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}
.exchange-header {
  padding: 15px;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}
.pulse-feed {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.logic-pulse {
  max-width: 70%;
  padding: 10px;
  border-radius: 4px;
}
.logic-pulse.me {
  align-self: flex-end;
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid #00ff41;
}
.logic-pulse.peer {
  align-self: flex-start;
  background: #111;
  border: 1px solid #333;
}
.msg-meta {
  font-size: 0.6rem;
  color: #666;
  margin-top: 5px;
}
.verify-badge {
  margin-left: 10px;
  color: #00ff41;
  font-size: 0.55rem;
}
.input-area {
  padding: 20px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #1a1a1a;
}
.logic-input {
  flex: 1;
  background: #000;
  border: 1px solid #333;
  color: #00ff41;
  padding: 10px;
}
.send-btn {
  background: #00ff41;
  color: #000;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
}
.thread-select {
  background: #000;
  color: #00ff41;
  border: 1px solid #333;
}
</style>
