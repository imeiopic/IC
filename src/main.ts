import { createApp, markRaw } from 'vue';
import { createPinia } from 'pinia';
import * as Sentry from '@sentry/vue';
import App from './App.vue';
import router from '@/router';
import { useAuthStore } from './stores/authStore';
import { SPICE } from './SPICE'; 
import { Loader } from "@googlemaps/js-api-loader";
import 'bootstrap/dist/css/bootstrap.min.css';

async function bootstrap(): Promise<void> {
  // 1. Pre-Mount Infrastructure: Map Loader
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    version: 'weekly',
    libraries: ['places', 'geometry'] 
  });

  try {
    // We initiate this, but don't strictly await it if you want the app to load faster,
    // though awaiting is safer for geolocated apps.
    await loader.load();
  } catch (err) {
    console.error('CRITICAL_MAPS_INIT_FAILURE:', err);
  }

  // 2. Initialize App and Stores
  const app = createApp(App);
  const pinia = createPinia();

  // Pinia Router Injection: Allows any store to call router.push()
  pinia.use(({ store }) => {
    store.router = markRaw(router);
  });

  app.use(pinia);
  app.use(router);

  // 3. Sentry Performance & Error Tracking
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration({ router }),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 0.1,
    });
  };

  // 4. Global Error Boundary
  app.config.errorHandler = (err, _instance, info) => {
    console.error('[Production Error Capture]:', err, info);
    Sentry.captureException(err);
  };

  // 5. Identity Mesh & Security Initialization
  // Activate the shield BEFORE the auth initialization to ensure
  // that any network requests made during auth are protected.
  SPICE.activateGlobalShield();

  const authStore = useAuthStore();
  await authStore.ensureAuthInitialized();
  
  // 6. Mount
  app.mount('#app');
}

// Global Bootstrap entry point
bootstrap().catch(err => {
  console.error('FATAL_BOOTSTRAP_FAILURE:', err);
  // Optional: Update UI to show a "System Offline" message
});