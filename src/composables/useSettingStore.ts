import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * SettingsStore manages global UI preferences and audio states.
 * Uses Pinia setup syntax for better type inference and scalability.
 */
export const useSettingStore = defineStore('settings', () => {
  // State
  const isMuted = ref<boolean>(false);
  const masterVolume = ref<number>(0.5);
  const theme = ref<'dark' | 'light'>('dark');

  // Getters
  const effectiveVolume = computed<number>(() => (isMuted.value ? 0 : masterVolume.value));

  // Actions
  function toggleMute(): void {
    isMuted.value = !isMuted.value;
  }

  function setVolume(value: number): void {
    // Clamp volume between 0 and 1
    masterVolume.value = Math.max(0, Math.min(1, value));
  }

  function setTheme(newTheme: 'dark' | 'light'): void {
    theme.value = newTheme;
  }

  return {
    isMuted,
    masterVolume,
    theme,
    effectiveVolume,
    toggleMute,
    setVolume,
    setTheme
  };
});