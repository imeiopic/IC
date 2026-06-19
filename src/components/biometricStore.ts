import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBiometricStore = defineStore('biometric', () => {
  // State to track if the user has been successfully sighted
  // Initialize from localStorage for persistence across browser sessions
  const isSighted = ref(localStorage.getItem('isSighted') === 'true');

  // Action to update the sighting status and persist it
  const setSighted = (status: boolean) => {
    isSighted.value = status;
    localStorage.setItem('isSighted', String(status));
  };

  return {
    isSighted,
    setSighted
  };
});
