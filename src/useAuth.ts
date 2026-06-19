import { ref } from 'vue'; // Removed onMounted, onUnmounted
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { auth } from './firebase'; // Assuming 'auth' is exported from firebase.ts

// Reactive state for authentication
const user = ref<User | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// A promise that resolves when the initial auth state is determined
let authInitializedPromise: Promise<User | null>;
let resolveAuthInitialized: ((value: User | null) => void) | null = null;

// Initialize the promise
authInitializedPromise = new Promise((resolve) => {
  resolveAuthInitialized = resolve;
});

// Function to start the Firebase Auth state listener
// This should be called once at application startup (e.g., in main.ts or Pinia store)
export function startAuthListener() {
  // This listener will persist for the lifetime of the application
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
    isLoading.value = false;
    if (resolveAuthInitialized) {
      resolveAuthInitialized(firebaseUser);
      resolveAuthInitialized = null; // Ensure it's only resolved once
    }
    // No explicit unsubscribe here as this listener is intended to be global and persistent.
  });
}

/**
 * Composable for managing Firebase Authentication state and actions.
 */
export function useAuth() {
  const clearError = () => {
    error.value = null;
  };

  const signIn = async (email: string, password: string) => {
    isLoading.value = true;
    clearError();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e: any) {
      error.value = e.message;
      return { success: false, error: e.message };
    } finally {
      isLoading.value = false;
    }
  };

  const signUp = async (email: string, password: string) => {
    isLoading.value = true;
    clearError();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e: any) {
      error.value = e.message;
      return { success: false, error: e.message };
    } finally {
      isLoading.value = false;
    }
  };

  const signOutUser = async () => {
    isLoading.value = true;
    clearError();
    try {
      await signOut(auth);
      return { success: true };
    } catch (e: any) {
      error.value = e.message;
      return { success: false, error: e.message };
    } finally {
      isLoading.value = false;
    }
  };

  const resetPassword = async (email: string) => {
    isLoading.value = true;
    clearError();
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent.' };
    } catch (e: any) {
      error.value = e.message;
      return { success: false, error: e.message };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Returns a promise that resolves with the current user once the initial
   * authentication state has been determined. Useful for router guards.
   */
  const authInitialized = (): Promise<User | null> => {
    return authInitializedPromise;
  };

  return {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOutUser,
    resetPassword,
    authInitialized,
    clearError,
  };
}