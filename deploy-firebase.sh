#!/bin/bash
# Local deployment script for Firebase Substrate
set -e

PROJECT_ID="calcium-channel-489906-m2"

echo "🛰️ Initializing Firebase deployment for project: $PROJECT_ID"

# 1. Install dependencies
npm install

# 2. Run tests to ensure stability (matches CI)
echo "🧪 Running unit tests..."
npm test

# 3. Build the application
echo "🏗️ Building project..."
npm run build

# 4. Switch to the correct Firebase project
npx firebase use $PROJECT_ID

# 5. Deploy
# Use --only hosting if you only want to update the frontend
# Or 'deploy' to update everything (Firestore rules, Functions, etc.)
npx firebase deploy

echo "✅ Deployment to $PROJECT_ID complete!"
