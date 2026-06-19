import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useUserStore } from './userStore';

/**
 * @deprecated Use useUserStore instead. 
 * This remains as a proxy for the Sovereign Shield (Navigation Guards).
 */
export const useAuthStore = defineStore('authStore', () => {
  const userStore = useUserStore();

  const currentUser = computed(() => userStore.currentUser);
  const isInitialLoad = computed(() => userStore.isInitialLoad);
  const authInitialized = userStore.authInitialized;

  return {
    currentUser,
    isInitialLoad,
    authInitialized,
  };
});
