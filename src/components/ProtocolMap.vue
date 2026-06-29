<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';
import ioLogo from '../assets/io.svg';

declare const L: any; // Global Leaflet variable

const props = defineProps<{
    userCoords: { lat: number; lon: number };
    targetCoords: { lat: number; lon: number };
    threshold: number;
}>();

const mapContainer = ref<HTMLElement | null>(null);
let map: any = null;

const initMap = () => {
    if (!mapContainer.value || typeof L === 'undefined') return;

    if (map) map.remove();

    // Initialize map centered on user
    map = L.map(mapContainer.value, {
        zoomControl: false,
        attributionControl: false
    }).setView([props.userCoords.lat, props.userCoords.lon], 16);

    // Use a dark-themed tile layer or standard OSM
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Define the custom IO Icon
    const ioIcon = L.icon({
        iconUrl: ioLogo,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });

    // Add markers
    const userMarker = L.marker([props.userCoords.lat, props.userCoords.lon], {
        icon: ioIcon
    }).addTo(map).bindPopup('Entity Node');

    const targetMarker = L.marker([props.targetCoords.lat, props.targetCoords.lon], {
        icon: ioIcon,
        className: 'target-node-marker'
    }).addTo(map).bindPopup('Target Node');

    // Threshold Circle
    L.circle([props.targetCoords.lat, props.targetCoords.lon], {
        color: '#007bff',
        fillColor: '#007bff',
        fillOpacity: 0.1,
        radius: props.threshold,
        weight: 1
    }).addTo(map);

    // Auto-fit both points
    const group = L.featureGroup([userMarker, targetMarker]);
    map.fitBounds(group.getBounds().pad(0.2));
};

onMounted(initMap);
watch(() => props.userCoords, initMap, { deep: true });
</script>

<template>
    <div ref="mapContainer" class="protocol-map-view border border-secondary rounded overflow-hidden mb-3"></div>
</template>

<style scoped>
.protocol-map-view {
    height: 200px;
    width: 100%;
    z-index: 1;
    filter: grayscale(0.5) invert(0.9) hue-rotate(180deg);
    /* Protocol/Dark aesthetic */
}

/* Base pulse animation for all markers to represent active logical nodes */
:deep(.leaflet-marker-icon) {
    --pulse-color: rgba(0, 123, 255, 0.6);
    --base-filter: brightness(1);
    animation: marker-pulse 2s infinite ease-in-out;
}

/* Shift the blue logo to red for the target node and adjust pulse parameters */
:deep(.target-node-marker) {
    --pulse-color: rgba(255, 0, 0, 0.6);
    --base-filter: hue-rotate(140deg) brightness(1.2);
}

@keyframes marker-pulse {

    0%,
    100% {
        filter: var(--base-filter) drop-shadow(0 0 2px var(--pulse-color));
    }

    50% {
        filter: var(--base-filter) brightness(1.5) drop-shadow(0 0 12px var(--pulse-color));
    }
}
</style>