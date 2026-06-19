<template>
  <div class="bank-link-container p-4 bg-dark text-white rounded border border-secondary">
    <h3 class="mb-3 text-info font-black">Linked Accounts</h3>
    
    <div v-if="bankStore.isBankLinked" class="linked-banks-list">
      <div 
        v-for="bank in bankStore.linkedBanks" 
        :key="bank.id" 
        class="bank-item d-flex justify-content-between align-items-center p-3 mb-2 bg-black border border-secondary rounded"
      >
        <div class="bank-info">
          <div class="font-bold text-white">{{ bank.name }}</div>
          <div class="tiny text-success mt-1">Status: {{ bank.status.toUpperCase() }}</div>
        </div>
        
        <button 
          @click="handleRemove(bank.id)" 
          class="btn btn-outline-danger btn-sm font-black tiny px-3 py-1"
          :disabled="bankStore.isBankLinkingInProgress"
        >
          {{ removingId === bank.id ? 'WAIT...' : 'REMOVE' }}
        </button>
      </div>
    </div>
    
    <div v-else class="text-white-50 italic p-3 text-center border border-secondary border-dashed rounded">
      No bank accounts currently linked.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useBankLinkingStore } from '../stores/bankLinking';

const bankStore = useBankLinkingStore();
const removingId = ref<string | null>(null);

const handleRemove = async (id: string) => {
  removingId.value = id;
  await bankStore.removeBankLink(id);
  removingId.value = null;
};
</script>

<style scoped>
.bank-item {
  transition: all 0.2s ease;
}
.bank-item:hover {
  border-color: #00e5ff !important;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.1);
}
.border-dashed {
  border-style: dashed !important;
}
.tiny { font-size: 0.75rem; }
.font-black { font-weight: 900; }
.italic { font-style: italic; }
</style>