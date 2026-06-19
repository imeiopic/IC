import { computed } from 'vue';
import { useSuccessStore } from './stores/success';

/**
 * Composable for global success messaging, powered by the Pinia `useSuccessStore`.
 * Provides a consistent interface similar to useError().
 */
export function useSuccess() {
  const successStore = useSuccessStore();

  return {
    /**
     * Reactive success message.
     */
    successMessage: computed(() => successStore.successMessage),

    /**
     * Methods to manage the success substrate.
     */
    setSuccessMessage: successStore.setSuccessMessage,
    clearSuccessMessage: successStore.clearSuccessMessage,
  };
}
