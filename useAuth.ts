import { ref } from 'vue';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/firebase';

/**
 * Iopic Protocol: useAuth Substrate
 * 
 * Manages the reactive authentication state for the global mesh.
 * Provides 'user' and 'isInitialized' signals to the application.
 */
export function useAuth() {
  const user = ref<User | null>(null);
  const isInitialized = ref(false);

  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
    isInitialized.value = true;
  });

  return { user, isInitialized };
}
