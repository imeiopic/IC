import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const isMuted = ref(false);
  const masterVolume = ref(0.5);
  return { isMuted, masterVolume };
});