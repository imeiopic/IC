#!/bin/bash
# IOPIC Automated Backup Substrate
# Safely archives the Fireback database volume without interrupting Terminal 10 velocity.

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="fireback_substrate_${TIMESTAMP}.tar.gz"

echo "SIGHTING: Initializing zero-downtime backup sequence..."

# Ensure local backup directory exists
mkdir -p "$BACKUP_DIR"

# Spin up an ephemeral container using the 'backend' service configuration.
# We override the entrypoint to run 'tar', compress the volume (/app/data),
# and output it to our mapped host directory (/backup).
docker-compose run --rm --no-deps \
  -v "$(pwd)/backups:/backup" \
  --entrypoint tar \
  backend \
  -czvf "/backup/${BACKUP_FILE}" -C /app/data .

echo "✅ LOCAL SYMMETRY ACHIEVED: Substrate archived to ${BACKUP_DIR}/${BACKUP_FILE}"

# Remote transmission sequence to Google Cloud Storage
# To enable, define GCS_BACKUP_BUCKET in your environment (e.g., gs://my-iopic-backups)
if [ -n "$GCS_BACKUP_BUCKET" ]; then
  echo "SIGHTING: Transmitting archive to the cloud substrate (${GCS_BACKUP_BUCKET})..."
  # Utilize gsutil (Google Cloud SDK) for high-velocity transfer
  gsutil cp "${BACKUP_DIR}/${BACKUP_FILE}" "${GCS_BACKUP_BUCKET}/${BACKUP_FILE}"
  echo "✅ CLOUD SYMMETRY ACHIEVED: Backup securely offloaded."
else
  echo "⚠️ OFFLINE MODE: GCS_BACKUP_BUCKET is not defined. Skipping cloud transmission."
fi