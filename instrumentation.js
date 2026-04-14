export async function register() {
  // Only run on the Node.js server, not during builds or in the browser
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const SYNC_INTERVAL = 60 * 1000; // 60 seconds
    const BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

    const runSync = async () => {
      try {
        const { syncStripePayments } = await import('./src/lib/stripe-sync.js');
        const result = await syncStripePayments();
        if (result.conversions > 0 || result.refunds > 0) {
          console.log(`[Stripe Sync] ${result.conversions} new conversions, ${result.refunds} refunds across ${result.sites} sites`);
        }
      } catch (err) {
        // Don't crash the server — just log and retry next interval
        if (!err.message?.includes('no such table')) {
          console.error('[Stripe Sync] Error:', err.message);
        }
      }
    };

    // GCS database backup
    const bucketName = process.env.GCS_BACKUP_BUCKET;
    const dbPath = process.env.DATABASE_PATH || './data/analytics.db';

    if (bucketName) {
      const { Storage } = await import('@google-cloud/storage');
      const storage = new Storage();
      const bucket = storage.bucket(bucketName);

      // Restore on startup
      try {
        const [exists] = await bucket.file('analytics.db').exists();
        if (exists) {
          const fs = await import('fs');
          const path = await import('path');
          fs.mkdirSync(path.dirname(dbPath), { recursive: true });
          await bucket.file('analytics.db').download({ destination: dbPath });
          console.log('[DB Backup] Database restored from GCS.');
        } else {
          console.log('[DB Backup] No backup found, starting fresh.');
        }
      } catch (err) {
        console.error('[DB Backup] Restore failed:', err.message);
      }

      // Periodic backup
      const runBackup = async () => {
        try {
          const fs = await import('fs');
          if (fs.existsSync(dbPath)) {
            await bucket.upload(dbPath, { destination: 'analytics.db' });
            console.log('[DB Backup] Database backed up to GCS.');
          }
        } catch (err) {
          console.error('[DB Backup] Backup failed:', err.message || err);
        }
      };

      // First backup after 30 seconds, then every 5 minutes
      setTimeout(runBackup, 30000);
      setInterval(runBackup, BACKUP_INTERVAL);
    }

    // Initial sync after a short delay to let the server fully start
    setTimeout(runSync, 5000);

    // Then sync every 60 seconds
    setInterval(runSync, SYNC_INTERVAL);
  }
}
