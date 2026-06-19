import { ref } from 'vue';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export function useInviteManagement() {
  const newName = ref('');
  const newLevel = ref('Member');
  const inviteePays = ref(false);
  const isSubmitting = ref(false);

  const addInvitee = async () => {
    if (!newName.value.trim()) return;
    isSubmitting.value = true;
    try {
      const currentUser = auth.currentUser;
      
      await addDoc(collection(db, 'invitees'), {
        name: newName.value,
        level: newLevel.value,
        status: 'Pending',
        inviteePays: inviteePays.value,
        inviterUid: currentUser ? currentUser.uid : 'anonymous',
        createdAt: new Date().toISOString()
      });

      newName.value = '';
      newLevel.value = 'Member';
      inviteePays.value = false;
    } catch (error) {
      console.error("Iopic Protocol Error: Failed to add invitee.", error);
    } finally {
      isSubmitting.value = false;
    }
  };

  return { newName, newLevel, inviteePays, isSubmitting, addInvitee };
}