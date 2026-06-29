<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRoomStore } from '@/stores/roomStore';

const roomStore = useRoomStore();

onMounted(() => {
  roomStore.subscribeToPresence();
});

onUnmounted(() => {
  // Logic: Terminate websocket listener
});
</script>

<template>
  <div class="ideal-room-substrate">
    <header class="room-header">
      <h2 class="text-glow">IDEAL Room: {{ roomStore.roomName }}</h2>
      <p class="node-count">Grounded Nodes: {{ roomStore.peers.length }}</p>
    </header>

    <div v-if="roomStore.isHost" class="host-pulse-zone">
      <button 
        @click="roomStore.triggerGlobalInvitation" 
        :disabled="roomStore.isInviting" 
        class="pulse-btn"
      >
        {{ roomStore.isInviting ? 'BROADCASTING PULSE...' : 'JOIN ME IN IOPIC' }}
      </button>
      <p class="logic-subtext">Inviting all peers to the 16-thread bus.</p>
      <p v-if="roomStore.invitationError" class="error-message">{{ roomStore.invitationError }}</p>
    </div>

    <div class="peer-grid">
      <div v-for="peer in roomStore.peers" :key="peer.id" class="peer-node">
        <div class="status-orb" :class="{ 'grounded': peer.hasIopic, 'invited': peer.invited }"></div>
        <span class="peer-name">{{ peer.name }}</span>
        <span class="peer-status">{{ peer.invited ? 'INVITED' : peer.hasIopic ? 'GROUNDED' : 'UNGROUNDED' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles remain consistent with your defined design */
.ideal-room-substrate { background: #050505; color: #fff; padding: 2rem; border-radius: 20px; max-width: 800px; margin: 2rem auto; border: 1px solid #333; }
.room-header { margin-bottom: 1.5rem; text-align: center; }
.text-glow { color: #00e5ff; text-shadow: 0 0 10px #00e5ff; }
.node-count { color: #888; font-size: 0.9rem; }
.pulse-btn { background: linear-gradient(45deg, #ffd700, #ffa500); color: #000; padding: 1rem 2rem; font-weight: bold; border: none; cursor: pointer; border-radius: 8px; transition: all 0.3s; }
.pulse-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.peer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
.peer-node { background: #111; border: 1px solid #222; padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
.status-orb { width: 10px; height: 10px; border-radius: 50%; background: #333; }
.status-orb.grounded { background: #00ff00; box-shadow: 0 0 8px #00ff00; }
.status-orb.invited { background: #00e5ff; box-shadow: 0 0 8px #00e5ff; animation: pulse-invite 1s infinite; }
@keyframes pulse-invite { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
.error-message { color: #ff0041; font-size: 0.85rem; margin-top: 1rem; }
</style>