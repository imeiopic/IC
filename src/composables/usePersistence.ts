// Basic persistence composable stub
import { ref } from 'vue';

export function usePersistence<T = any>(key: string, defaultValue: T) {
  const value = ref<T>(defaultValue);

  // Load from localStorage if available
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(key);
    if (stored !== null) {
      try {
        value.value = JSON.parse(stored);
      } catch {}
    }
  }

  // Watch and persist changes
  function save() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value.value));
    }
  }

  return { value, save };
}
