import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { useError } from './useError';
import { createPinia } from 'pinia';

// THE VISUAL SUBSTRATE (REMOVED: Physical imports replaced by index.html CDN)
// The following are now handled by the browser to ensure build velocity:
// - bootstrap.min.css
// - bootstrap-icons.css
// - coreui.min.css
// - coreui.bundle.min.js

// Import Custom SCSS (This is for your specific IOPIC branding/styles)
import './style.scss';

const app = createApp(App);
const pinia = createPinia();

// IO Environment Verification
if (import.meta.env.DEV) {
  console.log('IO Environment:', import.meta.env.MODE);
  console.log('Firebase Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
}

// Global Vue Error Boundary
app.config.errorHandler = (err) => {
  const { reportError } = useError();
  reportError(err);
};

app.use(router);
app.use(pinia);
app.mount('#app');