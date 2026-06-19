import { defineStore } from 'pinia';

export const useCriticalErrorStore = defineStore('criticalError', {
  state: () => ({
    isCriticalErrorActive: false,
    errorMessage: null as string | null
  }),
  actions: {
    /**
     * Activates the critical error state, triggering the ARC.vue override.
     * @param message An optional error message to display in ARC.vue.
     */
    activateCriticalError(message: string | null = null) {
      this.isCriticalErrorActive = true;
      this.errorMessage = message;
      console.error(
        `CRITICAL_ERROR_STORE: Critical error activated. ARC.vue override engaged. Message: ${message}`
      );
    },
    /**
     * Deactivates the critical error state.
     * This might be called by ARC.vue after recovery or by a system reset.
     */
    deactivateCriticalError() {
      this.isCriticalErrorActive = false;
      this.errorMessage = null;
      console.log(
        'CRITICAL_ERROR_STORE: Critical error deactivated. Returning to normal operation.'
      );
    }
  }
});
