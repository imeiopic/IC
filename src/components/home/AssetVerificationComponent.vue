<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useMeshStore, MutationTypes } from '@/stores/meshStore';

const mesh = useMeshStore();
const verificationStatus = ref<'IDLE' | 'VERIFYING' | 'SUCCESS' | 'FAILED'>('IDLE');
const transactionHash = ref<string | null>(null);

/**
 * HANDLER: 
 * Listens for the deposit confirmation mutation in the global ledger.
 */
const handleLedgerUpdate = (mutation: any) => {
  if (mutation.type === MutationTypes.ASSET_DEPOSIT_CONFIRMED) {
    verifyDeposit(mutation);
  }
};

const verifyDeposit = (mutation: any) => {
  verificationStatus.value = 'VERIFYING';
  
  // Simulate cryptographic signature verification
  setTimeout(() => {
    transactionHash.value = `0x${Math.random().toString(16).slice(2, 10)}`;
    verificationStatus.value = 'SUCCESS';
    
    // Trigger local state unlock
    mesh.logEvent('PREMIUM_ACCESS_GRANTED', { sequence: mutation.sequenceId });
  }, 2000);
};

onMounted(() => mesh.subscribeToLedger(handleLedgerUpdate));
onUnmounted(() => mesh.unsubscribeFromLedger(handleLedgerUpdate));
</script>

<template>
  <div class="verification-substrate">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-white font-black">ASSET_VERIFICATION</h3>
      <span class="font-mono text-[10px]" :class="{
        'text-zinc-500': verificationStatus === 'IDLE',
        'text-amber-500': verificationStatus === 'VERIFYING',
        'text-emerald-500': verificationStatus === 'SUCCESS'
      }">{{ verificationStatus }}</span>
    </div>

    <div v-if="verificationStatus === 'IDLE'" class="text-zinc-600 font-mono text-[10px]">
      WAITING_FOR_LEDGER_CONFIRMATION...
    </div>

    <div v-if="verificationStatus === 'SUCCESS'" class="mt-4 p-3 bg-emerald-900/10 border border-emerald-500">
      <p class="text-emerald-500 text-[10px] font-mono">
        DEPOSIT_VALIDATED: {{ transactionHash }}<br />
        SYSTEM_PERMISSION: PREMIUM_ACCESS_UNLOCKED
      </p>
    </div>
  </div>
</template>

<style scoped>
.verification-substrate { @apply p-6 bg-zinc-950 border-t border-zinc-800; }
</style>