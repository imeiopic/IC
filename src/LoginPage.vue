<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, type ActionCodeSettings } from 'firebase/auth';
import { auth } from './firebase';
import IopicManifestoViewer from './components/IopicManifestoViewer.vue';
import { useIOSettings } from './useIOSettings';
import { useAuth } from './useAuth';

const router = useRouter();
const { ensureAuthInitialized } = useAuth();
const { ioLoad } = useIOSettings();

const CURRENT_MANIFESTO_VERSION = '1.0.0';

const email = ref('');
const password = ref('');
const error = ref('');
const successMessage = ref('');
const loading = ref(false);
const showPassword = ref(false);
const showManifesto = ref(false);

onMounted(async () => {
  // Redirect to dashboard if already verified
  const user = await ensureAuthInitialized();
  if (user) {
    checkManifestoAndNavigate();
  }
});

const checkManifestoAndNavigate = () => {
  const syncedVersion = localStorage.getItem('io_manifesto_version');
  if (syncedVersion !== CURRENT_MANIFESTO_VERSION) {
    showManifesto.value = true;
  } else {
    router.push('/dashboard');
  }
};

const handleManifestoSync = () => {
  localStorage.setItem('io_manifesto_version', CURRENT_MANIFESTO_VERSION);
  router.push('/dashboard');
};

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Identity credentials incomplete.';
    return;
  }

  loading.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    checkManifestoAndNavigate();
  } catch (err: any) {
    console.error("Authentication failure:", err);
    // User-friendly mapping for common Firebase Auth errors
    if (err.code === 'auth/invalid-credential') {
      error.value = 'Invalid IO credentials.';
    } else if (err.code === 'auth/user-not-found') {
      error.value = 'Identity not detected in IO.';
    } else {
      error.value = 'Access Denied: Verification failed.';
    }
  } finally {
    loading.value = false;
  }
};

const handleForgotPassword = async () => {
  if (!email.value) {
    error.value = 'Enter Entity Email to reset IO Access Code.';
    return;
  }

  loading.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    const actionCodeSettings: ActionCodeSettings = {
      // Directs the user back to the IO login page after reset
      url: window.location.origin + '/login',
      handleCodeInApp: true,
    };

    await sendPasswordResetEmail(auth, email.value, actionCodeSettings);
    successMessage.value = 'Reset link transmitted to IO email.';
  } catch (err: any) {
    error.value = 'Reset sequence failed. Verify credentials.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-page d-flex align-items-center justify-content-center min-vh-100 bg-black text-light">
    <div v-if="showManifesto" class="w-100 p-3" style="max-width: 900px;">
      <IopicManifestoViewer :ioLoad="ioLoad" @sync-complete="handleManifestoSync" />
    </div>

    <div v-else class="card bg-dark border-secondary shadow-lg p-4" style="width: 100%; max-width: 400px;">
      <div class="text-center mb-4">
        <h2 class="fw-bold text-primary font-monospace">IO ACCESS</h2>
        <p class="text-muted small text-uppercase">Identity Verification Required</p>
      </div>

      <div v-if="error" class="alert alert-danger py-2 small border-0 shadow-sm mb-3">
        <i class="bi bi-exclamation-octagon-fill me-2"></i> {{ error }}
      </div>

      <div v-if="successMessage" class="alert alert-success py-2 small border-0 shadow-sm mb-3">
        <i class="bi bi-check-circle-fill me-2"></i> {{ successMessage }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label small font-monospace text-secondary text-uppercase">Entity Email</label>
          <input v-model="email" type="email" class="form-control bg-black text-white border-secondary" required
            placeholder="entity@iopic.world">
        </div>
        <div class="mb-3">
          <label class="form-label small font-monospace text-secondary text-uppercase">Access Code</label>
          <div class="input-group">
            <input v-model="password" :type="showPassword ? 'text' : 'password'"
              class="form-control bg-black text-white border-secondary" required placeholder="********">
            <button class="btn btn-outline-secondary border-secondary text-secondary" type="button"
              @click="showPassword = !showPassword">
              <i :class="['bi', showPassword ? 'bi-eye-slash' : 'bi-eye']"></i>
            </button>
          </div>
          <div class="text-end mt-1">
            <button type="button" @click="handleForgotPassword"
              class="btn btn-link p-0 text-secondary small text-decoration-none hover-link" :disabled="loading">
              Forgot Access Code?
            </button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100 fw-bold mt-2 py-2" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          VERIFY IDENTITY
        </button>
      </form>

      <div class="mt-4 text-center">
        <div class="mb-2">
          <span class="text-muted small">New Entity? </span>
          <router-link to="/register" class="text-primary small text-decoration-none hover-link">
            Initialize Registration
          </router-link>
        </div>
        <router-link to="/" class="text-secondary small text-decoration-none hover-link">
          <i class="bi bi-arrow-left"></i> Return to Terminal
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  background: radial-gradient(circle, #111 0%, #000 100%);
}

.hover-link:hover {
  color: #007bff !important;
}

.form-control:focus {
  background-color: #050505;
  border-color: #007bff;
  color: white;
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.25);
}
</style>