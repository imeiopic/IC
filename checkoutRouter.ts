import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

router.post('/create-session', async (req: Request, res: Response) => {
  const { priceId } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: 'MISSING_PRICE_PARAMETER' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.PLATFORM_DOMAIN}/mesh/hydration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PLATFORM_DOMAIN}/mesh/store`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("STRIPE_BUS_FAULT:", error);
    return res.status(500).json({ error: 'GATEWAY_HANDSHAKE_FAILED', details: error.message });
  }
});

export default router;