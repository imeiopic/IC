import { Router, Request, Response, raw } from 'express';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { STRIPE_ANCHORS, FIAT_TO_IO_RATIO, type StripeAnchorProduct } from './src/stores/anchorsData';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Note: This route requires the raw body for signature verification
router.post('/webhook', raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const priceId = session.metadata?.priceId;

    if (!userId || !priceId) {
      console.error('[STRIPE_WEBHOOK] Missing metadata in session:', session.id);
      return res.status(400).json({ error: 'MISSING_METADATA' });
    }

    // Look up anchor configuration
    const anchor = STRIPE_ANCHORS.find((a: StripeAnchorProduct) => a.priceId === priceId);
    if (!anchor) {
      console.error('[STRIPE_WEBHOOK] Unrecognized priceId:', priceId);
      return res.status(400).json({ error: 'INVALID_PRODUCT' });
    }

    // Calculate Tokenomics Allocation
    const baseIO = anchor.fiatPrice / FIAT_TO_IO_RATIO;
    const creditedIO = baseIO * anchor.multiplier;

    try {
      const db = admin.firestore();
      const userRef = db.collection('users').doc(userId);
      const ledgerRef = db.collection('ledgers').doc(userId);

      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new Error("User node does not exist.");

        const currentBalance = userDoc.data()?.iowb?.balance || 0;

        // 1. Increment User Balance & Set Grounded Status
        transaction.update(userRef, {
          'iowb.balance': admin.firestore.FieldValue.increment(creditedIO),
          'iowb.isGrounded': true,
          'iowb.lastGroundingTs': admin.firestore.FieldValue.serverTimestamp(),
          'status': 'EQUITY_GROUNDED'
        });

        // 2. Update Repatriable Ceiling (Principal USD Only)
        transaction.set(ledgerRef, {
          fiat_repatriable_ceiling: admin.firestore.FieldValue.increment(anchor.fiatPrice),
          last_updated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`[STRIPE_WEBHOOK] Successfully grounded node ${userId}. Credited: ${creditedIO} IO$`);
      });
    } catch (error) {
      console.error('[STRIPE_WEBHOOK] Firestore Transaction Failed:', error);
      return res.status(500).json({ error: 'DATABASE_MUTATION_FAILED' });
    }
  }

  res.json({ received: true });
});

export default router;
