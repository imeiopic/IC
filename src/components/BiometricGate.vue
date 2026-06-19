<template>
  <transition name="fade">
    <div
      v-if="!isVerified"
      class="biometric-gate fixed-top w-100 h-100 z-max bg-black d-flex justify-content-center align-items-center"
    >
      <div class="gate-card p-5 border border-info rounded-4 text-center shadow-glow">
        <h2 class="text-info font-black italic mb-4 tracking-widest">Ime.SIGHTAL_VERIFICATION</h2>

        <div
          class="video-container mb-4 position-relative border border-zinc-800 rounded-3 overflow-hidden bg-zinc-950"
          style="width: 320px; height: 240px"
        >
          <video ref="videoFeed" autoplay muted playsinline class="w-100 h-100 grayscale"></video>
          <div class="scan-line"></div>
          <div
            v-if="isValidating"
            class="verify-loader position-absolute top-50 start-50 translate-middle"
          >
            <CSpinner color="info" />
          </div>
          <div
            v-if="show2faFallback"
            class="liveness-prompt position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-black-75 text-warning font-black text-center p-3"
          >
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
            
            <CButton
              color="link"
              class="w-75 py-1 tiny text-info mt-2 text-decoration-none"
              @click="sendTwoFaCode"
              :disabled="isSendingCode"
            >
              <CSpinner v-if="isSendingCode" component="span" size="sm" aria-hidden="true" class="me-2" />
              {{ isSendingCode ? 'Sending...' : "Didn't receive code? Send again" }}
            </CButton>
            <div v-if="sendCodeMessage" class="text-success tiny mt-2">{{ sendCodeMessage }}</div>
            <div v-if="twoFaError" class="text-danger tiny mt-2">{{ twoFaError }}</div>
          </div>
          <div
            v-if="isLivenessCheckActive"
            class="liveness-prompt position-absolute top-50 start-50 translate-middle text-info font-black text-center"
          >
            {{ livenessPrompt }}
          </div>
        </div>

        <p v-if="user" class="text-white-50 tiny mt-2">
          Verifying identity for: {{ user.email || user.uid }}
        </p>
        <div class="auth-actions">
          <CButton
            color="info"
            variant="outline"
            class="w-100 py-2 font-black mb-3"
            @click="performBiometricHandshake"
            :disabled="isValidating"
          >
            <i class="bi bi-eye me-2"></i> INITIATE_GLOBAL_SIGHTING
          </CButton>
          <CButton
            v-if="user && !user.biometricEnrolled"
            color="secondary"
            variant="outline"
            class="w-100 py-2 font-black mt-2"
            @click="enrollBiometric"
            :disabled="isValidating || isEnrolling"
          >
            <i class="bi bi-person-bounding-box me-2"></i> ENROLL_BIOMETRICS
          </CButton>
        <div
          v-for="error in errors"
          :key="error.id"
          class="text-danger tiny mt-2 d-flex align-items-center justify-content-center"
        >
          <span>{{ error.message }}</span>
          <CButton
            color="link"
            class="text-danger p-0 ms-2 text-decoration-none dismiss-btn"
            @click="emit('dismiss-error', error.id)"
            title="Dismiss Message"
          >
            <i class="bi bi-x-lg" style="font-size: 0.7rem;"></i>
          </CButton>
        </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import {
    biometricEnrollCallable,
    biometricVerifyCallable,
    send2faCallable,
    verify2FaCallable
} from '@/firebase';
import { CButton, CSpinner } from '@coreui/vue';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';


interface AuthUser {
  uid: string;
  email: string | null;
  biometricEnrolled?: boolean;
  biometricVerified?: boolean;
}

const props = defineProps<{
  user: AuthUser | null;
  errors: GlobalError[];
  isVerified: boolean;
  globalError: string;
}>();

const emit = defineEmits([
  'update:isVerified',
  'update:globalError',
  'biometric-enrolled',
  'dismiss-error'
]);

const isValidating = ref(false);
const videoFeed = ref<HTMLVideoElement | null>(null);
const isLivenessCheckActive = ref(false);
const livenessPrompt = ref('');
const isEnrolling = ref(false);
const show2faFallback = ref(false); // New state for 2FA fallback
const twoFaCode = ref(''); // New: for 2FA input
const isTwoFaVerifying = ref(false); // New: for 2FA loading state
const twoFaError = ref(''); // New: for 2FA error messages
const isSendingCode = ref(false); // New: for sending code loading state
const sendCodeMessage = ref(''); // New: for send code success messages
const stream = ref<MediaStream | null>(null);

// Camera Management
const initCamera = async () => {
  // Prevent orphaned streams by stopping any existing stream first
  if (stream.value) {
    stopCamera();
  }
  
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    if (videoFeed.value) {
      videoFeed.value.srcObject = stream.value;
    }
  } catch (err) {
    emit('update:globalError', 'Camera Access Denied: Biometric Sighting Required');
    console.error('Camera access error:', err);
  }
};

const stopCamera = () => {
  stream.value?.getTracks().forEach((track) => track.stop());
  stream.value = null;
  if (videoFeed.value) {
    videoFeed.value.srcObject = null;
  }
};

const performBiometricHandshake = async () => {
  isValidating.value = true;
  show2faFallback.value = false; // Reset 2FA fallback on new attempt
  twoFaCode.value = ''; // Reset 2FA code
  isTwoFaVerifying.value = false; // Reset 2FA verifying state
  twoFaError.value = ''; // Reset 2FA error
  sendCodeMessage.value = ''; // Reset send message
  emit('update:globalError', '');

  if (!props.user?.biometricEnrolled) {
    emit(
      'update:globalError',
      'Biometric enrollment required before verification. Please enroll your biometrics.'
    );
    isValidating.value = false;
    return;
  }
  if (!videoFeed.value) {
    emit('update:globalError', 'Camera feed not available. Please ensure camera is enabled.');
    isValidating.value = false;
    return;
  }

  isLivenessCheckActive.value = true;
  const actions = ['BLINK_EYES', 'NOD_HEAD_SLIGHTLY', 'TURN_HEAD_LEFT'];
  const selectedAction = actions[Math.floor(Math.random() * actions.length)];
  livenessPrompt.value = `PERFORM_LIVENESS_ACTION: ${selectedAction}`;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  isLivenessCheckActive.value = false;
  livenessPrompt.value = '';

  const canvas = document.createElement('canvas');
  canvas.width = videoFeed.value.videoWidth;
  canvas.height = videoFeed.value.videoHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    emit('update:globalError', 'Could not get canvas context for image capture.');
    isValidating.value = false;
    return;
  }
  context.drawImage(videoFeed.value, 0, 0, canvas.width, canvas.height);
  const imageData = canvas.toDataURL('image/jpeg', 0.8);

  if (!props.user?.uid) {
    emit('update:globalError', 'Verification Failed: User not authenticated.');
    isValidating.value = false;
    return;
  }

  try {
    const response = await biometricVerifyCallable({
      uid: props.user.uid,
      imageData,
      livenessAction: selectedAction
    });
    const result = response.data as {
      success: boolean;
      message?: string;
      biometricLoginStatus?: string;
    };
    if (result.success) {
      emit('update:isVerified', true);
      stopCamera();
    } else {
      // Trigger 2FA fallback if biometric recognition specifically failed
      if (result.biometricLoginStatus === 'failed_recognition') {
        show2faFallback.value = true;
      }
      emit('update:globalError', result.message || 'Biometric verification failed.');
    }
  } catch (error: any) {
    emit('update:globalError', `Verification Failed: ${error.message || 'Network Error'}`);
    console.error('Biometric verification API error:', error);
  }
  isValidating.value = false;
};

// New: 2FA Fallback Logic
const verifyTwoFaCode = async () => {
  isTwoFaVerifying.value = true;
  twoFaError.value = '';
  emit('update:globalError', '');

  if (!props.user?.uid) {
    twoFaError.value = 'User not authenticated.';
    isTwoFaVerifying.value = false;
    return;
  }

  try {
    const response = await verify2FaCallable({
      uid: props.user.uid,
      code: twoFaCode.value
    });
    
    const result = response.data as { success: boolean; message?: string };
    
    if (result.success) {
      emit('update:isVerified', true);
      stopCamera();
      show2faFallback.value = false; // Hide 2FA UI on success
      twoFaCode.value = '';
      console.log('2FA verification successful!');
    } else {
      twoFaError.value = result.message || 'Invalid 2FA code. Please try again.';
      console.error('2FA verification failed:', result.message);
    }
  } catch (error: any) {
    twoFaError.value = `Verification Failed: ${error.message || 'Network Error'}`;
    console.error('2FA API error:', error);
  } finally {
    isTwoFaVerifying.value = false;
  }
};

// New: Send 2FA Code Logic
const sendTwoFaCode = async () => {
  if (!props.user?.uid) {
    twoFaError.value = 'User not authenticated.';
    return;
  }

  isSendingCode.value = true;
  twoFaError.value = '';
  sendCodeMessage.value = '';

  try {
    const response = await send2faCallable({
      uid: props.user.uid
    });
    
    const result = response.data as { success: boolean; message?: string };
    
    if (result.success) {
      sendCodeMessage.value = result.message || 'Code sent successfully!';
    } else {
      twoFaError.value = result.message || 'Failed to send code.';
    }
  } catch (error: any) {
    twoFaError.value = `Failed to send code: ${error.message || 'Network Error'}`;
    console.error('Send 2FA API error:', error);
  } finally {
    isSendingCode.value = false;
  }
};

// Watch for show2faFallback to become true and clear any previous 2FA state
watch(show2faFallback, (newVal) => {
  if (newVal) {
    twoFaCode.value = '';
    twoFaError.value = '';
    sendCodeMessage.value = '';
    isTwoFaVerifying.value = false;
  }
});
const enrollBiometric = async () => {
  isEnrolling.value = true;
  emit('update:globalError', '');
  if (!videoFeed.value) {
    emit('update:globalError', 'Camera feed not available. Please ensure camera is enabled.');
    isEnrolling.value = false;
    return;
  }
  isLivenessCheckActive.value = true;
  const actions = ['BLINK_EYES', 'NOD_HEAD_SLIGHTLY', 'TURN_HEAD_RIGHT'];
  const selectedAction = actions[Math.floor(Math.random() * actions.length)];
  livenessPrompt.value = `PERFORM_LIVENESS_ACTION: ${selectedAction}`;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  isLivenessCheckActive.value = false;
  livenessPrompt.value = '';

  const canvas = document.createElement('canvas');
  canvas.width = videoFeed.value.videoWidth;
  canvas.height = videoFeed.value.videoHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    emit('update:globalError', 'Could not get canvas context for image capture.');
    isEnrolling.value = false;
    return;
  }
  context.drawImage(videoFeed.value, 0, 0, canvas.width, canvas.height);
  const imageData = canvas.toDataURL('image/jpeg', 0.8);

  if (!props.user?.uid) {
    emit('update:globalError', 'Enrollment Failed: User not authenticated.');
    isEnrolling.value = false;
    return;
  }

  try {
    const response = await biometricEnrollCallable({
      uid: props.user.uid,
      imageData,
      livenessAction: selectedAction
    });
    const result = response.data as { success: boolean; message?: string };
    if (result.success) {
      emit('biometric-enrolled'); // Notify parent to update user state
      emit(
        'update:globalError',
        'Biometric enrollment successful! You can now initiate global sighting.'
      );
    } else {
      emit('update:globalError', result.message || 'Biometric enrollment failed.');
    }
  } catch (error: any) {
    emit('update:globalError', `Enrollment Failed: ${error.message || 'Network Error'}`);
    console.error('Biometric enrollment API error:', error);
  } finally {
    isEnrolling.value = false;
  }
};

watch(
  () => props.isVerified,
  (newVal) => {
    if (newVal) {
      stopCamera();
    }
  }
);

onMounted(async () => {
  await nextTick();
  if (!props.isVerified) {
    initCamera();
  }
});

onBeforeUnmount(() => {
  stopCamera();
});
</script>

<style scoped>
.z-max {
  z-index: 9999;
}
.shadow-glow {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.2);
}
.grayscale {
  filter: grayscale(100%);
}
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: #00e5ff;
  box-shadow: 0 0 15px #00e5ff;
  animation: scan 3s linear infinite;
}
@keyframes scan {
  from {
    top: 0%;
  }
  to {
    top: 100%;
  }
}
.font-black {
  font-weight: 900;
}
.bg-black-75 {
  background-color: rgba(0, 0, 0, 0.75);
  font-weight: 900;
}
.italic {
  font-style: italic;
}
.tiny {
  font-size: 0.65rem;
}
.dismiss-btn {
  opacity: 0.6;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
}
.dismiss-btn:hover {
  opacity: 1;
  transform: scale(1.3);
}
</style>
