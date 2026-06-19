<template>
  <div
    class="p-6 bg-black text-white border border-neutral-800 font-mono max-w-xl mx-auto relative overflow-hidden"
  >
    <header class="flex justify-between items-center border-b border-neutral-900 pb-4 mb-6">
      <div>
        <span class="text-[10px] text-neutral-500 block">THREAD_1111 // CRYPTO_SHIELD</span>
        <h2 class="text-md font-bold tracking-widest text-amber-500">BINARYTRUST.VUE</h2>
      </div>
      <div class="text-right">
        <span class="text-[10px] text-neutral-500 block">TRUST_STATUS</span>
        <span
          :class="[
            'text-xs font-bold',
            trustVerified ? 'text-emerald-400' : 'text-amber-500 animate-pulse'
          ]"
        >
          {{ trustVerified ? 'VERIFIED_SYMMETRY [1]' : 'AWAITING_HANDSHAKE [0]' }}
        </span>
      </div>
    </header>

    <main class="space-y-4">
      <div class="p-4 bg-neutral-950 border border-neutral-900 space-y-3">
        <div class="flex justify-between items-center text-xs">
          <span class="text-neutral-400">LOCAL_PEER_ID:</span>
          <span class="text-neutral-300 font-bold">SUID_CLEVELAND_0216_APEX</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="text-neutral-400">CONNECTING_NODE:</span>
          <input
            v-model="connectingNodeId"
            type="text"
            placeholder="Enter External SUID Token..."
            class="bg-black border border-neutral-800 p-1 text-amber-400 text-right w-48 focus:outline-none focus:border-amber-500"
            :disabled="isVerifying"
          />
        </div>
      </div>

      <section class="space-y-2">
        <div class="flex justify-between items-center">
          <h3 class="text-xs font-bold text-neutral-400">Zero-Knowledge Verification Loop</h3>
          <span class="text-[10px] text-neutral-600">I = VR² INTEGRITY</span>
        </div>
        <div
          class="h-28 bg-neutral-950 border border-neutral-900 p-3 text-[11px] space-y-1 overflow-y-auto"
        >
          <div v-for="log in verificationLogs" :key="log.id" class="flex gap-2">
            <span class="text-neutral-600">[{{ log.time }}]</span>
            <span :class="log.error ? 'text-red-500' : 'text-amber-500'">{{ log.prefix }}</span>
            <span class="text-neutral-300">{{ log.message }}</span>
          </div>
        </div>
      </section>
    </main>

    <footer class="mt-6 border-t border-neutral-900 pt-4">
      <button
        @click="executeBinaryHandshake"
        :disabled="isVerifying || !connectingNodeId"
        class="w-full bg-white text-black font-bold p-3 text-xs tracking-widest hover:bg-amber-500 hover:text-black transition-colors duration-300 disabled:opacity-50"
      >
        {{ isVerifying ? 'COMPUTING_ASYMMETRIC_KEYS...' : 'INITIALIZE_BINARY_TRUST_LOCK' }}
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface VerificationLog {
  id: number;
  time: string;
  prefix: string;
  message: string;
  error?: boolean;
}

// Import the Pinia store
import { useTrustStore } from '@/stores/trustStore';

const connectingNodeId = ref('');
const isVerifying = ref(false);
const trustVerified = ref(false);
const verificationLogs = ref<VerificationLog[]>([
  {
    id: 1,
    time: '16:21:01',
    prefix: 'TRUST_IDLE',
    message: 'Entropy shield standing by. Awaiting connection vector.'
  }
]);

// Initialize the store
const trustStore = useTrustStore();

const executeBinaryHandshake = () => {
  isVerifying.value = true;
  verificationLogs.value.push({
    id: Date.now(),
    time: '16:25:43',
    prefix: 'ZK_INIT',
    message: 'Generating episodic public challenge token. Stripping identity metadata...'
  });

  setTimeout(() => {
    verificationLogs.value.push({
      id: Date.now() + 1,
      time: '16:25:44',
      prefix: 'EVAL_1.1x',
      message: 'Verifying network compliance with the 1:16 wealth ratio baseline.'
    });
  }, 1000);

  setTimeout(() => {
    isVerifying.value = false;
    trustVerified.value = true;
    verificationLogs.value.push({
      id: Date.now() + 2,
      time: '16:25:45',
      prefix: 'SYNC_LOCK',
      message: 'Asymmetric math verified. 2.2x Mutual Apex Resonance enabled with target node.'
    });
    console.log('BINARY_TRUST: Zero-knowledge verification complete. Handshake achieved.');
  }, 2500);
};

// Watch for changes in trustVerified and trigger the global mutation
watch(trustVerified, (newValue) => {
  if (newValue) {
    console.log(
      'BINARY_TRUST: Trust verified, activating 2.2x Mutual Apex Resonance via global store.'
    );
    trustStore.activateApexResonance();
    // Optionally, you could pass the connectingNodeId to the store if needed
    // trustStore.setConnectedApexNode(connectingNodeId.value);
  }
});
</script>
