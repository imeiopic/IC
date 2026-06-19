<template>
  <div class="people-mesh-container">
    <header class="mesh-header">
      <h2>0110_SOCIAL: Node Directory</h2>
      <div class="mesh-stats">
        <span>Sighted: {{ totalNodes }}</span>
        <span>Symmetrical: {{ symmetricalCount }}</span>
      </div>
    </header>

    <div class="node-grid">
      <div v-for="node in nodes" :key="node.uid" class="node-card">
        <div class="node-avatar" :class="{ 'grounded': node.hasGrounded }">
          <img :src="node.photoURL || '/default-node.png'" :alt="node.displayName">
          <div class="status-orb"></div>
        </div>

        <div class="node-details">
          <h3>{{ node.displayName || 'Sovereign Node' }}</h3>
          <div class="equity-bar">
            <div class="fill" :style="{ width: node.equityPressure + '%' }"></div>
          </div>
          <p class="node-tier">{{ node.tierName || 'Node_Seed' }}</p>
        </div>

        <div class="node-actions">
          <button @click="initiateHandshake(node.uid)" class="handshake-btn">
            Connect
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const nodes = ref([]);

const totalNodes = computed(() => nodes.value.length);
const symmetricalCount = computed(() => nodes.value.filter(n => n.hasGrounded).length);

const loadMesh = () => {
  // Sighting the local cluster in Firestore
  const usersCollection = collection(db, 'users');
  onSnapshot(usersCollection, snapshot => {
    nodes.value = snapshot.docs.map(doc => doc.data());
  });
};

const initiateHandshake = (targetUid) => {
  // Trigger VideoChat.vue or Room.vue invitation
  store.dispatch('requestPeerHandshake', targetUid);
};

onMounted(loadMesh);
</script>

<style scoped>
.people-mesh-container { background: #000; color: #fff; padding: 2rem; border-radius: 15px; }
.node-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
.node-card { 
  background: #0a0a0a; border: 1px solid #222; padding: 1.5rem; border-radius: 12px;
  text-align: center; transition: transform 0.3s ease;
}
.node-card:hover { transform: translateY(-5px); border-color: #ffd700; }
.node-avatar { position: relative; width: 80px; height: 80px; margin: 0 auto 1rem; }
.node-avatar img { width: 100%; height: 100%; border-radius: 50%; border: 2px solid #333; }
.node-avatar.grounded img { border-color: #00ff00; box-shadow: 0 0 15px #00ff00; }
.status-orb { position: absolute; bottom: 5px; right: 5px; width: 12px; height: 12px; background: #555; border-radius: 50%; border: 2px solid #000; }
.node-avatar.grounded .status-orb { background: #00ff00; }
.equity-bar { height: 4px; background: #222; width: 100%; margin: 0.5rem 0; }
.equity-bar .fill { height: 100%; background: #ffd700; }
.handshake-btn { background: #fff; color: #000; border: none; padding: 0.5rem 1rem; border-radius: 20px; font-weight: bold; cursor: pointer; }
</style>