<template>
  <div class="my-peers">
    <h2>Direct Communication (Dcom) with All Peers</h2>
    <div class="peer-list">
      <div v-for="peer in peers" :key="peer.id" class="peer-card">
        <div class="peer-info">
          <span class="peer-id">{{ peer.id }}</span>
          <span class="peer-status" :class="{ online: peer.online }">
            {{ peer.online ? 'Online' : 'Offline' }}
          </span>
        </div>
        <textarea
          v-model="peerMessages[peer.id]"
          class="peer-message"
          placeholder="Type message..."
        ></textarea>
        <button @click="sendMessage(peer.id)" class="send-btn">Send</button>
        <div v-if="sentMessages[peer.id]" class="sent-msg">{{ sentMessages[peer.id] }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const peers = ref([
  { id: 'CLE-NODE-09', online: true },
  { id: 'LDN-NODE-42', online: false },
  { id: 'NYC-NODE-17', online: true }
]);

const peerMessages = ref({});
const sentMessages = ref({});

function sendMessage(peerId) {
  if (!peerMessages.value[peerId]) return;
  sentMessages.value[peerId] = `Message sent to ${peerId}: "${peerMessages.value[peerId]}"`;
  setTimeout(() => {
    sentMessages.value[peerId] = '';
    peerMessages.value[peerId] = '';
  }, 2000);
}
</script>

<style scoped>
.my-peers {
  padding: 2rem;
}
.peer-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.peer-card {
  background: #111;
  border: 1px solid #00e5ff;
  border-radius: 8px;
  padding: 1rem;
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.peer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.peer-id {
  color: #7fff00;
  font-weight: bold;
}
.peer-status {
  font-size: 0.8rem;
  color: #00e5ff;
}
.peer-status.online {
  color: #7fff00;
}
.peer-message {
  min-height: 40px;
  background: #222;
  color: #fff;
  border: 1px solid #00e5ff;
  border-radius: 4px;
  padding: 0.5rem;
}
.send-btn {
  background: #00e5ff;
  color: #000;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.send-btn:hover {
  background: #7fff00;
}
.sent-msg {
  color: #7fff00;
  font-size: 0.85rem;
  margin-top: 0.3rem;
}
</style>
