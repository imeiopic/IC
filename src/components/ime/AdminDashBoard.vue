<template>
  <CContainer fluid class="py-4" :class="{ 'harmonic-environment': isHarmonized }">
    <!-- Unauthorized Access Warning -->
    <div v-if="authStore.authReady && !authStore.isAdmin" class="p-5 text-center">
      <CCard class="border-danger">
        <CCardBody>
          <h3 class="text-danger">UNAUTHORIZED_ACCESS_DETECTED</h3>
          <p>Your entity profile does not have Admin clearance for the 16-Thread Reality Manifest.</p>
          <CButton color="primary" @click="router.push('/')">Return to Initialization Gateway</CButton>
        </CCardBody>
      </CCard>
    </div>

    <div v-else>
    <!-- Wallet Connection Section -->
    <CRow>
      <CCol md="12">
        <CCard class="mb-4">
          <CCardHeader>Crypto Wallet (MetaMask)</CCardHeader>
          <CCardBody>
            <div v-if="!walletAddress && !showThankYou">
              <button @click="connectWallet" class="btn btn-primary">Connect MetaMask</button>
            </div>
            <div v-else-if="walletAddress">
              <div><strong>Wallet Address:</strong> {{ walletAddress }}</div>
              <div v-if="isImeIopic"><strong>ETH Balance:</strong> {{ ethBalance }} ETH</div>
              <div class="mt-2">
                <input
                  v-model="sendTo"
                  placeholder="Recipient Address"
                  class="form-control"
                  style="margin-bottom: 0.5rem"
                />
                <input
                  v-model="sendAmount"
                  placeholder="Amount (ETH)"
                  type="number"
                  class="form-control"
                  style="margin-bottom: 0.5rem"
                />
                <button @click="sendEth" class="btn btn-success">Send ETH</button>
              </div>
              <div class="mt-2">
                <button @click="copyAddress" class="btn btn-secondary">
                  Copy My Address (for receiving)
                </button>
                <span v-if="copySuccess" style="color: green; margin-left: 0.5rem">Copied!</span>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <!-- End Wallet Connection Section -->

    <!-- Biometric Sighting Gate Overlay -->
    <BiometricGate
      v-if="!isSighted"
      :user="biometricUser"
      :isVerified="isSighted"
      @update:isVerified="isSighted = $event"
      v-model:globalError="biometricError"
      :errors="[]"
    />

    <!-- Sovereign Entity Cockpit -->
    <CRow v-if="isSighted" class="mb-4">
      <CCol md="12">
        <IOist :entitySUID="person.suid" :spatialAnchor="person.spatialAnchor" />
      </CCol>
    </CRow>

    <!--  Iopic Profile and Admin Dashboard Section -->
    <CRow>
      <CCol md="3">
        <CCard class="mb-4">
          <CCardHeader> Iopic Profile</CCardHeader>
          <CCardBody>
            <div class="text-center mb-3">
              <CImage src="../assets/images/imeiopic.png" roundedCircle width="96" height="96" />
              <h5 class="mt-2">{{ person.name }}</h5>
              <p class="text-muted">{{ person.description }}</p>
            </div>
            <div>
              <strong>IOWB:</strong> {{ person.iowb.accountNumber }} ({{ person.iowb.balance }} IO$)
            </div>
            <div><strong>Bank:</strong> {{ person.realWorldBank?.bankName }}</div>
            <div>
              <strong>Payment Methods:</strong>
              <ul>
                <li v-for="pm in person.paymentMethods" :key="pm.label">
                  <strong>{{ pm.label }}:</strong> {{ pm.details }}
                </li>
              </ul>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md="9">
        <CCard>
          <CCardHeader class="d-flex justify-content-between align-items-center">
            Admin Dashboard
            <CButton @click="themeStore.toggleTheme" color="info" variant="outline" size="sm">
              Switch to {{ (themeStore as any).theme === 'symmetry' ? 'Entropy' : 'Symmetry' }}
            </CButton>
            <CButton @click="handleLogout" color="danger" variant="outline" size="sm" class="ms-2"
              >Logout</CButton
            >
            <!-- Example CoreUI Buttons using theme colors -->
            <CButton color="primary" class="ms-2">Primary Button</CButton>
            <CButton color="info" class="ms-2">Info Button</CButton>
            <CButton color="success" class="ms-2">Success Button</CButton>
            <CButton 
              @click="frequencyFilterActive = !frequencyFilterActive" 
              :color="frequencyFilterActive ? 'warning' : 'secondary'"
              variant="outline" size="sm" class="ms-2">
              {{ frequencyFilterActive ? 'SIGHT HARMONICS' : 'NORMAL VIEW' }}
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md="4">
                <CCard class="mb-3 bg-info text-white">
                  <CCardBody>
                    <h6>CoinX Count</h6>
                    <h3>{{ person.coinxs.length }}</h3>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol md="4">
                <CCard class="mb-3 bg-success text-white">
                  <CCardBody>
                    <h6>IOWB Balance</h6>
                    <h3>{{ person.iowb.balance }} IO$</h3>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol md="4">
                <CCard class="mb-3 bg-warning text-dark">
                  <CCardBody>
                    <h6>Bank</h6>
                    <h3>{{ person.realWorldBank?.bankName }}</h3>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CCard class="mb-3">
                  <CCardHeader>CoinX List</CCardHeader>
                  <CCardBody>
                    <ul>
                      <li v-for="coinx in person.coinxs" :key="coinx.id">
                        {{ coinx.id }} ({{ coinx.contract.type }})
                        <CBadge 
                          v-if="frequencyFilterActive && harmonicNodes.has(coinx.id)" 
                          color="warning" 
                          shape="rounded-pill" 
                          class="ms-2 pulse-highlight"
                        >
                          HARMONIC_NODE
                        </CBadge>
                      </li>
                    </ul>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <CRow>
      <CCol md="12">
        <MyWorld />
      </CCol>
    </CRow>
    </div>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CImage,
  CButton,
  CBadge
} from '@coreui/vue';
import IOist from '@components/IOist.vue';
import BiometricGate from '@components/ime/BiometricGate.vue';
import MyWorld from '@components/MyWorld.vue';
import { useRouter } from 'vue-router';
import { person01 } from '@/personModel';
import ThankYouModal from '@components/ThankYouModal.vue'; // Assuming this component exists
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { useGlobalMandates } from '../../../ReusableMandate.vue';

declare global {
  interface Window {
    ethereum?: any;
  }
}
// Pinia Stores
import { useWalletStore } from '@/stores/walletStore'; // Ensure no 'type' keyword if using at runtime
const themeStore = useThemeStore();

// Define a local interface for Person to satisfy TypeScript, assuming personModel.ts
// exports a default object conforming to this structure.
// The actual personModel.ts file should define these properties.
interface Person {
  suid?: string;
  spatialAnchor?: number;
  name: string;
  description: string;
  iowb: { accountNumber: string; balance: number };
  realWorldBank?: { bankName: string };
  paymentMethods?: Array<{ label: string; details: string }>;
  coinxs: Array<{ id: string; contract: { type: string } }>;
}

// Initialize stores
const walletStore = useWalletStore();
// @ts-ignore - Module might not be available in context
import { useTransactionStore } from '@/stores/transactionStore';
const transactionStore = useTransactionStore();

const router = useRouter();
const authStore = useAuthStore();
const { harmonicNodes, startNoticeSync } = useGlobalMandates();

const frequencyFilterActive = ref(false);

// Best Practice: Use storeToRefs for state/getters to keep them reactive
const { walletAddress, ethBalance, sendTo, sendAmount, copySuccess } = storeToRefs(walletStore);

// Actions are just functions, destructure them directly
const { connectWallet, getBalance, sendEth, copyAddress } = walletStore;

// Destructure reactive state from transaction store to maintain reactivity in template
const { transactions, showThankYou } = storeToRefs(transactionStore);
// Destructure actions from transaction store
const { closeThankYouModal } = transactionStore;

// Local state (if any)
const person: Person = person01; // Cast person01 to the defined Person interface
// Sync local visibility with the unified store state
const isSighted = computed({
  get: () => authStore.isSighted,
  set: (val) => authStore.setSighted(val)
});
const biometricError = ref('');

const biometricUser = computed(() => ({
  uid: person.suid || 'UNKNOWN',
  email: null,
  biometricEnrolled: true // Standard practitioner assumed enrolled
}));

const isImeIopic = computed(() => person.name && person.name.trim().toLowerCase() === 'ime iopic');

// 4D VRE state: Detects if the environment is in the "Juneteenth Harmonic"
const isHarmonized = computed(() => {
  return authStore.isSighted && themeStore.theme === 'symmetry';
});

// Global State Monitoring Logic
let unsubs: Array<() => void> = [];

onMounted(() => {
  // Start planetary notice sync for the 4D VRE
  const noticeUnsub = startNoticeSync();
  if (noticeUnsub) unsubs.push(noticeUnsub);

  // 1. Monitor State Changes ($subscribe)
  const subscribeUnsub = walletStore.$subscribe(
    (mutation, state) => {
      console.log(`[VRE_MONITOR] Mutation Detected: ${mutation.type}`);
      if (mutation.type === 'patch object') {
        console.log('[VRE_MONITOR] Bulk State Update:', mutation.payload);
      }
      // Log the current grounding status
      console.log(`[VRE_MONITOR] Current Wallet: ${state.walletAddress || 'DISCONNECTED'}`);
    },
    { detached: false }
  );

  // 2. Monitor Action Execution ($onAction)
  const actionUnsub = walletStore.$onAction(({ name, args, after, onError }) => {
    const startTime = Date.now();
    console.log(`[VRE_MONITOR] Action Initiated: ${name} with args:`, args);

    // This runs after the action successfully finishes
    after((result) => {
      const duration = Date.now() - startTime;
      console.log(
        `[VRE_MONITOR] Action ${name} completed successfully in ${duration}ms.`,
        result !== undefined ? 'Result:' : '',
        result ?? ''
      );
    });

    // This runs if the action throws or returns a rejected promise
    onError((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[VRE_MONITOR] Action ${name} failed:`, message);
    });
  }, false);

  unsubs.push(subscribeUnsub, actionUnsub);

  console.log('[IOist] Monitoring Mesh established. All economic threads are being sighted.');
});

// Clean up subscriptions when the dashboard node is unmounted
onUnmounted(() => {
  unsubs.forEach((unsub) => unsub());
  console.log('[IOist] Monitoring Mesh detached.');
});

const handleLogout = async () => {
  // Call the unified logout from our new store
  await authStore.logout();
  // Also reset the legacy wallet store state
  walletStore.$reset();
};
</script>

<style lang="scss" scoped>
.bg-info {
  // Overriding CoreUI's bg-info to use our theme variable
  background-color: var(--cui-info) !important;
}
.bg-success {
  // Overriding CoreUI's bg-success to use our theme variable
  background-color: var(--cui-success) !important;
}
.bg-warning {
  // Overriding CoreUI's bg-warning to use our theme variable
  background-color: var(--cui-warning) !important;
}

.harmonic-environment {
  transition: background 2s ease-in-out;
  animation: harmonicPulse 8s infinite alternate;
}

@keyframes harmonicPulse {
  0% {
    box-shadow: inset 0 0 50px rgba(0, 255, 127, 0.2); /* Deep Green */
  }
  100% {
    box-shadow: inset 0 0 100px rgba(255, 215, 0, 0.4); /* Brilliant Gold */
    background-color: rgba(255, 215, 0, 0.02);
  }
}

.pulse-highlight {
  animation: fastPulse 1s infinite alternate;
  box-shadow: 0 0 10px var(--cui-warning);
}

@keyframes fastPulse {
  from { opacity: 0.7; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1.05); }
}
</style>
