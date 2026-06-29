<template>
  <div class="staking-terminal-section mt-4 p-3 border border-zinc-700 rounded-lg bg-zinc-950">
    <p class="extra-tiny text-zinc-500 italic mb-3 uppercase">Initialization Stake Tiers</p>

    <div v-if="errorMsg" class="pulse-msg error text-danger tiny mb-2">{{ errorMsg }}</div>
    <div v-if="isProcessing" class="pulse-msg processing text-info tiny mb-2">STABILIZING_HANDSHAKE...</div>

    <div v-if="isLoading" class="text-info extra-tiny font-mono uppercase">SIGHTING_STAKE_TIERS...</div>
    
    <div v-else class="tier-grid">
      <div
        v-for="tier in tiers"
        :key="tier.id"
        class="tier-card mb-3 p-3 border-top"
        :style="{ borderTop: '4px solid ' + tier.color }"
      >
        <h3 class="text-white tiny font-bold">{{ tier.label }}</h3>
        <p class="text-zinc-400 extra-tiny mb-2">{{ tier.description }}</p>
        
        <CButton
          color="info"
          variant="outline"
          class="w-100 py-2 extra-tiny font-black italic shadow-info"
          :disabled="isProcessing"
          @click="initiateStripeCheckout(tier)"
        >
          Ground {{ tier.amount }} IO$
        </CButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { CButton } from '@coreui/vue';
import { loadStripe } from '@stripe/stripe-js';
import { callFirebaseFunction } from '@/api';
import { app } from '@/firebase';
import * as Sentry from '@sentry/vue';

interface StakeTier {
  id: string;
  priceId: string;
  label: string;
  amount: string | number;
  color: string;
  description: string;
}

const tiers = ref<StakeTier[]>([]);
const isLoading = ref(false);
const isProcessing = ref(false);
const errorMsg = ref('');

// 1. Fetch available tiers from backend
const fetchStakeTiers = async () => {
  isLoading.value = true;
  try {
    tiers.value = await callFirebaseFunction<void, StakeTier[]>(app, 'getIopicTiers');
  } catch (err: any) {
    console.error('STAKE_TIER_FRACTURE:', err);
    errorMsg.value = 'CRITICAL: Failed to load stake tiers.';
    Sentry.captureException(err);
  } finally {
    isLoading.value = false;
  }
};

// 2. Stripe Checkout Orchestration
const initiateStripeCheckout = async (tier: StakeTier) => {
  isProcessing.value = true;
  errorMsg.value = '';

  try {
    const { sessionId } = await callFirebaseFunction(app, 'createStripeCheckoutSession', {
      priceId: tier.priceId,
    });

    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    await stripe?.redirectToCheckout({ sessionId });
  } catch (err: any) {
    errorMsg.value = 'HANDSHAKE_FRACTURE: Checkout initialization failed.';
    Sentry.captureException(err);
  } finally {
    isProcessing.value = false;
  }
};

onMounted(fetchStakeTiers);
</script>