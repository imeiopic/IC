import { ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from '../useAuth';
import { doc, collection, query, where, type Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase'; // Standardized to firebase.ts
import { safeOnSnapshot } from '../firestoreUtils';
import OrderTakerModel from '../orderTakerModel';
import { useDebounce } from './useDebounce';

export interface DashboardOptions {
  onNewBond?: (description: string) => void;
}

/**
 * useDashboardData: Composable for managing Firestore listeners and
 * security-related state for the entity dashboard.
 */
export function useDashboardData(options: DashboardOptions = {}) {
  const { user } = useAuth();

  const profile = ref<any>(null);
  const myInvites = ref<any[]>([]);
  const assignedBonds = ref<any[]>([]);
  const loading = ref(true);
  const firestoreError = ref<string | null>(null);
  const showSeedReminder = ref(false);
  const retryCount = ref(0);
  const MAX_RETRIES = 3;

  const SEED_REMINDER_KEY = 'io_seed_reminder_dismissed';
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  let unsubscribeProfile: Unsubscribe | null = null;
  let unsubscribeInvites: Unsubscribe | null = null;
  let unsubscribeBonds: Unsubscribe | null = null;

  const checkSeedReminder = () => {
    const lastDismissed = localStorage.getItem(SEED_REMINDER_KEY);
    if (lastDismissed === 'permanently_dismissed') {
      showSeedReminder.value = false;
      return;
    }
    const lastDismissedTime = parseInt(lastDismissed || '0', 10);
    showSeedReminder.value = Date.now() - lastDismissedTime > THIRTY_DAYS_MS;
  };

  const handleSeedReminderAction = (isConfirmed: boolean) => {
    if (isConfirmed) {
      localStorage.setItem(SEED_REMINDER_KEY, 'permanently_dismissed');
    } else {
      localStorage.setItem(SEED_REMINDER_KEY, Date.now().toString());
    }
    showSeedReminder.value = false;
  };

  // 16-Thread Bus Retry Substrate: Use useDebounce for exponential backoff management
  const { run: debounceRetry, cancel: cancelRetry } = useDebounce(
    setupListeners,
    () => Math.pow(2, retryCount.value) * 1000
  );

  function cleanup() {
    unsubscribeProfile?.();
    unsubscribeInvites?.();
    unsubscribeBonds?.();
    cancelRetry();
  }

  function setupListeners() {
    if (!user.value) return;

    cleanup();
    const uid = user.value.uid;

    // 1. Profile Listener
    unsubscribeProfile = safeOnSnapshot(
      doc(db, 'invitees', uid),
      (snap) => {
        profile.value = snap.exists() ? snap.data() : null;
        loading.value = false;
        retryCount.value = 0; // Reset on success
      },
      {
        onError: () => {
          loading.value = false;
          if (retryCount.value < MAX_RETRIES) {
            const delay = Math.pow(2, retryCount.value) * 1000;
            firestoreError.value = `Protocol Error. Retrying in ${delay / 1000}s...`;
            debounceRetry();
            retryCount.value++;
          } else {
            firestoreError.value = 'Security Error: Clearance denied by Access Protocol.';
          }
        },
        shouldReport: () => retryCount.value >= MAX_RETRIES
      }
    );

    // 2. Outbound Invites Listener
    const invitesQuery = query(collection(db, 'invitees'), where('inviterUid', '==', uid));
    unsubscribeInvites = safeOnSnapshot(invitesQuery, (snap) => {
      myInvites.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    });

    // 3. Assigned Bonds Listener (Inbound)
    unsubscribeBonds = OrderTakerModel.subscribeToAssignedBonds(uid, (snap) => {
      const newBonds = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

      if (
        options.onNewBond &&
        assignedBonds.value.length > 0 &&
        newBonds.length > assignedBonds.value.length
      ) {
        options.onNewBond(newBonds[0].payload?.description || 'Unknown Cargo');
      }

      assignedBonds.value = newBonds;
    });

    checkSeedReminder();
  }

  onMounted(setupListeners);
  onUnmounted(cleanup);

  return {
    profile,
    myInvites,
    assignedBonds,
    loading,
    firestoreError,
    showSeedReminder,
    retryCount,
    MAX_RETRIES,
    handleSeedReminderAction
  };
}
