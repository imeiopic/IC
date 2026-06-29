import { ref, vi } from 'vitest';

export const mockLinkedBanks = ref([]);
export const mockBankLinkingIsLoading = ref(false);
export const mockBankLinkingError = ref(null);

export const mockInitiateBankLink = vi.fn(async (bankDetails) => {
  mockBankLinkingIsLoading.value = true;
  mockBankLinkingError.value = null;
  await new Promise(resolve => setTimeout(resolve, 5)); // Simulate async operation
  if (bankDetails.id === 'fail') {
    mockBankLinkingError.value = 'Failed to link bank (mocked error)';
    mockBankLinkingIsLoading.value = false;
    throw new Error('Failed to link bank (mocked error)');
  }
  mockLinkedBanks.value.push({ ...bankDetails, status: 'active' });
  mockBankLinkingIsLoading.value = false;
});

export const mockRemoveBankLink = vi.fn(async (bankId) => {
  mockBankLinkingIsLoading.value = true;
  mockBankLinkingError.value = null;
  await new Promise(resolve => setTimeout(resolve, 5)); // Simulate async operation
  mockLinkedBanks.value = mockLinkedBanks.value.filter(bank => bank.id !== bankId);
  mockBankLinkingIsLoading.value = false;
});

export const resetBankLinkingMocks = () => {
  mockLinkedBanks.value = [];
  mockBankLinkingIsLoading.value = false;
  mockBankLinkingError.value = null;
  mockInitiateBankLink.mockClear();
  mockRemoveBankLink.mockClear();
};

// This is the actual composable that would be mocked
export const useBankLinking = () => ({
  linkedBanks: mockLinkedBanks,
  bankLinkingIsLoading: mockBankLinkingIsLoading,
  bankLinkingError: mockBankLinkingError,
  initiateBankLink: mockInitiateBankLink,
  removeBankLink: mockRemoveBankLink,
});