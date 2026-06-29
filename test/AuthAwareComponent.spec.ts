import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { useAuth } from '../src/useAuth.ts'; // Adjust path as necessary
import DashboardPage from './src/DashboardPage.vue';

// 1. Mock the useAuth composable module
vi.mock('./src/useAuth', () => ({
  useAuth: vi.fn()
}));

// 2. Mock the Firebase Auth SDK directly to prevent initialization errors
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(() => Promise.resolve()),
  })),
  updateProfile: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn(),
}));

describe('Authentication Mocking Example', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when auth is not initialized', () => {
    // Simulate the "booting up" state
    vi.mocked(useAuth).mockReturnValue({
      user: ref(null),
      isInitialized: ref(false)
    } as any);

    const wrapper = mount(DashboardPage);
    expect(wrapper.text()).toContain('Accessing Personal Node...');
    expect(wrapper.find('.spinner-border').exists()).toBe(true);
  });

  it('renders user identity when logged in', () => {
    const mockUser = {
      uid: 'vector-777',
      displayName: 'Commander Iopic',
      email: 'commander@iopic.world'
    };

    // Inject the logged-in state
    vi.mocked(useAuth).mockReturnValue({
      user: ref(mockUser),
      isInitialized: ref(true)
    } as any);

    const wrapper = mount(DashboardPage);
    
    // Assert that the UI reflects the mocked user data
    expect(wrapper.find('h4').text()).toBe('Commander Iopic');
    expect(wrapper.find('small').text()).toBe('commander@iopic.world');
    
    // Verify the loading state is hidden
    expect(wrapper.find('.spinner-border').exists()).toBe(false);
  });
});
