import { ref } from 'vue';
import type { App } from 'vue';

// Reactive state for global error visibility
const lastSubstrateError = ref<string | null>(null);
const lastSubstrateSuccess = ref<string | null>(null);

export function useErrorSubstrate() {
  return {
    lastSubstrateError,
    lastSubstrateSuccess,
    clearError: () => {
      lastSubstrateError.value = null;
    },
    clearSuccess: () => {
      lastSubstrateSuccess.value = null;
    },
    notifySuccess: (message: string) => {
      lastSubstrateSuccess.value = message;
    }
  };
}

export default {
  install: (app: App) => {
    // Handle Vue-specific errors (render, watchers, etc.)
    app.config.errorHandler = (err: any, instance, info) => {
      const message = err?.message || 'Internal Protocol Error';
      console.error(`🚨 [Symmetry Breach] ${info}:`, err);
      lastSubstrateError.value = message;
    };

    // Handle Async failures (Firestore queries, Auth requests, etc.)
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const message = reason?.message || 'Async Substrate Failure';

      console.error('🚨 [Async Substrate Rejection]:', reason);
      lastSubstrateError.value = message;

      // Prevent the error from bubbling further to the console if desired
      // event.preventDefault();
    });
  }
};
