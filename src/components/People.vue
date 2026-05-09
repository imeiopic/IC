<template>
  <CContainer fluid class="people-substrate p-4 bg-black min-vh-100 font-mono text-white">
    
    <header class="d-flex justify-content-between align-items-center mb-5 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-people text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">PEER_DIRECTORY</h1>
      </div>
      <div class="mesh-stats tiny text-zinc-500 text-end">
        <div class="d-flex align-items-center justify-content-end gap-2">
          <span>GLOBAL_NODES:</span>
          <span class="text-info font-black">{{ peers.length }}</span>
        </div>
        <div class="text-success uppercase">Active_Cluster: {{ userCluster }}</div>
      </div>
    </header>

    <CRow>
      <CCol lg="8">
        <div class="search-bar mb-4">
          <CFormInput 
            v-model="searchQuery" 
            placeholder="FILTER_BY_NODE_ID_OR_ALIAS..." 
            class="bg-zinc-950 border-zinc-800 text-info font-mono"
          />
        </div>

        <div class="peer-grid-container" style="max-height: 70vh; overflow-y: auto;">
          <div v-if="filteredPeers.length === 0" class="text-center py-5 opacity-25 italic">
            NO_PEERS_SIGHTED_IN_THIS_THREAD
          </div>
          
          <CRow class="g-3">
            <CCol v-for="peer in filteredPeers" :key="peer.id" md="6" xl="4">
              <CCard class="bg-zinc-900 border-zinc-800 h-100 peer-card transition-all" @click="viewPeer(peer.id)">
                <CCardBody class="d-flex align-items-center gap-3">
                  <div class="avatar-substrate position-relative">
                    <div class="avatar-ring position-absolute top-50 start-50 translate-middle"></div>
                    <CImage 
                      :src="peer.photoURL || '/images/imeiopic.png'" 
                      roundedCircle 
                      width="50" 
                      height="50" 
                      class="border border-zinc-700 p-1 grayscale" 
                    />
                    <div class="status-dot position-absolute bottom-0 end-0 bg-success rounded-circle border border-black" style="width: 10px; height: 10px;"></div>
                  </div>
                  <div class="peer-info overflow-hidden">
                    <h6 class="m-0 font-black text-truncate">{{ peer.displayName || 'Sovereign_Node' }}</h6>
                    <p class="tiny text-zinc-500 m-0 font-mono text-truncate">ID: {{ peer.id.substring(0, 12) }}</p>
                    <div class="d-flex gap-1 mt-1">
                      <CBadge color="info" variant="outline" class="extra-tiny">GROUNDED</CBadge>
                      <CBadge v-if="peer.cluster_id" color="dark" class="extra-tiny border border-zinc-700">{{ peer.cluster_id }}</CBadge>
                    </div>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </div>
      </CCol>

      <CCol lg="4">
        <CCard class="bg-zinc-900 border-info text-white shadow-glow sticky-top" style="top: 20px;">
          <CCardHeader class="font-black italic text-info border-zinc-800 bg-zinc-800 py-3">
            INFORMING_THREADS
          </CCardHeader>
          <CCardBody>
            <p class="tiny text-zinc-500 mb-4 uppercase tracking-widest">Nodes under your 2% profit shield:</p>
            
            <div class="referral-list mb-4" style="max-height: 300px; overflow-y: auto;">
              <div v-if="referrals.length === 0" class="text-center py-4 border border-dashed border-zinc-800 rounded opacity-50 small italic">
                AWAITING_MESH_EXPANSION...
              </div>
              <div v-for="refNode in referrals" :key="refNode.id" class="d-flex justify-content-between align-items-center mb-2 p-2 bg-black rounded border border-zinc-800">
                <div>
                  <span class="small font-mono d-block text-truncate" style="max-width: 150px;">{{ refNode.displayName || refNode.id.substring(0, 8) }}</span>
                  <span class="extra-tiny text-zinc-600 uppercase">SYNC_LOCKED</span>
                </div>
                <div class="text-end">
                  <span class="text-success small font-black d-block">+2%</span>
                  <span class="extra-tiny text-zinc-500">EQUITY_PULSE</span>
                </div>
              </div>
            </div>

            <CButton color="info" variant="outline" class="w-100 font-black italic py-3 shadow-info" @click="router.push({ name: 'QrCode' })">
              <i class="bi bi-broadcast me-2"></i>EXPAND_THE_MESH
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <footer class="mt-auto pt-5 text-center opacity-25">
      <div class="tiny">"I = VR² | THE PEOPLE ARE THE BUS"</div>
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';

const router = useRouter();
const peers = ref<any[]>([]);
const referrals = ref<any[]>([]);
const searchQuery = ref('');
const userCluster = ref('GLOBAL_VRE');

/**
 * 01_SIGHTING_PEER_SUBSTRATE
 * Synchronizing the social mesh with the 16-thread bus
 */
const initPeopleStream = () => {
  // Sighting all Grounded Nodes across the planetary mesh
  const qPeers = query(collection(db, 'users'), where('status', '==', 'Grounded_Node'));
  onSnapshot(qPeers, (snapshot) => {
    peers.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });

  if (auth.currentUser) {
    // Identifying local cluster context for the current Instance
    onSnapshot(doc(db, 'users', auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        userCluster.value = snap.data().cluster_id || 'GLOBAL_VRE';
      }
    });

    // Sighting nodes informed by this specific Sovereign Instance (Profit Shield)
    const qRefs = query(collection(db, 'users'), where('referrerInstanceID', '==', auth.currentUser.uid));
    onSnapshot(qRefs, (snapshot) => {
      referrals.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
  }
};

const filteredPeers = computed(() => {
  const search = searchQuery.value.toLowerCase();
  return peers.value.filter(p => 
    p.id.toLowerCase().includes(search) || 
    (p.displayName && p.displayName.toLowerCase().includes(search))
  );
});

const viewPeer = (id: string) => {
  console.log(`SIGHTING: Inspecting Node ${id}`);
  // Transit to specialized peer view could be integrated here
};

onMounted(() => initPeopleStream());
</script>

<style scoped>
.people-substrate { background-color: #000; }
.peer-card { cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.peer-card:hover { border-color: #00e5ff !important; transform: translateY(-3px); background: #050505 !important; }
.avatar-ring {
  width: 58px; height: 58px;
  border: 1px dashed rgba(0, 229, 255, 0.3);
  border-radius: 50%;
  animation: rotate 15s linear infinite;
}
@keyframes rotate { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
.text-glow { text-shadow: 0 0 15px rgba(0, 229, 255, 0.4); }
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.1) !important; }
.shadow-info { box-shadow: 0 0 20px rgba(0, 229, 255, 0.3); }
.grayscale { filter: grayscale(100%) contrast(110%); }
.font-black { font-weight: 900; }
.tiny { font-size: 0.65rem; }
.extra-tiny { font-size: 0.55rem; padding: 2px 6px; }
.italic { font-style: italic; }

/* Custom Scrollbar for the 16-thread aesthetic */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #000; }
::-webkit-scrollbar-thumb { background: #00e5ff; }
</style>