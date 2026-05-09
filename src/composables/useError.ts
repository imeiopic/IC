// src/composables/useError.ts
import { ref } from 'vue';

const globalError = ref<string | null>(null);

export function useError() {
  const clearError = () => {
    globalError.value = null;
  };

  return {
    globalError,
    clearError
  };
}