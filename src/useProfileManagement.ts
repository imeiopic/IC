import { ref } from 'vue';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, app } from '@/firebase';

/**
 * useProfileManagement: Composable for managing identity profile updates
 * and synchronizing display names across Firebase Auth and Firestore.
 */
export function useProfileManagement(initialName: string) {
  const newDisplayName = ref(initialName);
  const isUpdating = ref(false);

  /**
   * updateName: Synchronizes the new display name with the Auth substrate
   * and the Firestore invitees collection.
   */
  const updateName = async (uid: string) => {
    const nameToUpdate = newDisplayName.value.trim();
    if (!nameToUpdate) return false;

    isUpdating.value = true;
    try {
      const auth = getAuth(app);
      if (auth.currentUser) {
        // Update Firebase Auth profile
        await updateProfile(auth.currentUser, {
          displayName: nameToUpdate,
        });

        // Synchronize with the invitees collection in Firestore
        const userDocRef = doc(db, 'invitees', uid);
        await updateDoc(userDocRef, {
          name: nameToUpdate,
        });
        return true;
      }
    } catch (error) {
      console.error('Profile Management Error: Identity update failed.', error);
      throw error;
    } finally {
      isUpdating.value = false;
    }
    return false;
  };

  return {
    newDisplayName,
    isUpdating,
    updateName,
  };
}
