#!/bin/bash
# Deploy script for iopic.world
# Usage: ./deploy.sh

# Variables
USER="io"
HOST="iopic.world"
PASSWORD="IOcoinx01$"
REMOTE_HTML_DIR="/var/io/iopic.world/html"
LOCAL_DIST_DIR="dist"
REMOTE_DIST_DIR="$REMOTE_HTML_DIR/dist"
NGINX_CONF="/etc/nginx/sites-available/iopic.world"

# 1. Build the project
npm run build

# 2. Remove everything in the remote html directory
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$HOST "rm -rf $REMOTE_HTML_DIR/*"

# 3. Copy the local dist folder to the remote html directory
sshpass -p "$PASSWORD" scp -r $LOCAL_DIST_DIR $USER@$HOST:$REMOTE_HTML_DIR/

# 4. Ensure nginx config root is set (manual step if not already set)
echo "Check $NGINX_CONF to ensure root is set to $REMOTE_DIST_DIR"

# 5. Reload nginx
sshpass -p "$PASSWORD" ssh $USER@$HOST "sudo systemctl reload nginx"

echo "Deployment complete."
