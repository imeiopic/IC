// Management logic for background synchronization
export async function registerDICBackgroundSync(userId: string) {
  if (!('serviceWorker' in navigator) || !('periodicSync' in navigator)) {
    console.warn('Periodic Background Sync is not supported in this browser.');
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  try {
    // 1. Request permission for periodic sync
    const status = await (navigator as any).permissions.query({
      name: 'periodic-background-sync',
    });

    if (status.state === 'granted') {
      // 2. Register the sync tag
      await (registration as any).periodicSync.register('dic-node-heartbeat', {
        minInterval: 60 * 60 * 1000, // Browser-enforced minimum is usually 1 hour
      });

      // 3. Pass configuration to the Service Worker
      if (registration.active) {
        registration.active.postMessage({
          type: 'SET_CONFIG',
          userId: userId,
          config: {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          }
        });
      }
    }
  } catch (error) {
    console.error('Failed to register DIC background sync:', error);
  }
}