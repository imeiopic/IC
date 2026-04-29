import { ref, computed, watch } from 'vue';
import { auth } from '../firebase';
import { onIdTokenChanged, type User } from 'firebase/auth';

// Singleton state to ensure consistency across components
const currentUser = ref<User | null>(null);
const claims = ref<Record<string, any>>({});
const isInitialized = ref(false);

// Listen for auth changes, including token refreshes
onIdTokenChanged(auth, async (user) => {
  currentUser.value = user;
  if (user) {
    const tokenResult = await user.getIdTokenResult();
    claims.value = tokenResult.claims;
  } else {
    claims.value = {};
  }
  isInitialized.value = true;
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
    ensureAuthInitialized
  };
}