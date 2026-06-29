<template>
  <div class="bsmolecule-card">
    <h2>BSMOLECULE: Buyer-Seller Exchange</h2>
    <p class="coinx-id">COINX ID: {{ coinx.id }}</p>

    <div class="buyer-seller-info">
      <h3>Participants</h3>
      <p><strong>Buyer (Inviting Entity):</strong> {{ coinx.contract.invitingEntityId }}</p>
      <p><strong>Seller (Invited Entity):</strong> {{ coinx.contract.invitedEntityId }}</p>
    </div>

    <div class="commerce-details">
      <h3>Commerce Specifics</h3>
      <p v-if="coinx.contract.menu && coinx.contract.menu.length">
        <strong>Menu Items:</strong> {{ coinx.contract.menu.join(', ') }}
      </p>
      <p v-else><strong>Menu Items:</strong> Not specified</p>

      <p v-if="coinx.contract.order && coinx.contract.order.length">
        <strong>Order:</strong> {{ coinx.contract.order.join(', ') }}
      </p>
      <p v-else><strong>Order:</strong> No items ordered yet</p>
    </div>

    <div class="exchange-details">
      <h3>Exchange Details</h3>
      <p><strong>Contract ID:</strong> {{ coinx.contract.contractId }}</p>
      <p><strong>Status:</strong> <span :class="statusClass">{{ coinx.contract.status }}</span></p>
      <p><strong>Duration:</strong> {{ coinx.contract.durationMinutes }} minutes</p>
      <p><strong>Location:</strong> {{ coinx.contract.location }}</p>
      <p><strong>Network:</strong> {{ coinx.contract.network }}</p>
      <p><strong>Currency:</strong> {{ coinx.contract.currency }}</p>
      <p><strong>Language:</strong> {{ coinx.contract.language }}</p>
    </div>

    <div class="logical-unity-features">
      <h3>Logical Unity & Level Exchange</h3>
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

// A guard to ensure this component is used with a B2S CoinX
if (props.coinx.contract.type !== '10') {
  console.warn(`BSMOLECULE.vue received a CoinX of type '${props.coinx.contract.type}'. This component is designed for '10' (Buyer-to-Seller) contracts.`);
}

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
.bsmolecule-card {
  border: 2px solid #007bff; /* Distinct border color */
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #e6f2ff; /* Light blue background */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.bsmolecule-card h2 {
  color: #0056b3;
  margin-top: 0;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.coinx-id {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 15px;
}

.buyer-seller-info, .commerce-details, .exchange-details, .logical-unity-features {
  margin-bottom: 15px;
  padding-left: 15px;
  border-left: 4px solid #007bff;
}

.buyer-seller-info h3, .commerce-details h3, .exchange-details h3, .logical-unity-features h3 {
  color: #007bff;
  margin-top: 0;
  margin-bottom: 10px;
}

.bsmolecule-card p {
  margin: 5px 0;
  font-size: 0.98em;
}

.bsmolecule-card strong {
  color: #333;
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