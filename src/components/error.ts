import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as Sentry from '@sentry/vue';

export const useErrorStore = defineStore('error', () => {
  // General global error message (can be used for other errors)
  const globalError = ref<string | null>(null);

  // State specifically for chunk loading errors
  const isChunkLoadError = ref(false);
  const chunkLoadErrorMessage = ref<string | null>(null);

  function setGlobalError(message: string) {
    globalError.value = message;
    Sentry.captureMessage(message, 'error');
  }

  function clearGlobalError() {
    globalError.value = null;
  }

  function setChunkLoadError(message: string) {
    isChunkLoadError.value = true;
    chunkLoadErrorMessage.value = message;
    console.error('CHUNK_LOAD_ERROR:', message); // Log the error for debugging
    
    Sentry.captureMessage(`Chunk Load Failure: ${message}`, {
      level: 'fatal',
      tags: { error_type: 'chunk_load' },
      extra: { message }
    });
  }

  function clearChunkLoadError() {
    isChunkLoadError.value = false;
    chunkLoadErrorMessage.value = null;
  }

  return { globalError, isChunkLoadError, chunkLoadErrorMessage, setGlobalError, clearGlobalError, setChunkLoadError, clearChunkLoadError };
});