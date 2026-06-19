/**
 * Global Error composable
 */
import { ref } from 'vue';

const error = ref<string | null>(null);

export function useGlobalError() {
  function setError(message: string) {
    error.value = message;
  }

  function clearError() {
    error.value = null;
  }

  return {
    error,
    setError,
    clearError,
  };
}

export default useGlobalError;
