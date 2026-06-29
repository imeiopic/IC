<template>
  <div class="checkout-store bg-black text-white font-mono p-4 min-h-screen">
    <header class="border-bottom border-zinc-800 pb-4 mb-5">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 class="h4 font-black italic m-0 text-glow text-info">IOPIC_ANCHOR_STORE // v1.0.0</h1>
          <p class="tiny text-zinc-500 m-0 uppercase mt-1">System Standard Effective: June 1, 2026</p>
        </div>
        <div class="p-2 bg-zinc-900 border border-zinc-800 rounded small">
          <span class="text-zinc-500 tiny uppercase">Valuation_Scalar:</span>
          <span class="text-success font-black ms-2">5.00 USD = 1.00 IO$</span>
        </div>
      </div>
    </header>

    <div class="row g-4">
      <div v-for="anchor in products" :key="anchor.id" class="col-xl-3 col-md-6">
        <div class="card bg-zinc-900 border-zinc-800 h-100 position-relative overflow-hidden d-flex flex-column transition-card">
          
          <div v-if="anchor.eInviteRequired" class="invite-tag tiny px-2 py-0.5 bg-info text-black font-black uppercase position-absolute">
            E_INVITE_REQ
          </div>

          <div class="card-body p-4 d-flex flex-column h-100">
            <div class="mb-3">
              <h3 class="h6 font-black text-white m-0 uppercase tracking-wider">{{ anchor.name }}</h3>
              <span class="tiny text-zinc-500 font-mono">{{ anchor.id }}</span>
            </div>

            <p class="small text-zinc-400 flex-grow-1 line-clamp">
              {{ anchor.description }}
            </p>

            <div class="bg-black border border-zinc-800 rounded p-3 my-3 small font-mono">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-zinc-500 tiny">FIAT_COST:</span>
                <span class="text-white font-black">${{ anchor.fiatPrice.toFixed(2) }} USD</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-zinc-500 tiny">BASE_YIELD:</span>
                <span class="text-zinc-300">{{ calculateBaseIO(anchor.fiatPrice) }} IO$</span>
              </div>
              <div class="d-flex justify-content-between mb-2 pb-1 border-bottom border-zinc-900">
                <span class="text-zinc-500 tiny">MULTIPLIER:</span>
                <span class="text-warning font-black">x{{ anchor.multiplier.toFixed(2) }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center pt-1">
                <span class="text-info tiny font-black">SPENDABLE_CREDIT:</span>
                <span class="text-success text-glow font-black h6 m-0">
                  {{ calculateNetIO(anchor.fiatPrice, anchor.multiplier) }} IO$
                </span>
              </div>
            </div>

            <button 
              @click="initiateAnchorCheckout(anchor.priceId)"
              :disabled="loadingPriceId === anchor.priceId"
              class="btn btn-outline-info font-black text-uppercase tiny py-2.5 w-100 mt-auto tracking-widest d-flex align-items-center justify-content-center gap-2"
              :class="{ 'btn-loading': loadingPriceId === anchor.priceId }"
            >
              <i v-if="loadingPriceId === anchor.priceId" class="spinner-border spinner-border-sm"></i>
              <i v-else class="bi bi-lightning-charge-fill"></i>
              {{ loadingPriceId === anchor.priceId ? 'INITIALIZING_BUS...' : 'GROUND_ANCHOR_NODE' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FIAT_TO_IO_RATIO, STRIPE_ANCHORS } from '../stores/anchorsData';

const products = ref(STRIPE_ANCHORS);
const loadingPriceId = ref<string | null>(null);

const calculateBaseIO = (fiatPrice: number): string => {
  return (fiatPrice / FIAT_TO_IO_RATIO).toFixed(2);
};

const calculateNetIO = (fiatPrice: number, multiplier: number): string => {
  const base = fiatPrice / FIAT_TO_IO_RATIO;
  return (base * multiplier).toFixed(2);
};

const initiateAnchorCheckout = async (priceId: string) => {
  loadingPriceId.value = priceId;
  try {
    const response = await fetch('/api/checkout/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    });

    const session = await response.json();
    if (session.url) {
      window.location.href = session.url;
    } else {
      throw new Error("MALFORMED_GATEWAY_SESSION");
    }
  } catch (error) {
    console.error("CRITICAL_ROUTING_FAULT:", error);
    alert("TRANSACTION_BUS_LOCKED: Secure checkout initialization failure.");
  } finally {
    loadingPriceId.value = null;
  }
};
</script>

<style scoped>
.text-glow {
  text-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
}
.transition-card {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
}
.transition-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 229, 255, 0.3) !important;
}
.invite-tag {
  top: 0;
  right: 0;
  border-bottom-left-radius: 4px;
  font-size: 0.55rem;
  letter-spacing: 0.05em;
}
.tiny {
  font-size: 0.65rem;
  letter-spacing: 0.05em;
}
.font-black { font-weight: 900; }
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.btn-outline-info { border-color: rgba(0, 229, 255, 0.4); color: #00e5ff; }
</style>