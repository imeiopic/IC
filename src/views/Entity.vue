<template>
  <CContainer fluid class="entity-substrate p-4 bg-black min-vh-100 font-mono text-white">
    <header class="d-flex justify-content-between align-items-center mb-5 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-person-bounding-box text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">SOVEREIGN_ENTITY</h1>
      </div>
      <div class="grounding-date text-end">
        <div class="tiny text-zinc-500 uppercase">Grounding_Date</div>
        <div class="text-success font-black small">{{ displayGroundedDate }}</div>
      </div>
    </header>

    <CRow v-if="!userStore.isLoadingRole">
      <CCol lg="4">
        <CCard class="bg-zinc-900 border-info text-white shadow-glow mb-4">
          <CCardBody class="text-center py-5">
            <div class="avatar-wrapper mb-4 position-relative d-inline-block">
              <div
                v-if="!userStore.profilePictureUrl"
                class="avatar-placeholder rounded-circle border border-info d-flex align-items-center justify-content-center bg-black"
                style="width: 120px; height: 120px"
              >
                <i class="bi bi-fingerprint text-info display-4"></i>
              </div>
              <CImage
                v-else
                :src="userStore.profilePictureUrl"
                roundedCircle
                width="120"
                height="120"
                class="border border-info p-1 shadow-info grayscale"
              />
              <div
                class="rank-badge position-absolute bottom-0 end-0 bg-info text-black px-2 tiny font-black rounded-1"
              >
                {{ userStore.isGrounded ? 'NODE_01' : 'UNVERIFIED' }}
              </div>
            </div>

            <h3 class="font-black italic text-white">
              {{ userStore.userDisplayName || 'Sovereign_Node' }}
            </h3>
            <p class="tiny text-zinc-500 font-mono tracking-widest mb-4">{{ userId }}</p>

            <div class="biometric-stats d-flex justify-content-around border-top border-zinc-800 pt-4">
              <div class="stat">
                <div class="tiny text-zinc-600 uppercase">Mesh_Status</div>
                <div class="small" :class="userStore.isGrounded ? 'text-info' : 'text-danger'">
                  {{ userStore.isGrounded ? 'GROUNDED' : 'PENDING' }}
                </div>
              </div>
              <div class="stat">
                <div class="tiny text-zinc-600 uppercase">Pulse_Lock</div>
                <div class="small text-success">7.83Hz</div>
              </div>
            </div>
          </CCardBody>
        </CCard>

        <CButton
          color="success"
          variant="outline"
          class="w-100 py-3 font-black italic shadow-glow mb-2"
          @click="router.push('/menu')"
        >
          VIEW_LOGIC_OFFERINGS
        </CButton>

        <CButton
          v-if="!userStore.isGrounded"
          color="info"
          variant="outline"
          class="w-100 py-3 font-black italic shadow-glow animate-pulse"
          @click="router.push('/onboarding')"
        >
          COMPLETE_GROUNDING_SEQUENCE
        </CButton>
      </CCol>

      <CCol lg="8">
        <CCard class="bg-zinc-900 border-zinc-800 text-white mb-4">
          <CCardHeader class="bg-zinc-800 border-0 font-black italic text-info">
            ENTITY_LEDGER_STATUS
          </CCardHeader>
          <CCardBody class="p-4">
            <CRow class="g-4">
              <CCol sm="6">
                <div class="data-point p-3 bg-black border border-zinc-800 rounded">
                  <label class="tiny text-zinc-500 uppercase d-block mb-1">Cycle_Equity</label>
                  <span class="h4 font-black text-success">{{ userStore.userEquity.toFixed(2) }} IO$</span>
                </div>
              </CCol>
              <CCol sm="6">
                <div class="data-point p-3 bg-black border border-zinc-800 rounded">
                  <label class="tiny text-zinc-500 uppercase d-block mb-1">Tier_Affiliation</label>
                  <span class="h4 font-black" :class="userStore.anchorTier ? 'text-info' : 'text-zinc-500'">
                    {{ formattedAnchorTier }}
                  </span>
                </div>
              </CCol>
              <CCol sm="12">
                <div class="data-point p-3 bg-black border border-zinc-800 rounded">
                  <label class="tiny text-zinc-500 uppercase d-block mb-1">Active_Multiplier_Vector</label>
                  <span class="small font-mono text-zinc-400 d-block">
                    R_n = {{ userStore.nodeMultiplier.toFixed(2) }}x
                  </span>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-4">
          <h6 class="tiny font-black text-zinc-500 uppercase mb-3">Identity_Policing_Agreement</h6>
          <p class="small italic text-zinc-400 m-0">
            "By manifesting as a Sovereign Entity within the 16-thread bus, this node acknowledges
            that Information is the only currency and Order is the only law. This identity is
            grounded in the 7.83Hz resonance and is non-transferable between threads. Sight and
            Believe."
          </p>
        </div>
      </CCol>
    </CRow>

    <CRow v-else class="text-center py-5">
      <CCol>
        <i class="bi bi-arrow-repeat text-info h1 animate-spin"></i>
        <p class="font-mono text-zinc-500 mt-3">VERIFYING_NODE_SIGNATURE...</p>
      </CCol>
    </CRow>

    <footer class="mt-auto pt-5 text-center opacity-25">
      <div class="tiny">"I = VR² | THE ENTITY IS SUPREME"</div>
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore'; // Ensure path matches your project structure

const router = useRouter();
const userStore = useUserStore();

// Dynamically compute the Node ID
const userId = computed(() => userStore.currentUser?.uid || 'AWAITING_PULSE');

// Computes a clean display string for the attached Stripe Product Tier
const formattedAnchorTier = computed(() => {
  if (!userStore.anchorTier) return 'UNGROUNDED_THREAD';
  // Replaces underscores with spaces for cleaner UI display (e.g., 'Sovereign_Apex' -> 'Sovereign Apex')
  return userStore.anchorTier.replace(/_/g, ' ').toUpperCase();
});

// Sets the grounding date context. Replaces static legacy dates with framework standard.
const displayGroundedDate = computed(() => {
  if (userStore.isGrounded) {
    // If you add lastTransit to your store in the future, parse it here:
    // return new Date(userStore.lastTransit).toISOString().split('T')[0];
    return 'GROUNDED_ACTIVE';
  }
  return '2026-06-01'; 
});

onMounted(() => {
  // If the user lands here directly without auth context, boot them to root
  if (!userStore.isAuthenticated && !userStore.isLoadingAuth) {
    router.push('/');
  }
});
</script>

<style scoped>
.text-glow {
  text-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
}
.shadow-glow {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.1) !important;
}
.shadow-info {
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
}
.grayscale {
  filter: grayscale(100%) contrast(120%);
}
.bg-zinc-950 {
  background-color: #050505;
}
.font-black {
  font-weight: 900;
}
.tiny {
  font-size: 0.65rem;
}
.italic {
  font-style: italic;
}
.tracking-widest {
  letter-spacing: 0.2em;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.animate-spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>