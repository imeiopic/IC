<template>
  <div class="signup-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="signup">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <div>
        <label for="rationale">Why are you joining?</label>
        <textarea v-model="rationale" required placeholder="Share your rationale..."></textarea>
      </div>
      <button type="submit" :disabled="loading">Sign Up</button>
      <button type="button" class="google-btn" @click="googleSignup">Sign up with Google</button>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>
      <div v-if="loading" class="loading">Creating your account...</div>
    </form>
    <img :src="enter" alt="Enter the World" style="margin-top:2rem; width:100%; border-radius:8px;" />
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import enter from '../assets/images/entertheworld.png'
import { ref } from 'vue'
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
const googleSignup = async () => {
  error.value = ''
  try {
    const auth = getAuth(app)
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    success.value = 'Google signup successful! You can now log in.'
  } catch (e: any) {
    error.value = e.message
  }
}
import { createInstance } from '../createInstance'
import app from '../firebase.js'

const email = ref('')
const password = ref('')
const rationale = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

// Helper: Register user via Firebase
async function registerViaFirebase(email: string, password: string) {
  const auth = getAuth(app)
  return await createUserWithEmailAndPassword(auth, email, password)
}

// Onboarding logic: Initiate user genesis
async function initiateUserGenesis(email: string, password: string, rationale: string, lat: number, lon: number) {
  // 1. Authenticate (The Internet I)
  const userCredential = await registerViaFirebase(email, password)
  // 2. Define the Instance (The People P)
  await createInstance(userCredential.user.uid, rationale, {
    x: lat,
    y: lon,
    z: 0 // Surface of Earth
  })
  console.log("iiii = ! : The User has entered the Fabric.")
}

const signup = async () => {
  error.value = ''
  success.value = ''
  if (!rationale.value.trim()) {
    error.value = 'Please share your rationale.'
    return
  }
  loading.value = true
  // Get geolocation
  if (!navigator.geolocation) {
    error.value = 'Geolocation is not supported by your browser.'
    loading.value = false
    return
  }
  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      await initiateUserGenesis(
        email.value,
        password.value,
        rationale.value,
        position.coords.latitude,
        position.coords.longitude
      )
      success.value = 'Sign up successful! You can now log in.'
    } catch (e: any) {
      error.value = e.message || 'Signup failed.'
    } finally {
      loading.value = false
    }
  }, (geoErr) => {
    error.value = 'Failed to get location: ' + geoErr.message
    loading.value = false
  })
}
</script>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff url('../assets/entertheworld.png') no-repeat center center;
  background-size: cover;
}
.error {
  color: red;
  margin-top: 1rem;
}
.success {
  color: green;
  margin-top: 1rem;
}
.loading {
  color: #007bff;
  margin-top: 1rem;
}
.google-btn {
  width: 100%;
  padding: 0.75rem;
  background: #4285f4;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}
</style>
