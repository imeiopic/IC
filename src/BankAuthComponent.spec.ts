import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

// Component to test
import BankAuthComponent from './BankAuthComponent.vue';

// Mock store and composable values
const mockUser = ref<{ uid: string; email: string } | null>(null);
const mockLinkedBanks = ref<Array<{ id: string; name: string; status: string }>>([]);
const mockBankLinkingIsLoading = ref(false);
const mockInitiateBankLink = vi.fn();
const mockRemoveBankLink = vi.fn();

describe('BankAuthComponent', () => {
  it('displays auth error message on failed login', async () => {
    const wrapper = mount(BankAuthComponent);
    await wrapper.find('[data-testid="auth-email"]').setValue('wrong@example.com');
    await wrapper.find('[data-testid="auth-password"]').setValue('wrongpassword');
    await wrapper.find('[data-testid="auth-signin"]').trigger('click');

    await vi.advanceTimersByTimeAsync(10);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="auth-error"]').text()).toContain('Invalid credentials');
  });

  it('displays linked banks and allows adding new ones when logged in', async () => {
    mockUser.value = { uid: 'user123', email: 'test@example.com' } as any;
    mockLinkedBanks.value = [{ id: 'bank1', name: 'My Bank', status: 'active' }];
    const wrapper = mount(BankAuthComponent);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="bank-linking-status"]').text()).toContain('Linked banks: 1');
    expect(wrapper.find('[data-testid="linked-bank-item"]').text()).toContain('My Bank (active)');
    expect(wrapper.find('[data-testid="new-bank-id"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-bank-btn"]').exists()).toBe(true);
  });

  it('calls initiateBankLink action and updates UI on successful bank link', async () => {
    mockUser.value = { uid: 'user123', email: 'test@example.com' } as any;
    const wrapper = mount(BankAuthComponent);
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="new-bank-id"]').setValue('new-bank-id-1');
    await wrapper.find('[data-testid="new-bank-name"]').setValue('New Bank Name');
    await wrapper.find('[data-testid="add-bank-btn"]').trigger('click');

    expect(mockInitiateBankLink).toHaveBeenCalledWith({
      id: 'new-bank-id-1',
      name: 'New Bank Name'
    });
    expect(mockBankLinkingIsLoading.value).toBe(true);

    await vi.advanceTimersByTimeAsync(10);
    await wrapper.vm.$nextTick();

    expect(mockBankLinkingIsLoading.value).toBe(false);
    expect(mockLinkedBanks.value).toHaveLength(1);
    expect(mockLinkedBanks.value[0].name).toBe('New Bank Name');
    expect(wrapper.find('[data-testid="bank-linking-status"]').text()).toContain('Linked banks: 1');
    expect(wrapper.find('[data-testid="linked-bank-item"]').text()).toContain(
      'New Bank Name (active)'
    );
  });

  it('calls removeBankLink action and updates UI on successful bank removal', async () => {
    mockUser.value = { uid: 'user123', email: 'test@example.com' } as any;
    mockLinkedBanks.value = [{ id: 'bank-to-remove', name: 'Bank to Remove', status: 'active' }];
    const wrapper = mount(BankAuthComponent);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="linked-bank-item"]').exists()).toBe(true);

    await wrapper.find('[data-testid="remove-bank-btn"]').trigger('click');

    expect(mockRemoveBankLink).toHaveBeenCalledWith('bank-to-remove');
    expect(mockBankLinkingIsLoading.value).toBe(true);

    await vi.advanceTimersByTimeAsync(10);
    await wrapper.vm.$nextTick();

    expect(mockBankLinkingIsLoading.value).toBe(false);
    expect(mockLinkedBanks.value).toHaveLength(0);
    expect(wrapper.find('[data-testid="bank-linking-status"]').text()).toContain('No banks linked');
    expect(wrapper.find('[data-testid="linked-bank-item"]').exists()).toBe(false);
  });

  it('displays bank linking error message on failed bank link', async () => {
    mockUser.value = { uid: 'user123', email: 'test@example.com' } as any;
    const wrapper = mount(BankAuthComponent);
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="new-bank-id"]').setValue('fail'); // Trigger mock error
    await wrapper.find('[data-testid="new-bank-name"]').setValue('Failing Bank');
    await wrapper.find('[data-testid="add-bank-btn"]').trigger('click');

    await vi.advanceTimersByTimeAsync(10);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="bank-error"]').text()).toContain(
      'Failed to link bank (mocked error)'
    );
  });

  it('shows loading indicator during bank linking operations', async () => {
    mockUser.value = { uid: 'user123', email: 'test@example.com' } as any;
    mockBankLinkingIsLoading.value = true; // Set loading state directly
    const wrapper = mount(BankAuthComponent);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="bank-linking-status"]').text()).toContain(
      'Processing bank link...'
    );
    expect(wrapper.find('[data-testid="add-bank-btn"]').attributes('disabled')).toBeDefined();
  });
});
