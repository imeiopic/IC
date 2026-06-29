// src/stores/settingsStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const isMuted = ref(false);
  const masterVolume = ref(0.5);
  return { isMuted, masterVolume };
});

// src/stores/error.ts
export const useErrorStore = defineStore('error', () => {
  const isChunkLoadError = ref(false);
  const globalError = ref<string | null>(null);
  return { isChunkLoadError, globalError };
});