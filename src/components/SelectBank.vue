<template>
  <div class="bank-selector-bus">
    <h3 class="sighting-header">Sighting Your Financial Institution</h3>
    <p class="logic-subtext">Select a portal to ground your physical equity into the IOWB.</p>

    <div v-if="bankLinkingStore.error" class="error-banner">
      {{ bankLinkingStore.error }}
    </div>

    <div class="bank-grid">
      <div
        v-for="bank in commonBanks"
        :key="bank.id"
        class="bank-node"
        :class="{ disabled: bankLinkingStore.isBankLinkingInProgress }"
        @click="initiateLink(bank.id)"
      >
        <img :src="bank.logo" :alt="bank.name" class="bank-logo" />
        <span class="bank-label">{{ bank.name }}</span>
        <span v-if="linkingId === bank.id" class="text-info mt-2" style="font-size: 0.75rem"
          >Linking...</span
        >
      </div>
      <!-- Generic link option for other banks -->
      <div
        class="bank-node search-node"
        :class="{ disabled: bankLinkingStore.isBankLinkingInProgress }"
        @click="initiateGenericLink"
      >
        <div class="search-icon">🔍</div>
        <span class="bank-label">Search All Banks</span>
        <span v-if="linkingId === 'generic'" class="text-info mt-2" style="font-size: 0.75rem"
          >Linking...</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBankLinkingStore } from '../stores/bankLinking'; // Import the Pinia store

// Use the user's UID from useAuth to pass to the store's linking function
import { useAuth } from '@composables/useAuth';
const { user } = useAuth();

const commonBanks = ref([
  { id: 'chase', name: 'Chase', logo: '/logos/chase_pulse.png' },
  { id: 'navy_federal', name: 'Navy Federal', logo: '/logos/navyfed_pulse.png' }, // Sighted New Node
  { id: 'bofa', name: 'Bank of America', logo: '/logos/bofa_pulse.png' },
  { id: 'wells', name: 'Wells Fargo', logo: '/logos/wells_pulse.png' },
  { id: 'pnc', name: 'PNC', logo: '/logos/pnc_pulse.png' },
  { id: 'barclays', name: 'Barclays', logo: '/logos/barclays_pulse.png' }
]);

const bankLinkingStore = useBankLinkingStore();
const linkingId = ref(null);

const initiateLink = async (bankId) => {
  const selectedBank = commonBanks.value.find((b) => b.id === bankId);
  if (selectedBank) {
    if (!user.value || bankLinkingStore.isBankLinkingInProgress) return;
    linkingId.value = bankId;
    try {
      await bankLinkingStore.initiateStripeFinancialLink(user.value.uid, {
        id: selectedBank.id,
        name: selectedBank.name
      });
    } finally {
      linkingId.value = null;
    }
  }
};

const initiateGenericLink = async () => {
  if (!user.value || bankLinkingStore.isBankLinkingInProgress) return;
  // For generic link, we can use a placeholder name/id, Stripe will handle the actual selection
  linkingId.value = 'generic';
  try {
    await bankLinkingStore.initiateStripeFinancialLink(user.value.uid, {
      id: 'generic',
      name: 'Other Bank'
    });
  } finally {
    linkingId.value = null;
  }
};
</script>

<style scoped>
.bank-selector-bus {
  background: #0a0a0a;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #222;
  color: #eee; /* Added for better visibility */
}
.bank-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
.bank-node {
  background: #111;
  border: 1px solid #333;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bank-node:hover {
  border-color: #ffd700;
  transform: translateY(-5px);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
}
.bank-node.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.bank-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
  margin-bottom: 0.5rem;
  filter: grayscale(100%) brightness(1.5);
}
.bank-node:hover .bank-logo {
  filter: grayscale(0%) brightness(1);
}
.bank-label {
  font-size: 0.8rem;
  color: #888;
}
.sighting-header {
  color: #00e5ff;
}
.logic-subtext {
  color: #ccc;
}
.error-banner {
  color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.85rem;
}
</style>
