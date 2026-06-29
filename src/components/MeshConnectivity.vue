<template>
  <CContainer fluid class="connected-substrate p-4 bg-black min-vh-100 font-mono text-white">
    
    <header class="d-flex justify-content-between align-items-center mb-5 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-hub text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">MESH_CONNECTIVITY</h1>
      </div>
      <div class="sync-status text-end">
        <div class="tiny text-zinc-500 uppercase">Handshake_Protocol</div>
        <div class="text-success font-black h5 m-0">ACTIVE_1101</div>
      </div>
    </header>

    <CRow>
      <CCol lg="5">
        <CCard class="bg-zinc-900 border-info text-white shadow-glow mb-4">
          <CCardHeader class="bg-zinc-800 border-0 font-black italic text-info py-3">
            0011_INVITE_PULSE
          </CCardHeader>
          <CCardBody class="p-4 text-center">
            <p class="small text-zinc-400 mb-4">
              Generate a unique referral pulse to ground new entities. 
              Successful grounding triggers the **2% Profit Shield**.
            </p>
            
            <div class="invite-link-box p-3 bg-black border border-zinc-800 rounded mb-4">
              <div class="tiny text-zinc-600 uppercase mb-2">Sovereign_Invite_URL</div>
              <div class="small font-black text-info text-break">{{ inviteUrl }}</div>
            </div>

            <CButton 
              color="info" 
              class="w-100 py-3 font-black italic shadow-info"
              @click="copyInvite"
            >
              <i class="bi bi-clipboard-pulse me-2"></i>COPY_INVITE_PULSE
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg="7">
        <CCard class="bg-zinc-900 border-zinc-800 text-white mb-4">
          <CCardHeader class="font-black italic border-zinc-800">CONNECTED_NODES_FEED</CCardHeader>
          <CCardBody>
            <div class="connection-log font-mono tiny" style="height: 300px; overflow-y: auto;">
              <div v-if="connections.length === 0" class="h-100 d-flex align-items-center justify-content-center opacity-25 italic">
                AWAITING_NEW_MESH_HANDSHAKES...
              </div>
              <div v-for="conn in connections" :key="conn.id" class="d-flex justify-content-between p-2 border-bottom border-zinc-950">
                <span class="text-info">NODE_{{ conn.id.substring(0,8) }}</span>
                <span class="text-zinc-500">{{ conn.timestamp }}</span>
                <CBadge color="success" class="extra-tiny">GROUNDED</CBadge>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <footer class="mt-auto pt-4 text-center opacity-25 tiny">
      "I = VR² | THE BUS GROWS BY HANDSHAKE"
    </footer>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const userId = auth.currentUser?.uid || 'AWAITING_ID';
const connections = ref<any[]>([]);

const inviteUrl = computed(() => {
  return `${window.location.origin}/?ref=${userId}`;
});

const copyInvite = () => {
  navigator.clipboard.writeText(inviteUrl.value);
  alert("PULSE_COPIED: Send this to ground a new entity.");
};

const initConnectionSighting = () => {
  if (auth.currentUser) {
    const q = query(
      collection(db, 'users'), 
      where('referrerInstanceID', '==', auth.currentUser.uid)
    );
    onSnapshot(q, (snap) => {
      connections.value = snap.docs.map(doc => ({
        id: doc.id,
        timestamp: doc.data().timestamp?.toDate().toLocaleDateString() || 'RECENT'
      }));
    });
  }
};

onMounted(() => initConnectionSighting());
</script>

<style scoped>
.text-glow { text-shadow: 0 0 15px rgba(0, 229, 255, 0.4); }
.shadow-glow { box-shadow: 0 0 30px rgba(0, 229, 255, 0.1) !important; }
.shadow-info { box-shadow: 0 0 20px rgba(0, 229, 255, 0.3); }
.font-black { font-weight: 900; }
.tiny { font-size: 0.65rem; }
.extra-tiny { font-size: 0.55rem; padding: 2px 4px; }
.italic { font-style: italic; }
</style>