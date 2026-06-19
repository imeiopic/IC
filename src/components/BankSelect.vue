<template>
  <div class="bank-discovery-substrate">
    <label class="logic-label">1010_EQUITY // SELECT LOCAL GROUNDING</label>
    
    <div class="discovery-status" v-if="loading">
      Sighting local branches in the mesh...
    </div>

    <div class="bank-grid" v-else>
      <div 
        v-for="bank in localBanks" 
        :key="bank.place_id" 
        class="bank-node-card"
        :class="{ 'selected': selectedBankId === bank.place_id }"
        @click="selectBank(bank)"
      >
        <div class="bank-info">
          <span class="bank-name">{{ bank.name }}</span>
          <span class="bank-address">{{ bank.vicinity }}</span>
        </div>
        <div class="grounding-indicator"></div>
      </div>
    </div>

    <button 
      v-if="selectedBank" 
      @click="initializeBankLink" 
      class="handshake-btn"
    >
      Initialize BankLinked Handshake
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const localBanks = ref([]);
const loading = ref(true);
const selectedBank = ref(null);

const fetchLocalBanks = () => {
  // Use Google Places Service to find physical grounding points
  const service = new google.maps.places.PlacesService(document.createElement('div'));
  
  const request = {
    location: currentSovereignCoords, // From Locality.vue
    radius: '5000',
    type: ['bank']
  };

  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      localBanks.value = results;
      loading.value = false;
      console.log(`${results.length} Physical Nodes Sighted.`);
    }
  });
};

const selectBank = (bank) => {
  selectedBank.value = bank;
  console.log(`Bank Sighted: ${bank.name}. Awaiting Logic Grounding.`);
};

onMounted(fetchLocalBanks);
</script>

<style scoped>
.bank-node-card {
  background: #0a0a0a;
  border: 1px solid #222;
  padding: 1rem;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bank-node-card.selected { border-color: #ffd700; background: #111; }
.grounding-indicator { width: 10px; height: 10px; background: #333; border-radius: 50%; }
.selected .grounding-indicator { background: #00ff00; box-shadow: 0 0 10px #00ff00; }
.handshake-btn { width: 100%; background: #ffd700; color: #000; font-weight: bold; padding: 1rem; border: none; }
</style>