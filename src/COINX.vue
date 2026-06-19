<template>
  <div class="coinx-card">
    <h3>COINX: {{ coinx.id }}</h3>
    <p class="coinx-type">{{ coinxTypeLabel }}</p>

    <div class="contract-details">
      <h4>Contract Details</h4>
      <p><strong>Contract ID:</strong> {{ coinx.contract.contractId }}</p>
      <p><strong>Inviting Entity:</strong> {{ coinx.contract.invitingEntityId }}</p>
      <p><strong>Invited Entity:</strong> {{ coinx.contract.invitedEntityId }}</p>
      <p><strong>Status:</strong> <span :class="statusClass">{{ coinx.contract.status }}</span></p>
      <p><strong>Duration:</strong> {{ coinx.contract.durationMinutes }} minutes</p>
      <p><strong>Location:</strong> {{ coinx.contract.location }}</p>
      <p><strong>Network:</strong> {{ coinx.contract.network }}</p>
      <p><strong>Currency:</strong> {{ coinx.contract.currency }}</p>
      <p><strong>Language:</strong> {{ coinx.contract.language }}</p>

      <div v-if="isBuyerSellerType">
        <h5>Commerce Specifics</h5>
        <p v-if="coinx.contract.menu && coinx.contract.menu.length">
          <strong>Menu Items:</strong> {{ coinx.contract.menu.join(', ') }}
        </p>
        <p v-if="coinx.contract.order && coinx.contract.order.length">
          <strong>Order:</strong> {{ coinx.contract.order.join(', ') }}
        </p>
      </div>
    </div>

    <div class="coinx-features">
      <h4>Features</h4>
      <p><strong>Identity Validated:</strong> {{ coinx.identityValidated ? 'Yes' : 'No' }}</p>
      <p><strong>Encrypted:</strong> {{ coinx.encrypted ? 'Yes' : 'No' }}</p>
      <p><strong>Peer-to-Peer:</strong> {{ coinx.peerToPeer ? 'Yes' : 'No' }}</p>
      <p><strong>Commerce Enabled:</strong> {{ coinx.commerceEnabled ? 'Yes' : 'No' }}</p>
      <p><strong>Trusted Data Types:</strong> {{ coinx.trustedDataTypes.join(', ') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';
import type { CoinX } from './coinxModel';

const props = defineProps<{
  coinx: CoinX;
}>();

const coinxTypeLabel = computed(() => {
  switch (props.coinx.contract.type) {
    case '01': return 'Person-to-Person (P2P)';
    case '10': return 'Buyer-to-Seller (B2S)';
    default: return 'Unknown Type';
  }
});

const isBuyerSellerType = computed(() => props.coinx.contract.type === '10');

const statusClass = computed(() => {
  switch (props.coinx.contract.status) {
    case 'ACTIVE': return 'status-active';
    case 'PENDING': return 'status-pending';
    case 'EXPIRED': return 'status-expired';
    case 'CANCELLED': return 'status-cancelled';
    default: return '';
  }
});
</script>

<style scoped>
.coinx-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.coinx-card h3 {
  color: #333;
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.coinx-type {
  font-style: italic;
  color: #666;
  margin-bottom: 12px;
}

.contract-details, .coinx-features {
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #007bff;
}

.contract-details h4, .coinx-features h4 {
  color: #007bff;
  margin-top: 0;
  margin-bottom: 8px;
}

.contract-details p, .coinx-features p {
  margin: 4px 0;
  font-size: 0.95em;
}

.contract-details strong, .coinx-features strong {
  color: #555;
}

.status-active {
  color: green;
  font-weight: bold;
}

.status-pending {
  color: orange;
  font-weight: bold;
}

.status-expired, .status-cancelled {
  color: red;
  font-weight: bold;
}
</style>