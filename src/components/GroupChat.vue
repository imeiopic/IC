<template>
  <div class="chat-sanctum d-flex flex-column h-100 bg-obsidian border border-zinc-800 rounded-3 overflow-hidden">
    <header class="chat-header p-3 bg-zinc-900 border-bottom border-zinc-800 d-flex justify-content-between align-items-center">
      <div>
        <h6 class="text-gold font-black m-0 uppercase italic">{{ activeGroup?.name || 'SELECT_NODE' }}</h6>
        <span class="tiny text-success font-mono">{{ activeGroup?.members?.length || 0 }} NODES_CONNECTED</span>
      </div>
      <div class="tiny text-zinc-500 font-mono">7.83Hz_ENCRYPTED</div>
    </header>

    <div class="message-thread flex-grow-1 p-3 overflow-auto" ref="threadScroll">
      <div v-for="(msg, i) in messages" :key="i" 
           :class="['msg-bubble mb-3 d-flex flex-column', msg.senderId === user.uid ? 'align-items-end' : 'align-items-start']">
        <span class="tiny text-zinc-500 font-mono mb-1">{{ msg.senderName }}</span>
        <div :class="['p-2 rounded-3 small border', msg.senderId === user.uid ? 'bg-gold text-black border-gold' : 'bg-black text-white border-zinc-700']">
          {{ msg.text }}
        </div>
      </div>
    </div>

    <footer class="chat-footer p-3 bg-zinc-900 border-top border-zinc-800">
      <form @submit.prevent="sendMessage" class="d-flex gap-2">
        <input 
          v-model="newMessage" 
          type="text" 
          class="form-control bg-black border-zinc-700 text-white font-mono tiny" 
          placeholder="TRANSMIT_SIGNAL..."
          :disabled="!activeGroupId"
        />
        <CButton type="submit" color="gold" class="font-black px-3" :disabled="!newMessage.trim()">
          <i class="bi bi-send-fill"></i>
        </CButton>
      </form>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { db } from './firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { CButton } from '@coreui/vue';

const props = defineProps<{ activeGroupId: string | null }>();
const { user } = useAuth();
const messages = ref<any[]>([]);
const newMessage = ref('');
const activeGroup = ref<any>(null);
const threadScroll = ref<HTMLElement | null>(null);

// Watch for group selection to ground the listener
watch(() => props.activeGroupId, (newId) => {
  if (newId) {
    syncGroupData(newId);
    listenToThread(newId);
  }
}, { immediate: true });

async function syncGroupData(id: string) {
  const gSnap = await getDoc(doc(db, 'groups', id));
  if (gSnap.exists()) activeGroup.value = gSnap.data();
}

function listenToThread(id: string) {
  const q = query(
    collection(db, 'messages'),
    where('groupId', '==', id),
    orderBy('createdAt', 'asc')
  );

  onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(d => d.data());
    scrollToBottom();
  });
}

async function sendMessage() {
  if (!newMessage.value.trim() || !props.activeGroupId || !user.value) return;

  const payload = {
    text: newMessage.value,
    senderId: user.value.uid,
    senderName: user.value.displayName || 'ANON_NODE',
    groupId: props.activeGroupId,
    createdAt: serverTimestamp()
  };

  await addDoc(collection(db, 'messages'), payload);
  newMessage.value = '';
}

const scrollToBottom = () => {
  nextTick(() => {
    if (threadScroll.value) {
      threadScroll.value.scrollTop = threadScroll.value.scrollHeight;
    }
  });
};
</script>

<style scoped>
.chat-sanctum { height: 600px; max-height: 80vh; }
.bg-obsidian { background-color: #050505; }
.text-gold { color: #c5a059 !important; }
.bg-gold { background-color: #c5a059 !important; }
.border-gold { border-color: #c5a059 !important; }
.font-black { font-weight: 900; }
.tiny { font-size: 0.65rem; }
.italic { font-style: italic; }
.uppercase { text-transform: uppercase; }

.message-thread::-webkit-scrollbar { width: 4px; }
.message-thread::-webkit-scrollbar-thumb { background: #1a1a1a; }

.msg-bubble { max-width: 80%; }
</style>