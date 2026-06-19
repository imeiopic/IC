<template>
  <CContainer fluid class="order-portal-substrate p-4 bg-black min-vh-100 font-mono text-white">
    <header
      class="d-flex justify-content-between align-items-center mb-5 border-bottom border-zinc-800 pb-3"
    >
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-cart-plus text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">INITIALIZATION_PORTAL</h1>
      </div>
      <div class="equity-status tiny text-success">
        ENTITY_BALANCE: {{ currentEntityBalance }} IO$
      </div>
    </header>

    <!-- APEX_LAYER_ACCELERATION_DISPLAY -->
    <div
      v-if="isApexRecognized"
      class="apex-streamline-block p-3 mb-4 border border-info bg-black shadow-glow animate-in"
    >
      <p class="tiny text-info font-black mb-1">[IOPIC.WORLD // APEX LAYER ACCELERATION]</p>
      <div class="extra-tiny font-mono mb-2">
        <div class="text-white">APEX VECTOR RECOGNIZED: SECTOR {{ apexSector }}</div>
        <div class="text-zinc-500">[SEED LOCK] Pool Index 0x14F engaged.</div>
        <div class="text-zinc-500">[BALANCE ] 5.00 IO$ settled instantly.</div>
      </div>

      <!-- VECTOR_LINE_ANIMATION_HUD -->
      <div
        class="vector-hud-container relative h-16 my-4 overflow-hidden bg-zinc-950/50 rounded border border-info/20"
      >
        <div class="absolute inset-0 flex justify-between items-center px-6 z-10">
          <div class="node-icon local-node">
            <div class="w-2 h-2 bg-info rounded-full shadow-[0_0_10px_#00e5ff]"></div>
            <span class="extra-tiny text-info block mt-1">LOCAL</span>
          </div>
          <div class="node-icon peer-node text-right">
            <div class="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
            <span class="extra-tiny text-emerald-500 block mt-1">PEER</span>
          </div>
        </div>

        <svg
          class="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 64"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="emeraldGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            id="vectorPath"
            d="M 48,32 L 352,32"
            fill="none"
            :class="['vector-line', { 'vector-active': isSubmitting }]"
          />
          <text v-if="isSubmitting" fill="#10b981" font-size="8" class="coordinate-readout">
            <textPath href="#vectorPath" :startOffset="handshakeProgress + '%'">
              {{ currentHandshakeCoord }}
            </textPath>
          </text>
        </svg>
      </div>

      <div
        class="hotkey-prompt text-center p-2 border border-dashed border-info"
        :class="{ 'animate-pulse': !isSubmitting }"
      >
        <span class="text-info font-black italic">{{
          isSubmitting
            ? 'COLLAPSING_BOUNDARIES...'
            : '>> HOTKEY ACTIVE: PRESS [SPACEBAR] TO COLLAPSE APEX BOUNDARIES <<'
        }}</span>
      </div>
      <p v-if="apexStatus" class="extra-tiny text-success mt-2 font-black italic">
        STATUS: {{ apexStatus }}
      </p>
    </div>

    <CRow class="justify-content-center">
      <CCol lg="6" md="8">
        <CCard class="bg-zinc-900 border-zinc-800 text-white shadow-glow">
          <CCardHeader class="bg-zinc-800 border-0 font-black italic text-center py-3">
            03_INITIALIZATION_MANIFEST
          </CCardHeader>
          <CCardBody class="p-4">
            <CForm @submit.prevent="submitRequest">
              <div class="mb-4">
                <label class="tiny text-zinc-500 uppercase mb-2">Resource_Thread_Activation</label>
                <CFormSelect v-model="form.type" class="bg-black border-zinc-800 text-info">
                  <option value="HARDWARE_PROVISION">HARDWARE_PROVISION</option>
                  <option value="BANDWIDTH_ALLOCATION">BANDWIDTH_ALLOCATION</option>
                  <option value="EQUITY_TRANSIT">EQUITY_TRANSIT</option>
                  <option value="SPATIAL_LOCK_SERVICE">SPATIAL_LOCK_SERVICE</option>
                </CFormSelect>
              </div>

              <div class="mb-4">
                <label class="tiny text-zinc-500 uppercase mb-2">Initialization_Stake (IO$)</label>
                <CFormInput
                  v-model.number="initializationStakeValue"
                  type="number"
                  class="bg-black border-zinc-800 text-success fw-bold"
                  placeholder="0.00"
                />
              </div>

              <div class="mb-4">
                <label class="tiny text-zinc-500 uppercase mb-2">Request_Note (Optional)</label>
                <CFormTextarea
                  v-model="form.note"
                  rows="3"
                  class="bg-black border-zinc-800 text-white small"
                  placeholder="Briefly state the necessity of this resource..."
                ></CFormTextarea>
              </div>

              <CButton
                type="submit"
                color="info"
                class="w-100 py-3 font-black italic shadow-info mt-3"
                :disabled="isSubmitting || !checkStakeSymmetry"
              >
                <span v-if="!isSubmitting">DISPATCH_REQUEST_PULSE</span>
                <span v-else class="vibrate">WRITING_TO_MESH...</span>
              </CButton>

              <p v-if="!checkStakeSymmetry" class="text-danger tiny text-center mt-3">
                INSUFFICIENT_EQUITY_FOR_TRANSIT
              </p>
            </CForm>
          </CCardBody>
        </CCard>

        <div class="history-substrate mt-5">
          <h5 class="text-zinc-500 tiny uppercase mb-3">Recent_Transit_Sightings</h5>
          <div
            v-for="req in history"
            :key="req.id"
            class="p-3 mb-2 bg-zinc-950 border border-zinc-800 rounded d-flex justify-content-between align-items-center"
          >
            <div>
              <span class="tiny d-block opacity-50">{{ req.type }}</span>
              <span class="small font-black">{{ req.amount }} IO$</span>
            </div>
            <CBadge :color="getStatusColor(req.status)" class="text-black tiny">{{
              req.status
            }}</CBadge>
          </div>
        </div>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useNodeStore } from '@/stores/nodeStore';
import { SPICE } from './SPICE';
import { ApexLink, type ApexHandshakeVector } from '@/services/ApexLink';
import { db, auth } from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy
} from 'firebase/firestore';

// NODE_STORE_INTEGRATION
const nodeStore = useNodeStore();
const {
  initializationStakeValue,
  currentEntityBalance,
  isCircuitActivated,
  nodeState,
  checkStakeSymmetry
} = storeToRefs(nodeStore);

const isSubmitting = ref(false);
const handshakeProgress = ref(0);
const history = ref<any[]>([]);
const form = ref({
  type: 'HARDWARE_PROVISION',
  note: ''
});

// REPATRIATION_SUBSTRATE_VISIBILITY
const showRepatriation = ref(false);
const toggleRepatriation = () => { showRepatriation.value = !showRepatriation.value; };

// APEX_STREAMLINE_LOGIC
const isApexRecognized = ref(true); // Hardcoded true for prototype sighting
const apexSector = ref('41.81°N [CLEVELAND] <-> 41.87°N [CHICAGO]');
const apexStatus = ref('');

const currentHandshakeCoord = computed(() => {
  const startLat = 41.81;
  const endLat = 41.87;
  const currentLat = startLat + (endLat - startLat) * (handshakeProgress.value / 100);
  return `${currentLat.toFixed(4)}°N`;
});

const handleApexHotkey = async (event: KeyboardEvent) => {
  if (event.code === 'Space' && isApexRecognized.value && !isSubmitting.value) {
    event.preventDefault();
    isSubmitting.value = true;
    handshakeProgress.value = 0;

    const duration = 800; // Duration of visual handshake animation
    const startTime = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      handshakeProgress.value = Math.min((elapsed / duration) * 100, 100);
      if (elapsed >= duration) clearInterval(progressTimer);
    }, 16);

    const mockPeer: ApexHandshakeVector = {
      poolIndex: 0x14f,
      matrixSignature: 'SYM_VEC_88',
      coordinateDelta: 0.06
    };

    const result = await ApexLink.lockDoubleApexConnection(
      'SYM_VEC_AA', // Local signature
      mockPeer,
      currentEntityBalance.value
    );

    apexStatus.value = result.statusLog;

    if (result.success) {
      // Trigger global resonance pulse in the store
      nodeStore.initializationStakeValue = 5.0;
      SPICE.sparkIgnition();
      nodeStore.deductStake();
      console.log(`[APEX_LOCKED] Velocity: ${result.resonanceVelocity}x`);
    }

    isSubmitting.value = false;
  }
};

/**
 * 01_SIGHTING_HISTORY
 */
const initHistoryStream = () => {
  if (!auth.currentUser) return;

  const q = query(
    collection(db, 'resource_requests'),
    where('originID', '==', auth.currentUser.uid),
    orderBy('timestamp', 'desc')
  );

  onSnapshot(q, (snapshot) => {
    history.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  });
};

/**
 * 02_DISPATCH_REQUEST
 */
const submitRequest = async () => {
  if (!auth.currentUser) return;
  isSubmitting.value = true;

  if (!checkStakeSymmetry.value) {
    console.error('CRITICAL_ERROR: Asymmetric asset state. Drop connection.');
    isSubmitting.value = false;
    return;
  }

  try {
    await addDoc(collection(db, 'resource_requests'), {
      originID: auth.currentUser.uid,
      originEmail: auth.currentUser.email,
      originNode: auth.currentUser.uid.substring(0, 8),
      type: form.value.type,
      amount: initializationStakeValue.value,
      note: form.value.note,
      status: 'PENDING',
      timestamp: serverTimestamp()
    });

    nodeStore.deductStake();
    form.value.note = '';
    alert('NODE_LOG: Initialization Stake successfully committed to the fabric.');
  } catch (err) {
    console.error('TRANSIT_ERROR: Pulse failed to ground.');
  } finally {
    isSubmitting.value = false;
  }
};

const getStatusColor = (status: string) => {
  if (status === 'FULFILLED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'info';
};

/**
 * CHAT_INTERFACE_INTEGRATION
 * Listens for protocol-level commands to toggle the Repatriation Substrate.
 */
const handleChatCommand = (e: MessageEvent) => {
  if (e.data?.type === 'IOPIC_COMMAND' && e.data?.action === 'TOGGLE_REPATRIATION') {
    toggleRepatriation();
  }
};

onMounted(() => {
  initHistoryStream();
  window.addEventListener('keydown', handleApexHotkey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleApexHotkey);
});
</script>

<style scoped>
.order-portal-substrate {
  font-family: 'Space Mono', monospace;
}
.apex-streamline-block {
  background: rgba(0, 0, 0, 0.9);
  position: relative;
  z-index: 10;
}
.extra-tiny {
  font-size: 0.6rem;
}
.text-glow {
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}
.bg-zinc-950 {
  background-color: #050505;
}
.shadow-glow {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.1);
}
.vibrate {
  animation: jitter 0.1s infinite;
}
@keyframes jitter {
  0% {
    transform: translate(1px, -1px);
  }
  100% {
    transform: translate(-1px, 1px);
  }
}
.tiny {
  font-size: 0.65rem;
}
.font-black {
  font-weight: 900;
}
.italic {
  font-style: italic;
}
</style>
