<template>
  <div class="login-page">
    <div class="login-card">
      <h3>Admin Login</h3>
      <p class="text-muted">Logging in as: <strong>{{ username }}</strong></p>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input type="password" id="password" v-model="password" class="form-control" @keyup.enter="handleLogin" placeholder="Enter your password" />
      </div>
      <button @click="handleLogin" class="btn btn-primary w-100">Login</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const username = ref('');
const password = ref('');

onMounted(() => {
  // Retrieve the username passed from the Homepage
  username.value = (route.query.user as string) || 'Ime Iopic';
});

function handleLogin() {
  // Mock authentication logic
  // If the user is Ime Iopic, send him to the Admin Dashboard
  if (username.value.toLowerCase() === 'ime iopic') {
    router.push('/ime-admin');
  } else {
    // Default fallback for other users
    router.push('/myworld');
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}
.login-card {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}
</style>