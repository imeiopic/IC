import { ref } from 'vue';

// Shared state singleton
const globalError = ref<string | null>(null);

/**
 * Global Error Protocol Composable.
 * Used to capture and display critical system failures.
 */
export function useError() {
  const reportError = (err: any) => {
    console.error("Critical Protocol Failure Captured:", err);
    // Standardize the error message for the UI
    globalError.value = err?.message || String(err);
  };

  const clearError = () => {
    globalError.value = null;
  };

  return { globalError, reportError, clearError };
}