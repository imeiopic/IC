<template>
  <div class="earth-substrate bg-black min-vh-100 position-relative overflow-hidden">
    <div class="coordinate-overlay tiny font-mono text-info p-3 position-absolute top-0 start-0 z-2">
      <div class="d-flex flex-column">
        <span>SIGHTING_MODE: GLOBAL_RELEASE</span>
        <span>LAT: {{ userLocation?.lat || '0.000' }}</span>
        <span>LNG: {{ userLocation?.lng || '0.000' }}</span>
        <span class="text-white mt-1">CLUSTER_ID: {{ userLocation?.cluster || 'GLB_HUB' }}</span>
      </div>
    </div>

    <div id="vre-map" ref="mapContainer" class="map-viewport"></div>

    <div class="mesh-telemetry position-absolute bottom-0 w-100 p-4 z-2">
      <div class="container-fluid d-flex justify-content-between align-items-end">
        <div class="cluster-stats bg-zinc-950 border border-zinc-800 p-3 rounded font-mono shadow-info">
          <h6 class="extra-tiny text-zinc-500 uppercase mb-2">Active_Cluster_Nodes</h6>
          <div class="d-flex align-items-baseline gap-2">
            <span class="display-6 font-black text-white">{{ activeNodes.length }}</span>
            <span class="tiny text-success italic status-pulse">● LIVE_SYNC</span>
          </div>
        </div>

        <div class="tpe-buffer text-end font-mono">
          <p class="extra-tiny text-zinc-500 m-0">PLANETARY_EQUITY_BUFFER</p>
          <h4 class="text-glow text-info font-black italic">1.2Q TPE</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import { db } from '@/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { onMounted, onUnmounted, ref } from 'vue';

const { user } = useAuth();
const mapContainer = ref<HTMLElement | null>(null);
const activeNodes = ref<any[]>([]);
const userLocation = ref<any>(null);

/**
 * 01_CLUSTER_SIGHTING
 * Pulling all grounded nodes within the global bus.
 */
let unsubscribe: any = null;

const syncMeshNodes = () => {
  const q = query(collection(db, 'users'), where('status', '==', 'Grounded_Node'));
  unsubscribe = onSnapshot(q, (snapshot) => {
    activeNodes.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Logic: Plot nodes on the VR Earth map substrate here
  });
};

onMounted(() => {
  // The 'user' object from useAuth does not contain profile data like 'ideals'.
  // This needs to be fetched from your 'users' collection in Firestore.
  if (user.value) {
    // Example: fetchUserIdeals(user.value.uid).then(ideals => userLocation.value = ideals);
  }
  syncMeshNodes();
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});
</script>

<style scoped>
.map-viewport {
  width: 100%;
  height: 100vh;
  filter: grayscale(1) contrast(1.2) brightness(0.8);
  background: radial-gradient(circle at center, #050505 0%, #000 100%);
}

.shadow-info { box-shadow: 0 0 30px rgba(0, 229, 255, 0.1); }
.text-glow { text-shadow: 0 0 15px rgba(0, 229, 255, 0.4); }

.status-pulse { animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

.font-black { font-weight: 900; }
.tiny { font-size: 0.65rem; }
.extra-tiny { font-size: 0.55rem; }
.italic { font-style: italic; }
</style>