#!/bin/sh
set -e

DB_PATH="${DATABASE_PATH:-/data/analytics.db}"
BUCKET="${GCS_BACKUP_BUCKET:-}"
DB_DIR=$(dirname "$DB_PATH")

mkdir -p "$DB_DIR"

# Restore from GCS on startup
if [ -n "$BUCKET" ]; then
  echo "Checking for database backup in $BUCKET..."
  if gcloud storage cp "gs://$BUCKET/analytics.db" "$DB_PATH" 2>/dev/null; then
    echo "Database restored from backup."
  else
    echo "No backup found, starting fresh."
  fi

  # Background: backup every 5 minutes
  (
    while true; do
      sleep 300
      if [ -f "$DB_PATH" ]; then
        gcloud storage cp "$DB_PATH" "gs://$BUCKET/analytics.db" --quiet 2>/dev/null && \
          echo "Database backed up to GCS." || echo "Backup failed."
      fi
    done
  ) &
fi

exec "$@"
