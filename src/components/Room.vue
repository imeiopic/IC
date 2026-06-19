<template>
  <div class="ideal-room-substrate">
    <div class="room-header">
      <h2 class="text-glow">IDEAL Room: {{ roomName }}</h2>
      <p class="node-count">Grounded Nodes: {{ peers.length }}</p>
    </div>

    <div v-if="isHost" class="host-pulse-zone">
      <button @click="broadcastIopicInvitation" :disabled="isInviting" class="pulse-btn">
        <span v-if="!isInviting">Join Me in Iopic</span>
        <span v-else>Broadcasting Pulse...</span>
      </button>
      <p class="logic-subtext">Inviting all peers to the 16-thread bus.</p>
      <p v-if="invitationError" class="error-message">{{ invitationError }}</p>
    </div>

    <div class="peer-grid">
      <div v-for="peer in peers" :key="peer.id" class="peer-node">
        <div class="status-orb" :class="{ grounded: peer.hasIopic, invited: peer.invited }"></div>
        <span class="peer-name">{{ peer.name }}</span>
        <span v-if="peer.invited" class="peer-status">INVITED</span>
        <span v-else-if="peer.hasIopic" class="peer-status">GROUNDED</span>
        <span v-else class="peer-status">UNGROUNDED</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

// Reactive state for the room
const roomName = ref('The Nexus Chamber'); // This could be fetched from a route param or store
const isInviting = ref(false);
const invitationError = ref<string | null>(null);

// Computed properties from Vuex store
const peers = computed(() => store.state.room.peers);
const isHost = computed(() => store.state.user.id === store.state.room.hostId);

const broadcastIopicInvitation = async () => {
  isInviting.value = true;
  invitationError.value = null;
  try {
    // Dispatch the Vuex action to trigger the global invitation
    await store.dispatch('triggerGlobalInvitation', {
      roomId: store.state.room.id,
      multiplierAlpha: 1.1 // The baseline for the handshake
    });
    console.log('Global Handshake Pulse Sent. Silencing room noise...');
  } catch (error: any) {
    console.error('Error broadcasting Iopic invitation:', error);
    invitationError.value = error.message || 'Failed to send invitation pulse.';
  } finally {
    isInviting.value = false;
  }
};

// Lifecycle hooks for potential room presence listening
let unsubscribeFromRoomPresence: (() => void) | null = null;

onMounted(() => {
  // In a real application, you'd likely fetch room details and peers here
  // and set up a real-time listener for room presence.
  // For this example, we're relying on mock data in the store.
  // If you had a listener, it might look like:
  // unsubscribeFromRoomPresence = store.dispatch('listenToRoomPresence', store.state.room.id);
});

onUnmounted(() => {
  if (unsubscribeFromRoomPresence) {
    unsubscribeFromRoomPresence();
  }
});
</script>

<style scoped>
.ideal-room-substrate {
  background: #050505;
  color: #fff;
  padding: 2rem;
  border-radius: 20px;
  max-width: 800px;
  margin: 2rem auto;
  border: 1px solid #333;
}
.room-header {
  margin-bottom: 1.5rem;
  text-align: center;
}
.text-glow {
  color: #00e5ff;
  text-shadow: 0 0 10px #00e5ff;
}
.node-count {
  color: #888;
  font-size: 0.9rem;
}
.host-pulse-zone {
  text-align: center;
  margin-bottom: 2rem;
}
.pulse-btn {
  background: linear-gradient(45deg, #ffd700, #ffa500);
  color: #000;
  padding: 1rem 2rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  border-radius: 8px;
  transition: all 0.3s ease;
}
.pulse-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
}
.pulse-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.logic-subtext {
  color: #888;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}
.error-message {
  color: #ff0041;
  font-size: 0.85rem;
  margin-top: 1rem;
}
.peer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}
.peer-node {
  background: #111;
  border: 1px solid #222;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.peer-name {
  flex-grow: 1;
}
.peer-status {
  font-size: 0.7rem;
  color: #555;
  text-transform: uppercase;
}
.status-orb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #333;
}
.status-orb.grounded {
  background: #00ff00;
  box-shadow: 0 0 8px #00ff00;
}
.status-orb.invited {
  background: #00e5ff;
  box-shadow: 0 0 8px #00e5ff;
  animation: pulse-invite 1s infinite;
}
@keyframes pulse-invite {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
