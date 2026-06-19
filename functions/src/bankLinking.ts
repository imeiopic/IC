import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { app } from '../src/firebase'; // Assuming firebase app is exported from here
import { loadStripe } from '@stripe/stripe-js';
import { registerDICBackgroundSync } from '../../src/sw-manager';

interface LinkedBank {
  id: string;
  name: string;
  accountId: string;
  sessionId: string;
  status: string;
  linkedAt: any; // Firebase Timestamp
  balance?: number; // Optional, fetched later
  tierColor?: string; // Optional, derived from balance
  lastSync?: any;
}

export const useBankLinkingStore = defineStore('bankLinking', () => {
  const isBankLinked = ref(false);
  const linkedBanks = ref<LinkedBank[]>([]);
  const iowbBalance = ref<number | null>(null);
  const tierColor = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isBankLinkingInProgress = ref(false);
  const selectedBankId = ref<string | null>(null); // To track which bank is being linked
  const currentUserId = ref<string | null>(null);

  let unsubscribe: (() => void) | null = null;
  let heartbeatInterval: any = null;
  const functions = getFunctions(app);
  const db = getFirestore(app);

  // Stripe instance (loaded lazily)
  let stripePromise: Promise<any> | null = null;
  const getStripe = () => {
    if (!stripePromise) {
      stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    }
    return stripePromise;
  };

  const setBankGrounded = (balance: number, color: string) => {
    iowbBalance.value = balance;
    tierColor.value = color;
    isBankLinked.value = true;
  };

  const setBankLinkingError = (msg: string | null) => {
    error.value = msg;
  };

  const resetBankLinkingState = () => {
    isBankLinked.value = false;
    linkedBanks.value = [];
    iowbBalance.value = null;
    tierColor.value = null;
    isLoading.value = false;
    error.value = null;
    isBankLinkingInProgress.value = false;
    selectedBankId.value = null;
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  /**
   * AUTOMATED SYNC: Monitor User ID changes to trigger background synchronization.
   */
  watch(currentUserId, (newId) => {
    if (newId) {
      startBackgroundSync(newId);
      registerDICBackgroundSync(newId);
    } else {
      stopBackgroundSync();
    }
  });

  const startBackgroundSync = (userId: string) => {
    fetchBankLinkingStatus(userId);
    startHeartbeat(userId);
  };

  const stopBackgroundSync = () => {
    resetBankLinkingState();
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  };

  const startHeartbeat = (userId: string) => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(async () => {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        'status_metadata.lastHeartbeat': new Date()
      }).catch(err => console.warn('Heartbeat failed:', err));
    }, 60000); // 1 minute heartbeat
  };

  // Internal sync logic using real-time listeners
  const fetchBankLinkingStatus = (userId: string) => {
    const userDocRef = doc(db, 'users', userId);

    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const userLinkedBanks: LinkedBank[] = userData.linkedBanks || [];
          linkedBanks.value = userLinkedBanks;

          if (userLinkedBanks.length > 0) {
            isBankLinked.value = true;
            iowbBalance.value = userData.iowb?.balance || 0;
            tierColor.value = userData.iowb?.tierColor || '#ccc';
            
            // Sync background status for DIC Interlock Registry
            console.log(`DIC_CLIENT_SYNC: Node Grounded (Balance: ${iowbBalance.value})`);
          } else {
            isBankLinked.value = false;
            iowbBalance.value = null;
            tierColor.value = null;
          }
        } else {
          isBankLinked.value = false; // User document might not exist or linkedBanks is empty
          iowbBalance.value = null;
          tierColor.value = null;
        }
      },
      (err) => {
        console.error('Error fetching bank linking status:', err);
        error.value = 'Failed to load bank linking status.';
        resetBankLinkingState();
      }
    );
  };

  // Initiates the Stripe Financial Connections flow
  const initiateStripeFinancialLink = async (
    userId: string,
    bankInfo: { id: string; name: string }
  ) => {
    if (!userId) {
      error.value = 'Authentication required to link a bank.';
      return;
    }
    if (isLoading.value) return;

    isLoading.value = true;
    isBankLinkingInProgress.value = true;
    selectedBankId.value = bankInfo.id;
    error.value = null;

    try {
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe not loaded.');
      }

      // 1. Call Firebase function to create a Financial Connections Session
      const createFinancialSessionCallable = httpsCallable(functions, 'createFinancialSession');
      const sessionResult = await createFinancialSessionCallable();

      if (!sessionResult.data || !(sessionResult.data as any).success) {
        throw new Error(
          (sessionResult.data as any)?.message || 'Failed to create financial session.'
        );
      }
      const { clientSecret } = sessionResult.data as { clientSecret: string };

      // 2. Collect financial accounts using Stripe.js
      const { error: collectError, financialConnectionsSession } =
        await stripe.collectFinancialConnectionsAccounts({
          clientSecret: clientSecret
        });

      if (collectError) {
        throw collectError;
      }

      if (!financialConnectionsSession?.id) {
        throw new Error('Financial Connections Session ID not returned.');
      }

      // 3. Call Firebase function to verify and save the linked bank
      const verifyFinancialSessionCallable = httpsCallable(functions, 'verifyFinancialSession');
      const verifyResult = await verifyFinancialSessionCallable({
        sessionId: financialConnectionsSession.id,
        bankDetails: bankInfo // Pass selected bank info to be saved
      });

      if (!verifyResult.data || !(verifyResult.data as any).success) {
        throw new Error(
          (verifyResult.data as any)?.message || 'Failed to verify financial session.'
        );
      }

      // Success! The Firestore listener will update the state.
      console.log('Bank successfully linked via Stripe Financial Connections.');
      window.dispatchEvent(new CustomEvent('bank-linked-success')); // Notify other components
    } catch (err: any) {
      console.error('Error during Stripe Financial Connections flow:', err);
      error.value = err.message || 'Failed to link bank account.';
    } finally {
      isLoading.value = false;
      isBankLinkingInProgress.value = false;
      selectedBankId.value = null;
    }
  };

  // Removes a linked bank
  const removeBankLink = async (bankId: string) => {
    if (isLoading.value) return;
    isLoading.value = true;
    error.value = null;

    try {
      const bankToRemove = linkedBanks.value.find((b) => b.id === bankId);
      if (!bankToRemove) {
        throw new Error('Bank not found in linked accounts.');
      }

      // Check for offline status to queue request
      if (!navigator.onLine) {
        await queueOfflineMutation('disconnectFinancialAccount', {
          accountId: bankToRemove.accountId,
          bankId: bankToRemove.id
        });
        error.value = 'Offline: Request queued for background synchronization.';
        return;
      }

      const disconnectFinancialAccountCallable = httpsCallable(
        functions,
        'disconnectFinancialAccount'
      );
      const result = await disconnectFinancialAccountCallable({
        accountId: bankToRemove.accountId,
        bankId: bankToRemove.id
      });

      if (!result.data || !(result.data as any).success) {
        throw new Error((result.data as any)?.message || 'Failed to disconnect bank account.');
      }

      console.log(`Bank ${bankId} disconnected.`);
      // Firestore listener will update linkedBanks.value automatically
    } catch (err: any) {
      console.error('Error disconnecting bank account:', err);
      error.value = err.message || 'Failed to disconnect bank account.';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Queues a mutation request in IndexedDB and registers a background sync tag.
   */
  const queueOfflineMutation = async (functionName: string, data: any) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('DIC_OFFLINE_DB', 1);
      
      request.onupgradeneeded = () => {
        request.result.createObjectStore('mutation-queue', { keyPath: 'id', autoIncrement: true });
      };

      request.onsuccess = async () => {
        const db = request.result;
        const tx = db.transaction('mutation-queue', 'readwrite');
        const store = tx.objectStore('mutation-queue');
        
        store.add({
          url: `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net/${functionName}`,
          data,
          timestamp: Date.now()
        });

        tx.oncomplete = async () => {
          const registration = await navigator.serviceWorker.ready;
          if ('sync' in registration) {
            await (registration as any).sync.register('process-mutations');
          }
          resolve();
        };
      };
      request.onerror = () => reject(request.error);
    });
  };

  return {
    currentUserId,
    isBankLinked,
    linkedBanks,
    iowbBalance,
    tierColor,
    isLoading,
    error,
    isBankLinkingInProgress,
    selectedBankId,
    setBankGrounded,
    setBankLinkingError,
    resetBankLinkingState,
    startBackgroundSync,
    fetchBankLinkingStatus,
    initiateStripeFinancialLink,
    removeBankLink
  };
});
