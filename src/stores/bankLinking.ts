import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const useBankLinkingStore = defineStore('bankLinking', () => {
  // State
  let initialBanks = [];
  try {
    const storedBanks = localStorage.getItem('io_linked_banks');
    if (storedBanks) {
      initialBanks = JSON.parse(storedBanks);
    }
  } catch (e) {
    console.error('Failed to parse linked banks from local storage', e);
  }

  const linkedBanks =
    ref<{ id: string; name: string; status: string; sessionId?: string; accountId?: string }[]>(
      initialBanks
    );
  const isBankLinkingInProgress = ref(false);
  const bankLinkingError = ref<string | null>(null);
  const tierColor = ref('#00e5ff');
  const iowbBalance = ref(0);

  // Persist state changes to local storage
  watch(
    linkedBanks,
    (newBanks) => {
      localStorage.setItem('io_linked_banks', JSON.stringify(newBanks));
    },
    { deep: true }
  );

  // Getters
  const isBankLinked = computed(() => linkedBanks.value.length > 0);

  // Actions
  const initiateBankLink = async (bankDetails: { id: string; name: string }) => {
    isBankLinkingInProgress.value = true;
    bankLinkingError.value = null;

    try {
      // Check if the bank is already linked
      const isAlreadyLinked = linkedBanks.value.some((bank) => bank.id === bankDetails.id);
      if (isAlreadyLinked) {
        throw new Error(`${bankDetails.name} is already linked to your account.`);
      }

      // 1. Fetch the Client Secret from the Cloud Function
      const functions = getFunctions();
      const createFinancialSession = httpsCallable(functions, 'createFinancialSession');
      const result: any = await createFinancialSession();

      if (!result.data.success) {
        throw new Error(result.data.message || 'Failed to initialize financial session.');
      }

      // 2. Initialize the Stripe Handshake
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      if (!stripe) throw new Error('Stripe SDK failed to load.');

      const { session, error: stripeError } = await stripe.collectFinancialConnectionsAccounts({
        clientSecret: result.data.clientSecret,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // 3. Verify and Securely Save the Connection via Backend
      const verifyFinancialSession = httpsCallable(functions, 'verifyFinancialSession');
      const verifyResult: any = await verifyFinancialSession({
        sessionId: session.id,
        bankDetails: { id: bankDetails.id, name: bankDetails.name },
      });

      if (!verifyResult.data.success) {
        throw new Error(verifyResult.data.message || 'Failed to verify secure connection.');
      }

      // 4. Complete the Grounding Locally
      linkedBanks.value.push({
        ...bankDetails,
        status: 'active',
        sessionId: session.id,
        accountId: verifyResult.data.accountId,
      });
    } catch (err: any) {
      bankLinkingError.value = err.message || 'Failed to establish a secure link with the bank.';
    } finally {
      isBankLinkingInProgress.value = false;
    }
  };

  const removeBankLink = async (bankId: string) => {
    isBankLinkingInProgress.value = true;
    bankLinkingError.value = null;

    try {
      // Simulate API removal delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const bankToRemove = linkedBanks.value.find((bank) => bank.id === bankId);
      const accountId = bankToRemove ? (bankToRemove as any).accountId : null;

      const functions = getFunctions();
      const disconnectAccount = httpsCallable(functions, 'disconnectFinancialAccount');

      const result: any = await disconnectAccount({ accountId, bankId });

      if (!result.data.success) {
        throw new Error(result.data.message || 'Failed to disconnect account on the server.');
      }

      linkedBanks.value = linkedBanks.value.filter((bank) => bank.id !== bankId);
    } catch (err: any) {
      bankLinkingError.value = err.message || 'Failed to remove the bank link.';
    } finally {
      isBankLinkingInProgress.value = false;
    }
  };

  const setBankLinkingError = (msg: string | null) => {
    bankLinkingError.value = msg;
  };

  const handleBankLinkExit = () => {
    isBankLinkingInProgress.value = false;
  };

  const fetchBankLinkingStatus = async () => {
    // Implementation for syncing status with backend
  };

  const resetBankLinkingState = () => {
    linkedBanks.value = [];
    bankLinkingError.value = null;
    isBankLinkingInProgress.value = false;
    iowbBalance.value = 0;
  };

  return {
    linkedBanks,
    isBankLinkingInProgress,
    bankLinkingError,
    isBankLinked,
    tierColor,
    iowbBalance,
    initiateBankLink,
    removeBankLink,
    setBankLinkingError,
    handleBankLinkExit,
    fetchBankLinkingStatus,
    resetBankLinkingState,
  };
});
