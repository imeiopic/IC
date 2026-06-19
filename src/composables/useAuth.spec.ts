import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from './useAuth';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/firebase';

// 1. Capture the globally registered auth callback
let authStateCallback: (user: any) => Promise<void>;

// 2. Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  onIdTokenChanged: vi.fn((authInstance, callback) => {
    // Steal the callback so we can manually trigger Firebase auth events
    authStateCallback = callback;
    return vi.fn(); // Mock the unsubscribe function
  }),
}));

// 3. Mock the Firebase app instance
vi.mock('@/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('useAuth.ts Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 4. Reset the singleton state before each test so they don't pollute each other
    const { isInitialized, user, claims } = useAuth();
    isInitialized.value = false;
    user.value = null;
    claims.value = {};
    auth.currentUser = null as any;
  });

  it('initializes properly with an unauthenticated user', async () => {
    const { user, claims, isInitialized, isAdmin, isEditor, isSystem } = useAuth();

    // Simulate Firebase returning no user
    await authStateCallback(null);

    expect(isInitialized.value).toBe(true);
    expect(user.value).toBeNull();
    expect(claims.value).toEqual({});
    expect(isAdmin.value).toBe(false);
    expect(isEditor.value).toBe(false);
    expect(isSystem.value).toBe(false);
  });

  it('fetches claims and sets reactive state for an authenticated user', async () => {
    const { user, claims, isAdmin, isEditor, isSystem } = useAuth();

    const mockUser = {
      uid: 'vector-123',
      getIdTokenResult: vi.fn().mockResolvedValue({
        claims: { admin: true, system: true },
      }),
    };

    // Simulate Firebase returning a logged-in user
    await authStateCallback(mockUser);

    expect(user.value).toBe(mockUser);
    expect(mockUser.getIdTokenResult).toHaveBeenCalled();
    expect(claims.value).toEqual({ admin: true, system: true });

    expect(isAdmin.value).toBe(true);
    expect(isSystem.value).toBe(true);
    expect(isEditor.value).toBe(false); // Was not included in the mock claims
  });

  it('ensureAuthInitialized returns immediately if already initialized', async () => {
    const { ensureAuthInitialized, isInitialized, user } = useAuth();

    // Force the initialized state
    isInitialized.value = true;
    user.value = { uid: 'quick-user' } as any;

    const result = await ensureAuthInitialized();
    expect(result).toEqual({ uid: 'quick-user' });
  });

  it('ensureAuthInitialized waits for initialization if not yet initialized', async () => {
    const { ensureAuthInitialized, isInitialized } = useAuth();
    const mockUser = {
      uid: 'delayed-user',
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: {} }),
    };

    // Call the function WITHOUT awaiting it yet to trigger the Vue watch() logic
    const initPromise = ensureAuthInitialized();

    // Simulate Firebase finally responding a few milliseconds later
    setTimeout(() => {
      authStateCallback(mockUser);
    }, 10);

    // Now await it. The watcher inside ensureAuthInitialized should resolve this promise!
    const result = await initPromise;

    expect(result).toBe(mockUser);
    expect(isInitialized.value).toBe(true);
  });

  it('refreshClaims forces a token refresh and updates claims', async () => {
    const { refreshClaims, claims } = useAuth();

    const mockUser = {
      uid: 'vector-123',
      getIdTokenResult: vi
        .fn()
        .mockResolvedValueOnce({ claims: { editor: true } }) // Initial load
        .mockResolvedValueOnce({ claims: { editor: true, admin: true } }), // After force refresh
    };

    // 1. Execute initial login
    auth.currentUser = mockUser as any;
    await authStateCallback(mockUser);

    expect(claims.value).toEqual({ editor: true });

    // 2. Call refreshClaims
    await refreshClaims();

    // 3. Verify that getIdTokenResult was called with 'true' to force a network refresh
    expect(mockUser.getIdTokenResult).toHaveBeenCalledWith(true);
    expect(claims.value).toEqual({ editor: true, admin: true });
  });
});
