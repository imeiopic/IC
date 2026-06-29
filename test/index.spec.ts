import { router } from '@/router';
import { useAuth } from '@/useAuth';

// 1. Mock the useAuth composable so we can control clearance levels
vi.mock('@/useAuth', () => ({
  useAuth: vi.fn(),
}));

// 2. Mock the views to prevent Vitest from trying to resolve actual Vue files during routing
vi.mock('@/views/HomePage.vue', () => ({ default: { template: '<div/>' } }));
vi.mock('@/views/FeaturesPage.vue', () => ({ default: { template: '<div/>' } }));
vi.mock('@/views/PricingPage.vue', () => ({ default: { template: '<div/>' } }));
vi.mock('@/views/LoginPage.vue', () => ({ default: { template: '<div/>' } }));
vi.mock('@/views/DashboardPage.vue', () => ({ default: { template: '<div/>' } }));
vi.mock('@/views/AccessDeniedPage.vue', () => ({ default: { template: '<div/>' } }));
/* vi.mock("./src/views/EmailLogsDashboard.vue", () => ({
  default: { template: "<div/>" },
})); */

describe('Vue Router Navigation Guards', () => {
  // Helper function to dynamically change the mock return values for each test
  const setAuthState = (user: any, isAdmin = false, isEditor = false) => {
    vi.mocked(useAuth).mockReturnValue({
      ensureAuthInitialized: vi.fn().mockResolvedValue(user),
      // The router expects these to be computed refs, so we wrap them in an object with a 'value' property
      isAdmin: { value: isAdmin },
      isEditor: { value: isEditor },
    } as any);
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset the router to the public home page before each test
    setAuthState(null);
    await router.push('/');
    await router.isReady();
  });

  it('redirects unauthenticated users to /login when accessing protected routes', async () => {
    setAuthState(null); // Unauthenticated
    await router.push('/dashboard');

    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('redirects non-admin users to /403 when accessing /admin/email-logs', async () => {
    setAuthState({ uid: 'standard-user' }, false, false);
    await router.push('/admin/email-logs');

    expect(router.currentRoute.value.path).toBe('/403');
    expect(router.currentRoute.value.query.role).toBe('admin');
  });

  it('allows admin users to access /admin/email-logs', async () => {
    setAuthState({ uid: 'admin-user' }, true, false);
    await router.push('/admin/email-logs');

    expect(router.currentRoute.value.path).toBe('/admin/email-logs');
  });

  it('redirects non-editor users to /403 when accessing /dashboard', async () => {
    setAuthState({ uid: 'standard-user' }, false, false);
    await router.push('/dashboard');

    expect(router.currentRoute.value.path).toBe('/403');
    expect(router.currentRoute.value.query.role).toBe('editor');
  });

  it('allows editor users to access /dashboard', async () => {
    setAuthState({ uid: 'editor-user' }, false, true);
    await router.push('/dashboard');

    expect(router.currentRoute.value.path).toBe('/dashboard');
  });

  it('allows admin users to access /dashboard (admin implies editor clearance)', async () => {
    // This tests the `!isEditor.value && !isAdmin.value` logic in your router
    setAuthState({ uid: 'admin-user' }, true, false);
    await router.push('/dashboard');

    expect(router.currentRoute.value.path).toBe('/dashboard');
  });
});
