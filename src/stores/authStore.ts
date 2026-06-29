import { defineStore } from 'pinia';
import { useUserStore } from './userStore';
import { useMeshStore } from './meshStore'; // Added to track thread-auth

export const useAuthStore = defineStore('authStore', () => {
  const userStore = useUserStore();
  const meshStore = useMeshStore();

  /**
   * SECURITY_GATE: Synchronizes user state with Mesh integrity.
   */
  async function ensureAuthInitialized(): Promise<boolean> {
    if (userStore.isInitialLoad) {
      await userStore.initializeAuth();
    }
    
    // Additional Logic: Ensure the authenticated node is synchronized with the mesh
    if (userStore.isAuthenticated && meshStore.state === 'DISCONNECTED') {
      await meshStore.initiateHandshake();
    }
    
    return userStore.isAuthenticated;
  }

  /**
   * SOVEREIGN_CHECK: Guards against unauthorized access.
   * Now includes thread-lock validation.
   */
  function canAccess(requiredRole?: string, threadId?: number): boolean {
    if (!userStore.isAuthenticated) return false;
    
    // Role validation
    if (requiredRole && userStore.identity.role !== requiredRole) return false;
    
    // Thread-lock validation: If a resource is thread-specific, verify access
    if (threadId && meshStore.activeThreads !== threadId) {
       console.warn(`[SECURITY_ALERT] Attempted cross-thread access: T-${threadId}`);
       return false;
    }

    return true;
  }

  return {
    ensureAuthInitialized,
    canAccess,
    isAuthenticated: () => userStore.isAuthenticated,
  };
});