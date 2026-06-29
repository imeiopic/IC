import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Pinia Store for global success notifications.
 * Manages a single reactive `successMessage` state.
 */
export const useSuccessStore = defineStore('success', () => {
  const successMessage = ref<string | null>(null);

  function setSuccessMessage(message: string) {
    successMessage.value = message;
  }

  function clearSuccessMessage() {
    successMessage.value = null;
  }

  return { successMessage, setSuccessMessage, clearSuccessMessage };
});
