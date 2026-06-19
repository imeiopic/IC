/**
 * User Store
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);

  const isLoggedIn = computed(() => currentUser.value !== null);

  function setUser(user: User) {
    currentUser.value = user;
  }

  function clearUser() {
    currentUser.value = null;
  }

  return {
    currentUser,
    isLoggedIn,
    setUser,
    clearUser,
  };
});
