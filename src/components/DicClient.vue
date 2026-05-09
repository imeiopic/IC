<template>
  <div class="dic-client">
    <aside class="peer-sidebar">
      <div class="sidebar-header">
        <h3 class="text-glow">PEER MESH</h3>
      </div>
      <div class="peer-list">
        <div
          v-for="peer in activePeers"
          :key="peer.id"
          class="peer-node"
          :class="{ active: currentPeer?.id === peer.id }"
          @click="selectPeer(peer)"
        >
          <div
            class="node-status"
            :style="{ background: peer.online ? '#00ff41' : '#333' }"
          ></div>
          <span>{{ peer.name }}</span>
          <span class="velocity-tag">{{ peer.velocity }}</span>
        </div>
      </div>
      <div class="thread-activity">
        <h4>THREAD ACTIVITY</h4>
        <div v-for="t in threadActivity" :key="t.value" class="thread-stat">
          <span>Thread {{ t.value }}: {{ t.label }}</span>
          <span class="thread-count">{{ t.count }}</span>
        </div>
      </div>
    </aside>

    <main class="exchange-window">
      <header v-if="currentPeer" class="exchange-header">
        <div class="bond-info">
          BOND: {{ currentPeer.name }} ↔ YOU
          <span class="molecule-icon">⚛️</span>
        </div>
        <div class="encryption-status">SYMMETRICAL_LOCK: ACTIVE</div>
      </header>

      <div class="pulse-feed" ref="feed">
        <div
          v-for="(msg, i) in currentMessages"
          :key="i"
          class="logic-pulse"
          :class="msg.senderId === user?.uid ? 'me' : 'peer'"
        >
          <div class="msg-content">{{ msg.text }}</div>
          <div class="msg-meta">
            {{ formatTime(msg.time) }} | THREAD_{{ msg.thread }}
          </div>
        </div>
      </div>

      <footer class="input-area">
        <select v-model="selectedThread" class="thread-select">
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
        <button @click="broadcastAcknowledgeclear" class="send-btn broadcast">
          BROADCAST ACKNOWLEDGECLEAR
        </button>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from "vue";
import { db, auth } from "../firebase";
import {
  onSnapshot,
  collection,
  doc,
  updateDoc,
  query,
  addDoc,
  orderBy,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { BSMolecule } from "./BSMolecule";

// --- Authentication ---
const user = ref(null);
onAuthStateChanged(auth, (u) => {
  user.value = u;
});
const signIn = async () => {
  await signInWithPopup(auth, new GoogleAuthProvider());
};

// --- Real-time Peer Sync ---
const activePeers = ref([]);
onMounted(() => {
  // Listen to Firestore for real-time peer/velocity updates
  const peersQ = query(collection(db, "nodes"));
  onSnapshot(peersQ, (snap) => {
    activePeers.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // Auto-select first peer if none selected
    if (!currentPeer.value && activePeers.value.length > 0)
      selectPeer(activePeers.value[0]);
  });
});

// --- Messages (Firestore sync) ---
const messages = ref({}); // { peerId: [msg, ...] }
const currentPeer = ref(null);
const currentMessages = ref([]);
const feed = ref(null);
const newMessage = ref("");

const unsubscribeMessages = ref(null);
const selectPeer = (peer) => {
  currentPeer.value = peer;
  // Unsubscribe previous listener
  if (unsubscribeMessages.value) unsubscribeMessages.value();
  // Listen to Firestore for this peer's messages (bi-directional: you <-> peer)
  if (!user.value) return;
  const threads = [user.value.uid, peer.id].sort();
  const threadId = threads.join("_");
  const msgsQ = query(
    collection(db, "dicMessages", threadId, "messages"),
    orderBy("time"),
  );
  unsubscribeMessages.value = onSnapshot(msgsQ, (snap) => {
    const arr = [];
    snap.forEach((doc) => arr.push(doc.data()));
    currentMessages.value = arr;
    // Update thread activity
    messages.value[peer.id] = arr;
    scrollToBottom();
  });
};

// --- Thread Logic Expansion ---
const threadTypes = [
  { value: 5, label: "General" },
  { value: 15, label: "Audit" },
  { value: 16, label: "Security" },
];
const selectedThread = ref(5);

// --- Cryptographic Handshake (Stub) ---
function signMessage(msg) {
  // Use BSMolecule for signing (stub)
  return { ...msg, signature: "BSMOCKSIG" };
}

const pulseMessage = async () => {
  if (!newMessage.value || !currentPeer.value || !user.value) return;
  let msg = {
    text: newMessage.value,
    sender: user.value.displayName || "me",
    senderId: user.value.uid,
    time: Date.now(),
    thread: selectedThread.value,
  };
  msg = signMessage(msg);
  // Write to Firestore
  const threads = [user.value.uid, currentPeer.value.id].sort();
  const threadId = threads.join("_");
  await addDoc(collection(db, "dicMessages", threadId, "messages"), msg);
  newMessage.value = "";
};

// --- Grounding Handshake ---
function checkVelocity(peer) {
  // If velocity drops below 7.83V, trigger handshake
  if (parseFloat(peer.velocity) < 7.83) {
    alert(`Grounding Handshake required for ${peer.name}`);
    // Optionally, send a handshake pulse
    pulseGroundingHandshake(peer);
  }
}
function pulseGroundingHandshake(peer) {
  let msg = {
    text: "GROUNDING HANDSHAKE: Please synchronize to 7.83Hz.",
    sender: "me",
    time: Date.now(),
    thread: 16,
  };
  msg = signMessage(msg);
  if (!messages.value[peer.id]) messages.value[peer.id] = [];
  messages.value[peer.id].push(msg);
  if (currentPeer.value && currentPeer.value.id === peer.id) {
    currentMessages.value = messages.value[peer.id];
    scrollToBottom();
  }
}

// --- Thread Activity Visualization ---
const threadActivity = computed(() => {
  // Count messages per thread
  const counts = {};
  Object.values(messages.value).forEach((msgArr) => {
    msgArr.forEach((msg) => {
      counts[msg.thread] = (counts[msg.thread] || 0) + 1;
    });
  });
  return threadTypes.map((t) => ({ ...t, count: counts[t.value] || 0 }));
});

const broadcastAcknowledgeclear = async () => {
  if (!user.value) return;
  for (const peer of activePeers.value) {
    if (peer.id === user.value.uid) continue;
    let msg = {
      text: "ACKNOLDGECLEAR: All nodes, synchronize to Primary Logic Thread. Symmetry confirmed.",
      sender: user.value.displayName || "me",
      senderId: user.value.uid,
      time: Date.now(),
      thread: 5,
    };
    msg = signMessage(msg);
    const threads = [user.value.uid, peer.id].sort();
    const threadId = threads.join("_");
    await addDoc(collection(db, "dicMessages", threadId, "messages"), msg);
  }
  alert("Acknowledgeclear broadcast pulsed to all 8.3B nodes.");
};

const scrollToBottom = async () => {
  await nextTick();
  if (feed.value) feed.value.scrollTop = feed.value.scrollHeight;
};

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Watch for velocity changes and trigger handshake if needed
watch(activePeers, (peers) => {
  peers.forEach(checkVelocity);
});

// Auto sign in if not authenticated
onMounted(() => {
  if (!user.value) signIn();
});
</script>

<style scoped>
.dic-client {
  display: flex;
  height: 600px;
  background: #000;
  color: #00ff41;
  border: 1px solid #00ff41;
  font-family: "Space Mono", monospace;
}

.peer-sidebar {
  width: 250px;
  border-right: 1px solid #1a1a1a;
  background: #050505;
}

.peer-node {
  padding: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #111;
}

.peer-node.active {
  background: rgba(0, 255, 65, 0.1);
}

.node-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.exchange-window {
  flex: 1;
  display: flex;
  flex-direction: column;
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
.send-btn.broadcast {
  background: #111;
  color: #00ff41;
  border: 1px solid #00ff41;
  margin-left: 10px;
}
.thread-select {
  background: #000;
  color: #00ff41;
  border: 1px solid #333;
  padding: 10px;
  margin-right: 10px;
}
.thread-activity {
  margin: 2rem 0 0 0;
  padding: 1rem;
  border-top: 1px solid #222;
}
.thread-stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  margin: 0.25rem 0;
}
.thread-count {
  font-weight: bold;
  color: #00ff41;
}
</style>
