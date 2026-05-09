<template>
  <div class="qrc-container bg-black min-vh-100 p-4 text-center d-flex flex-column align-items-center">
    <div class="header-substrate mt-5 mb-4">
      <h2 class="text-white tracking-widest">01_BROADCAST_IDENTITY</h2>
      <p class="text-info opacity-75 small">INFORMING INSTANCE: {{ user?.uid }}</p>
    </div>

    <!-- QR Generation Substrate -->
    <div class="qr-manifest p-4 bg-white rounded-4 shadow-lg mb-4">
      <qrcode-vue 
        :value="referralLink" 
        :size="240" 
        level="H" 
        render-as="svg"
        foreground="#000000"
      />
    </div>

    <!-- Live Reward Ledger Substrate -->
    <div class="reward-ledger p-3 bg-dark border border-success rounded-3 mb-4 w-100" style="max-width: 450px;">
      <div class="d-flex justify-content-between align-items-center mb-2 border-bottom border-secondary pb-2">
        <span class="text-success fw-bold">REWARD_LEDGER_STREAM</span>
        <span class="badge bg-success">ACTIVE</span>
      </div>
      
      <div class="ledger-entries overflow-auto" style="max-height: 150px;">
        <div v-if="referrals.length === 0" class="text-secondary py-3 small">
          AWAITING PEER HANDSHAKE...
        </div>
        <div v-for="ref in referrals" :key="ref.id" class="d-flex justify-content-between py-1 border-bottom border-dark small text-start">
          <span class="text-white opacity-75 font-monospace">NODE_{{ ref.nodeShort }}</span>
          <span class="text-info">+{{ ref.amount.toFixed(2) }} IO</span>
        </div>
      </div>

      <div class="total-equity mt-3 pt-2 border-top border-secondary d-flex justify-content-between">
        <span class="text-white fw-bold">TOTAL_ACCRUED:</span>
        <span class="text-success fw-bold">{{ totalAccrued.toFixed(2) }} IO</span>
      </div>
    </div>

    <div class="action-threads d-flex gap-3 mt-auto mb-5">
      <button @click="copyLink" class="btn btn-outline-info px-4">
        {{ copied ? 'LINK_LOCKED' : 'COPY_TRANSIT_URL' }}
      </button>
      <button @click="navigateBack" class="btn btn-outline-light px-4">DISCONNECT</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import QrcodeVue from 'qrcode.vue';
import { auth, db } from '../firebase'; // Core Auth and Firestore Anchors
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const router = useRouter();
const user = computed(() => auth.currentUser);
const copied = ref(false);
const referrals = ref<any[]>([]);

// Real-time stream for referral rewards
onMounted(() => {
  if (!user.value) return;

  const q = query(
    collection(db, 'referral_rewards'), 
    where('informerID', '==', user.value.uid)
  );

  // sighting peer rewards in real-time
  onSnapshot(q, (snapshot) => {
    referrals.value = snapshot.docs.map(doc => ({
      id: doc.id,
      nodeShort: doc.data().entityID.substring(0, 8),
      amount: doc.data().amount,
      timestamp: doc.data().timestamp
    }));
  });
});

const totalAccrued = computed(() => {
  return referrals.value.reduce((acc, curr) => acc + curr.amount, 0);
});

const referralLink = computed(() => {
  const base = 'https://iopic-world'; // Production node
  return user.value ? `${base}?ref=${user.value.uid}` : base;
});

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value);
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
  } catch (err) {
    console.error("TRANSIT_ERROR: CLIPBOARD_DRAG_FAILED");
  }
};

const navigateBack = () => router.push('/peers');
</script>
// src/components/MyQRC.vue
import QrcodeVue from 'qrcode.vue'; // Standard grounding
<style scoped>
.tracking-widest { letter-spacing: 0.25em; }
.reward-ledger {
  background: linear-gradient(145deg, #0a0a0a, #020202);
  box-shadow: 0 0 20px rgba(25, 135, 84, 0.15);
}
.ledger-entries::-webkit-scrollbar { width: 4px; }
.ledger-entries::-webkit-scrollbar-thumb { background: #198754; }
</style>