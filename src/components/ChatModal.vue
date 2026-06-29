<template>
  <CModal :visible="isVisible" @close="$emit('close')" size="lg" class="chat-modal">
    <CModalHeader class="bg-zinc-900 border-bottom border-zinc-800">
      <CModalTitle class="text-info font-black italic">
        <i class="bi bi-chat-dots-fill me-2"></i>RIDE_CHAT ({{
          chatStore.activeRideId?.substring(0, 8)
        }}...)
      </CModalTitle>
      <CButtonClose class="text-white" @click="$emit('close')"></CButtonClose>
    </CModalHeader>
    <CModalBody class="bg-zinc-950 text-white chat-body">
      <div v-if="chatStore.isLoadingMessages" class="text-center py-5">
        <CSpinner color="info" />
        <p class="mt-2 text-info">LOADING_MESSAGES...</p>
      </div>
      <div v-else class="messages-container" @scroll="handleScroll">
        <!-- Spacer to ensure scrollbar appears if content is short -->
        <div v-if="chatStore.currentMessages.length === 0" class="text-center py-5 opacity-50">
          NO_MESSAGES_YET. START_THE_CONVERSATION!
        </div>
        <!-- Messages -->
        <div
          v-for="message in chatStore.currentMessages"
          :key="message.id"
          class="message-item mb-2"
        >
          <div
            :class="[
              'message-bubble',
              {
                'my-message': message.senderId === userStore.currentUser?.uid,
                'other-message': message.senderId !== userStore.currentUser?.uid,
              },
            ]"
          >
            <div class="sender-info small text-zinc-400 mb-1">
              {{
                message.senderId === userStore.currentUser?.uid
                  ? 'YOU'
                  : message.senderId.substring(0, 8) + '...'
              }}
              <span class="timestamp ms-2">{{ formatTimestamp(message.timestamp) }}</span>
            </div>
            <p class="message-text m-0">{{ message.text }}</p>
            <div
              v-if="
                message.senderId === userStore.currentUser?.uid &&
                message.readBy &&
                message.readBy.length > 1
              "
              class="read-receipts mt-1 text-end"
            >
              <i class="bi bi-check-all text-success small" title="Read"></i>
              <!-- You could add avatars here for each reader if needed -->
            </div>
          </div>
        </div>
        <div ref="messagesEnd"></div>
      </div>
    </CModalBody>
    <CModalFooter class="bg-zinc-900 border-top border-zinc-800">
      <CForm @submit.prevent="sendMessage" class="d-flex w-100">
        <CFormInput
          v-model="newMessage"
          placeholder="TYPE_YOUR_MESSAGE..."
          class="bg-zinc-800 border-zinc-700 text-white font-mono flex-grow-1 me-2"
          @keyup.enter="sendMessage"
          :disabled="!userStore.isAuthenticated || !chatStore.activeRideId"
        />
        <CButton
          color="info"
          type="submit"
          :disabled="!newMessage.trim() || !userStore.isAuthenticated || !chatStore.activeRideId"
        >
          <i class="bi bi-send-fill"></i>
        </CButton>
      </CForm>
    </CModalFooter>
  </CModal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useChatStore } from '../stores/chatStore';
import { useUserStore } from '../stores/userStore';
import { type Timestamp } from 'firebase/firestore';

const props = defineProps<{
  // Removed unused props: mapLat, mapLng, mapMarkerText, showMap
  isVisible: boolean;
  rideId: string | null;
}>();

const emit = defineEmits(['close']);

const chatStore = useChatStore();
const userStore = useUserStore();

const newMessage = ref('');
const messagesEnd = ref<HTMLDivElement | null>(null);
const messageObserver = ref<IntersectionObserver | null>(null);
const messagesContainer = ref<HTMLDivElement | null>(null);

watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal && props.rideId) {
      chatStore.startChat(props.rideId);
      nextTick(() => {
        scrollToBottom();
        setupIntersectionObserver();
      });
    } else {
      chatStore.stopChat();
      disconnectIntersectionObserver();
    }
  }
);

watch(
  () => chatStore.messages,
  () => {
    scrollToBottom();
  }
);

const sendMessage = () => {
  if (newMessage.value.trim()) {
    chatStore.sendMessage(newMessage.value);
    newMessage.value = '';
  }
};

const setupIntersectionObserver = () => {
  disconnectIntersectionObserver(); // Ensure previous observer is disconnected

  const options = {
    root: messagesContainer.value, // Observe within the scrollable chat body
    rootMargin: '0px',
    threshold: 0.5, // Trigger when 50% of the message is visible
  };

  messageObserver.value = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const messageElement = entry.target as HTMLElement;
        const messageId = messageElement.dataset.messageId;
        const senderId = messageElement.dataset.senderId;

        if (messageId && senderId !== userStore.currentUser?.uid) {
          // Mark as read only if it's not our own message
          chatStore.markMessageAsRead(messageId);
        }
      }
    });
  }, options);

  // Observe all message items
  document.querySelectorAll('.message-item').forEach((item) => {
    messageObserver.value?.observe(item);
  });
};

const disconnectIntersectionObserver = () => {
  messageObserver.value?.disconnect();
  messageObserver.value = null;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesEnd.value) {
      messagesEnd.value.scrollIntoView({ behavior: 'auto' }); // Use 'auto' for initial load, 'smooth' for new messages
    }
  });
};

const formatTimestamp = (timestamp: Timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Handle scroll to trigger observer for newly visible messages
const handleScroll = () => {
  // IntersectionObserver handles this automatically, but you might want to debounce
  // any manual scroll-related logic here if needed.
};
</script>

<style scoped>
.chat-modal .modal-content {
  background-color: #0d0d0d;
  border: 1px solid #00e5ff;
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.15);
}
.chat-body {
  position: relative; /* Needed for IntersectionObserver root */
  height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.messages-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 10px; /* Add some padding */
  justify-content: flex-end; /* Keep messages at the bottom */
}
.message-bubble {
  padding: 8px 12px;
  border-radius: 15px;
  max-width: 75%;
  word-wrap: break-word;
}
.my-message {
  background-color: #007bff; /* Primary blue */
  align-self: flex-end;
  border-bottom-right-radius: 2px;
}
.other-message {
  background-color: #343a40; /* Dark grey */
  align-self: flex-start;
  border-bottom-left-radius: 2px;
}
.sender-info {
  font-size: 0.75rem;
}
.timestamp {
  font-size: 0.65rem;
  opacity: 0.7;
}
.message-text {
  font-size: 0.9rem;
}
.read-receipts {
  font-size: 0.7rem;
}
</style>
