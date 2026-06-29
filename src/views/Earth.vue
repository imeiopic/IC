<template>
  <div class="earth-substrate bg-black min-vh-100 position-relative overflow-hidden">
    <div class="coordinate-overlay tiny font-mono text-info p-3 position-absolute top-0 start-0 z-2">
      <span>SIGHTING_MODE: GLOBAL_RELEASE</span>
      <span>LAT: {{ userLocation?.lat?.toFixed(3) || '0.000' }}</span>
      <span>LNG: {{ userLocation?.lng?.toFixed(3) || '0.000' }}</span>
    </div>

    <div ref="mapContainer" class="map-viewport"></div>

    <div class="mesh-telemetry position-absolute bottom-0 w-100 p-4 z-2">
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';
import { db } from '@/firebase';
import { collection, onSnapshot, query, where, Unsubscribe } from 'firebase/firestore';
import { useAuth } from '@/composables/useAuth';

const { user } = useAuth();
const mapContainer = ref<HTMLElement | null>(null);
const activeNodes = ref<any[]>([]);
const userLocation = ref<any>(null);

let map: google.maps.Map;
let unsubscribe: Unsubscribe | null = null;

// Initialize Map
const initMap = async () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: "weekly",
  });

  const { Map } = await loader.importLibrary("maps");
  
  map = new Map(mapContainer.value as HTMLElement, {
    center: { lat: 0, lng: 0 },
    zoom: 2,
    styles: [ /* Add your grayscale map styles here */ ],
    disableDefaultUI: true
  });
};

// Plot nodes onto the map
const plotNodes = (nodes: any[]) => {
  nodes.forEach(node => {
    if (node.ideals?.coords) {
      new google.maps.Marker({
        position: node.ideals.coords,
        map: map,
        title: node.displayName,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: '#00e5ff', fillOpacity: 0.8, strokeColor: '#fff' }
      });
    }
  });
};

const syncMeshNodes = () => {
  const q = query(collection(db, 'users'), where('status', '==', 'Grounded_Node'));
  unsubscribe = onSnapshot(q, (snapshot) => {
    activeNodes.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (map) plotNodes(activeNodes.value);
  });
};

onMounted(async () => {
  await initMap();
  syncMeshNodes();
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});
</script>

<style scoped>
.map-viewport { width: 100%; height: 100vh; filter: grayscale(1) contrast(1.2) brightness(0.8); }
</style>