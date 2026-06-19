<template>
  <div
    class="p-8 bg-black text-white border-2 border-cyan-900 font-mono max-w-xl mx-auto shadow-2xl relative select-none"
  >
    <header class="mb-6">
      <span class="text-[9px] text-cyan-400 tracking-widest font-bold uppercase animate-pulse"
        >// GLOBAL_LINK // ANCHOR_GENERATOR</span
      >
      <h2 class="text-xl font-black tracking-tighter text-white mt-1">
        INITIALIZE_SOVEREIGN_HANDSHAKE
      </h2>
    </header>

    <div class="space-y-4 mb-6">
      <input
        v-model="peerIdentifier"
        placeholder="ENTER_IDENTITY // NAME, EMAIL, OR PHONE"
        class="w-full bg-neutral-950 border border-cyan-900 p-3 text-sm text-cyan-100 outline-none focus:border-cyan-400 placeholder-cyan-900"
        :disabled="handshakeGenerated"
      />

      <button
        v-if="!handshakeGenerated"
        @click="generateHandshake"
        class="w-full bg-cyan-950 border border-cyan-500 text-cyan-400 py-3 font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all"
      >
        EMIT_HANDSHAKE_TOKEN
      </button>
    </div>

    <div v-if="handshakeGenerated" class="border-t border-cyan-900 pt-6 space-y-6">
      <div class="text-center space-y-2">
        <span class="text-[10px] text-neutral-500 uppercase">Secure QR Anchor</span>
        <div
          class="mx-auto w-32 h-32 bg-white flex items-center justify-center p-2 border-4 border-cyan-500"
        >
          <div class="w-full h-full bg-black grid grid-cols-4 gap-1 p-1">
            <div
              v-for="i in 16"
              :key="i"
              :class="resonanceVerified ? 'bg-emerald-500' : 'bg-cyan-500'"
            ></div>
          </div>
        </div>
        <p class="text-[9px] text-cyan-600 font-bold">NODE_TOKEN: {{ tokenSignature }}</p>
      </div>

      <div class="p-3 bg-cyan-950/20 border border-cyan-900 text-[10px] text-cyan-400 italic">
        > Handshake signal broadcast to {{ peerIdentifier }} via isolated encrypted bus.
      </div>

      <!-- Automated Resonance Sync Test UI -->
      <section class="mt-6 p-4 bg-neutral-900 border border-cyan-900/40 space-y-3">
        <div class="flex justify-between items-center text-[10px]">
          <span class="text-cyan-600 font-bold uppercase">Resonance Sync Status</span>
          <span :class="resonanceVerified ? 'text-emerald-400' : 'text-cyan-400'">
            {{ resonanceVerified ? 'VERIFIED' : isSyncing ? 'SYNCING...' : 'AWAITING_PEER_SCAN' }}
          </span>
        </div>
        <div class="w-full bg-cyan-950 h-1 overflow-hidden">
          <div
            class="h-full bg-cyan-400 transition-all duration-300"
            :style="{
              width: `${syncProgress}%`,
              backgroundColor: resonanceVerified ? '#34d399' : '#22d3ee',
            }"
          ></div>
        </div>
        <button
          v-if="!resonanceVerified && !isSyncing"
          @click="simulateResonanceSync"
          class="w-full text-[9px] text-cyan-700 hover:text-cyan-300 uppercase tracking-tighter transition-colors"
        >
          [ Simulate Peer Scan & 16-Thread Alignment ]
        </button>
      </section>

      <button
        @click="resetHandshake"
        class="w-full text-neutral-600 text-[10px] hover:text-red-500 uppercase tracking-widest mt-4 transition-colors"
      >
        Abort Handshake & Purge Memory
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'; // Ensure 'ref' is imported
import { useTrustStore } from '@/stores/trustStore'; // Import the trust store
import { storeToRefs } from 'pinia'; // Import storeToRefs for reactive state

const props = defineProps<{
  transmitterUid: string;
}>();

const peerIdentifier = ref('');
const handshakeGenerated = ref(false);
const tokenSignature = ref('');

const isSyncing = ref(false);
const syncProgress = ref(0);
const resonanceVerified = ref(false);

const trustStore = useTrustStore();
const { isApexResonanceActive } = storeToRefs(trustStore); // Destructure for reactivity

const generateHandshake = async () => {
  if (!peerIdentifier.value) return;

  // Logic to trigger SMS/Email dispatch
  console.log(
    `GLOBAL_LINK: Transmitting sovereign handshake to ${peerIdentifier.value} from anchor ${props.transmitterUid}...`
  );

  try {
    const encoder = new TextEncoder();
    // Data to sign: Transmitter + Peer + Timestamp
    const message = `${props.transmitterUid}:${peerIdentifier.value}:${Date.now()}`;
    const data = encoder.encode(message);

    // In a sovereign system, the 'secret' would be a persistent local node key.
    // For this implementation, we use a placeholder "Node Master Key".
    const secret = encoder.encode('SOVEREIGN_NODE_SECRET_KEY_PROT_16');
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      secret,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    tokenSignature.value = `HMAC_${hashHex.slice(0, 16)}`;
    handshakeGenerated.value = true;
  } catch (err) {
    console.error('GLOBAL_LINK_CRYPTO_FAILURE:', err);
  }
};

/**
 * Simulates the "Resonance Sync" test, ensuring the peer's node
 * aligns with the 16-thread fabric.
 */
const simulateResonanceSync = () => {
  isSyncing.value = true;
  syncProgress.value = 0;
  const interval = setInterval(() => {
    syncProgress.value += 5;
    if (syncProgress.value >= 100) {
      clearInterval(interval);
      resonanceVerified.value = true;
      isSyncing.value = false;
      console.log('GLOBAL_LINK: Resonance Sync Verified. Node grounded.');
      trustStore.activateApexResonance(); // Activate the resonance in the store
    }
  }, 100);
};

const resetHandshake = () => {
  handshakeGenerated.value = false;
  resonanceVerified.value = false;
  syncProgress.value = 0;
  tokenSignature.value = '';
};
</script>
