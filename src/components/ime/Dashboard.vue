<template>
  <CRow>
    <CCol lg="4">
      <CCard class="mb-4 bg-zinc-900 border-info text-info shadow-glow">
        <CCardBody class="text-center">
          <CImage
            :src="userPhoto || '/images/imeiopic.png'"
            roundedCircle
            width="80"
            height="80"
            class="mb-3 border border-info p-1 grayscale"
          />
          <h4 class="font-black italic text-white">MASTER_NODE</h4>
          <CBadge color="success" class="text-black px-3">ROOT_ACCESS</CBadge>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol lg="8">
      <CCard class="bg-zinc-900 border-success text-white shadow-success p-4">
        <h5 class="font-black italic text-success mb-3">GLOBAL_PULSE_BROADCAST</h5>
        <CButton
          color="success"
          class="w-100 py-3 font-black italic"
          @click="triggerGlobalPulse"
          :disabled="isPushing"
        >
          {{ isPushing ? 'TRANSMITTING...' : 'BROADCAST_UNIVERSAL_DIVIDEND' }}
        </CButton>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CCard, CCardBody, CImage, CBadge, CButton, CRow, CCol } from '@coreui/vue';
import { db } from '../../firebase'; // Corrected relative path
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface AuthUser {
  uid: string;
}

const props = defineProps<{ user: AuthUser | null; userPhoto: string | null }>();
const emit = defineEmits(['update:globalError']);

const isPushing = ref(false);

const triggerGlobalPulse = async () => {
  if (isPushing.value) return;
  isPushing.value = true;
  emit('update:globalError', '');

  try {
    await updateDoc(doc(db, 'system', 'globalStatus'), {
      lastPulse: serverTimestamp(),
      pulsedBy: props.user?.uid || 'UNKNOWN_MASTER',
      pulseCount: (Math.random() * 1000).toFixed(0)
    });
  } catch (error: any) {
    emit('update:globalError', `BROADCAST_FAILURE: CLUSTER_BUS_ERROR - ${error.message}`);
    console.error('Global pulse broadcast error:', error);
  } finally {
    isPushing.value = false;
  }
};
</script>

<style scoped>
.shadow-glow {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.2);
}
.shadow-success {
  box-shadow: 0 0 30px rgba(40, 167, 69, 0.2);
}
.grayscale {
  filter: grayscale(100%);
}
.font-black {
  font-weight: 900;
}
.italic {
  font-style: italic;
}
</style>
