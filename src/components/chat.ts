// src/stores/chat.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { useErrorStore } from './error';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: any; // Firebase Timestamp
  readBy?: string[]; // Array of user IDs who have read the message
}

export const useChatStore = defineStore('chat', () => {
  const errorStore = useErrorStore();

  const activeRideId = ref<string | null>(null);
  const messages = ref<ChatMessage[]>([]);
  const isLoadingMessages = ref(false);
  let messagesUnsubscribe: Unsubscribe | null = null;
  let currentUserId: string | null = null; // Store current user ID for read receipts

  const currentMessages = computed(() => messages.value);

  const startChat = (rideId: string) => {
    if (!auth.currentUser) {
      errorStore.setGlobalError('AUTHENTICATION_REQUIRED: Cannot start chat.');
      return;
    }
    if (activeRideId.value === rideId) return; // Already chatting in this ride

    stopChat(); // Stop any existing chat subscription
    currentUserId = auth.currentUser.uid; // Set current user ID

    activeRideId.value = rideId;
    isLoadingMessages.value = true;

    const messagesRef = collection(db, 'rideRequests', rideId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    messagesUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        messages.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatMessage[];
        isLoadingMessages.value = false;
      },
      (error) => {
        console.error('Error fetching chat messages:', error);
        errorStore.setGlobalError('Failed to load chat messages.');
        isLoadingMessages.value = false;
      }
    );
  };

  const stopChat = () => {
    messagesUnsubscribe?.();
    messagesUnsubscribe = null;
    activeRideId.value = null;
    messages.value = [];
    currentUserId = null;
    isLoadingMessages.value = false;
  };

  const sendMessage = async (text: string) => {
    if (!auth.currentUser || !activeRideId.value || !text.trim()) return;

    try {
      await addDoc(collection(db, 'rideRequests', activeRideId.value, 'messages'), {
        senderId: auth.currentUser.uid,
        text: text.trim(),
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      errorStore.setGlobalError('Failed to send message.');
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    if (!currentUserId || !activeRideId.value || !messageId) return;

    const messageRef = doc(db, 'rideRequests', activeRideId.value, 'messages', messageId);
    try {
      await updateDoc(messageRef, {
        readBy: arrayUnion(currentUserId),
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      // Don't show a global error for this, as it's a background operation
    }
  };

  return {
    activeRideId,
    messages,
    isLoadingMessages,
    currentMessages,
    startChat,
    stopChat,
    sendMessage,
    markMessageAsRead,
  };
});