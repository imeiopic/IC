<template>
  <div class="py-4">
    <h4 class="text-center italic font-black uppercase">MESH_CONNECTION</h4>
    <ul class="nav nav-pills nav-fill mb-3 bg-zinc-900 rounded p-1">
      <li class="nav-item">
        <button
          class="nav-link btn-sm py-1"
          :class="{ active: connectionMode === 'find' }"
          @click="connectionMode = 'find'"
        >
          CONNECT
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link btn-sm py-1"
          :class="{ active: connectionMode === 'invites' }"
          @click="checkInvites"
        >
          INVITES ({{ invites.length }})
        </button>
      </li>
    </ul>
    <div v-if="connectionMode === 'find'" class="text-start">
      <input
        v-model="peerId"
        type="text"
        class="form-control bg-black border-zinc-700 text-white mb-2 tiny"
        placeholder="PEER_OR_GROUP_ID"
      />
      <button class="btn btn-success w-100 font-black tiny" @click="initiateHandshake">
        INITIATE_HANDSHAKE
      </button>
      <button class="btn btn-link text-info w-100 mt-3 tiny font-mono" @click="emit('finalize')">
        FINALIZE_MESH_ENTRY
      </button>
    </div>
    <div v-if="connectionMode === 'invites'" class="invite-list">
      <div
        v-for="inv in invites"
        :key="inv.id"
        class="d-flex justify-content-between align-items-center bg-zinc-900 p-2 mb-2 rounded border border-zinc-800"
      >
        <span class="tiny font-mono">{{ inv.fromName }}</span>
        <button class="btn btn-success btn-xs px-2 py-1 tiny" @click="acceptInvite(inv)">
          ACCEPT
        </button>
      </div>
      <button class="btn btn-link text-info w-100 mt-3 tiny font-mono" @click="emit('finalize')">
        FINALIZE_MESH_ENTRY
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { db } from '@/firebase';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { ref } from 'vue';

const emit = defineEmits(['finalize']);

const props = defineProps<{
  userId?: string;
}>();

const connectionMode = ref('find');
const peerId = ref('');
const invites = ref<any[]>([]);

const checkInvites = async () => {
  connectionMode.value = 'invites';
  if (!props.userId) return;
  const q = query(
    collection(db, 'invites'),
    where('toId', '==', props.userId),
    where('status', '==', 'pending')
  );
  const snap = await getDocs(q);
  invites.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const initiateHandshake = async () => {
  if (peerId.value && props.userId) {
    alert(`Handshake Pulse Sent: ${peerId.value}`);
    peerId.value = '';
  }
};

const acceptInvite = async (invite: any) => {
  if (!props.userId) return;
  await updateDoc(doc(db, 'invites', invite.id), { status: 'accepted' });
  await checkInvites(); // Refresh the invite list after accepting
};
</script>