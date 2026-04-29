// src/composables/useDebounce.ts
// Basic scaffold for useDebounce composable
import { ref, watch } from 'vue';

export function useDebounce<T>(value: T, delay = 300) {
  const debounced = ref(value) as { value: T };

  let timeout: ReturnType<typeof setTimeout>;

  watch(
    () => value,
    (newValue) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        debounced.value = newValue;
      }, delay);
    }
  );

  return debounced;
}
