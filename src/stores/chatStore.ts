/**
 * Chat Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Array<{ id: string; content: string; author: string }>>([]);

  function addMessage(content: string, author: string) {
    messages.value.push({
      id: Date.now().toString(),
      content,
      author,
    });
  }

  function clearMessages() {
    messages.value = [];
  }

  return {
    messages,
    addMessage,
    clearMessages,
  };
});
