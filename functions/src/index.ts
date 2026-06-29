import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * Stripe Webhook: handleStripeWebhook
 * Acts as the Settlement Layer for the Caretaker Mutuality protocol.
 */
export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    // Construct the event using the raw body and signature secret for integrity
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`[WEBHOOK_ERROR] Signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    // Ensure this transaction is authenticated via the IOPIC Caretaker protocol
    if (metadata?.iopic_protocol === 'CARETAKER_MUTUALITY_V1') {
      const userId = metadata.userId;
      const netIoImpact = parseFloat(metadata.netIoImpact);
      const mutualityContribution = parseFloat(metadata.caretakerAllocation);

      const db = admin.firestore();
      const userRef = db.collection('users').doc(userId);
      const globalMeshWalletRef = db.collection('registry').doc('global_mesh_wallet');

      try {
        await db.runTransaction(async (transaction) => {
          // 1. Credit the Sovereign Node with the Net IO$ balance
          transaction.update(userRef, {
            'iowb.balance': admin.firestore.FieldValue.increment(netIoImpact),
            'iowb.isGrounded': true,
            'ledger.last_reallocation_sync': admin.firestore.FieldValue.serverTimestamp()
          });

          // 2. Reallocate the Mutuality Contribution (VAT) to the Global Mesh Wallet
          // This pool is reserved for Caretaker pillars: Healthcare and Education.
          transaction.set(globalMeshWalletRef, {
            caretaker_mutuality_pool: admin.firestore.FieldValue.increment(mutualityContribution),
            last_updated: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        });
        console.log(`[CARETAKER_SYNC] Mutuality contribution processed for Node ${userId}. ${mutualityContribution} USD reallocated to mesh.`);
      } catch (e) {
        console.error('[CARETAKER_FRACTURE] Reallocation transaction failed:', e);
      }
    }
  }

  res.json({ received: true });
});