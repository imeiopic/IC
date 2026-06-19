import { ref, computed, type Directive } from 'vue';
import type { Router, RouteLocationNormalized } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    prefetch?: (
      route: RouteLocationNormalized,
      onProgress: (percent: number) => void
    ) => Promise<void>;
  }
}

const prefetchedPaths = new Set<string>();
const activeCount = ref(0);
export const globalProgress = ref(0);
const heavyChunksPrimed = ref(false);
let intersectionObserver: IntersectionObserver | null = null;

/**
 * Reactive state indicating if any prefetch operations are currently active.
 */
export const isPrefetching = computed(() => activeCount.value > 0);

/**
 * Speculatively loads heavy vendor chunks during browser idle time.
 * This ensures that 'vendor-three', 'vendor-firebase', etc., are warm 
 * in the cache without impacting the initial time-to-interactive.
 */
export const primeHeavyVendors = (router: Router) => {
  if (heavyChunksPrimed.value || typeof window === 'undefined') return;

  const idleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 2000));

  idleCallback(() => {
    console.log('[PREFETCH]: Priming heavy substrates during idle window...');
    // We trigger dynamic imports for components that we know rely on 
    // the heavy vendor chunks defined in vite.config.ts.
    // This causes the browser to download the shared vendor chunks.
    // Add your routes that use heavy chunks here.
    const criticalRoutes = ['/admin/dashboard', '/map', '/visualizer'];
    criticalRoutes.forEach(path => prefetchRoute(router, path));
    heavyChunksPrimed.value = true;
  });
};

/**
 * Programmatically triggers both code and data prefetching for a route.
 */
export const prefetchRoute = async (router: Router, path: string) => {
  if (prefetchedPaths.has(path)) return;

  const resolved = router.resolve(path);
  if (!resolved || resolved.matched.length === 0) return;

  prefetchedPaths.add(path);

  const routeRecord = resolved.matched[0];
  const component = routeRecord.components?.default;

  // 1. Code Prefetching (Vite Chunks)
  if (typeof component === 'function') {
    try {
      (component as () => Promise<any>)();
    } catch (e) {
      console.warn(`[PREFETCH_ERROR]: Chunk load failed for ${path}`, e);
    }
  }

  // 2. Data Prefetching (Firestore / Pinia)
  const prefetchData = resolved.meta?.prefetch;
  if (typeof prefetchData === 'function') {
    activeCount.value++;
    globalProgress.value = 0;
    try {
      // Trigger the background data fetch
      await prefetchData(resolved, (percent) => {
        globalProgress.value = Math.min(100, Math.max(0, percent));
      });
    } catch (err) {
      console.warn(`[DATA_PRIME_FRACTURE]: Data fetch failed for ${path}`, err);
    } finally {
      activeCount.value--;
      // Optional: keep at 100 for a brief moment in the UI via the component
    }
  }
};

/**
 * v-prefetch directive: Triggers component loading on mouseenter.
 */
export const vPrefetch = (router: Router): Directive<HTMLElement, string> => ({
  mounted(el, binding) {
    const path = binding.value;
    if (!path) return;

    el.addEventListener('mouseenter', () => prefetchRoute(router, path), { once: true });
  }
});

/**
 * v-prefetch-in-view directive: Triggers loading when the link enters the viewport.
 * Uses a shared IntersectionObserver for efficiency.
 */
export const vPrefetchInView = (router: Router): Directive<HTMLElement, string> => ({
  mounted(el, binding) {
    const path = binding.value;
    if (!path || typeof window === 'undefined') return;

    if (!intersectionObserver) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const targetPath = (entry.target as HTMLElement).getAttribute('data-prefetch-path');
              if (targetPath) {
                prefetchRoute(router, targetPath);
                intersectionObserver?.unobserve(entry.target);
              }
            }
          });
        },
        { rootMargin: '100px' } // Starts prefetching when within 100px of viewport
      );
    }

    el.setAttribute('data-prefetch-path', path);
    intersectionObserver.observe(el);
  },
  unmounted(el) {
    intersectionObserver?.unobserve(el);
  }
});