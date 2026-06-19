<template>
  <div class="iod-substrate bg-black min-vh-100 p-4 font-mono text-zinc-300">
    <div class="container-fluid max-w-7xl mx-auto">
      <header class="mb-5 border-b border-zinc-800 pb-4 animate-in">
        <h1 class="text-info font-black italic display-5 tracking-tighter text-glow">
          COLLECTIVE_ANCHORS
        </h1>
        <p class="extra-tiny text-zinc-500 uppercase tracking-widest opacity-75">
          [IOPIC.WORLD // SYSTEM_DIRECTORY // NODE_STAKE_REGISTRY]
        </p>
      </header>

      <!-- Loading State -->
      <div v-if="loading && anchors.length === 0" class="d-flex flex-column align-items-center justify-content-center my-5 py-5">
        <CSpinner color="info" variant="grow" />
        <span class="extra-tiny text-info mt-3 tracking-widest uppercase">Initializing_Collective_Registry...</span>
      </div>

      <!-- Error State -->
      <CAlert v-if="error" color="danger" class="extra-tiny font-mono bg-zinc-950 border-danger text-danger mb-4 py-2">
        [CRITICAL_SYNC_FAILURE]: {{ error }}
      </CAlert>

      <div v-if="anchors.length > 0" class="row g-4">
        <div v-for="anchor in anchors" :key="anchor.id" class="col-12 col-md-6 col-lg-4 col-xl-3">
          <div
            class="anchor-card h-100 p-3 border border-zinc-800 bg-zinc-950 rounded position-relative overflow-hidden d-flex flex-column transition-all"
          >
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 class="tiny font-black text-white m-0 uppercase tracking-tight">
                  {{ anchor.name.replace(/_/g, ' ') }}
                </h2>
                <span class="extra-tiny text-zinc-600 font-mono">{{ anchor.id }}</span>
              </div>
              <div
                class="multiplier-tag extra-tiny font-black px-2 py-1 rounded bg-info text-black shadow-glow"
              >
                {{ anchor.multiplier }}X
              </div>
            </div>

            <p class="extra-tiny text-zinc-400 mb-4 line-height-1-4 italic">
              "{{ anchor.description }}"
            </p>

            <div class="node-metadata mb-4 space-y-1">
              <div v-if="anchor.metadata.ime_circle" class="extra-tiny text-warning font-black">
                [IME_CIRCLE_VERIFIED]
              </div>
              <div v-if="anchor.metadata.e_capable" class="extra-tiny text-info">
                [EQUITY_CAPABLE:
                {{ anchor.metadata.e_capable === true ? 'FULL' : anchor.metadata.e_capable }}]
              </div>
              <div v-if="anchor.metadata.e_invite" class="extra-tiny text-success">
                [INVITE_BOND_ENABLED]
              </div>
              <div v-if="anchor.metadata.vote" class="extra-tiny text-zinc-500">
                [VOTING_RIGHTS_ACTIVE]
              </div>
            </div>

            <div class="footer-action mt-auto pt-3 border-t border-zinc-900">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="extra-tiny text-zinc-500 uppercase">Initialization Stake</span>
                <span class="tiny font-black text-white">
                  {{ anchor.stake ? anchor.stake + ' IO$' : 'VARIABLE' }}
                </span>
              </div>

              <CButton
                color="info"
                variant="outline"
                class="w-100 extra-tiny font-black italic py-2 shadow-info hover-emerald"
                @click="initiateHandshake(anchor)"
              >
                INITIATE_HANDSHAKE
              </CButton>
            </div>

            <!-- Cyber Accent -->
            <div class="accent-glow"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useCheckoutStore } from '@/stores/checkout';
import { useNodeStore } from '@/stores/nodeStore';
import { useAnchorsStore, type CollectiveAnchor } from '@/stores/anchors';
import { CButton, CSpinner, CAlert } from '@coreui/vue';
import { MeshManager } from '@/services/MeshManager';
import { getMyLocation } from '@/utils/getMyLocation';

const router = useRouter();
const checkoutStore = useCheckoutStore();
const nodeStore = useNodeStore();
const anchorsStore = useAnchorsStore();
const { anchors, loading, error } = storeToRefs(anchorsStore);

// Establish real-time synchronization with the anchor registry on mount
onMounted(async () => {
  try {
    const location = await getMyLocation();
    console.log(`[LOCALITY_SYNC] Node sighted at quadrant: ${location.locality}`);
    anchorsStore.fetchAnchors(location.locality);
  } catch (err) {
    console.warn('[LOCALITY_SYNC] Sighting failed, grounding to global mesh:', err);
    anchorsStore.fetchAnchors();
  }
});

// Sever synchronization to prevent memory leaks on unmount
onUnmounted(() => {
  anchorsStore.stopSync();
});

/**
 * Records selection in the global store and returns to the home substrate.
 */
const initiateHandshake = async (anchor: CollectiveAnchor) => {
  try {
    // Calculate and synchronize stability index to the Firestore mesh (I = V * R^2)
    const stabilityIndex = await MeshManager.syncNode(
      anchor.id,
      anchor.multiplier,
      anchors.value.length,
      anchor.metadata.consecutiveHandshakes || 0,
      (anchor.metadata as any)?.lastHandshake
    );

    console.log(`[PHYSICS_SYNC] Handshake successful for ${anchor.name}. Stability Index: ${stabilityIndex.toFixed(4)}`);
    
    // Record selection and ground the stability index in the global node store
    nodeStore.initializationStakeValue = anchor.stake || 0;
    nodeStore.nodeState.stabilityIndex = stabilityIndex;

    router.push('/');
  } catch (err) {
    console.error('[PHYSICS_SYNC] Handshake failed to ground:', err);
  }
};
</script>

<style scoped>
.iod-substrate {
  background: radial-gradient(circle at top right, #050505 0%, #000 100%);
  min-height: 100vh;
}

.anchor-card {
  border-color: rgba(63, 63, 70, 0.4) !important;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.anchor-card:hover {
  border-color: #00e5ff !important;
  transform: translateY(-5px);
  box-shadow: 0 10px 40px -10px rgba(0, 229, 255, 0.25);
  background-color: #080808 !important;
}

.text-glow {
  text-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
}

.shadow-glow {
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}

.shadow-info {
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.1);
}

.hover-emerald:hover {
  background-color: #10b981 !important;
  color: #000 !important;
  border-color: #10b981 !important;
}

.tiny {
  font-size: 0.8rem;
}
.extra-tiny {
  font-size: 0.65rem;
}
.font-black {
  font-weight: 900;
}

.accent-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.anchor-card:hover .accent-glow {
  opacity: 1;
}
</style>
