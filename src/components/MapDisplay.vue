<template>
  <div :id="mapId" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Fix for default marker icon issue with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const props = defineProps<{
  mapId: string; // Unique ID for the map container
  latitude: number;
  longitude: number;
  markerText?: string;
  zoom?: number;
}>();

const mapInstance = ref<L.Map | null>(null);
const markerInstance = ref<L.Marker | null>(null);

const initializeMap = () => {
  if (!mapInstance.value && props.latitude && props.longitude) {
    mapInstance.value = L.map(props.mapId).setView([props.latitude, props.longitude], props.zoom || 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.value as L.Map);

    addMarker(props.latitude, props.longitude, props.markerText);
  }
};

const addMarker = (lat: number, lng: number, text?: string) => {
  if (mapInstance.value) {
    if (markerInstance.value) {
      mapInstance.value.removeLayer(markerInstance.value as L.Marker);
    }
    markerInstance.value = L.marker([lat, lng]).addTo(mapInstance.value as L.Map);
    if (text) {
      markerInstance.value.bindPopup(text).openPopup();
    }
  }
};

watch([() => props.latitude, () => props.longitude, () => props.markerText], ([newLat, newLng, newText]) => {
  if (mapInstance.value && newLat && newLng) {
    mapInstance.value.setView([newLat, newLng], props.zoom || 13);
    addMarker(newLat, newLng, newText);
  }
});

onMounted(() => {
  initializeMap();
});

onUnmounted(() => {
  mapInstance.value?.remove();
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 250px; /* Adjust height as needed */
  border-radius: 8px;
  overflow: hidden; /* Ensures map tiles don't overflow rounded corners */
  border: 1px solid #00e5ff; /* Match theme */
}
</style>