<template>
  <div class="instance-edit">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const profile = ref({
  name: '',
  description: '',
  avatar: ''
})

function saveProfile() {
  localStorage.setItem('instanceProfile', JSON.stringify(profile.value))
  alert('Profile saved!')
}

// Load from localStorage on mount
if (typeof window !== 'undefined') {
  const savedProfile = localStorage.getItem('instanceProfile')
  if (savedProfile) profile.value = JSON.parse(savedProfile)
}
</script>

<style scoped>
.instance-edit {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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
