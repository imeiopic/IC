<template>
  <div class="harmonic-offering-substrate container-fluid p-0 font-mono">
    <!-- System Feedback Layer -->
    <div class="message-center px-4 pt-4" v-if="successMsg || errorMsg">
      <div v-if="successMsg" class="pulse-msg success mb-4">{{ successMsg }}</div>
      <div v-if="errorMsg" class="pulse-msg error mb-4">{{ errorMsg }}</div>
    </div>

    <div class="row g-4 justify-content-center">
      <div 
        v-for="anchor in anchors" 
        :key="anchor.id" 
        class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex"
      >
        <div class="anchor-card w-100 d-flex flex-column bg-zinc-950 border border-zinc-800 rounded position-relative overflow-hidden transition-all shadow-hover">
          
          <div class="image-substrate position-relative border-bottom border-zinc-800">
            <img 
              v-if="anchor.images && anchor.images.length > 0" 
              :src="anchor.images[0]" 
              :alt="anchor.name"
              class="w-100 object-fit-cover"
              style="height: 200px;"
            />
            <div v-else class="fallback-visualizer w-100 d-flex align-items-center justify-content-center text-zinc-700" style="height: 200px;">
              [NO_VISUAL_DATA]
            </div>
            
            <div 
              v-if="anchor.metadata?.chashapp" 
              class="position-absolute top-0 end-0 m-2 px-2 py-1 bg-black border border-info text-info extra-tiny fw-bold rounded shadow-info"
            >
              C_HASH: {{ anchor.metadata.chashapp }}
            </div>
          </div>

          <div class="card-body p-4 d-flex flex-column flex-grow-1">
            <h4 class="text-white font-black text-uppercase tracking-wide mb-2">
              {{ formatName(anchor.name) }}
            </h4>
            
            <p class="text-zinc-400 tiny mb-4 flex-grow-1">
              {{ (anchor as any).description || 'Baseline mesh stabilization node. No explicit parameters defined.' }}
            </p>

            <button 
              class="btn btn-outline-info w-100 py-2 font-black italic text-uppercase shadow-glow-hover mt-auto"
              :disabled="isProcessing"
              @click="initiateGrounding(anchor)"
            >
              {{ isProcessing ? 'Stabilizing...' : 'Ground Thread' }}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { callFirebaseFunction } from '@/api';
import { app } from '@/firebase';
import { storeToRefs } from 'pinia';
import { useAnchorsStore } from '@/stores/anchors';
import { useAuth } from '@composables/useAuth';
import { loadStripe } from '@stripe/stripe-js';
import { computed, onMounted, ref, watch } from 'vue';

// 02_STATE_PAYLOAD
const { user } = useAuth();
const anchorsStore = useAnchorsStore();
const { anchors } = storeToRefs(anchorsStore);

const isProcessing = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

/**
 * Replaces underscores with spaces for a cleaner UI presentation.
 * @param name The raw anchor name.
 */
const formatName = (name: string) => name.replace(/_/g, ' ');

/**
 * Verifies the Stripe session after a successful redirection.
 */
const verifyTransit = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  if (sessionId && user.value) {
    successMsg.value = 'TRANSIT_VERIFIED: SYNCING_EQUITY_THREAD...';
    errorMsg.value = '';

    try {
      const responseData = await callFirebaseFunction<
        { sessionId: string; userId: string },
        { success: boolean; message: string }
      >(app, 'verifyStripeSession', { sessionId, userId: user.value.uid });

      if (responseData.success) {
        localStorage.setItem('isNodeInitialized', 'true');
        successMsg.value = 'EQUITY_STABILIZED: HARMONIC_ANCHOR_GROUNDED';
        
        // Signal to the global mesh that equity has been updated
        window.dispatchEvent(new CustomEvent('equity-updated'));
        setTimeout(() => (successMsg.value = ''), 5000);
      } else {
        errorMsg.value = responseData.message || 'ERROR: Pulse verification fractured.';
        setTimeout(() => (errorMsg.value = ''), 7000);
      }
    } catch (err: any) {
      console.error('TRANSIT_VERIFICATION_FAILED', err);
      errorMsg.value = 'ERROR: Unexpected handshake failure during verification.';
      setTimeout(() => (errorMsg.value = ''), 7000);
    } finally {
      // Clean URL to prevent re-triggering on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
};

onMounted(() => {
  anchorsStore.fetchAnchors();
  verifyTransit();
});

watch(user, (newUser) => {
  if (newUser) {
    verifyTransit();
  }
});

/**
 * Initiates the grounding handshake for a specific harmonic anchor.
 * @param anchor The target anchor node.
 */
const initiateGrounding = async (anchor: HarmonicAnchor) => {
  if (!user.value) {
    errorMsg.value = 'ERROR: Node not sighted. Please authenticate.';
    console.error(errorMsg.value);
    return;
  }

  isProcessing.value = true;
  try {
    // Extract multiplier from description or metadata if available, default to 1.0
    const multiplierStr = anchor.description?.match(/(\d+\.?\d*)x/)?.[1] || '1.0';
    const multiplier = parseFloat(multiplierStr);

    const result = await callFirebaseFunction<
      { priceId: string; userId: string; multiplier: number },
      { sessionId: string }
    >(app, 'createStripeCheckoutSession', {
      priceId: anchor.default_price,
      userId: user.value.uid,
      multiplier: multiplier,
    });

    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    if (stripe && result.sessionId) {
      console.log(`[HARMONIC_OFFERING] Redirecting to Stripe: ${anchor.name}`);
      await stripe.redirectToCheckout({ sessionId: result.sessionId });
    }
  } catch (err: any) {
    console.error('STRIPE_INIT_FAILED', err);
    errorMsg.value = 'LOGIC_FRACTURE: Failed to initialize secure handshake.';
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.shadow-hover:hover {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.15);
}
.shadow-info {
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}
.shadow-glow-hover:hover {
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
}
.object-fit-cover {
  object-fit: cover;
}
.bg-zinc-950 {
  background-color: #050505;
}
.pulse-msg {
  padding: 10px;
  border: 1px solid;
  text-align: center;
  font-weight: bold;
  border-radius: 8px;
  font-size: 0.65rem;
  text-transform: uppercase;
  font-style: italic;
}
.success {
  color: #00ff00;
  border-color: #00ff00;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}
.error {
  color: #ff0000;
  border-color: #ff0000;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
}
</style>
