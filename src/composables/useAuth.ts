import { ref, onMounted } from 'vue';
import { auth } from '../firebase'; // Pointing back to your root config
import { onAuthStateChanged, type User } from 'firebase/auth';

export function useAuth() {
  const user = ref<User | null>(null);
  onMounted(() => {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser;
    });
  });
  return { user };
}