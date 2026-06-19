/**
 * Prefetch directive for link prefetching
 */
import type { DirectiveBinding } from 'vue';

export const vPrefetch = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    const href = binding.value || el.getAttribute('href');
    if (href) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    }
  },
};

export default vPrefetch;
