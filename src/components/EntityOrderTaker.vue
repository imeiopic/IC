<script setup lang="ts">
import { callFirebaseFunction } from '@/api';
import { useAuth } from '@composables/useAuth';
import { CSpinner } from '@coreui/vue';
import { loadStripe } from '@stripe/stripe-js';
import { ref } from 'vue';
import { FIAT_TO_IO_RATIO, STRIPE_ANCHORS, type StripeAnchorProduct } from '../stores/anchorsData';

const { user } = useAuth();
const isLoading = ref(false);
const selectedPriceId = ref<string | null>(null);
const errorMsg = ref<string | null>(null);

/**
 * Initiates the Stripe Checkout process.
 */
const handleOrder = async (anchor: StripeAnchorProduct) => {
  if (!user.value) {
    errorMsg.value = "CRITICAL: User session not detected. Please ground your identity first.";
    return;
  }

  isLoading.value = true;
  selectedPriceId.value = anchor.priceId;
  errorMsg.value = null;

  console.log(`[ORDER_TAKER] Initiating order for: ${anchor.name} (${anchor.priceId})`);
  
  try {
    const result = await callFirebaseFunction('createStripeCheckoutSession', {
      priceId: anchor.priceId,
      userId: user.value.uid,
      multiplier: anchor.multiplier,
    }) as { sessionId: string };

    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId: result.sessionId });
    }
  } catch (error: any) {
    errorMsg.value = error.message || "HANDSHAKE_FRACTURE: Secure redirection failed.";
    console.error('[ORDER_TAKER] Checkout failed:', error);
  } finally {
    isLoading.value = false;
  }
};

const calculateExpectedIO = (fiat: number, multiplier: number) => {
  return (fiat / FIAT_TO_IO_RATIO) * multiplier;
};
</script>

<template>
  <div class="order-taker-substrate">
    <div class="header">
      <h3>Anchor Acquisition Terminal</h3>
      <p class="subtitle">Select a grounding tier to stabilize your node identity.</p>
    </div>

    <div v-if="errorMsg" class="error-alert">
      [SYSTEM_ERROR]: {{ errorMsg }}
      <button @click="errorMsg = null" class="close-btn">×</button>
    </div>

    <div class="anchor-grid">
      <div 
        v-for="anchor in STRIPE_ANCHORS" 
        :key="anchor.id" 
        :class="['anchor-card', { 'invite-locked': anchor.eInviteRequired }]"
      >
        <div class="card-header">
          <span class="anchor-name">{{ anchor.name }}</span>
          <span v-if="anchor.eInviteRequired" class="lock-icon">🔒</span>
        </div>
        
        <p class="description">{{ anchor.description }}</p>
        
        <div class="economics">
          <div class="fiat-price">${{ anchor.fiatPrice.toFixed(2) }} USD</div>
          <div class="io-reward">
            <span class="label">Yield:</span>
            <span class="value">{{ calculateExpectedIO(anchor.fiatPrice, anchor.multiplier).toFixed(2) }} IO$</span>
          </div>
          <div class="multiplier-tag">x{{ anchor.multiplier.toFixed(2) }} Multiplier</div>
        </div>

        <button 
          @click="handleOrder(anchor)" 
          :disabled="isLoading"
          class="ground-btn"
        >
          <CSpinner v-if="isLoading && selectedPriceId === anchor.priceId" size="sm" variant="grow" class="me-2" />
          <span v-if="isLoading && selectedPriceId === anchor.priceId">INITIALIZING_PULSE...</span>
          <span v-else-if="isLoading">LOCKED</span>
          <span v-else>GROUND NODE</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-taker-substrate {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 24px;
  margin: 10px 0;
}

.header h3 { margin: 0; color: #1a1a1a; font-weight: 700; }
.subtitle { font-size: 0.9em; color: #6c757d; margin-bottom: 24px; }

.error-alert {
  background: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.8em;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.anchor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.anchor-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.anchor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.anchor-name { font-weight: bold; color: #2e7d32; font-family: monospace; }
.description { font-size: 0.85em; color: #495057; line-height: 1.4; flex-grow: 1; margin-bottom: 16px; }

.economics { border-top: 1px solid #f1f3f5; padding-top: 12px; margin-bottom: 16px; }
.fiat-price { font-size: 1.25em; font-weight: 800; color: #212529; }
.io-reward { font-size: 0.9em; margin-top: 4px; }
.io-reward .value { color: #00e5ff; font-weight: bold; }
.multiplier-tag { font-size: 0.75em; background: #e8f5e9; color: #2e7d32; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 8px; }

.ground-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: 900;
  font-family: monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
.ground-btn:hover:not(:disabled) { background-color: #388e3c; }
.ground-btn:disabled { 
  opacity: 0.5; 
  cursor: not-allowed; 
  filter: grayscale(0.6);
  background-color: #2e7d32;
}
</style>