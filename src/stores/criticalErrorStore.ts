import { defineStore } from 'pinia';

export const useCriticalErrorStore = defineStore('criticalError', {
  state: () => ({
    criticalErrorMessage: null as string | null,
    isCriticalErrorActive: false
  }),
  actions: {
    /**
     * Activates a critical error with a given message.
     * @param message The error message to display.
     */
    activateCriticalError(message: string) {
      this.criticalErrorMessage = message;
      this.isCriticalErrorActive = true;
    },
    /**
     * Clears the current critical error.
     */
    clearCriticalError() {
      this.criticalErrorMessage = null;
      this.isCriticalErrorActive = false;
    }
  }
});
