<template>
  <div class="instance-home">
    <div class="button-row">
      <InstanceHomeButton @click="goTo('InstanceHome')" />
      <IOorderTakerButton @click="goTo('OrderTaker')" />
      <InstanceCommunicateButton @click="goTo('InstanceCommunicate')" />
      <button @click="goTo('Login')" style="margin-left: 1rem;">Go to Login</button>
    </div>
    <h1>Edit Instance Profile</h1>
    <form @submit.prevent="saveProfile">
      <label>
        Name:
        <input v-model="profile.name" required />
      </label>
      <label>
        Description:
        <textarea v-model="profile.description" />
      </label>
      <label>
        Avatar URL:
        <input v-model="profile.avatar" />
      </label>
      <button type="submit">Save Profile</button>
    </form>

    <h2>Connections</h2>
    <form @submit.prevent="addConnection">
      <input v-model="newConnection" placeholder="Add connection (e.g. user email)" />
      <button type="submit">Add</button>
    </form>
    <ul>
      <li v-for="(conn, idx) in connections" :key="idx">
        {{ conn }}
        <button @click="removeConnection(idx)">Remove</button>
      </li>
    </ul>
    <hr style="margin:2rem 0;" />
    <h2>Face Recognition (CompreFace Demo)</h2>
    <form @submit.prevent="handleFaceRecognition">
      <input type="file" accept="image/*" @change="onFileChange" />
      <button type="submit" :disabled="!imageFile">Recognize Face</button>
    </form>
    <div v-if="faceResult">
      <h3>Recognition Result</h3>
      <pre>{{ faceResult }}</pre>
    </div>
    <div v-if="faceError" style="color:red;">{{ faceError }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InstanceHomeButton from './InstanceHomeButton.vue'
import IOorderTakerButton from './IOorderTakerButton.vue'
import InstanceCommunicateButton from './InstanceCommunicateButton.vue'

const router = useRouter()
function goTo(name: string) {
  router.push({ name })
}

const profile = ref({
  name: '',
  description: '',
  avatar: ''
})
const connections = ref<string[]>([])
const newConnection = ref('')

// CompreFace demo values
const COMPRE_URL = 'http://localhost:8000/api/v1/recognition/recognize'
const COMPRE_API_KEY = 'demo-api-key-here'
const imageFile = ref<File|null>(null)
const faceResult = ref('')
const faceError = ref('')

function saveProfile() {
  localStorage.setItem('instanceProfile', JSON.stringify(profile.value))
}

function addConnection() {
  if (newConnection.value && !connections.value.includes(newConnection.value)) {
    connections.value.push(newConnection.value)
    newConnection.value = ''
    localStorage.setItem('instanceConnections', JSON.stringify(connections.value))
  }
}

function removeConnection(idx: number) {
  connections.value.splice(idx, 1)
  localStorage.setItem('instanceConnections', JSON.stringify(connections.value))
}

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    imageFile.value = files[0]
  } else {
    imageFile.value = null
  }
}

async function handleFaceRecognition() {
  faceResult.value = ''
  faceError.value = ''
  if (!imageFile.value) return
  const formData = new FormData()
  formData.append('file', imageFile.value)
  try {
    const res = await fetch(COMPRE_URL, {
      method: 'POST',
      headers: {
        'x-api-key': COMPRE_API_KEY
      },
      body: formData
    })
    if (!res.ok) throw new Error('CompreFace error: ' + res.status)
    const data = await res.json()
    faceResult.value = JSON.stringify(data, null, 2)
  } catch (err: any) {
    faceError.value = err.message || 'Unknown error'
  }
}

// Load from localStorage on mount
if (typeof window !== 'undefined') {
  const savedProfile = localStorage.getItem('instanceProfile')
  if (savedProfile) profile.value = JSON.parse(savedProfile)
  const savedConnections = localStorage.getItem('instanceConnections')
  if (savedConnections) connections.value = JSON.parse(savedConnections)
}
</script>

<style scoped>
.instance-home {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
 .button-row {
   display: flex;
   justify-content: center;
   gap: 2rem;
   margin-bottom: 2rem;
 }
form {
  margin-bottom: 1.5rem;
}
input, textarea {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
button {
  margin-left: 0.5rem;
}
</style>
