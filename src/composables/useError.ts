import { computed } from 'vue';
import { useErrorStore } from '@/stores/error'; // Updated to use alias
import { ApiError } from '../../api'; // Corrected path

/**
 * Composable for global error handling, now powered by the Pinia `useErrorStore`.
 * This wrapper maintains compatibility with existing `useError()` calls.
 */
export function useError() {
  const errorStore = useErrorStore();

  /**
   * reportError: Centralized mechanism for identifying and broadcasting 
   * error states to the UI. It specifically handles ApiError by extracting
   * the descriptive messages returned by the backend.
   */
  const reportError = (err: any) => {
    let message = 'An unexpected system error occurred.';

    if (err instanceof ApiError) {
      message = err.message;
    } else if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }

    errorStore.setGlobalError(message);
    
    console.error('[GLOBAL_ERROR_HANDLER]:', err);
  };

  return {
    globalError: computed(() => errorStore.globalError),
    setGlobalError: errorStore.setGlobalError,
    clearError: errorStore.clearGlobalError,
    reportError,
  };
}