<template>
  <div
    class="p-6 bg-black text-white border-2 border-red-950 font-mono max-w-2xl mx-auto shadow-2xl relative select-none"
  >
    <header class="flex justify-between items-center border-b border-red-900 pb-3 mb-4">
      <div>
        <span class="text-[9px] text-red-500 block tracking-widest font-bold animate-pulse"
          >▲ CRITICAL_GATEWAY_OVERRIDE</span
        >
        <h2 class="text-sm font-black tracking-tight text-white uppercase">
          TIER 1 INTERLOCK REGISTRY
        </h2>
      </div>
      <span
        class="text-[10px] text-red-500 font-bold border border-red-900 bg-red-950/20 px-2 py-0.5"
        >HARD_LOCK_ACTIVE</span
      >
    </header>

    <div class="space-y-2 bg-neutral-950 p-4 border border-neutral-900 mb-4">
      <span class="text-[10px] text-neutral-500 block uppercase font-bold tracking-wider"
        >Protected Tier 1 Node Registry</span
      >

      <div class="divide-y divide-neutral-900 text-xs">
        <div
          v-for="[suid, node] in registry"
          :key="suid"
          class="py-2 flex justify-between items-center"
        >
          <div>
            <span class="text-white font-bold block">{{ node.suid }}</span>
            <span class="text-[10px] text-neutral-500">{{ node.operatorName }}</span>
          </div>
          <div class="text-right">
            <span class="text-emerald-400 font-bold block"
              >{{ node.currentBalance.toFixed(2) }} IO$</span
            >
            <span
              v-if="node.isPermanentlyLocked"
              class="text-[9px] text-red-400 uppercase tracking-widest font-black"
              >● PERMA_LOCKED</span
            >
            <span v-else class="text-[9px] text-emerald-400 uppercase tracking-widest font-black"
              >● UNLOCKED</span
            >
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <div class="bg-neutral-950 p-3 border border-neutral-900 space-y-2">
        <label class="text-[10px] text-neutral-400 block font-bold"
          >EMERGENCY SIGNATURE VERIFICATION STRING</label
        >
        <input
          type="password"
          v-model="inputSignature"
          placeholder="ENTER_ROOT_STEWARD_SECRET_PHRASE"
          class="w-full bg-black border border-neutral-800 p-2 text-xs text-red-400 font-bold placeholder-neutral-700 outline-none focus:border-red-600 tracking-widest"
        />
      </div>

      <button
        @click="triggerReleaseVerification"
        :disabled="isVerifying"
        class="w-full bg-red-950/40 border-2 border-red-700 text-red-400 hover:bg-red-900 hover:text-white font-black text-xs py-2.5 tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isVerifying ? 'VERIFYING_ROOT_SIGNATURE...' : 'EXECUTE_TEMPORARY_INTERLOCK_RELEASE' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { RegistryEngine } from '../services/RegistryEngine';

const inputSignature = ref('');
const isVerifying = ref(false);
const registry = computed(() => RegistryEngine.getRegistry());

const triggerReleaseVerification = async () => {
  isVerifying.value = true;
  // Simulate a brief delay for signature artifact verification
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (inputSignature.value === 'SIGNATURE_NOLAND_S_NEWTON_ROOT_OVERRIDE') {
    alert(
      'AUTHORIZATION_GRANTED:\n\nPermanent interlock bounds have been temporarily decoupled. Value modification pipeline is open for exactly 1 processing cycle.'
    );
    // Note: In a real implementation, this would trigger a state change in the engine
    // allowing a one-time bypass for a specific mutation.
    inputSignature.value = '';
  } else {
    alert(
      'ACCESS_DENIED:\n\nInvalid signature artifact. The target nodes remain hardlocked inside the 16-thread ledger layer. Zero data modification achieved.'
    );
  }
  isVerifying.value = false;
};
</script>

<style scoped>
/* Custom styles to match the IOPIC aesthetic */
input::placeholder {
  letter-spacing: 2px;
}

header {
  border-bottom-width: 1px;
}

button:active {
  transform: scale(0.98);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
