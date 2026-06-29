import { ref, computed, watch } from 'vue';
import { auth, db } from '@/firebase';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import type { AppUser } from '@/types/auth';

// Singleton state to ensure consistency across components
const currentUser = ref<AppUser | null>(null);
const claims = ref<Record<string, any>>({});
const isInitialized = ref(false);
let unsubscribeProfile: Unsubscribe | null = null;

// Listen for auth changes, including token refreshes
onIdTokenChanged(auth, async (user) => {
  // 1. Clean up any existing Firestore listener to prevent memory leaks
  if (unsubscribeProfile) {
    unsubscribeProfile();
    unsubscribeProfile = null;
  }

  if (user) {
    // 2. Refresh Custom Claims (Admin, Editor, etc.)
    const tokenResult = await user.getIdTokenResult();
    claims.value = tokenResult.claims;

    // 3. Setup real-time sync with the Firestore 'users' collection
    const userRef = doc(db, 'users', user.uid);
    unsubscribeProfile = onSnapshot(userRef, async (snap) => {
      if (!snap.exists()) {
        // Automatically create the document if it doesn't exist
        try {
          await setDoc(
            userRef,
            {
              email: user.email,
              role: 'buyer', // Default role for new entities
              status: 'INITIALIZED',
              createdAt: serverTimestamp(),
            },
            { merge: true }
          );
          // The next snapshot iteration will handle setting currentUser and isInitialized
          return;
        } catch (error) {
          console.error('[useAuth] Firestore user auto-creation failed:', error);
          // Fallback to basic auth user so the app can still function
          currentUser.value = user as AppUser;
        }
      } else {
        // Merge Auth User with Firestore data to fulfill the AppUser interface
        currentUser.value = Object.assign(user, snap.data()) as AppUser;
      }
      isInitialized.value = true;
    });
  } else {
    currentUser.value = null;
    claims.value = {};
    isInitialized.value = true;
  }
});

export function useAuth() {
  const isAdmin = computed(() => !!claims.value.admin);
  const isEditor = computed(() => !!claims.value.editor);
  const isSystem = computed(() => !!claims.value.system);

  // Helper to wait for the initial auth/claims load
  const ensureAuthInitialized = async (): Promise<User | null> => {
    if (isInitialized.value) return currentUser.value;
    return new Promise((resolve) => {
      const unwatch = watch(isInitialized, (val) => {
        if (val) {
          unwatch();
          resolve(currentUser.value);
        }
      });
    });
  };

  // Useful if you know a claim was just granted and want to skip the 1-hour cache
  const refreshClaims = async () => {
    if (auth.currentUser) {
      const tokenResult = await auth.currentUser.getIdTokenResult(true);
      claims.value = tokenResult.claims;
    }
  };

  return {
    user: currentUser,
    claims,
    isInitialized,
    isAdmin,
    isEditor,
    isSystem,
    refreshClaims,
    ensureAuthInitialized,
  };
}
