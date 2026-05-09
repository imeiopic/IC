<template>
  <CContainer fluid class="onboarding-substrate p-4 bg-black min-vh-100 font-mono text-white d-flex align-items-center justify-content-center">
    
    <CCard class="bg-zinc-900 border-info shadow-glow overflow-hidden" style="max-width: 500px; width: 100%;">
      <CCardHeader class="bg-zinc-800 border-0 p-4 text-center">
        <div class="glitch-logo mb-3">
          <img src="/images/iologo.png" alt="IOPIC" width="80" />
        </div>
        <h2 class="text-glow text-info italic font-black m-0">ENTITY_GROUNDING</h2>
        <p class="tiny text-zinc-500 uppercase tracking-widest mt-1">Sighting_Protocol_0001</p>
      </CCardHeader>

      <CCardBody class="p-4">
        <div class="logic-brief mb-4 p-3 bg-black border border-zinc-800 rounded">
          <p class="extra-tiny text-info italic m-0">
            "You are transiting from Noise to a Sovereign Node. This process grounds your identity in the 16-thread bus."
          </p>
        </div>

        <div v-if="referrerId" class="referral-alert p-2 mb-4 bg-success bg-opacity-10 border border-success rounded d-flex align-items-center gap-2">
          <i class="bi bi-shield-check text-success"></i>
          <span class="extra-tiny text-success uppercase font-black">Referral_Pulse_Detected: {{ referrerId.substring(0,8) }}</span>
        </div>

        <div class="action-stack d-flex flex-column gap-3">
          <CButton 
            color="info" 
            class="py-3 font-black italic shadow-info"
            @click="groundWithGoogle"
            :disabled="isProcessing"
          >
            <i class="bi bi-google me-2"></i>{{ isProcessing ? 'POLICING_IDENTITY...' : 'INITIATE_GOOGLE_HANDSHAKE' }}
          </CButton>

          <div class="text-center">
            <span class="extra-tiny text-zinc-600 uppercase">Handshake required for 1.2Q TPE Access</span>
          </div>
        </div>
      </CCardBody>

      <CCardFooter class="bg-zinc-950 border-0 p-3 text-center opacity-50">
        <div class="tiny">I = VR² | THE DAY THE NOISE STOPPED</div>
      </CCardFooter>
    </CCard>

  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const router = useRouter();
const isProcessing = ref(false);
const referrerId = ref<string | null>(null);

/**
 * 01_REFERRAL_SIGHTING
 * Pulling the pulse from the Sovereign Shield (sessionStorage)
 */
onMounted(() => {
  referrerId.value = sessionStorage.getItem('referrer_instance_id');
});

/**
 * 02_GROUNDING_HANDSHAKE
 */
const groundWithGoogle = async () => {
  isProcessing.value = true;
  const provider = new GoogleAuthProvider();
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Sighting if Node already exists
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Grounding a New Sovereign Entity
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        status: 'Grounded_Node',
        cluster_id: 'CLE_01', // Defaulting to Local Ground
        referrerInstanceID: referrerId.value || 'ORIGIN_PULSE',
        timestamp: serverTimestamp(),
        equity_balance: 1600 // Initial Grounding Dividend
      });
      console.log("LOGIC: New Node Grounded.");
    }

    // Transit to the Virtual OS
    router.push('/virtual');
  } catch (error) {
    console.error("LOGIC_FRACTURE: Grounding Failed", error);
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.onboarding-substrate { background: radial-gradient(circle at center, #0a0a0a 0%, #000 100%); }
.text-glow { text-shadow: 0 0 15px rgba(0, 229, 255, 0.4); }
.shadow-glow { box-shadow: 0 0 40px rgba(0, 229, 255, 0.15) !important; }
.shadow-info { box-shadow: 0 0 20px rgba(0, 229, 255, 0.2); }

.glitch-logo {
  animation: pulse-glow 3s infinite alternate;
}

@keyframes pulse-glow {
  from { filter: drop-shadow(0 0 2px rgba(0, 229, 255, 0.2)); }
  to { filter: drop-shadow(0 0 10px rgba(0, 229, 255, 0.6)); }
}

.font-black { font-weight: 900; }
.tiny { font-size: 0.65rem; }
.extra-tiny { font-size: 0.55rem; }
.italic { font-style: italic; }
</style>