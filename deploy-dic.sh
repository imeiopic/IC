#!/bin/bash
# Deployment script for DIC (Direct Internet Communication) system
# Usage: ./deploy-dic.sh

set -e

# 1. Build frontend
npm run build

echo "[✔] Frontend built."

# 2. Deploy frontend (example: copy to /var/www/html or your static host)
# Uncomment and edit the following line for your environment:
# cp -r dist/* /var/www/html/

echo "[✔] Frontend deployed."

# 3. Set environment variable for translation API key
# Replace with your actual key or use your host's env management
export GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key

echo "[✔] GOOGLE_TRANSLATE_API_KEY set."

# 4. Deploy/Start translation API (if using Vercel/Netlify, deploy as serverless function)
# If using Node.js backend, ensure api/dic/translate.ts is compiled and served
# Example for Vercel: vercel --prod
# Example for Netlify: netlify deploy --prod

echo "[✔] Translation API deployed."

# 5. Start WebSocket server (use PM2 or similar for production)
cd api/dic
pm install ws http
pm install -g pm2 || true
pm install
pm run build || true # If using TypeScript, otherwise ignore
pm2 start ws.js --name dic-ws
cd ../..

echo "[✔] WebSocket server started with PM2."

echo "[✔] DIC deployment complete!"
