export interface StripeAnchorProduct {
  id: string;
  name: string;
  description: string;
  fiatPrice: number; // Raw USD Cost
  multiplier: number;
  priceId: string;
  eInviteRequired: boolean;
}

export const STRIPE_ANCHORS: StripeAnchorProduct[] = [
  {
    id: "prod_UVpSSbnKOryyd5",
    name: "Pentad_Pulse",
    description: "Ground a single thread inside the network mesh.",
    fiatPrice: 5.00,
    multiplier: 1.05,
    priceId: "price_1TWnnzEeAOmbo0qVah7f5MBj",
    eInviteRequired: false
  },
  {
    id: "prod_UVpT6k1qTnAAxz",
    name: "Deca_Node",
    description: "Initial grounding of a pair. Essential Node Grounding matrix.",
    fiatPrice: 10.00,
    multiplier: 1.10,
    priceId: "price_1TWnp0EeAOmbo0qVl5Ijrem7",
    eInviteRequired: false
  },
  {
    id: "prod_UVpR508beRfkIm",
    name: "VANGUARD_20",
    description: "Connect and validate a node configuration with no bank account link.",
    fiatPrice: 20.00,
    multiplier: 1.00,
    priceId: "price_1TWnmjEeAOmbo0qVd2vjrsWl",
    eInviteRequired: false
  },
  {
    id: "prod_UVpUmTbAJKQMlP",
    name: "Half_Decade_Core",
    description: "Mid-Range Mesh Stability expansion protocol.",
    fiatPrice: 20.00,
    multiplier: 1.20,
    priceId: "price_1TWnpjEeAOmbo0qVHSMzwcWz",
    eInviteRequired: true
  },
  {
    id: "prod_UVpVaHTY6xmzBs",
    name: "Centa_Node",
    description: "Full Equity Participant status activation.",
    fiatPrice: 50.00,
    multiplier: 1.25,
    priceId: "price_1TWnqcEeAOmbo0qVAJ0zSN9q",
    eInviteRequired: true
  },
  {
    id: "prod_UVpWah5RmFyha2",
    name: "Penta_Shield",
    description: "Advanced Cluster Protection and spatial routing isolation.",
    fiatPrice: 500.00,
    multiplier: 1.50,
    priceId: "price_1TWnrdEeAOmbo0qVvlqyTMle",
    eInviteRequired: true
  },
  {
    id: "prod_UVpX7gG9BkYVlG",
    name: "Sovereign_Kilo",
    description: "Regional Cluster Pillar core framework assignment.",
    fiatPrice: 1000.00,
    multiplier: 1.75,
    priceId: "price_1TWnsbEeAOmbo0qVr1RnV1Ro",
    eInviteRequired: true
  },
  {
    id: "prod_UVpYXQyMhh3Aqc",
    name: "Sovereign_Apex",
    description: "Planetary Anchor core layer placement | 10k return guarantee.",
    fiatPrice: 10000.00,
    multiplier: 2.00,
    priceId: "price_1TWntMEeAOmbo0qVifyHbFIS",
    eInviteRequired: true
  }
];

export const FIAT_TO_IO_RATIO = 5.00; // 5 USD = 1 IO$