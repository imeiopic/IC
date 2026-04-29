import { ref, onUnmounted, nextTick, computed } from 'vue';
import { collection, addDoc, query, where, getDocs, limit, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from './firebase-config';
import { safeOnSnapshot } from './firestoreUtils';
import { useDebounce } from './useDebounce';

export interface Invitee {
  id: string;
  name: string;
  level: string;
  status: string;
  inviteePays: boolean;
  targetUid: string;
  inviterUid: string;
}

/**
 * useInviteManagement: Composable for handling the creation and 
 * validation of new protocol invites, and managing the active list.
 */
export function useInviteManagement() {
  const auth = getAuth();
  
  // State for the invite list
  const invitees = ref<Invitee[]>([]);
  const searchQuery = ref('');
  const loading = ref(true);
  const connectionError = ref(false);
  const retryCount = ref(0);
  const MAX_RETRIES = 5;
  const isInitialLoad = ref(true);
  const lastSyncTimestamp = ref(0);

  // State for the "New Invite" form
  const newName = ref('');
  const inviteeEmail = ref('');
  const newLevel = ref('Member');
  const inviteePays = ref(false);
  const isSubmitting = ref(false);

  let unsubscribe: (() => void) | null = null;

  // 16-Thread Bus Retry Substrate: Exponential backoff (2^retry * 1000ms)
  const { run: debounceRetry, cancel: cancelRetry } = useDebounce(
    () => connectToProtocol(),
    () => Math.min(Math.pow(2, retryCount.value) * 1000, 30000) // Cap at 30s
  );

  const filteredInvitees = computed(() => {
    const queryStr = searchQuery.value.toLowerCase().trim();
    if (!queryStr) return invitees.value;

    return invitees.value.filter((invitee) => {
      return invitee.name.toLowerCase().includes(queryStr) ||
             invitee.level.toLowerCase().includes(queryStr) ||
             invitee.status.toLowerCase().includes(queryStr);
    });
  });

  const addInvitee = async () => {
    const auth = getAuth();
    if (!newName.value.trim() || !inviteeEmail.value.trim() || !auth.currentUser) return;

    isSubmitting.value = true;

    try {
      // Lookup targetUid by email in the invitees collection (the protocol registry)
      const q = query(
        collection(db, 'invitees'),
        where('email', '==', inviteeEmail.value.trim()),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Identity Lookup Failed: Target email not found in protocol registry.");
      }

      const targetUid = querySnapshot.docs[0].id;

      await addDoc(collection(db, 'invitees'), {
        name: newName.value.trim(),
        level: newLevel.value,
        status: 'Pending',
        inviteePays: inviteePays.value,
        targetUid: targetUid,
        inviterUid: auth.currentUser.uid
      });
      // Reset form state
      newName.value = '';
      inviteeEmail.value = '';
      newLevel.value = 'Member';
      inviteePays.value = false;
    } catch (error) {
      console.error("Iopic Protocol Error: Failed to register invitee.", error);
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleProposal = async (id: string, action: 'accept' | 'deny' | 'onu') => {
    const inviteeRef = doc(db, 'invitees', id);
    try {
      if (action === 'deny') {
        await deleteDoc(inviteeRef);
      } else if (action === 'accept') {
        await updateDoc(inviteeRef, { status: 'Active' });
      } else if (action === 'onu') {
        await updateDoc(inviteeRef, { status: 'Active', inviteePays: false });
      }
    } catch (error) {
      console.error("Iopic Protocol Error: Handshake failed.", error);
      throw error;
    }
  };

  const removeInvitee = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'invitees', id));
    } catch (error) {
      console.error("Iopic Protocol Error: Failed to remove invitee.", error);
      throw error;
    }
  };

  const connectToProtocol = () => {
    // Ensure idempotency: Cleanup existing listener before establishing a new one
    if (unsubscribe) unsubscribe();
    cancelRetry();

    const q = query(collection(db, 'invitees'));
    
    unsubscribe = safeOnSnapshot(q, (snapshot) => {
      connectionError.value = false;
      retryCount.value = 0; // Reset on successful sync
      lastSyncTimestamp.value = Date.now();

      invitees.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Invitee));
      
      loading.value = false;
      nextTick(() => {
        isInitialLoad.value = false;
      });
    }, {
      onError: (error) => {
        console.error("Iopic Protocol Sync Error:", error);
        connectionError.value = true;
        loading.value = false;

        if (retryCount.value < MAX_RETRIES) {
          retryCount.value++;
          debounceRetry();
        }
      },
      shouldReport: () => retryCount.value >= MAX_RETRIES
    });
  };

  onUnmounted(() => {
    if (unsubscribe) unsubscribe();
    cancelRetry();
  });

  return { 
    invitees, 
    filteredInvitees,
    searchQuery,
    lastSyncTimestamp,
    loading, 
    connectionError, 
    retryCount,
    MAX_RETRIES,
    isInitialLoad,
    newName, 
    inviteeEmail, 
    newLevel, 
    inviteePays, 
    isSubmitting, 
    addInvitee, 
    handleProposal, 
    removeInvitee, 
    connectToProtocol 
  };
}