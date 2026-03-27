<template>
  <div class="profile-details">
    <h2>Edit Profile Details</h2>
    <form @submit.prevent="saveProfile">
      <div>
        <label>Name:</label>
        <input v-model="profile.name" required />
      </div>
      <div>
        <label>Description:</label>
        <textarea v-model="profile.description" />
      </div>
      <div>
        <label>Avatar URL:</label>
        <input v-model="profile.avatar" />
      </div>
      <div>
        <label>Language:</label>
        <input v-model="profile.language" />
      </div>
      <div>
        <label>Currency:</label>
        <input v-model="profile.currency" />
      </div>
      <div>
        <label>CoinXs (comma separated):</label>
        <input v-model="profile.coinxs" placeholder="e.g. BTC,ETH,USDT" />
      </div>
      <div>
        <label>vCard:</label>
        <textarea v-model="profile.vcard" placeholder="Paste vCard or contact info here"></textarea>
      </div>
      <button type="submit">Save Profile</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  initialProfile: {
    type: Object,
    default: () => ({})
  }
})

const profile = ref({
  name: '',
  description: '',
  avatar: '',
  language: '',
  currency: '',
  coinxs: '',
  vcard: ''
})

watch(() => props.initialProfile, (val) => {
  if (val) profile.value = { ...profile.value, ...val }
}, { immediate: true })

function saveProfile() {
  // Save to localStorage or emit event for parent to handle
  localStorage.setItem('instanceProfile', JSON.stringify(profile.value))
  alert('Profile saved!')
}
</script>

<style scoped>
.profile-details {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
form > div {
  margin-bottom: 1rem;
}
input, textarea {
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
button {
  margin-top: 1rem;
}
</style>

// src/types/global.d.ts
export {};

declare global {
  interface Window {
    google: any;
  }
}
