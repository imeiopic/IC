import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

// Import the mock functions and reactive refs from your mock file
import {
  mockUser,
  mockIsLoading,
  mockError,
  mockSignIn,
  mockSignOutUser,
  resetAuthMocks,
} from '../__mocks__/useAuth';

// Mock the useAuth composable. Vitest will automatically use the __mocks__ directory
// if you specify the module path correctly.
vi.mock('../useAuth');

// --- Hypothetical Component to Test ---
// This component demonstrates how a typical Vue component might use the useAuth composable
// or the useAuthStore (which wraps useAuth).
const MyAuthComponent = defineComponent({
  setup() {
    // If using Pinia store:
    // const authStore = useAuthStore();
    // return { ...authStore };

    // If using composable directly:
    const { user, isLoading, error, signIn, signOutUser } = useAuth();
    const email = ref('');
    const password = ref('');

    const handleSignIn = async () => {
      await signIn(email.value, password.value);
    };

    const handleSignOut = async () => {
      await signOutUser();
    };

    return {
      user,
      isLoading,
      error,
      email,
      password,
      handleSignIn,
      handleSignOut,
    };
  },
  template: `
    <div>
      <div v-if="isLoading">Loading authentication state...</div>
      <div v-else>
        <div v-if="user">
          <p>Welcome, {{ user.displayName }} ({{ user.email }})!</p>
          <button class="sign-out" @click="handleSignOut">Sign Out</button>
        </div>
        <div v-else>
          <h2>Login</h2>
          <input type="email" v-model="email" placeholder="Email" />
          <input type="password" v-model="password" placeholder="Password" />
          <button class="sign-in" @click="handleSignIn">Sign In</button>
          <p v-if="error" style="color: red;">{{ error }}</p>
        </div>
      </div>
    </div>
  `,
});

describe('MyAuthComponent', () => {
  beforeEach(() => {
    setActivePinia(createPinia()); // Ensure Pinia is active for stores
    resetAuthMocks(); // Reset all auth-related mocks before each test
    vi.useFakeTimers(); // Use fake timers for controlling async operations
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers
  });

  it('displays a login form when no user is logged in', async () => {
    const wrapper = mount(MyAuthComponent);
    await vi.advanceTimersByTimeAsync(1); // Allow initial auth check (ensureAuthInitialized) to resolve

    expect(wrapper.text()).toContain('Login');
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('button.sign-in').exists()).toBe(true);
  });

  it('displays user info when a user is logged in', async () => {
    mockUser.value = { uid: 'user123', email: 'test@example.com', displayName: 'Test User' } as any;
    const wrapper = mount(MyAuthComponent);
    await vi.advanceTimersByTimeAsync(1); // Allow initial auth check to resolve

    expect(wrapper.text()).toContain('Welcome, Test User (test@example.com)!');
    expect(wrapper.find('button.sign-out').exists()).toBe(true);
  });

  it('calls signIn and updates UI on successful login', async () => {
    const wrapper = mount(MyAuthComponent);
    await vi.advanceTimersByTimeAsync(1); // Initial auth check

    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');
    await wrapper.find('button.sign-in').trigger('click');

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockIsLoading.value).toBe(true); // Should be loading immediately after click

    await vi.advanceTimersByTimeAsync(10); // Advance timers for mockSignIn to complete
    await wrapper.vm.$nextTick(); // Wait for Vue to update

    expect(mockIsLoading.value).toBe(false);
    expect(mockUser.value?.email).toBe('test@example.com');
    expect(wrapper.text()).toContain('Welcome, Test User (test@example.com)!');
  });

  it('calls signOutUser and updates UI on successful logout', async () => {
    mockUser.value = { uid: 'user123', email: 'test@example.com', displayName: 'Test User' } as any;
    const wrapper = mount(MyAuthComponent);
    await vi.advanceTimersByTimeAsync(1); // Initial auth check

    await wrapper.find('button.sign-out').trigger('click');

    expect(mockSignOutUser).toHaveBeenCalled();
    expect(mockIsLoading.value).toBe(true);

    await vi.advanceTimersByTimeAsync(10); // Advance timers for mockSignOutUser to complete
    await wrapper.vm.$nextTick();

    expect(mockIsLoading.value).toBe(false);
    expect(mockUser.value).toBeNull();
    expect(wrapper.text()).toContain('Login');
  });

  it('displays error message on failed login attempt', async () => {
    const wrapper = mount(MyAuthComponent);
    await vi.advanceTimersByTimeAsync(1); // Initial auth check

    await wrapper.find('input[type="email"]').setValue('wrong@example.com');
    await wrapper.find('input[type="password"]').setValue('wrongpassword');
    await wrapper.find('button.sign-in').trigger('click');

    await vi.advanceTimersByTimeAsync(10); // Advance timers for mockSignIn to complete
    await wrapper.vm.$nextTick();

    expect(mockError.value).toBe('Invalid credentials');
    expect(wrapper.text()).toContain('Invalid credentials');
  });

  it('shows loading indicator during async operations', async () => {
    mockIsLoading.value = true;
    const wrapper = mount(MyAuthComponent);
    await vi.advanceTimersByTimeAsync(1); // Initial auth check

    expect(wrapper.text()).toContain('Loading authentication state...');
  });
});
