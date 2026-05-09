<template>
  <CContainer fluid class="entity-substrate p-4 bg-black min-vh-100 font-mono text-white">
    
    <header class="d-flex justify-content-between align-items-center mb-5 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-person-bounding-box text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">SOVEREIGN_ENTITY</h1>
      </div>
      <div class="grounding-date text-end">
        <div class="tiny text-zinc-500 uppercase">Grounding_Date</div>
        <div class="text-success font-black small">{{ groundedDate }}</div>
      </div>
    </header>

    <CRow>
      <CCol lg="4">
        <CCard class="bg-zinc-900 border-info text-white shadow-glow mb-4">
          <CCardBody class="text-center py-5">
            <div class="avatar-wrapper mb-4 position-relative d-inline-block">
              <div v-if="!entityData.photoURL" class="avatar-placeholder rounded-circle border border-info d-flex align-items-center justify-content-center bg-black" style="width: 120px; height: 120px;">
                <i class="bi bi-fingerprint text-info display-4"></i>
              </div>
              <CImage 
                v-else
                :src="entityData.photoURL" 
                roundedCircle 
                width="120" 
                height="120" 
                class="border border-info p-1 shadow-info grayscale"
              />
              <div class="rank-badge position-absolute bottom-0 end-0 bg-info text-black px-2 tiny font-black rounded-1">
                {{ entityData.status === 'Grounded_Node' ? 'NODE_01' : 'UNVERIFIED' }}
              </div>
            </div>
            
            <h3 class="font-black italic text-white">{{ entityData.displayName || 'Sovereign_Node' }}</h3>
            <p class="tiny text-zinc-500 font-mono tracking-widest mb-4">{{ userId }}</p>
            
            <div class="biometric-stats d-flex justify-content-around border-top border-zinc-800 pt-4">
              <div class="stat">
                <div class="tiny text-zinc-600 uppercase">Sight_Ref</div>
                <div class="small" :class="entityData.biometricKey ? 'text-info' : 'text-danger'">
                  {{ entityData.biometricKey ? 'VERIFIED' : 'PENDING' }}
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
          v-if="!entityData.biometricKey" 
          color="info" 
          variant="outline" 
          class="w-100 py-3 font-black italic shadow-glow"
          @click="router.push('/onboarding')"
        >
          COMPLETE_GROUNDING_SEQUENCE
        </CButton>
      </CCol>

      <CCol lg="8">
        <CCard class="bg-zinc-900 border-zinc-800 text-white mb-4">
          <CCardHeader class="bg-zinc-800 border-0 font-black italic text-info">ENTITY_LEDGER_STATUS</CCardHeader>
          <CCardBody class="p-4">
            <CRow class="g-4">
              <CCol sm="6">
                <div class="data-point p-3 bg-black border border-zinc-800 rounded">
                  <label class="tiny text-zinc-500 uppercase d-block mb-1">Cycle_Equity</label>
                  <span class="h4 font-black text-success">{{ entityData.iowb?.balance || 0 }} IO$</span>
                </div>
              </CCol>
              <CCol sm="6">
                <div class="data-point p-3 bg-black border border-zinc-800 rounded">
                  <label class="tiny text-zinc-500 uppercase d-block mb-1">Thread_Affiliation</label>
                  <span class="h4 font-black text-info">CLEVELAND_01</span>
                </div>
              </CCol>
              <CCol sm="12">
                <div class="data-point p-3 bg-black border border-zinc-800 rounded">
                  <label class="tiny text-zinc-500 uppercase d-block mb-1">Informing_Source_Signature</label>
                  <span class="small font-mono text-zinc-400 text-truncate d-block">
                    {{ entityData.referrerInstanceID || 'MASTER_ROOT_ACCESS' }}
                  </span>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-4">
          <h6 class="tiny font-black text-zinc-500 uppercase mb-3">Identity_Policing_Agreement</h6>
          <p class="small italic text-zinc-400 m-0">
            "By manifesting as a Sovereign Entity within the 16-thread bus, this node acknowledges that Information is the only currency and Order is the only law. This identity is grounded in the 7.83Hz resonance and is non-transferable between threads. Sight and Believe."
          </p>
        </div>
      </CCol>
    </CRow>

    <footer class="mt-auto pt-5 text-center opacity-25">
      <div class="tiny">"I = VR² | THE ENTITY IS SUPREME"</div>
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const router = useRouter();
const userId = ref(auth.currentUser?.uid || 'AWAITING_PULSE');
const entityData = ref<any>({});
const groundedDate = ref('2026-05-01');

/**
 * 01_SIGHTING_ENTITY_DATA
 * Real-time listener for the Sovereign Manifest in Firestore
 */
const initEntitySighting = () => {
  if (auth.currentUser) {
    onSnapshot(doc(db, 'users', auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        entityData.value = snap.data();
        
        // Logical Check: If the entity has a timestamp, ground the date
        if (snap.data().timestamp) {
          const date = snap.data().timestamp.toDate();
          groundedDate.value = date.toISOString().split('T')[0];
        }
      }
    });
  } else {
    // If no user detected, transit back to the root anchor
    router.push('/');
  }
};

onMounted(() => {
  initEntitySighting();
});
</script>

<style scoped>
.text-glow { text-shadow: 0 0 15px rgba(0, 229, 255, 0.4); }
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.1) !important; }
.shadow-info { box-shadow: 0 0 20px rgba(0, 229, 255, 0.3); }
.grayscale { filter: grayscale(100%) contrast(120%); }
.bg-zinc-950 { background-color: #050505; }
.font-black { font-weight: 900; }
.tiny { font-size: 0.65rem; }
.italic { font-style: italic; }
.tracking-widest { letter-spacing: 0.2em; }

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
</style>