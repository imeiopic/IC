<template>
  <CCard class="bg-zinc-900 border-info text-white shadow-glow p-4" style="width: 350px">
    <CCardHeader class="font-black italic text-info text-center"
      >NEW_IDENTITY_REGISTRATION</CCardHeader
    >
    <CCardBody>
      <CForm @submit.prevent="handleRegister">
        <div class="mb-3">
          <CFormLabel for="registerEmail" class="text-zinc-400">EMAIL_ADDRESS</CFormLabel>
          <CFormInput
            id="registerEmail"
            type="email"
            v-model="email"
            placeholder="user@domain.com"
            class="bg-zinc-950 border-zinc-800 text-info font-mono"
            required
          />
        </div>
        <div class="mb-3">
          <CFormLabel for="registerPassword" class="text-zinc-400">PASSWORD</CFormLabel>
          <CFormInput
            id="registerPassword"
            type="password"
            v-model="password"
            placeholder="********"
            class="bg-zinc-950 border-zinc-800 text-info font-mono"
            required
          />
        </div>
        <div class="mb-3">
          <CFormLabel for="confirmPassword" class="text-zinc-400">CONFIRM_PASSWORD</CFormLabel>
          <CFormInput
            id="confirmPassword"
            type="password"
            v-model="confirmPassword"
            placeholder="********"
            class="bg-zinc-950 border-zinc-800 text-info font-mono"
            required
          />
        </div>
        <div class="mb-4">
          <CFormLabel for="selectRole" class="text-zinc-400">SELECT_ROLE</CFormLabel>
          <CFormSelect
            id="selectRole"
            v-model="selectedRole"
            class="bg-zinc-950 border-zinc-800 text-info font-mono"
          >
            <option value="buyer">BUYER</option>
            <option value="seller">SELLER</option>
          </CFormSelect>
          <p class="tiny text-warning mt-1">
            WARNING: Self-selecting 'seller' role is for demonstration. In production, this requires
            admin approval.
          </p>
        </div>
        <CButton
          color="info"
          type="submit"
          class="w-100 py-2 font-black italic"
          :disabled="isProcessing"
        >
          <span v-if="!isProcessing">INITIATE_IDENTITY</span>
          <span v-else>CREATING_IDENTITY...</span>
        </CButton>
      </CForm>
      <div class="text-center mt-3">
        <p class="small text-zinc-500 mb-1">ALREADY_HAVE_IDENTITY?</p>
        <CButton color="link" class="text-info small" @click="$emit('show-login')">
          ACCESS_EXISTING_IDENTITY
        </CButton>
      </div>
    </CCardBody>
  </CCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useErrorStore } from '@/stores/error';
import { useSuccessStore } from '@/stores/success';
const emit = defineEmits(['show-login']);

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const selectedRole = ref('buyer'); // Default role
const isProcessing = ref(false);
// Pinia Stores
const errorStore = useErrorStore();
const successStore = useSuccessStore();
// Removed: const { globalError } = useError(); // This line is no longer needed after unifying error handling.

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    errorStore.setGlobalError('REGISTRATION_FAILED: Passwords do not match.');
    return;
  }

  isProcessing.value = true;
  errorStore.clearGlobalError(); // Clear previous errors
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // Create user document in Firestore with selected role and initial equity
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: selectedRole.value,
      iowb: { balance: 1000 }, // Initial equity
    });

    successStore.setSuccessMessage(
      'REGISTRATION_SUCCESS: New user identity created. Please log in.'
    );
    // Firebase's onAuthStateChanged in App.vue will handle navigation
  } catch (error: any) {
    console.error('REGISTRATION_FRACTURE:', error.code, error.message);
    errorStore.setGlobalError(`REGISTRATION_FAILED: ${error.message}`);
  } finally {
    isProcessing.value = false;
  }
};
</script>
