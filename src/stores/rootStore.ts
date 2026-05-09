import { defineStore } from 'pinia';

export const useRootStore = defineStore('root', {
  state: () => ({
    user: null as null | { id: string; name: string },
    kernelLoaded: false
  }),
  actions: {
    setUser(user: { id: string; name: string }) {
      this.user = user;
    },
    setKernelLoaded(loaded: boolean) {
      this.kernelLoaded = loaded;
    }
  }
});
