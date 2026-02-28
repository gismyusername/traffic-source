import Stripe from 'stripe';
import { getDb } from '@/lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const buf = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const db = getDb();

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'payment_intent.succeeded'
  ) {
    const session = event.data.object;

    // Parse client_reference_id: "visitorId|sessionId|siteId"
    let visitorId = null;
    let sessionId = null;
    let siteId = null;

    if (session.client_reference_id) {
      const parts = session.client_reference_id.split('|');
      if (parts.length === 3) {
        [visitorId, sessionId, siteId] = parts;
      }
    }

    const amount = session.amount_total || session.amount || 0;
    const currency = session.currency || 'usd';

    // Look up original session for source attribution
    let utmSource = null;
    let utmMedium = null;
    let utmCampaign = null;
    let referrerDomain = null;

    if (sessionId) {
      const origSession = db
        .prepare('SELECT * FROM sessions WHERE id = ?')
        .get(sessionId);
      if (origSession) {
        utmSource = origSession.utm_source;
        utmMedium = origSession.utm_medium;
        utmCampaign = origSession.utm_campaign;
        referrerDomain = origSession.referrer_domain;
        siteId = siteId || origSession.site_id;
      }
    }

    // Fallback: match by visitor_id
    if (!utmSource && visitorId) {
      const recentSession = db
        .prepare(
          'SELECT * FROM sessions WHERE visitor_id = ? ORDER BY started_at DESC LIMIT 1'
        )
        .get(visitorId);
      if (recentSession) {
        utmSource = recentSession.utm_source;
        utmMedium = recentSession.utm_medium;
        utmCampaign = recentSession.utm_campaign;
        referrerDomain = recentSession.referrer_domain;
        siteId = siteId || recentSession.site_id;
      }
    }

    if (siteId) {
      db.prepare(
        `INSERT OR IGNORE INTO conversions (
          site_id, session_id, visitor_id, stripe_event_id,
          stripe_customer_id, stripe_customer_email, payment_intent_id,
          amount, currency, status,
          utm_source, utm_medium, utm_campaign, referrer_domain
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        siteId,
        sessionId,
        visitorId,
        event.id,
        session.customer || null,
        session.customer_email ||
          session.customer_details?.email ||
          null,
        session.payment_intent || null,
        amount,
        currency,
        'completed',
        utmSource,
        utmMedium,
        utmCampaign,
        referrerDomain
      );
    }
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    db.prepare(
      "UPDATE conversions SET status = 'refunded' WHERE payment_intent_id = ?"
    ).run(charge.payment_intent);
  }

  res.status(200).json({ received: true });
}
