import { defineStore } from 'pinia';
import { useAuth, startAuthListener } from '../useAuth'; // Import startAuthListener

/**
 * Pinia store for Firebase Authentication.
 * This store wraps the `useAuth` composable, making its reactive state
 * and authentication methods globally accessible.
 */
export const useAuthStore = defineStore('auth', () => {
  // Start the auth listener once when the store is created
  // This ensures the listener is set up globally and not tied to a component's lifecycle
  startAuthListener();

  return { ...useAuth() };
});