import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('io-theme') || 'symmetry');

  const toggleTheme = () => {
    theme.value = theme.value === 'symmetry' ? 'entropy' : 'symmetry';
  };

  // Watch for changes and apply to the document root
  watch(
    theme,
    (newTheme) => {
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('io-theme', newTheme);
    },
    { immediate: true }
  );

  return {
    theme,
    toggleTheme
  };
});
