import { ref } from 'vue';

export interface GlobalError {
  id: string;
  message: string;
}

// Defining the state outside the function ensures it is shared 
// across every component that imports this composable.
const errors = ref<GlobalError[]>([]);

export function useGlobalError() {
  const setError = (message: string) => {
    if (!message) {
      errors.value = []; // Maintain existing clear-on-empty behavior
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    errors.value.push({ id, message });

    setTimeout(() => {
      removeError(id);
    }, 5000);
  };

  const removeError = (id: string) => {
    errors.value = errors.value.filter((e) => e.id !== id);
  };

  const clearError = () => {
    errors.value = [];
  };

  return {
    errors,
    setError,
    clearError,
    removeError,
  };
}