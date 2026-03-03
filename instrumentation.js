export async function register() {
  // Only run on the Node.js server, not during builds or in the browser
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const SYNC_INTERVAL = 60 * 1000; // 60 seconds

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

    // Initial sync after a short delay to let the server fully start
    setTimeout(runSync, 5000);

    // Then sync every 60 seconds
    setInterval(runSync, SYNC_INTERVAL);
  }
}
