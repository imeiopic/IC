import { defineStore } from 'pinia';
import { db, auth } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';

interface UserState {
  currentUser: User | null;
  userEquity: number;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingRole: boolean;
  userRole: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    userEquity: 0,
    isAuthenticated: false,
    isLoadingAuth: true,
    isLoadingRole: false,
    userRole: null,
  }),

  actions: {
    // Initialize the auth listener and connect Firestore equity sync
    async initializeAuth() {
      return new Promise<void>((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          this.currentUser = user;
          this.isAuthenticated = !!user;
          this.isLoadingAuth = false;

          if (user) {
            this.subscribeToUserEquity(user.uid);
          } else {
            this.userEquity = 0;
            this.userRole = null;
          }
          resolve();
        });
      });
    },

    // Real-time synchronization of the user's equity balance
    subscribeToUserEquity(uid: string) {
      const userRef = doc(db, 'users', uid);
      return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          this.userEquity = data.iowb?.balance || 0;
          this.userRole = data.role || 'user';
        }
      });
    },

    // Ensure the auth is ready before mounting the application
    async ensureAuthInitialized() {
      if (!this.isLoadingAuth) return;
      await this.initializeAuth();
    },

    clearSubscriptions() {
      // Logic to clear listeners if needed
    }
  }
});