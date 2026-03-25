<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
      <button type="button" class="google-btn" @click="googleSignup">Sign up with Google</button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
    
  </div>
</template>

<script setup lang="ts">
/// <reference path="../firebase.js.d.ts" />
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
const googleSignup = async () => {
  error.value = ''
  try {
    const auth = getAuth(app)
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    alert('Google signup successful!')
  } catch (e: any) {
    error.value = e.message
  }
}
import app from '../firebase.js'

const email = ref('')
const password = ref('')
const error = ref('')

const login = async () => {
  error.value = ''
  try {
    const auth = getAuth(app)
    await signInWithEmailAndPassword(auth, email.value, password.value)
    // Redirect or show success message here
    alert('Login successful!')
  } catch (e: any) {
    error.value = e.message
  }
}
</script>

<style scoped>
.login-background {
  background-image: url();
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 0.75rem;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
.error {
  color: red;
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
