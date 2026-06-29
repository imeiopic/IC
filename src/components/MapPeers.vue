<template>
  <div class="map-peers">
    <h2>Interactive Peer Map</h2>
    <div id="map" class="map-container"></div>
    <div class="peer-list">
      <div v-for="peer in peers" :key="peer.id" class="peer-marker-info">
        <span class="peer-id">{{ peer.id }}</span>
        <span class="peer-status" :class="{ online: peer.online }">
          {{ peer.online ? 'Online' : 'Offline' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const peers = ref([
  { id: 'CLE-NODE-09', online: true, lat: 41.4993, lng: -81.6944 },
  { id: 'LDN-NODE-42', online: false, lat: 51.5074, lng: -0.1278 },
  { id: 'NYC-NODE-17', online: true, lat: 40.7128, lng: -74.006 }
]);

onMounted(() => {
  if (!window.google || !window.google.maps) return;
  const map = new window.google.maps.Map(document.getElementById('map'), {
    center: { lat: 41.4993, lng: -81.6944 },
    zoom: 3
  });
  peers.value.forEach((peer) => {
    const marker = new window.google.maps.Marker({
      position: { lat: peer.lat, lng: peer.lng },
      map,
      title: peer.id,
      icon: peer.online
        ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });
    marker.addListener('click', () => {
      window.alert(`Peer: ${peer.id}\nStatus: ${peer.online ? 'Online' : 'Offline'}`);
    });
  });
});
</script>

<style scoped>
.map-peers {
  padding: 2rem;
}
.map-container {
  width: 100%;
  height: 400px;
  border: 2px solid #00e5ff;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}
.peer-list {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}
.peer-marker-info {
  background: #111;
  border: 1px solid #00e5ff;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
</style>
