import { ref, readonly } from 'vue';
import { getAuth, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { app } from './firebase-config';

const user = ref<User | null>(null);
const isInitialized = ref(false);

const auth = getAuth(app);

// Global listener to keep 'user' reactive across the entire app
onAuthStateChanged(auth, (firebaseUser) => {
  user.value = firebaseUser;
  isInitialized.value = true;
});

/**
 * Composable to access and manage global authentication state.
 */
export function useAuth() {
  const logout = async () => {
    await signOut(auth);
  };

  /**
   * Returns a promise that resolves once the Firebase Auth state is initialized.
   * Useful for navigation guards to prevent "flash" redirects.
   */
  const ensureAuthInitialized = (): Promise<User | null> => {
    if (isInitialized.value) return Promise.resolve(user.value);
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        unsubscribe();
        resolve(u);
      });
    });
  };

  return {
    user: readonly(user),
    isInitialized: readonly(isInitialized),
    logout,
    ensureAuthInitialized,
  };
}