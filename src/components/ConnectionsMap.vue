<template>
  <div class="connections-map-page">
    <h1>Connections Map</h1>
    <div id="map" style="width:100%;height:500px;position:relative;"></div>
    <div class="group-chat-area" @dragover.prevent @drop="onDropGroupChat">
      <h2>Group Chat</h2>
      <div class="group-chat-members">
        <div v-for="conn in groupChat" :key="conn.id" class="group-chat-member">
          <img :src="conn.profileImage" :alt="conn.name" />
          <span>{{ conn.name }}</span>
        </div>
      </div>
      <button v-if="groupChat.length > 1" @click="startGroupChat">Start Group Chat</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { db } from '../firebase-config'
import { collection, getDocs, query, where } from 'firebase/firestore'

const map = ref<any>(null)
const connections = ref<any[]>([])
const groupChat = ref<any[]>([])

// Load connections with geolocation and profile image
async function loadConnections() {
  // Assume 'connections' collection, each doc: { online, lat, lng, profileImage, name }
  const q = query(collection(db, 'connections'), where('online', '==', true))
  const querySnapshot = await getDocs(q)
  connections.value = []
  querySnapshot.forEach(doc => {
    const data = doc.data()
    if (data.lat && data.lng && data.profileImage) {
      connections.value.push({
        id: doc.id,
        ...data
      })
    }
  })
}

function initMap() {
  // @ts-ignore
  map.value = new window.google.maps.Map(document.getElementById('map'), {
    center: { lat: 0, lng: 0 },
    zoom: 2
  })
  // Add draggable markers for each connection
  connections.value.forEach(conn => {
    // @ts-ignore
    const marker = new window.google.maps.Marker({
      position: { lat: conn.lat, lng: conn.lng },
      map: map.value,
      title: conn.name || 'Connection',
      icon: {
        url: conn.profileImage,
        scaledSize: new window.google.maps.Size(48, 48)
      },
      draggable: true
    })
    // Add dragstart event to marker
    marker.addListener('dragstart', () => {
      // Store the connection id in the drag event (simulate drag)
      window.sessionStorage.setItem('drag-conn-id', conn.id)
    })
    // Optional: Snap marker back to original position after drag
    marker.addListener('dragend', () => {
      marker.setPosition({ lat: conn.lat, lng: conn.lng })
    })
  })
}

function onDropGroupChat(e: DragEvent) {
  e.preventDefault()
  const connId = window.sessionStorage.getItem('drag-conn-id')
  if (!connId) return
  const conn = connections.value.find(c => c.id === connId)
  if (conn && !groupChat.value.some(c => c.id === conn.id)) {
    groupChat.value.push(conn)
  }
  window.sessionStorage.removeItem('drag-conn-id')
}

function startGroupChat() {
  // Implement group chat logic (e.g., open chat window with groupChat.value)
  alert('Starting group chat with: ' + groupChat.value.map(c => c.name).join(', '))
}

onMounted(async () => {
  await loadConnections()
  // Load Google Maps script if not already loaded
  if (!window.google || !window.google.maps) {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBLYrkyAwyRSX826f6R5BSgm1dv4STn-Qk`
    script.async = true
    script.onload = initMap
    document.head.appendChild(script)
  } else {
    initMap()
  }
})
</script>

<style scoped>
.connections-map-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
#map {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.group-chat-area {
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 10px;
  min-height: 120px;
  border: 2px dashed #1976d2;
  text-align: center;
}
.group-chat-members {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}
.group-chat-member {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.group-chat-member img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #1976d2;
  margin-bottom: 0.3rem;
}
</style>
