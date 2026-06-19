/**
 * IOPIC DIC Client - User State Manager
 * Updated per June 1st Documentation Standard
 */
import { auth, db } from '@/firebase';
import {
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

// 1. Production Interfaces
export interface UserMeshState {
  role?: string;
  isMember?: boolean;
  equity_grounded?: boolean;
  anchorTier?: string;
  multiplier?: number;
  iowb?: { balance: number };
  profilePictureUrl?: string;
  displayName?: string;
}

export const useUserStore = defineStore('userStore', () => {
  // Core Auth State
  const currentUser = ref<User | null>(null);
  const isLoadingAuth = ref(true);
  const isInitialLoad = ref(true);

  // Node / User State
  const userRole = ref<string | null>(null);
  const isMemberRef = ref<boolean>(false);
  const isGroundedRef = ref<boolean>(false);
  const anchorTier = ref<string | null>(null);
  const nodeMultiplier = ref<number>(1.0);
  const userEquity = ref<number>(0);
  const profilePictureUrl = ref<string | null>(null);
  const userDisplayName = ref<string | null>(null);
  const isLoadingRole = ref(false);

  const unsubscribes: Unsubscribe[] = [];

  // 2. Production Computed Keys
  const isAuthenticated = computed(() => !!currentUser.value);
  const isMember = computed(() => isMemberRef.value);
  const isGrounded = computed(() => isGroundedRef.value); // True if BSMolecule checkout succeeded
  const isAdmin = computed(() => userRole.value === 'admin');

  // Legacy or auxiliary role checks (optional)
  const isBuyer = computed(() => userRole.value === 'buyer');
  const isDriver = computed(() => userRole.value === 'driver');

  /**
   * Checks if the current user has the required role(s).
   * @param roles A single role string or an array of allowed roles.
   */
  const hasRole = (roles: string | string[]) => {
    if (!userRole.value) return false;
    if (Array.isArray(roles)) {
      return roles.includes(userRole.value);
    }
    return userRole.value === roles;
  };

  /**
   * Checks if the user holds a specific or higher Anchor Tier
   * Useful for Sovereign_Apex access gating
   */
  const hasAnchorTier = (tierId: string) => {
    return anchorTier.value === tierId;
  };

  // Internal promise for navigation guards (The Sovereign Shield)
  let resolveInit: (user: User | null) => void;
  const initPromise = new Promise<User | null>((resolve) => {
    resolveInit = resolve;
  });

  const authInitialized = (): Promise<User | null> => initPromise;

  const clearSubscriptions = () => {
    unsubscribes.forEach(unsub => unsub());
    unsubscribes.length = 0;
  };

  const initializeAuth = () => {
    onAuthStateChanged(auth, (user) => {
      currentUser.value = user;
      isLoadingAuth.value = false;
      
      if (isInitialLoad.value) {
        isInitialLoad.value = false;
        resolveInit(user);
      }

      clearSubscriptions();

      if (user) {
        isLoadingRole.value = true;
        const userRef = doc(db, 'nodes', user.uid); // Ensure this matches your target collection (users/nodes)

        const unsub = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserMeshState;

            // Core Identity
            userRole.value = data.role || null;
            userDisplayName.value = data.displayName || null;
            profilePictureUrl.value = data.profilePictureUrl || null;

            // Production & Mesh State Keys
            isMemberRef.value = data.isMember ?? false;
            isGroundedRef.value = data.equity_grounded ?? false;
            anchorTier.value = data.anchorTier || null;
            nodeMultiplier.value = data.multiplier ?? 1.0;
            userEquity.value = data.iowb?.balance ?? 0;
          }
          isLoadingRole.value = false;
        }, (error) => {
          console.error("Firestore snapshot error [Node Validation]:", error);
          isLoadingRole.value = false;
        });
        unsubscribes.push(unsub);
      } else {
        // Reset state on disconnect
        userRole.value = null;
        isMemberRef.value = false;
        isGroundedRef.value = false;
        anchorTier.value = null;
        nodeMultiplier.value = 1.0;
        userEquity.value = 0;
        profilePictureUrl.value = null;
        userDisplayName.value = null;
        isLoadingRole.value = false;
      }
    });
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    clearSubscriptions();
  };

  const signInAnonymously = async () => {
    await firebaseSignInAnonymously(auth);
  };

  return {
    // State
    currentUser,
    userRole,
    userEquity,
    profilePictureUrl,
    userDisplayName,
    anchorTier,
    nodeMultiplier,

    // Loading States
    isLoadingAuth,
    isLoadingRole,
    isInitialLoad,

    // Computed Production Keys
    isAuthenticated,
    isMember,
    isGrounded,
    isAdmin,
    isBuyer,
    isDriver,

    // Methods
    authInitialized,
    hasRole,
    hasAnchorTier,
    initializeAuth,
    clearSubscriptions,
    logout,
    signInAnonymously
  };
});
