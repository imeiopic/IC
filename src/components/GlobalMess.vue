<template>
  <CCard class="bg-zinc-900 border-info text-white shadow-glow mb-4">
    <CCardHeader class="font-black italic text-info d-flex justify-content-between align-items-center">
      <span>GLOBAL_MESH_INVITATION</span>
      <CBadge color="info" class="animate-pulse">BROADCAST_READY</CBadge>
    </CCardHeader>
    <CCardBody>
      <div class="invitation-logic p-3 bg-black rounded border border-zinc-800 mb-3">
        <p class="tiny text-zinc-500 uppercase mb-3">Target: ALL_UNGROUNDED_ENTITIES</p>
        
        <CFormTextarea 
          v-model="inviteMessage" 
          placeholder="ENTER_INVITATION_MANIFESTO..."
          rows="3"
          class="bg-zinc-950 border-zinc-800 text-info font-mono small mb-3"
        />

        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="flex-grow-1">
            <label class="tiny text-zinc-500 d-block mb-1">EQUITY_BOND_SIGNAL</label>
            <CFormInput v-model="equityBond" type="number" class="bg-black border-zinc-800 text-white" />
          </div>
          <div class="flex-grow-1">
            <label class="tiny text-zinc-500 d-block mb-1">RESONANCE_FREQ</label>
            <CFormInput value="7.83Hz" disabled class="bg-black border-zinc-800 text-zinc-600" />
          </div>
        </div>

        <CButton 
          color="info" 
          variant="outline" 
          class="w-100 font-black italic py-2" 
          @click="broadcastGlobalInvitation"
          :disabled="isBroadcasting"
        >
          <i class="bi bi-broadcast me-2"></i>
          <span v-if="!isBroadcasting">DISPATCH_GLOBAL_PULSE</span>
          <span v-else class="vibrate">TRANSMITTING_TO_MESH...</span>
        </CButton>
      </div>

      <div class="broadcast-status tiny font-mono text-zinc-500">
        LAST_GLOBAL_SYNC: {{ lastBroadcast || 'NEVER' }}
      </div>
    </CCardBody>
  </CCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { db, rtdb } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as dbRef, set } from 'firebase/database';
import { person01 } from '../personModel';

const inviteMessage = ref("CONNECT TO THE 16-THREAD REALITY. GROUND YOUR NODE. CLAIM YOUR EQUITY.");
const equityBond = ref(1600);
const isBroadcasting = ref(false);
const lastBroadcast = ref<string | null>(null);

const broadcastGlobalInvitation = async () => {
  if (isBroadcasting.value) return;
  isBroadcasting.value = true;

  try {
    // 1. Dispatch high-velocity pulse to Realtime Database
    // This triggers the DIC Client 'handshake' listener for all active users
    await set(dbRef(rtdb, 'system/global_invitation'), {
      message: inviteMessage.value,
      bond: equityBond.value,
      origin: person01.id,
      timestamp: Date.now(),
      active: true
    });

    // 2. Log the invitation in the permanent Firestore Ledger
    await addDoc(collection(db, 'invitation_history'), {
      type: 'GLOBAL_BROADCAST',
      senderID: person01.id,
      message: inviteMessage.value,
      bondAmount: equityBond.value,
      timestamp: serverTimestamp()
    });

    lastBroadcast.value = new Date().toLocaleTimeString();
    alert('GLOBAL_PULSE_GROUNDED: Invitation transmitted to the mesh.');
    
    // Reset RTD pulse after 5 seconds to prevent loop-drag
    setTimeout(() => {
      set(dbRef(rtdb, 'system/global_invitation/active'), false);
    }, 5000);

  } catch (err) {
    console.error("BROADCAST_FAILURE: Logic fracture in the bus.");
  } finally {
    isBroadcasting.value = false;
  }
};
</script>