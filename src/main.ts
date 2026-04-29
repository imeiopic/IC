import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { useError } from "./useError";

// Import Custom SCSS and CoreUI Bundle
import "./style.scss";
import "@coreui/coreui/dist/js/coreui.bundle.min.js";

const app = createApp(App);

// Verify that environment variables are loaded correctly
if (import.meta.env.DEV) {
  console.log("IO Environment:", import.meta.env.MODE);
  console.log("Firebase Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
  // Avoid logging the full API Key in production environments
}

// Global Vue Error Boundary
app.config.errorHandler = (err) => {
  const { reportError } = useError();
  reportError(err);
};

app.use(router);
app.mount("#app");
