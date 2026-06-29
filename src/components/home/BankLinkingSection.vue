 <script setup lang="ts">
import { ref, computed } from 'vue';
import { useMeshStore } from '@/stores/meshStore';
import { ledgerStream } from '@/services/LedgerStreamService';

const mesh = useMeshStore();
const isSyncing = ref(false);
const linkStatus = ref<'DISCONNECTED' | 'PENDING' | 'SECURED'>('DISCONNECTED');

/**
 * BANK_HANDSHAKE:
 * Initiates the connection to the external financial ledger.
 */
const initiateBankLink = async () => {
  isSyncing.value = true;
  linkStatus.value = 'PENDING';

  try {
    // 1. Trigger the link process
    // In production, this would be an OIDC/OAuth flow (e.g., Plaid/Stripe)
    const secureToken = await mesh.requestBankingHandshake();
    
    // 2. Broadcast the state change to the ledger
    ledgerStream.broadcast({
      type: 'BANK_CONNECTION_ESTABLISHED',
      nodeId: mesh.nodeId,
      status: 'SECURED'
    });

    linkStatus.value = 'SECURED';
  } catch (err) {
    console.error('[BANK_LINK_FRACTURE]:', err);
    linkStatus.value = 'DISCONNECTED';
    mesh.logEvent('BANK_LINK_ERROR', { error: err });
  } finally {
    isSyncing.value = false;
  }
};

const statusColor = computed(() => ({
  'text-red-500': linkStatus.value === 'DISCONNECTED',
  'text-amber-500': linkStatus.value === 'PENDING',
  'text-emerald-500': linkStatus.value === 'SECURED'
}));
</script>

<template>
  <div class="bank-link-substrate">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-white font-black tracking-tighter">FINANCIAL_LEDGER_ANCHOR</h3>
      <span class="font-mono text-[10px]" :class="statusColor">STATUS: {{ linkStatus }}</span>
    </div>

    <div class="p-4 bg-zinc-900/50 border border-zinc-800 rounded">
      <p class="text-zinc-400 text-xs font-mono mb-4">
        Linking your external financial ledger to T-{{ mesh.activeThreads }} allows for real-time asset settlement across the mesh.
      </p>

      <button 
        @click="initiateBankLink" 
        :disabled="isSyncing || linkStatus === 'SECURED'"
        class="w-full py-3 bg-cyan-900/20 border border-cyan-500 text-cyan-500 font-black hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-50"
      >
        {{ isSyncing ? 'ESTABLISHING_HANDSHAKE...' : 'LINK_EXTERNAL_LEDGER' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.bank-link-substrate { @apply p-6 bg-zinc-950 border border-zinc-800 shadow-xl; }
</style>