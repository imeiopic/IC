import { onUnmounted } from 'vue';

/**
 * useDebounce: A generic utility to delay the execution of a function
 * until after a specified stabilization window has passed.
 */
export function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number | (() => number) = 2000) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const run = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    
    const actualDelay = typeof delay === 'function' ? delay() : delay;
    timeout = setTimeout(() => {
      fn(...args);
    }, actualDelay);
  };

  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  // Ensure the internal timer is purged on unmount to prevent logic leaks
  onUnmounted(cancel);

  return {
    run,
    cancel
  };
}