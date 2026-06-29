import { PiniaPluginContext } from 'pinia';
import { useLoadingStore } from '@/stores/loadingStore';

/**
 * Options for the Pinia loading plugin.
 */
interface PiniaLoadingPluginOptions {
  /**
   * An array of action names (strings) or regular expressions (RegExp)
   * that should NOT trigger the global loading indicator.
   */
  exclude?: (string | RegExp)[];
}

export function piniaLoadingPlugin(options?: PiniaLoadingPluginOptions) {
  const excludePatterns = options?.exclude || [];

  return ({ store }: PiniaPluginContext) => {
    // Prevent the loading store's own actions from triggering the loading indicator
    if (store.$id === 'loading') return;

    store.$onAction(({ name, after, onError }) => {
      const shouldExclude = excludePatterns.some(pattern =>
        typeof pattern === 'string' ? name === pattern : pattern.test(name)
      );

      if (shouldExclude) return; // Skip loading indicator for excluded actions

      const loadingStore = useLoadingStore();
      loadingStore.startLoading();

      after(() => loadingStore.stopLoading());
      onError(() => loadingStore.stopLoading());
    });
  };
}