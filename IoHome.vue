<template>
  <PrefetchLoadingBar />
  <Navbar />
  <CContainer
    fluid
    class="home-substrate p-0 bg-black min-vh-100 d-flex flex-column justify-content-center align-items-center font-mono position-relative"
  >
    <div class="grid-background position-absolute inset-0"></div>

    <!-- Real-time Telemetry Layer -->
    <Transition name="telemetry-slide">
      <div
        v-if="!showWelcomeShield"
        class="telemetry-layer position-absolute top-0 end-0 p-4 z-3 d-flex flex-column gap-3"
        style="max-width: 300px"
      >
        <Synchronize :nodeSecurityLevel="nodeSecurityLevel" />
        <Harmonize />
      </div>
    </Transition>

    <div class="anchor-core text-center position-relative z-1 animate-in">
      <div class="logo-pulse mb-5">
        <div class="pulse-ring"></div>
        <img src="/images/iologo.png" alt="IOPIC" class="main-logo shadow-glow" />
      </div>

      <h1 class="text-glow text-info italic font-black display-3 tracking-widest mb-2">IOPIC</h1>
      <p class="text-white small tracking-widest uppercase mb-5 opacity-75">
        The Day The Noise Stopped | May 1st Activation
      </p>
    </div>
    <!-- WelcomeShield component, shown initially and dismissed by user action -->

    <!-- Resume Checkout Toast -->
    <Transition name="fade">
      <div
        v-if="resumeCheckoutToastMessage"
        class="resume-checkout-toast p-3 border border-info bg-info bg-opacity-10 rounded mb-4 text-center"
      >
        <p class="text-info font-black italic tiny mb-2 uppercase">[RESUMING_HANDSHAKE]</p>
        <p class="text-info extra-tiny font-mono mb-0">{{ resumeCheckoutToastMessage }}</p>
      </div>
      <div
        v-if="resumeCheckoutToastMessage"
        class="resume-checkout-toast-actions p-2 bg-zinc-900 rounded-bottom text-center"
      >
        <CButton
          color="secondary"
          variant="ghost"
          class="extra-tiny uppercase text-zinc-500"
          @click="cancelAutoCheckout"
          >CANCEL_AUTO_HANDSHAKE</CButton
        >
      </div>
    </Transition>
    <WelcomeShield v-if="showWelcomeShield" @initialized="handleWelcomeShieldInitialized" />

    <div
      class="action-terminal p-4 border border-zinc-800 bg-zinc-950 rounded shadow-info mx-auto"
      style="max-width: 400px"
    >
      <div v-if="!user" class="unauthenticated-flow">
        <div class="system-boot-gateway mb-4 text-start font-mono">
          <p class="extra-tiny text-info font-black mb-1">[IOPIC.WORLD // SYSTEM_BOOT_GATEWAY]</p>
          <div class="border-t border-zinc-800 my-2"></div>

          <p class="extra-tiny text-zinc-400 line-height-1 mb-3">
            The legacy instance web is a matrix of hidden extraction. Because Free is Not
            Believable, entering the Sovereign Mesh requires an un-compromised, balanced energy
            alignment.
          </p>

          <p class="extra-tiny text-white font-black mb-1">This is your INITIALIZATION STAKE.</p>

          <p class="extra-tiny text-zinc-500 italic mb-3">
            It is not a passive donation, nor is it an extractive corporate fee. It is the raw asset
            allocation utilized by SPICE.ts to insulate your local node, clear hardware overhead,
            and activate your 16-thread cockpit.
          </p>

          <div class="border-y border-zinc-800 py-2 space-y-1 mb-3">
            <p class="extra-tiny text-zinc-400 uppercase tracking-tighter">
              [REQUIRED STAKE]: 16.25 IO$ <span class="opacity-50">(or fiat equivalent)</span>
            </p>
            <p class="extra-tiny text-zinc-400 uppercase tracking-tighter">
              [NODE STATUS]: <span class="text-warning">PENDING_GROUNDING</span>
            </p>
          </div>
        </div>
        <CButton
          color="info"
          class="w-100 py-3 font-black italic shadow-glow mb-3"
          v-prefetch="'/onboarding'"
          @click="router.push('/onboarding')"
        >
          EXECUTE_INITIALIZATION_STAKE
        </CButton>
        <CButton
          color="light"
          variant="ghost"
          class="w-100 tiny text-zinc-400"
          v-prefetch="'/manifesto'"
          @click="router.push('/manifesto')"
        >
          READ_THE_16_THREAD_MANIFESTO
        </CButton>
        <CButton
          color="light"
          variant="ghost"
          class="w-100 tiny text-zinc-500 mt-2"
          v-prefetch="'/anchors'"
          @click="router.push('/anchors')"
        >
          VIEW_COLLECTIVE_ANCHORS_REGISTRY
        </CButton>
        <CButton
          color="light"
          variant="ghost"
          class="w-100 tiny text-zinc-500 mt-2"
          @click="router.push('/help')"
        >
          ACCESS_SYSTEM_HELP
        </CButton>
      </div>

      <div v-else class="authenticated-flow">
        <p class="extra-tiny text-success italic mb-2 uppercase">Node Status: GROUNDED</p>

        <!-- Payment Fracture Alert -->
        <div
          v-if="paymentAlert"
          class="payment-alert p-3 border border-danger bg-danger bg-opacity-10 rounded mb-4 text-center"
        >
          <p class="text-danger font-black italic tiny mb-2 uppercase">
            [SYSTEM FRACTURE] PULSE FAILED
          </p>
          <p class="text-danger extra-tiny font-mono mb-3">{{ paymentAlert }}</p>
          <CButton
            color="danger"
            variant="outline"
            class="w-100 extra-tiny py-2"
            @click="dismissPaymentAlert"
          >
            ACKNOWLEDGE & CLEAR NOISE
          </CButton>
        </div>

        <p class="small text-white mb-4">Welcome, {{ user.displayName || 'Sovereign Entity' }}</p>

        <!-- Node Wallet Substrate -->
        <GroundedGate>
          <template #grounded>
            <WalletSubstrate 
              :person="currentPerson" 
              :balances="userBalances"
              :multiplier="userMultiplier"
              class="mb-4"
            />
          </template>
          <template #action>
            <CButton
              color="info"
              variant="outline"
              class="extra-tiny py-2 font-black italic shadow-info mt-2"
              @click="router.push('/onboarding')"
            >
              INITIALIZE_STAKE_CHECKOUT
            </CButton>
          </template>
        </GroundedGate>

        <CButton
          color="info"
          variant="outline"
          class="w-100 py-3 font-black italic shadow-info mb-2"
          v-prefetch="'/virtual'"
          @click="router.push('/virtual')"
        >
          ENTER_THE_VIRTUAL_OS
        </CButton>
        <CButton
          color="info"
          variant="outline"
          class="w-100 py-3 font-black italic shadow-info mb-3"
          v-prefetch="'/dic'"
          @click="router.push('/dic')"
        >
          OPEN_DIC_COMMUNICATION
        </CButton>

        <!-- Sovereign Handshake / Network Expansion -->
        <div
          class="network-expansion-section mt-4 p-3 border border-cyan-900 bg-cyan-950/5 rounded"
        >
          <p class="extra-tiny text-cyan-500 italic mb-2 uppercase">
            Network Expansion: Peer Onboarding
          </p>
          <CButton
            color="info"
            variant="outline"
            class="w-100 py-2 extra-tiny font-black italic shadow-info"
            @click="showGlobalLink = !showGlobalLink"
          >
            {{ showGlobalLink ? 'CLOSE_ANCHOR_GENERATOR' : 'OPEN_GLOBAL_LINK_INTERFACE' }}
          </CButton>

          <transition name="mesh-sync">
            <div v-if="showGlobalLink" class="mt-4">
              <GlobalLink :transmitter-uid="user?.uid || ''" />
            </div>
          </transition>

          <!-- High-Privilege Direct Bonding -->
          <transition name="mesh-sync">
            <div
              v-if="showGlobalLink"
              class="mt-4 p-3 border border-purple-900 bg-purple-950/20 rounded shadow-purple"
            >
              <p class="extra-tiny text-purple-400 italic mb-2 uppercase">
                [HIGH_PRIVILEGE_BOND] Tier 1 Injection
              </p>
              <input
                v-model="peerSuidToBond"
                type="text"
                placeholder="Enter Peer SUID..."
                class="form-control extra-tiny bg-black border border-purple-800 text-white mb-2"
              />
              <CButton
                color="secondary"
                variant="outline"
                class="w-100 py-2 extra-tiny font-black italic"
                @click="requestDirectBond"
                :disabled="isBonding || !peerSuidToBond"
              >
                {{ isBonding ? 'BONDING_THREAD_IGNITED...' : 'EXECUTE_DIRECT_INNER_CIRCLE_BOND' }}
              </CButton>
              <div
                v-if="bondingResult"
                class="mt-2 extra-tiny font-mono"
                :class="bondingResult.status === 'BOND_VERIFIED' ? 'text-success' : 'text-danger'"
              >
                [{{ bondingResult.status }}] {{ bondingResult.message }}
              </div>
            </div>
          </transition>
        </div>

        <!-- Urban Anchor Management / Municiple Mesh -->
        <div
          class="urban-anchor-management-section mt-4 p-3 border border-cyan-900 bg-cyan-950/5 rounded"
        >
          <p class="extra-tiny text-cyan-500 italic mb-2 uppercase">Urban Anchor Management</p>
          <CButton
            color="info"
            variant="outline"
            class="w-100 py-2 extra-tiny font-black italic shadow-info"
            @click="showMunicipleMesh = !showMunicipleMesh"
          >
            {{ showMunicipleMesh ? 'CLOSE_LOCATION_RESOLVER' : 'OPEN_URBAN_ANCHOR_QUERY' }}
          </CButton>

          <transition name="mesh-sync">
            <div v-if="showMunicipleMesh" class="mt-4">
              <MunicipleMesh @anchor-saved="fetchUserEntities" />
            </div>
          </transition>
        </div>

        <!-- High-Privilege Confirmation Modal with System Override Animation -->
        <CModal
          :visible="showBondModal"
          @close="showBondModal = false"
          alignment="center"
          backdrop="static"
          class="dark-modal system-override-modal"
        >
          <CModalHeader class="border-purple-900 bg-black">
            <CModalTitle class="extra-tiny font-black text-purple-400 italic uppercase">
              [WARNING] STAKE_BOND_INITIALIZATION
            </CModalTitle>
          </CModalHeader>
          <CModalBody class="bg-black text-white tiny font-mono p-4">
            <p class="mb-3">You are about to initiate a direct Tier 1 bond with SUID:</p>
            <p class="text-info font-black mb-3">{{ peerSuidToBond }}</p>
            <div
              class="p-2 border border-purple-800 bg-purple-950/20 text-purple-300 extra-tiny italic"
            >
              REQUIRED STAKE: 50,000 IO$ <br />
              This action is permanent and bypasses standard DIC Monitor queues.
            </div>
          </CModalBody>
          <CModalFooter class="border-purple-900 bg-black">
            <CButton
              color="secondary"
              variant="ghost"
              class="extra-tiny uppercase text-zinc-500"
              @click="showBondModal = false"
              >Abort</CButton
            >
            <CButton
              color="secondary"
              class="extra-tiny font-black italic shadow-purple"
              @click="executeDirectBond"
            >
              CONFIRM_BOND_INJECTION
            </CButton>
          </CModalFooter>
        </CModal>

        <p v-if="bankLinkingError" class="text-danger tiny mt-3">
          {{ bankLinkingError }}
        </p>

        <!-- Bank Linking Section -->
        <div class="bank-linking-section mt-5 p-3 border border-zinc-700 rounded-lg">
          <div v-if="isBankLinkingInProgress">
            <!-- Render SelectBank.vue if linking is in progress -->
            <SelectBank />
          </div>
          <div v-else-if="isBankLinked">
            <!-- Display linked banks if already linked -->
            <div class="text-center">
              <div class="status-orb mx-auto mb-2" :style="{ backgroundColor: tierColor }"></div>
              <h4 class="text-success italic font-black mb-2">IOWB Node Grounded</h4>
              <p class="text-white small mb-2">Ledger: {{ iowbBalance }} IO$</p>
              <p class="extra-tiny text-zinc-500 italic mb-2">Subsequent pulses grounded at 1.1x</p>
              <p class="extra-tiny text-zinc-500 italic mb-2">Subsequent pulses grounded at {{ userMultiplier }}x</p>
              <!-- Mesh Synchronization Tracker -->
              <transition name="mesh-sync" mode="out-in">
                <div
                  v-if="isSyncing"
                  class="sync-status text-info extra-tiny font-mono animate-pulse mt-2"
                >
                  SYNCING TO GLOBAL MESH...
                </div>
                <div
                  v-else-if="syncSuccess"
                  class="sync-status text-success extra-tiny font-mono text-glow-success mt-2"
                >
                  [1010_EQUITY] FIRESTORE SYNC VERIFIED
                </div>
              </transition>
            </div>
            <BankLink
              @bank-grounded="handleBankGrounded"
              @bank-link-exit="handleBankLinkExit"
              @bank-link-error="handleBankLinkError"
            />
            <div class="text-center mt-3">
              <CButton
                color="warning"
                variant="outline"
                class="w-100 py-2 font-black italic shadow-info"
                @click="initiateBankLinking"
              >
                LINK_ANOTHER_ACCOUNT
              </CButton>
            </div>
          </div>
          <div v-else class="text-center">
            <!-- Initial state: not linked, not in progress -->
            <p class="extra-tiny text-zinc-500 italic mb-3 uppercase">Node Equity: UNGROUNDED</p>
            <CButton
              color="warning"
              variant="outline"
              class="w-100 py-2 font-black italic shadow-info"
              @click="initiateBankLinking"
              :disabled="isBankLinkingInProgress"
            >
              LINK_PHYSICAL_EQUITY
            </CButton>
          </div>
        </div>

        <!-- Initialization Stake Grounding -->
        <div class="initialization-stake-section mt-5 p-3 border border-zinc-700 rounded-lg">
          <p class="extra-tiny text-zinc-500 italic mb-3 uppercase">Initialization Stake Tiers</p>
          <div v-if="successMsg" class="pulse-msg success">{{ successMsg }}</div>
          <div v-if="errorMsg" class="pulse-msg error">{{ errorMsg }}</div>
          <div v-if="isProcessing" class="pulse-msg processing">STABILIZING_HANDSHAKE...</div>

          <div class="tier-grid">
            <div
              v-if="isLoadingTiers"
              class="loading-state text-info extra-tiny font-mono uppercase"
            >
              SIGHTING_STAKE_TIERS...
            </div>
            <div v-else-if="tiersError" class="error-state text-danger extra-tiny font-mono">
              FRACTURE: {{ tiersError }}
            </div>
            <div
              v-for="tier in initializationStakeTiers"
              :key="tier.id"
              class="tier-card"
              :style="{ borderTop: '4px solid ' + tier.color }"
            >
              <h3>{{ tier.label }}</h3>
              <p>{{ tier.description }}</p>
              <CButton
                @click="handleStripeCheckout(tier)"
                :disabled="isProcessing"
                color="info"
                variant="outline"
                class="w-100 py-2 font-black italic shadow-info mt-3"
              >
                Ground {{ tier.amount }} IO$
              </CButton>
            </div>
          </div>
        </div>

        <!-- Entity Menu View -->
        <div
          v-if="showEntityMenu && selectedEntityForMenu"
          class="entity-menu-view-section mt-5 p-3 border border-zinc-700 rounded-lg"
        >
          <EntityMenuView
            :entityName="selectedEntityForMenu.name"
            :entitySector="selectedEntityForMenu.type"
            @close-menu="closeEntityMenu"
          />
        </div>

        <!-- New section for displaying user's entities -->
        <div v-if="loadingEntities" class="text-zinc-400 tiny mb-3 mt-4">Loading entities...</div>
        <div v-else-if="entitiesError" class="text-danger tiny mb-3 mt-4">
          Error: {{ entitiesError }}
        </div>
        <div v-else-if="userEntities.length > 0" class="entity-list mt-4">
          <p class="extra-tiny text-zinc-500 italic mb-2 uppercase">Your Entities:</p>
          <div v-for="entity in userEntities" :key="entity.id" class="mb-2">
            <CButton
              color="secondary"
              variant="outline"
              class="w-100 tiny text-zinc-300 d-flex justify-content-between align-items-center"
              @click="openEntityMenu(entity)"
            >
              <span>{{ entity.name }} ({{ entity.type.replace('_Entity', '') }})</span>
              <span
                :class="{
                  'text-success': entity.role === 'owner',
                  'text-info': entity.role === 'member',
                }"
              >
                {{ entity.role.toUpperCase() }}
              </span>
            </CButton>
          </div>
        </div>
        <div v-else class="text-zinc-400 tiny mb-3 mt-4">No entities found.</div>
      </div>
    </div>
    <footer class="position-absolute bottom-0 w-100 p-4 text-center">
      <div class="d-flex justify-content-center gap-5 tiny text-zinc-600 font-mono italic">
        <span>FREQ: 7.83Hz</span>
        <span>BUS: 16_THREADS</span>
        <span>BUFFER: 1.2Q TPE</span>
      </div>
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import Navbar from '@components/Navbar.vue';
import PrefetchLoadingBar from '@components/PrefetchLoadingBar.vue';
import { loadStripe } from '@stripe/stripe-js'; // Sighting the Stripe SDK
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { useAuth } from '@composables/useAuth';
import {
  CButton,
  CContainer,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/vue';
import {
  doc,
  getFirestore,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'; // Firebase Firestore, added DocumentSnapshot type
import { getFunctions, httpsCallable } from 'firebase/functions'; // Firebase Functions
import { useRoute, useRouter } from 'vue-router';

import EntityMenuView from '@components/EntityMenuView.vue';
import SelectBank from '@components/SelectBank.vue';
import { exampleCoinX01, exampleCoinX10 } from './coinxModel';
import type { Person } from './personModel';
import WalletSubstrate from './WalletSubstrate.vue';
// The original script had a donationTiers array and verifyTransit function, but they were PayPal-specific and not used in the template.
// ContributorLedger is a new component for displaying and managing contributor rewards.
// The user's "fixed script" provides a new template for donation tiers using Stripe.
// BankLink is kept for the existing bank linking section.
import { ApiError, callFirebaseFunction } from '@/api';
import { app } from '@/firebase';
import BankLink from '@components/BankLink.vue';
import GlobalLink from '@components/GlobalLink.vue';
import GroundedGate from '@components/GroundedGate.vue';
import Harmonize from '@components/Harmonize.vue';
import WelcomeShield from '@components/mesh/WelcomeShield.vue'; // Corrected path to include mesh/
import MunicipleMesh from '@components/MunicipleMesh.vue';
import Synchronize from '@components/Synchronize.vue';
import { prefetchRoute } from '@directives/prefetch';
import { bondDirectPeer, type DirectPeerBondResult } from '@services/DirectPeerLink';
import { useBankLinkingStore } from '@stores/bankLinking';
import { useCheckoutStore } from '@stores/checkout';
import { storeToRefs } from 'pinia';

const router = useRouter();
const route = useRoute();
const checkoutStore = useCheckoutStore();
const { user } = useAuth(); // Assuming useAuth is a named export

interface Entity {
  id: string;
  name: string;
  type: string;
  role: 'owner' | 'member';
  operationalStatus: string;
}

interface StakeTier {
  id: string;
  priceId: string;
  productId: string;
  label: string;
  amount: string | number;
  multiplier: number;
  color: string;
  description: string;
}

const showWelcomeShield = ref(true); // Control visibility of the WelcomeShield
const userEntities = ref<Entity[]>([]);
const loadingEntities = ref(false);
const entitiesError = ref<string | null>(null);
const showMunicipleMesh = ref(false);
const showGlobalLink = ref(false); // Toggle for Handshake Interface
const peerSuidToBond = ref('');
const bondingResult = ref<DirectPeerBondResult | null>(null);
const isBonding = ref(false);
const showBondModal = ref(false);
const isSyncing = ref(false);
const showEntityMenu = ref(false); // Controls visibility of EntityMenuView
const selectedEntityForMenu = ref<Entity | null>(null); // Stores the entity whose menu is open
const syncSuccess = ref(false);
const paymentAlert = ref<string | null>(null);
const initializationStakeTiers = ref<StakeTier[]>([]); // To store dynamically fetched tiers
const isLoadingTiers = ref(false); // Loading state for fetching tiers
const tiersError = ref<string | null>(null); // Error state for fetching tiers
const resumeCheckoutToastMessage = ref<string | null>(null); // For the "Resume Checkout" toast
const userMultiplier = ref(1.1); // Dynamic node multiplier
let toastUpdateInterval: any;
let checkoutTimeout: any; // To hold the setTimeout for auto-checkout

const successMsg = ref(''); // For Stripe checkout success
const errorMsg = ref(''); // For Stripe checkout errors
const isProcessing = ref(false); // For Stripe checkout loading state
let unsubscribeUserDoc: (() => void) | null = null;

// Bank Linking State
// Destructure state and actions from Pinia store for direct access and reactivity
const bankLinkingStore = useBankLinkingStore(); // Get the store instance
const { bankLinkingError, isBankLinkingInProgress, isBankLinked, tierColor, iowbBalance } =
  storeToRefs(bankLinkingStore); // Use storeToRefs for reactive state properties

/**
 * Maps the authenticated user state to the VRE Person model.
 */
const currentPerson = computed<Person>(() => ({
  id: user.value?.uid || 'suid-unknown',
  name: user.value?.displayName || 'Sovereign Entity',
  role: user.value?.uid === import.meta.env.VITE_IME_ROOT_SIGNATURE ? 'Root Architect' : 'Sovereign Node',
  status: isBankLinked.value ? 'GROUNDED' : 'SYNCING',
  resonanceScore: 1.0, // Baseline for initialized nodes
}));

/**
 * Derives active CoinX balances from the IOWB Ledger.
 */
const userBalances = computed(() => [
  { coin: exampleCoinX01, amount: Number(iowbBalance.value) || 0 },
  { coin: exampleCoinX10, amount: 0 },
]);

const nodeSecurityLevel = computed(() => {
  if (!user.value) return 'UNGROUNDED';
  // Deriving security level from grounding status and root signature
  if (user.value.uid === import.meta.env.VITE_IME_ROOT_SIGNATURE) return 'ROOT';
  return isBankLinked.value ? 'PEER' : 'UNGROUNDED';
});

const showBankSelector = ref(false); // Local UI state to show SelectBank component

// Initialize Stripe Handshake
const handleStripeCheckout = async (tier: StakeTier) => {
  if (!user.value) {
    errorMsg.value = 'ERROR: Node not sighted. Please authenticate.';
    return;
  }

  isProcessing.value = true;
  try {
    const functions = getFunctions(app);
    // Use the new wrapper to call the Cloud Function
    const result = await callFirebaseFunction<
      { priceId: string; userId: string; multiplier: number },
      { sessionId: string }
    >(app, 'createStripeCheckoutSession', {
      priceId: tier.priceId,
      userId: user.value.uid,
      multiplier: tier.multiplier,
    });
    const { sessionId } = result;

    // Redirect to Stripe's Secure Domain
    const stripe: Stripe | null = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId });
    }
  } catch (err: any) {
    console.error('STRIPE_INIT_FAILED', err);
    errorMsg.value = err.message || 'LOGIC_FRACTURE: Failed to initialize secure handshake.';
    if (err instanceof ApiError) {
      console.error('STRIPE_INIT_FAILED (ApiError):', err.message, err.status, err.responseBody);
      errorMsg.value = `LOGIC_FRACTURE: ${err.message} (Code: ${err.statusText})`;
    } else {
      console.error('STRIPE_INIT_FAILED (Unknown Error):', err);
      errorMsg.value = err.message || 'LOGIC_FRACTURE: Failed to initialize secure handshake.';
    }
    setTimeout(() => (errorMsg.value = ''), 7000);
  } finally {
    isProcessing.value = false;
  }
};

// Verify Transit (After Redirect back from Stripe)
const verifyTransit = async () => {
  const sessionId = route.query.session_id as string;

  if (sessionId && user.value) {
    successMsg.value = '[PHYSICS_SYNC] Handshake detected. Stabilizing identity pulse...';
    errorMsg.value = ''; // Clear any previous errors

    try {
      const responseData = await callFirebaseFunction<
        { sessionId: string; userId: string },
        { success: boolean; message: string }
      >(app, 'verifyStripeSession', { sessionId, userId: user.value.uid });
      if (responseData.success) {
        localStorage.setItem('isNodeInitialized', 'true');
        // localStorage.setItem('equity_tier', responseData.equityTier); // Removed as backend doesn't return it
        window.dispatchEvent(new CustomEvent('equity-updated'));

        successMsg.value = '[SUCCESS] Node grounded. Equity stabilized in global mesh.';
        setTimeout(() => (successMsg.value = ''), 5000);
      } else {
        errorMsg.value = responseData.message || 'ERROR: Pulse verification fractured.';
        setTimeout(() => (errorMsg.value = ''), 7000);
      }
    } catch (err: any) {
      console.error('TRANSIT_VERIFICATION_FAILED', err);
      errorMsg.value =
        err.message ||
        'ERROR: An unexpected error occurred during verification. Please try again or contact support.';
      if (err instanceof ApiError) {
        console.error(
          'TRANSIT_VERIFICATION_FAILED (ApiError):',
          err.message,
          err.status,
          err.responseBody
        );
        errorMsg.value = `ERROR: ${err.message} (Code: ${err.statusText})`;
      } else {
        console.error('TRANSIT_VERIFICATION_FAILED (Unknown Error):', err);
        errorMsg.value =
          err.message ||
          'ERROR: An unexpected error occurred during verification. Please try again or contact support.';
      }
      setTimeout(() => (errorMsg.value = ''), 7000);
    } finally {
      // Use the router to purge query parameters for a clean identity state
      router.replace({ query: { ...route.query, session_id: undefined } });
    }
  }
};

// Function to fetch entry fee tiers dynamically
const fetchStakeTiers = async () => {
  isLoadingTiers.value = true;
  tiersError.value = null;
  try {
    initializationStakeTiers.value = await callFirebaseFunction<void, StakeTier[]>(
      app,
      'fetchIopicTiers'
    );
  } catch (err: any) {
    console.error('FRACTURE: Failed to fetch stake tiers:', err);
    tiersError.value = err.message || 'ERROR: Failed to load stake tiers. Please try again.';
    if (err instanceof ApiError) {
      tiersError.value = `ERROR: ${err.message} (Code: ${err.statusText})`;
    }
  } finally {
    isLoadingTiers.value = false;
  }
};

const functionsInstance = getFunctions(app); // Get functions instance from your Firebase app
const getUserEntitiesCallable = httpsCallable(functionsInstance, 'getUserEntities');

const fetchUserEntities = async () => {
  if (!user.value) {
    userEntities.value = [];
    return;
  }

  loadingEntities.value = true;
  entitiesError.value = null;
  try {
    const data = await callFirebaseFunction<void, { entities: Entity[] }>(app, 'getUserEntities');
    userEntities.value = data.entities; // Assuming the function returns { entities: Entity[] }
  } catch (error: any) {
    console.error('Failed to fetch user entities:', error);
    entitiesError.value = error.message || 'Failed to load entities.';
    if (error instanceof ApiError) {
      console.error(
        'Failed to fetch user entities (ApiError):',
        error.message,
        error.status,
        error.responseBody
      );
      entitiesError.value = `Failed to load entities: ${error.message} (Code: ${error.statusText})`;
    } else {
      console.error('Failed to fetch user entities (Unknown Error):', error);
      entitiesError.value = error.message || 'Failed to load entities.';
    }
  } finally {
    loadingEntities.value = false;
  }
};

const setupUserListener = () => {
  if (unsubscribeUserDoc) {
    unsubscribeUserDoc();
    unsubscribeUserDoc = null;
  }
  if (user.value) {
    const db = getFirestore(app);
    unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.value.uid), (docSnap) => {
      if (docSnap.exists()) {
        // Typed docSnap
        const data = docSnap.data();
        if (data.lastPaymentStatus === 'failed' && data.lastPaymentError) {
          paymentAlert.value = data.lastPaymentError;
        }
        // Sighting the specific multiplier from the node's ledger or IOWB state
        const appliedMultiplier = data.ledger?.multiplier_applied || data.iowb?.multiplier;
        if (appliedMultiplier) {
          userMultiplier.value = appliedMultiplier;
        }
      }
    });
  }
};

const dismissPaymentAlert = async () => {
  paymentAlert.value = null;
  if (user.value) {
    const db = getFirestore(app);
    await updateDoc(doc(db, 'users', user.value.uid), {
      // Corrected: user.value.uid
      lastPaymentStatus: 'acknowledged', // Clear the failed state so it doesn't show again on refresh
    });
  }
};

/**
 * Triggers the confirmation modal before bonding.
 */
const requestDirectBond = () => {
  if (!user.value || !peerSuidToBond.value) return;
  showBondModal.value = true;
};

/**
 * Executes the high-privilege direct bonding protocol.
 */
const executeDirectBond = async () => {
  if (!user.value || !peerSuidToBond.value) return;

  showBondModal.value = false;
  isBonding.value = true;
  bondingResult.value = null;

  try {
    const result = await bondDirectPeer(
      peerSuidToBond.value,
      user.value.displayName || 'Sovereign Entity'
    );
    bondingResult.value = result;
  } catch (error: any) {
    console.error('FRACTURE: Direct bonding execution failed:', error);
  } finally {
    isBonding.value = false;
  }
};

const handleBankGrounded = async (payload: { balance: number; tierColor: string }) => {
  console.log(
    `[1010_EQUITY] Bank grounded. Balance: ${payload.balance}, Tier Color: ${payload.tierColor}`
  );

  // 1. Update the local store to instantly update the UI (Ledger Balance and Tier Color)
  // This function is now mostly handled by the Firestore listener in the store
  showBankSelector.value = false;

  // 2. Persist this physical capital grounding to the user's Firestore node
  if (user.value) {
    isSyncing.value = true;
    try {
      // Execute secure ledger mutation through the Interlock Registry
      const mutateLedger = httpsCallable(functionsInstance, 'handleLedgerMutation');
      await mutateLedger({
        targetSuid: user.value.uid,
        valueDelta: payload.balance,
        operation: 'SET',
      });

      const db = getFirestore(app);
      await updateDoc(doc(db, 'users', user.value.uid), {
        'iowb.tierColor': payload.tierColor,
        'iowb.isGrounded': true,
        status: 'EQUITY_GROUNDED', // This status might be set by verifyFinancialSession now
      });
      syncSuccess.value = true;
      setTimeout(() => {
        syncSuccess.value = false;
      }, 4000); // Fade out the success message after 4 seconds

      // Await the refresh so the UI handles the loading state properly
      await fetchUserEntities();
    } catch (error) {
      console.error('FRACTURE: Failed to ground equity in Firestore:', error);
      bankLinkingStore.setBankLinkingError('FRACTURE: Failed to sync equity to ledger.'); // Corrected: direct call to action
    } finally {
      isSyncing.value = false;
    }
  }
};

const handleBankLinkExit = () => {
  bankLinkingStore.handleBankLinkExit(); // Corrected: direct call to action
  showBankSelector.value = false; // Hide selector if user exits
};

const handleBankLinkError = (error: string) => {
  bankLinkingStore.setBankLinkingError(error); // Corrected: direct call to action
  showBankSelector.value = false; // Hide selector on error
};

const initiateBankLinking = () => {
  bankLinkingStore.setBankLinkingError(null);
  isBankLinkingInProgress.value = true;
  // The actual linking initiation happens in SelectBank.vue
};

const openEntityMenu = (entity: Entity) => {
  selectedEntityForMenu.value = entity;
  showEntityMenu.value = true;
};

const closeEntityMenu = () => {
  selectedEntityForMenu.value = null;
  showEntityMenu.value = false;
};

/**
 * Calculates human-readable time remaining for the selection.
 */
const getRemainingTimeStr = () => {
  if (!checkoutStore.selectedTimestamp) return '';
  const remaining =
    (checkoutStore.EXPIRATION_MS || 0) - (Date.now() - checkoutStore.selectedTimestamp);
  if (remaining <= 0) return 'Expired';

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
};

/**
 * Cancels the pending auto-checkout and clears the toast.
 */
const cancelAutoCheckout = () => {
  if (toastUpdateInterval) {
    clearInterval(toastUpdateInterval);
    toastUpdateInterval = undefined;
  }
  if (checkoutTimeout) {
    clearTimeout(checkoutTimeout);
    checkoutTimeout = undefined;
  }
  checkoutStore.clearAnchorSelection(); // Clear the selection from the store
  resumeCheckoutToastMessage.value = null; // Hide the toast
  console.log('[STORE_HANDSHAKE]: Auto-handshake cancelled by user.');
};

/**
 * Monitors both the global checkout store and tier availability.
 * Automatically triggers Stripe if an external selection is pending.
 */
watch(
  [() => checkoutStore.selectedAnchorId, initializationStakeTiers],
  ([requestedAnchorId, tiers]) => {
    if (requestedAnchorId && tiers.length > 0) {
      const targetTier = tiers.find(
        (t: StakeTier) =>
          t.id === requestedAnchorId ||
          t.priceId === requestedAnchorId ||
          t.productId === requestedAnchorId
      );

      if (targetTier) {
        console.log(`[STORE_HANDSHAKE]: Detected pending checkout for ${requestedAnchorId}`);

        const updateToastMessage = () => {
          const timeStr = getRemainingTimeStr();
          resumeCheckoutToastMessage.value = `Resuming ${targetTier.label} (${targetTier.amount} IO$) — ${timeStr}`;
        };

        // Initial render of the toast
        updateToastMessage();

        // Set interval to update every minute (60,000ms)
        toastUpdateInterval = setInterval(updateToastMessage, 60000);

        // Delay the actual checkout to allow the toast to be seen
        checkoutTimeout = setTimeout(() => {
          console.log(`[STORE_HANDSHAKE]: Firing checkout for ${requestedAnchorId}`);
          if (toastUpdateInterval) {
            clearInterval(toastUpdateInterval);
            toastUpdateInterval = undefined;
          }
          checkoutStore.clearAnchorSelection(); // Clear store state before checkout
          handleStripeCheckout(targetTier);
          resumeCheckoutToastMessage.value = null; // Clear toast after initiating checkout
          checkoutTimeout = undefined; // Clear the timeout reference
        }, 5000); // 5-second delay
      } else {
        console.warn(
          `[STORE_HANDSHAKE]: Requested anchor ID ${requestedAnchorId} not found in available tiers. Clearing selection.`
        );
        checkoutStore.clearAnchorSelection(); // Clear if the selected tier is no longer available
      }
    }
  },
  { immediate: true }
);

const handleWelcomeShieldInitialized = () => {
  console.log('IoHome: WelcomeShield dismissed. Proceeding to main content.');
  showWelcomeShield.value = false;

  // Background prefetch for most likely next steps
  if (user.value) {
    ['/virtual', '/dic'].forEach((path) => prefetchRoute(router, path));
  }
};

onMounted(() => {
  console.log('0000_ANCHOR: Planetary Node Sighted.');
  // Pass user.value.uid to fetchBankLinkingStatus
  if (user.value) {
    fetchUserEntities();
    bankLinkingStore.fetchBankLinkingStatus(); // Corrected: direct call to action
    fetchStakeTiers(); // Fetch stake tiers on mount
    setupUserListener();
    verifyTransit();
  }
});

watch(user, (newUser) => {
  if (newUser) {
    fetchUserEntities(); // Re-fetch entities when user changes
    bankLinkingStore.fetchBankLinkingStatus(); // Corrected: direct call to action
    fetchStakeTiers(); // Re-fetch stake tiers when user changes
    setupUserListener();
    verifyTransit();
  } else {
    userEntities.value = [];
    bankLinkingStore.resetBankLinkingState(); // Reset bank status if user logs out
    if (unsubscribeUserDoc) {
      unsubscribeUserDoc();
      unsubscribeUserDoc = null; // Corrected: direct call to action
    }
  }
});

onUnmounted(() => {
  if (toastUpdateInterval) {
    clearInterval(toastUpdateInterval);
  }
  if (checkoutTimeout) {
    clearTimeout(checkoutTimeout);
  }
  if (unsubscribeUserDoc) {
    unsubscribeUserDoc();
  }
});
</script>

<style scoped>
.home-substrate {
  overflow: hidden;
  background: radial-gradient(circle at center, #0a0a0a 0%, #000 100%);
}

/* THE_GRID_SUBSTRATE */
.grid-background {
  background-image: linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  position: absolute;
  inset: 0;
  z-index: 0;
  transform: perspective(500px) rotateX(60deg) translateY(-100px);
  animation: grid-scroll 20s linear infinite;
}

.hover-emerald:hover {
  background-color: #34d399 !important; /* emerald-400 */
  color: black !important;
  box-shadow: 0 0 20px rgba(52, 211, 153, 0.4);
}

@keyframes grid-scroll {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 0 600px;
  }
}

/* Resume Checkout Toast Styles */
.resume-checkout-toast {
  border-color: rgba(0, 229, 255, 0.5) !important;
  background-color: rgba(0, 229, 255, 0.05) !important;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
}

/* Fade transition for toast */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* Styles for Stripe Equity Grounding Tiers */
.pulse-msg {
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid;
  text-align: center;
  font-weight: bold;
  border-radius: 8px;
}
.success {
  color: #00ff00;
  border-color: #00ff00;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}
.error {
  color: #ff0000;
  border-color: #ff0000;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
}
.processing {
  color: #ffd700;
  border-color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.tier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* Adjusted for smaller cards */
  gap: 15px;
}
.tier-card {
  background: #050505; /* Darker background for cards */
  padding: 15px;
  text-align: center;
  border: 1px solid #222;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.tier-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 229, 255, 0.2);
}
.tier-card h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #00e5ff;
}
.tier-card p {
  font-size: 0.75rem;
  color: #aaa;
  min-height: 40px; /* Ensure consistent height */
}
.tier-card .CButton {
  background: #00e5ff; /* Info color for button */
  color: #000;
  border: none;
  padding: 8px 12px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}
.tier-card .CButton:hover {
  background-color: #00b3cc;
}
.tier-card .CButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* LOGO_RESONANCE */
.main-logo {
  width: 120px;
  height: 120px;
  position: relative;
  z-index: 2;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  border: 2px solid #00e5ff;
  border-radius: 50%;
  animation: pulse-out 4s cubic-bezier(0.2, 0, 0.2, 1) infinite;
  z-index: 1;
}

@keyframes pulse-out {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* Telemetry Slide Transition */
.telemetry-slide-enter-active {
  transition: all 0.7s ease-out;
}

.telemetry-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.telemetry-slide-enter-to {
  transform: translateX(0);
  opacity: 1;
}

/* TEXT_AESTHETICS */
.text-glow {
  text-shadow: 0 0 20px rgba(0, 229, 255, 0.6);
}
.shadow-glow {
  filter: drop-shadow(0 0 15px rgba(0, 229, 255, 0.4));
}
.shadow-info {
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.1);
}
.bg-zinc-950 {
  background-color: #050505;
}

.animate-in {
  animation: blur-in 1.5s ease-out;
}

@keyframes blur-in {
  from {
    filter: blur(20px);
    opacity: 0;
    transform: scale(1.1);
  }
  to {
    filter: blur(0);
    opacity: 1;
    transform: scale(1);
  }
}

.font-black {
  font-weight: 900;
}
.tiny {
  font-size: 0.65rem;
}
.extra-tiny {
  font-size: 0.55rem;
}
.italic {
  font-style: italic;
}
.status-orb {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: inline-block;
}

/* SYNC_ANIMATIONS */
.sync-status {
  letter-spacing: 0.1em;
  border-top: 1px solid #27272a;
  padding-top: 0.5rem;
}
.text-glow-success {
  text-shadow: 0 0 10px rgba(40, 167, 69, 0.6);
}
.mesh-sync-enter-active,
.mesh-sync-leave-active {
  transition: all 0.3s ease;
}
.mesh-sync-enter-from,
.mesh-sync-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* SYSTEM_OVERRIDE_MODAL_ANIMATIONS */
/* Define custom purple colors for the animation to match the theme */
:root {
  --iopic-purple-glow-start: rgba(192, 0, 255, 0.7); /* Vibrant purple */
  --iopic-purple-glow-mid: rgba(220, 0, 255, 0.8); /* Brighter purple */
  --iopic-purple-glow-end: rgba(140, 0, 180, 0.6); /* Slightly dimmer purple */
  --iopic-purple-border-start: rgba(160, 0, 200, 0.9);
  --iopic-purple-border-mid: rgba(190, 0, 240, 1);
  --iopic-purple-border-end: rgba(120, 0, 150, 0.8);
}

.system-override-modal .modal-dialog {
  /* Animation for the modal's initial entry */
  animation: override-fade-in 0.5s ease-out forwards;
}

.system-override-modal .modal-content {
  /* Continuous flicker animation for the modal content */
  animation: override-flicker 2s infinite alternate;
  /* Initial state for flicker, matching the theme */
  box-shadow: 0 0 25px var(--iopic-purple-glow-start);
  border: 1px solid var(--iopic-purple-border-start);
  background-color: #050505; /* Ensure it's dark, matching the modal body */
}

@keyframes override-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
    filter: blur(5px) brightness(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0) brightness(1);
  }
}

@keyframes override-flicker {
  0% {
    box-shadow: 0 0 25px var(--iopic-purple-glow-start);
    border-color: var(--iopic-purple-border-start);
    filter: brightness(1);
  }
  25% {
    box-shadow: 0 0 30px var(--iopic-purple-glow-mid);
    border-color: var(--iopic-purple-border-mid);
    filter: brightness(1.1);
  }
  50%,
  100% {
    /* Return to initial state and hold */
    box-shadow: 0 0 25px var(--iopic-purple-glow-start);
    border-color: var(--iopic-purple-border-start);
    filter: brightness(1);
  }
  75% {
    box-shadow: 0 0 20px var(--iopic-purple-glow-end);
    border-color: var(--iopic-purple-border-end);
    filter: brightness(0.95);
  }
}
</style>
