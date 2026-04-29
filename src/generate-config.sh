#!/bin/sh
# Generates the runtime config.js using Docker environment variables.
# Placed in /docker-entrypoint.d/ by the Dockerfile, Nginx runs this on startup.

cat <<EOF > /usr/share/nginx/html/config.js
window.__APP_CONFIG__ = {
  firebase: {
    apiKey: "${FIREBASE_API_KEY}",
    authDomain: "${FIREBASE_AUTH_DOMAIN}",
    projectId: "${FIREBASE_PROJECT_ID}",
    storageBucket: "${FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",
    appId: "${FIREBASE_APP_ID}"
  },
  useEmulator: ${USE_EMULATOR:-false},
  appCheckSiteKey: "${APP_CHECK_SITE_KEY}",
  appCheckDebugToken: "${APP_CHECK_DEBUG_TOKEN:-true}"
};
EOF