#!/bin/bash
# Deploy script for iopic.world
# Usage: ./deploy.sh

set -e

# Variables
REMOTE_ALIAS="iopic"
REMOTE_HTML_DIR="/var/io/iopic.world/html"
LOCAL_DIST_DIR="dist"
REMOTE_DIST_DIR="$REMOTE_HTML_DIR/dist"

# 1. Build the project
npm run build

# 2. Remove everything in the remote html directory
[[ -n "$REMOTE_HTML_DIR" && "$REMOTE_HTML_DIR" != "/" ]] && ssh $REMOTE_ALIAS "rm -rf ${REMOTE_HTML_DIR:?}/*"

# 3. Copy the local dist folder to the remote html directory using rsync for efficiency
rsync -avz --delete $LOCAL_DIST_DIR/ $REMOTE_ALIAS:$REMOTE_HTML_DIR/

# 4. Ensure nginx config root is set (manual step if not already set)
echo "Check $NGINX_CONF to ensure root is set to $REMOTE_DIST_DIR"

# 5. Reload nginx
ssh $REMOTE_ALIAS "sudo systemctl reload nginx"

echo "Deployment complete."
