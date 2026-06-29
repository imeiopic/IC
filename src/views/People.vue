<template>
  <div class="people-mesh-container">
    <header class="mesh-header">
      <h2>0110_SOCIAL: Node Directory</h2>
      <div class="mesh-stats">
        <span>Sighted: {{ nodes.length }}</span>
        <button @click="resetAndLoad" class="refresh-btn">Sync</button>
      </div>
    </header>
<template>
  <div class="people-mesh-container">
    <header class="mesh-header d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-info font-black italic">0110_SOCIAL: Node Directory</h2>
      <div class="mesh-stats">
        <span class="text-zinc-500 mr-3">Sighted: {{ nodes.length }}</span>
        <button @click="resetAndLoad" class="btn btn-outline-info btn-sm">Sync</button>
      </div>
    </header>

    <div class="node-grid">
      <div v-for="node in nodes" :key="node.uid" class="node-card">
        <div class="node-avatar" :class="{ 'grounded': node.hasGrounded }">
          <img :src="node.photoURL || '/default-node.png'" :alt="node.displayName" loading="lazy">
          <div class="status-orb" :class="node.hasGrounded ? 'bg-success' : 'bg-secondary'"></div>
        </div>

        <div class="node-details mt-3">
          <h5 class="text-white">{{ node.displayName || 'Sovereign Node' }}</h5>
          <div class="equity-bar bg-zinc-900 w-100 mt-2" style="height: 4px;">
            <div class="fill bg-info" :style="{ width: `${Math.min(node.equityPressure || 0, 100)}%` }"></div>
          </div>
          <p class="node-tier small text-zinc-500 mt-2">{{ node.tierName || 'Node_Seed' }}</p>
        </div>

        <div class="node-actions mt-3">
          <button 
            @click="handleConnect(node.uid)" 
            class="handshake-btn w-100"
            :disabled="handshake.isProcessing"
          >
            {{ handshake.isProcessing ? 'SYNCING...' : 'Connect' }}
          </button>
        </div>
      </div>
    </div>

    <div ref="scrollTrigger" class="scroll-sentinel py-5 text-center">
      <p v-if="loading" class="text-info small italic animate-pulse">Searching adjacent clusters...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '@/firebase';
import { 
  collection, query, limit, startAfter, getDocs, orderBy, 
  QueryDocumentSnapshot, DocumentData 
} from 'firebase/firestore';
import { useHandshakeStore } from '@/stores/handshakeStore';

interface INode {
  uid: string;
  displayName: string;
  photoURL?: string;
  hasGrounded: boolean;
  equityPressure: number;
  tierName: string;
}

const handshake = useHandshakeStore();
const nodes = ref<INode[]>([]);
const lastVisible = ref<QueryDocumentSnapshot<DocumentData> | null>(null);
const loading = ref(false);
const scrollTrigger = ref<HTMLElement | null>(null);

const loadNodes = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    let q = query(
      collection(db, 'users'),
      orderBy('uid'),
      limit(12)
    );

    if (lastVisible.value) {
      q = query(q, startAfter(lastVisible.value));
    }

    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > 0) {
      lastVisible.value = snapshot.docs[snapshot.docs.length - 1];
      const newNodes = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as INode));
      
      nodes.value.push(...newNodes);
    }
  } catch (err) {
    console.error('Mesh Sync Failure:', err);
  } finally {
    loading.value = false;
  }
};

const resetAndLoad = () => {
  nodes.value = [];
  lastVisible.value = null;
  loadNodes();
};

const handleConnect = async (targetUid: string) => {
  await handshake.requestPeerHandshake(targetUid);
};
defineExpose({
  handleConnect
});
// Intersection Observer for Infinite Scroll
let observer: IntersectionObserver;

onMounted(() => {
  loadNodes();
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !loading.value) loadNodes();
  }, { threshold: 0.1 });
  
  if (scrollTrigger.value) observer.observe(scrollTrigger.value);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.node-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
.node-card { background: #050505; border: 1px solid #1a1a1a; padding: 1.5rem; border-radius: 8px; }
.node-avatar img { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; }
.handshake-btn { background: #00e5ff; border: none; padding: 0.5rem; border-radius: 4px; font-weight: 900; }
.handshake-btn:disabled { opacity: 0.5; }
</style>
    <div class="node-grid" v-if="nodes.length > 0">
      <div v-for="node in nodes" :key="node.uid" class="node-card">
        <div class="node-avatar" :class="{ 'grounded': node.hasGrounded }">
          <img :src="node.photoURL || '/default-node.png'" :alt="node.displayName" loading="lazy">
          <div class="status-orb"></div>
        </div>

        <div class="node-details">
          <h3>{{ node.displayName || 'Sovereign Node' }}</h3>
          <div class="equity-bar">
            <div class="fill" :style="{ width: `${node.equityPressure || 0}%` }"></div>
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

    <div ref="scrollTrigger" class="scroll-sentinel">
      <p v-if="loading">Searching adjacent clusters...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '@/firebase';
import { 
  collection, 
  query, 
  limit, 
  startAfter, 
  getDocs, 
  orderBy, 
  QueryDocumentSnapshot,
  DocumentData 
} from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useHandshakeStore } from '@/stores/handshakeStore';

const auth = useAuthStore();
const handshake = useHandshakeStore();
// Interface for strictly typed node data
interface INode {
  uid: string;
  displayName: string;
  photoURL?: string;
  hasGrounded: boolean;
  equityPressure: number;
  tierName: string;
}

const nodes = ref<INode[]>([]);
const lastVisible = ref<QueryDocumentSnapshot<DocumentData> | null>(null);
const loading = ref(false);
const scrollTrigger = ref<HTMLElement | null>(null);

const loadNodes = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    let q = query(
      collection(db, 'users'),
      orderBy('uid'),
      limit(12)
    );

    if (lastVisible.value) {
      q = query(q, startAfter(lastVisible.value));
    }

    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > 0) {
      lastVisible.value = snapshot.docs[snapshot.docs.length - 1];
      const newNodes = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as INode));
      
      nodes.value.push(...newNodes);
    }
  } catch (err) {
    console.error('Mesh Sync Failure:', err);
  } finally {
    loading.value = false;
  }
};

const resetAndLoad = () => {
  nodes.value = [];
  lastVisible.value = null;
  loadNodes();
};

const initiateHandshake = (targetUid: string) => {
  store.dispatch('requestPeerHandshake', targetUid);
};

// Intersection Observer for Infinite Scroll
let observer: IntersectionObserver;

onMounted(() => {
  loadNodes();
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadNodes();
  }, { threshold: 0.1 });
  
  if (scrollTrigger.value) observer.observe(scrollTrigger.value);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.people-mesh-container { background: #000; color: #fff; padding: 2rem; min-height: 100vh; }
.node-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 2rem; padding-top: 2rem; }
.node-card { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 1.5rem; border-radius: 12px; text-align: center; }
.scroll-sentinel { height: 50px; display: flex; justify-content: center; align-items: center; }
.handshake-btn { background: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.handshake-btn:hover { background: #00e5ff; }
</style>