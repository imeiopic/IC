import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * Manually triggerable Cloud Function to synchronize Stripe Products with Firestore.
 * This ensures the 'anchors' collection reflects the current state of the Stripe Dashboard.
 */
export const syncStripeProducts = functions.https.onCall(async (data, context) => {
  // Authorization check (optional: restrict to admins)
  // if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Node not sighted.');

  try {
    // 1. Fetch active products with their default prices expanded
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    const db = admin.firestore();
    const batch = db.batch();

    // 2. Map and write each product to the 'anchors' collection
    for (const product of products.data) {
      const price = product.default_price as Stripe.Price;
      const anchorRef = db.collection('anchors').doc(product.id);

      // Extract multiplier from metadata or fallback to description parsing (e.g., "1.25x")
      const multiplierMatch = product.description?.match(/(\d+\.?\d*)x/);
      const multiplier = parseFloat(product.metadata.multiplier || (multiplierMatch ? multiplierMatch[1] : '1.0'));

      // Mapping Stripe Product to a unified mesh schema for the frontend components
      const anchorData = {
        id: product.id,
        name: product.name,
        description: product.description || 'Baseline mesh stabilization node.',
        images: product.images,
        // Schema compatibility for all components
        default_price: price?.id || null, // Used by HarmonicOffering.vue
        priceId: price?.id || null,       // Used by EntityOrderTaker.vue
        stake: price?.unit_amount ? price.unit_amount / 100 : 0, // Used by IoD.vue
        multiplier: multiplier,                                  // Used by IoD.value
        metadata: product.metadata || {},
        active: product.active,
        lastSync: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(anchorRef, anchorData, { merge: true });
    }

    await batch.commit();
    return { success: true, count: products.data.length };
  } catch (error: any) {
    console.error('[SYNC_FRACTURE] Handshake failed:', error);
    throw new functions.https.HttpsError('internal', error.message || 'GATEWAY_HANDSHAKE_FAILED');
  }
});