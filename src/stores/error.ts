import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Pinia Store for global error handling.
 * Manages a single reactive `globalError` state and provides actions to set and clear it.
 */
export const useErrorStore = defineStore('error', () => {
  const globalError = ref<string | null>(null);

  function setGlobalError(message: string) {
    globalError.value = message;
  }

  function clearGlobalError() {
    globalError.value = null;
  }

  return { globalError, setGlobalError, clearGlobalError };
});
