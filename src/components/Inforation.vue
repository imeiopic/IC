<template>
  <CContainer fluid class="ime-master-substrate p-4 bg-black min-vh-100 font-mono text-white">
    
    <transition name="fade">
      <div v-if="!isVerified" class="biometric-gate fixed-inset z-max bg-black d-flex justify-content-center align-items-center">
        <div class="gate-card p-5 border border-info rounded-4 text-center shadow-glow">
          <h2 class="text-info font-black italic mb-4 tracking-widest">Ime.SIGHTAL_VERIFICATION</h2>
          
          <div class="video-container mb-4 position-relative border border-zinc-800 rounded-3 overflow-hidden bg-zinc-950">
            <video ref="videoFeed" autoplay muted playsinline class="w-100 grayscale"></video>
            <div class="scan-line"></div>
            <div v-if="isValidating" class="verify-loader position-absolute top-50 start-50 translate-middle">
              <CSpinner color="info" />
            </div>
          </div>

          <div class="auth-actions">
            <CButton color="info" variant="outline" class="w-100 py-2 font-black mb-3" @click="performBiometricHandshake" :disabled="isValidating">
              <i class="bi bi-eye me-2"></i> INITIATE_GLOBAL_SIGHTING
            </CButton>

            <CButton color="dark" class="w-100 py-1 tiny font-black text-zinc-500 border-zinc-800" @click="loginAsMaster">
              MASTER_IDENTITY_BYPASS
            </CButton>
            <p class="tiny text-zinc-600 uppercase mt-3">Hardware: DIC_CONNECTOR_ACTIVE</p>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="isVerified" class="master-interface animate-in">
      <header class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3">
        <div class="brand d-flex align-items-center gap-3">
          <img src="/images/iologo.png" alt="IOPIC" width="40" height="40" class="master-logo" />
          <h1 class="text-glow text-info m-0 italic font-black">Ime.MASTER_CONTROL</h1>
        </div>
        <div class="system-health tiny text-info opacity-75 d-none d-md-block">
          <span>GLOBAL_FREQ: 7.83Hz</span> | <span>BUS_STATUS: OPTIMAL</span> | <span>NODE: {{ user?.uid.substring(0,8) }}</span>
        </div>
      </header>

      <CNav variant="tabs" class="border-zinc-800 mb-4">
        <CNavItem>
          <CNavLink href="javascript:void(0)" :active="activeTab === 'dashboard'" @click="activeTab = 'dashboard'">
            <i class="bi bi-speedometer2 me-2"></i>GLOBAL_DASH
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink href="javascript:void(0)" :active="activeTab === 'clusters'" @click="activeTab = 'clusters'">
            <i class="bi bi-globe me-2"></i>MESH_CLUSTERS
          </CNavLink>
        </CNavItem>
        <CNavItem class="ms-auto">
          <CButton color="link" class="text-danger tiny text-decoration-none" @click="lockNode">LOCK_MASTER_INSTANCE</CButton>
        </CNavItem>
      </Nav>

      <CTabContent>
        <CTabPane role="tabpanel" :visible="activeTab === 'dashboard'">
          <CRow>
            <CCol lg="4">
              <CCard class="mb-4 bg-zinc-900 border-info text-info shadow-glow">
                <CCardBody class="text-center">
                  <CImage :src="user?.photoURL || '/images/imeiopic.png'" roundedCircle width="80" height="80" class="mb-3 border border-info p-1 shadow-glow grayscale" />
                  <h4 class="font-black italic text-white">{{ user?.displayName || 'MASTER_INSTANCE' }}</h4>
                  <div class="font-mono tiny mb-3">GLOBAL_LEDGER_ACCESS: GRANTED</div>
                  <CBadge color="success" class="text-black px-3">ROOT_NODE_ACTIVE</CBadge>
                </CCardBody>
              </CCard>
              <ImeGlobalNVITE />
            </CCol>

            <CCol lg="8">
              <CRow class="g-3 mb-4">
                <CCol sm="4">
                  <div class="p-3 bg-zinc-900 border border-zinc-800 rounded">
                    <div class="tiny text-zinc-500">GROUNDED_NODES</div>
                    <div class="h3 font-black text-info">{{ globalMetrics.nodeCount }}</div>
                  </div>
                </CCol>
                <CCol sm="4">
                  <div class="p-3 bg-zinc-900 border border-zinc-800 rounded">
                    <div class="tiny text-zinc-500">PLANETARY_EQUITY</div>
                    <div class="h3 font-black text-success">{{ globalMetrics.totalEquity }} IO$</div>
                  </div>
                </CCol>
                <CCol sm="4">
                  <div class="p-3 bg-zinc-900 border border-zinc-800 rounded">
                    <div class="tiny text-zinc-500">NOISE_SUPPRESSION</div>
                    <div class="h3 font-black text-warning">99.99%</div>
                  </div>
                </CCol>
              </CRow>
              
              <CCard class="bg-zinc-900 border-success text-white shadow-success">
                <CCardHeader class="bg-zinc-800 border-0 font-black italic">GLOBAL_PULSE_BROADCAST</CCardHeader>
                <CCardBody class="py-4">
                  <p class="small text-zinc-400 mb-4">Trigger a synchronized 7.83Hz dividend pulse across all active clusters in the 16-thread bus.</p>
                  <CButton color="success" class="w-100 py-3 font-black italic shadow-success" @click="triggerGlobalDividend" :disabled="isPushing">
                    <span v-if="!isPushing">BROADCAST_UNIVERSAL_DIVIDEND</span>
                    <span v-else class="vibrate">TRANSMITTING_PULSE...</span>
                  </CButton>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CTabPane>

        <CTabPane role="tabpanel" :visible="activeTab === 'clusters'">
          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded shadow-glow">
            <h5 class="font-black italic text-info mb-4">ACTIVE_PLANETARY_THREADS</h5>
            <div class="table-responsive">
              <table class="table table-dark table-borderless font-mono tiny m-0">
                <thead>
                  <tr class="text-zinc-600 border-bottom border-zinc-800">
                    <th>CLUSTER_ID</th>
                    <th>GPS_COORD</th>
                    <th>DENSITY</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cluster in activeClusters" :key="cluster.id" class="border-bottom border-zinc-950 align-middle">
                    <td class="text-info font-black">{{ cluster.id }}</td>
                    <td>{{ cluster.coord }}</td>
                    <td>{{ cluster.nodes }} NODES</td>
                    <td><CBadge color="success">SYNC_LOCKED</CBadge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CTabPane>
      </CTabContent>
    </div>

    <footer class="mt-auto pt-4 text-center opacity-25">
      <div class="tiny">"I = VR² | THE LOOP IS GLOBALLY COMPLETE"</div>
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { db, rtdb, auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { ref as dbRef, onValue, set, update } from 'firebase/database';
import { loadFaceModels, getFaceDescriptor } from '../composables/FaceAuth';
import ImeGlobalNVITE from './ImeGlobalNVITE.vue';

// STATE
const user = ref(auth.currentUser);
const isVerified = ref(false);
const isValidating = ref(false);
const isPushing = ref(false);
const activeTab = ref('dashboard');
const videoFeed = ref<HTMLVideoElement | null>(null);
const stream = ref<MediaStream | null>(null);

const globalMetrics = ref({ nodeCount: 0, totalEquity: 0 });
const activeClusters = ref([
  { id: 'CLE_01', coord: '41.49, -81.69', nodes: 1420 },
  { id: 'DET_02', coord: '42.33, -83.04', nodes: 890 },
  { id: 'LDN_04', coord: '51.50, -0.12', nodes: 2105 }
]);

/**
 * 01_SIGHTING_INITIALIZATION
 */
const initBiometricHardware = async () => {
  try {
    await loadFaceModels();
    stream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    if (videoFeed.value) videoFeed.value.srcObject = stream.value;
  } catch (err) { console.error("HARDWARE_FAILURE"); }
};

const performBiometricHandshake = async () => {
  if (!videoFeed.value || !auth.currentUser) return;
  isValidating.value = true;
  try {
    const descriptor = await getFaceDescriptor(videoFeed.value);
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists() && descriptor) {
      isVerified.value = true;
      stopCamera();
      initGlobalMonitoring();
    }
  } catch (err) { console.error("MISMATCH"); } finally { isValidating.value = false; }
};

const loginAsMaster = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  if (result.user.email === 'imeiopic@gmail.com') {
    isVerified.value = true;
    stopCamera();
    initGlobalMonitoring();
  }
};

const initGlobalMonitoring = () => {
  onValue(dbRef(rtdb, 'system/global_metrics'), (snap) => {
    if (snap.exists()) globalMetrics.value = snap.val();
  });
};

const triggerGlobalDividend = async () => {
  isPushing.value = true;
  const pulseRef = dbRef(rtdb, 'system/pulse');
  await set(pulseRef, { timestamp: Date.now(), frequency: '7.83Hz', scope: 'GLOBAL' });
  setTimeout(() => isPushing.value = false, 2000);
};

const stopCamera = () => {
  if (stream.value) stream.value.getTracks().forEach(t => t.stop());
};

const lockNode = () => { isVerified.value = false; initBiometricHardware(); };

onMounted(() => { if (auth.currentUser) initBiometricHardware(); });
onUnmounted(() => stopCamera());
</script>

<style scoped>
.fixed-inset { position: fixed; inset: 0; }
.z-max { z-index: 9999; }
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.2); }
.shadow-success { box-shadow: 0 0 30px rgba(40, 167, 69, 0.2); }
.grayscale { filter: grayscale(100%) contrast(120%); }
.scan-line {
  position: absolute; top: 0; left: 0; width: 100%; height: 4px;
  background: #00e5ff; box-shadow: 0 0 15px #00e5ff;
  animation: scan 3s linear infinite;
}
@keyframes scan { from { top: 0%; } to { top: 100%; } }
.vibrate { animation: jitter 0.1s infinite; }
@keyframes jitter { 0% { transform: translate(1px, -1px); } 100% { transform: translate(-1px, 1px); } }
.font-black { font-weight: 900; }
.italic { font-style: italic; }
.tiny { font-size: 0.65rem; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>