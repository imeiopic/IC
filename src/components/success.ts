// src/stores/success.ts
import { defineStore } from 'pinia';
import { useNotificationStore } from './notification'; // Import notification store

export const useSuccessStore = defineStore('success', () => {
  const notificationStore = useNotificationStore();

  const setSuccessMessage = (message: string, durationMs?: number) => {
    notificationStore.addNotification('success', message, undefined, durationMs);
  };

  const clearSuccessMessage = () => {
    // No direct clear needed here
  };

  // successMessage ref is no longer needed as notifications are managed by notificationStore
  return { setSuccessMessage, clearSuccessMessage };
});