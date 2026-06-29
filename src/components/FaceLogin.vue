<template>
  <div class="face-login-container">
    <h2 class="text-info font-black italic mb-4 tracking-widest">FACE_LOGIN_VERIFICATION</h2>

    <div v-if="!isVerified" class="biometric-flow">
      <CamFaceCapture
        :user-name="user?.displayName || user?.email || 'User'"
        :is-uploading="isUploading"
        :upload-message="uploadMessage"
        @image-captured="handleImageCaptured"
        @upload-request="handleUploadRequest"
        @error="handleCamCaptureError"
      />

      <div v-if="show2faFallback" class="two-fa-fallback-overlay">
        <p class="mb-3">Biometric failed. Initiating 2FA fallback...</p>
        <p class="mb-3">Please enter your 2FA code:</p>
        <input
          type="text"
          v-model="twoFaCode"
          placeholder="Enter 2FA Code"
          class="form-control text-center bg-dark text-white border-info mb-3"
          @keyup.enter="verifyTwoFaCode"
          :disabled="isTwoFaVerifying"
        />
        <CButton
          color="warning"
          variant="outline"
          class="w-75 py-2 font-black"
          @click="verifyTwoFaCode"
          :disabled="isTwoFaVerifying || !twoFaCode.trim()"
        >
          <CSpinner v-if="isTwoFaVerifying" component="span" size="sm" aria-hidden="true" />
          {{ isTwoFaVerifying ? 'Verifying...' : 'Verify 2FA Code' }}
        </CButton>
        <div v-if="twoFaError" class="text-danger tiny mt-2">{{ twoFaError }}</div>
      </div>

      <p v-if="globalError" class="text-danger tiny mt-3">{{ globalError }}</p>
    </div>

    <div v-else class="login-success text-center mt-5">
      <h3 class="text-success font-black italic">BIOMETRIC_LOGIN_SUCCESS</h3>
      <p class="text-white-50">Welcome back, {{ user?.displayName || user?.email }}!</p>
      <CButton color="info" @click="emit('login-success')">CONTINUE_TO_OS</CButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CButton, CSpinner } from '@coreui/vue';
import { getApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ref, watch } from 'vue';
import { useAuth } from '../useAuth'; // Assuming useAuth provides the current user
import CamFaceCapture from './CamFaceCapture.vue';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  biometricEnrolled?: boolean; // Assuming this property exists on the user object
}

const emit = defineEmits(['login-success', 'login-failure']);

const { user } = useAuth(); // Get the current authenticated user

const isVerified = ref(false);
const globalError = ref('');
const isUploading = ref(false);
const uploadMessage = ref<string | null>(null);

// 2FA Fallback states
const show2faFallback = ref(false);
const twoFaCode = ref('');
const isTwoFaVerifying = ref(false);
const twoFaError = ref('');

// Firebase Functions setup
const functions = getFunctions(getApp());
const biometricVerifyCallable = httpsCallable(functions, 'biometricVerify');

const handleImageCaptured = (imageData: string, livenessAction: string | null) => {
  console.log('FaceLogin: Image captured (preview only).');
  // This event is primarily for parent components to get the image data if needed
};

const handleUploadRequest = async (imageData: string, livenessAction: string | null) => {
  if (!user.value?.uid) {
    globalError.value = 'User not authenticated for biometric login.';
    return;
  }
  if (!(user.value as any)?.biometricEnrolled) {
    globalError.value = 'Biometric profile not enrolled. Please enroll first.';
    return;
  }

  isUploading.value = true;
  uploadMessage.value = 'Verifying biometric data...';
  globalError.value = '';
  show2faFallback.value = false; // Reset 2FA fallback on new attempt
  twoFaCode.value = '';
  isTwoFaVerifying.value = false;
  twoFaError.value = '';

  try {
    const response = await biometricVerifyCallable({
      uid: user.value.uid,
      imageData,
      livenessAction
    });
    const result = response.data as {
      success: boolean;
      message?: string;
      biometricLoginStatus?: string;
    };

    if (result.success) {
      isVerified.value = true;
      console.log('FaceLogin: Biometric verification successful!');
      emit('login-success'); // Notify parent of successful login
    } else {
      globalError.value = result.message || 'Biometric verification failed.';
      if (result.biometricLoginStatus === 'failed_recognition') {
        show2faFallback.value = true;
      }
      emit('login-failure', globalError.value);
    }
  } catch (error: any) {
    globalError.value = `Biometric Login Failed: ${error.message || 'Network Error'}`;
    console.error('FaceLogin: Biometric verification API error:', error);
    emit('login-failure', globalError.value);
  } finally {
    isUploading.value = false;
    uploadMessage.value = null;
  }
};

const handleCamCaptureError = (message: string) => {
  globalError.value = `Camera Error: ${message}`;
  emit('login-failure', globalError.value);
};

const verifyTwoFaCode = async () => {
  isTwoFaVerifying.value = true;
  twoFaError.value = '';
  globalError.value = '';

  // Simulate API call for 2FA verification
  // In a real app, this would be an actual API call to your backend
  // e.g., const response = await apiFetch('/verify2fa', { method: 'POST', body: JSON.stringify({ uid: user.value.uid, code: twoFaCode.value }) });
  // const result = await response.json();

  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

  const correctCode = '123456'; // Replace with actual backend verification

  if (twoFaCode.value === correctCode) {
    isVerified.value = true;
    show2faFallback.value = false; // Hide 2FA UI on success
    twoFaCode.value = '';
    console.log('FaceLogin: 2FA verification successful!');
    emit('login-success'); // Notify parent of successful login
  } else {
    twoFaError.value = 'Invalid 2FA code. Please try again.';
    console.error('FaceLogin: 2FA verification failed.');
    emit('login-failure', '2FA failed.');
  }
  isTwoFaVerifying.value = false;
};

// Watch for show2faFallback to become true and clear any previous 2FA state
watch(show2faFallback, (newVal) => {
  if (newVal) {
    twoFaCode.value = '';
    twoFaError.value = '';
    isTwoFaVerifying.value = false;
  }
});

// Watch for user prop changes to reset state if user logs out or changes
watch(
  user,
  (newUser) => {
    if (!newUser) {
      // Reset all states if user logs out
      isVerified.value = false;
      globalError.value = '';
      isUploading.value = false;
      uploadMessage.value = null;
      show2faFallback.value = false;
      twoFaCode.value = '';
      isTwoFaVerifying.value = false;
      twoFaError.value = '';
    }
  },
  { immediate: true }
); // Run immediately on component mount to initialize state based on current user
</script>

<style scoped>
.face-login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 1px solid #333;
  border-radius: 12px;
  max-width: 600px;
  margin: 20px auto;
  background-color: #0a0a0a;
  color: #eee;
  position: relative; /* Needed for absolute positioning of 2FA overlay */
}

.biometric-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.two-fa-fallback-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ffc107; /* warning color */
  font-weight: bold;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  z-index: 10; /* Ensure it's above CamFaceCapture */
}

.form-control {
  background-color: #222;
  border-color: #00e5ff;
  color: #eee;
}
.form-control:focus {
  background-color: #333;
  border-color: #00e5ff;
  box-shadow: 0 0 0 0.25rem rgba(0, 229, 255, 0.25);
}

.text-info {
  color: #00e5ff;
}
.text-success {
  color: #28a745;
}
.text-danger {
  color: #dc3545;
}
.text-warning {
  color: #ffc107;
}
.font-black {
  font-weight: 900;
}
.italic {
  font-style: italic;
}
.tiny {
  font-size: 0.65rem;
}
.tracking-widest {
  letter-spacing: 0.5em;
}
</style>
