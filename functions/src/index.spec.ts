import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUpdate, mockDoc, mockCollection } = vi.hoisted(() => {
  const mockUpdate = vi.fn();
  const mockDoc = vi.fn(() => ({ update: mockUpdate }));
  const mockCollection = vi.fn(() => ({ doc: mockDoc }));
  return { mockUpdate, mockDoc, mockCollection };
});

// 1. Mock SendGrid
vi.mock("@sendgrid/mail", () => {
  return {
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([{ statusCode: 202 }]), // Simulate a successful email send
  };
});

// 2. Mock Stripe
vi.mock("stripe", () => {
  const StripeMock = vi.fn(() => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ id: "mock_session_123" }),
        retrieve: vi.fn().mockResolvedValue({
          payment_status: "paid",
          metadata: { userId: "test_user_uid" },
        }),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  }));
  
  return { default: StripeMock };
});

// Mock Firebase Admin (Required since index.ts initializes it globally)
vi.mock("firebase-admin", () => ({
  initializeApp: vi.fn(),
  firestore: Object.assign(vi.fn(() => ({
    collection: mockCollection,
  })), {
    FieldValue: {
      serverTimestamp: vi.fn(() => "mock_timestamp"),
    }
  })
}));

// Import the functions AFTER the mocks are defined
import { createStripeCheckoutSession, stripeWebhook } from "./index";
import Stripe from "stripe";
import * as sgMail from "@sendgrid/mail";

describe("Cloud Functions: External Integrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createStripeCheckoutSession", () => {
    it("should reject unauthenticated requests", async () => {
      const request = { data: {} } as any;
      
      const result = await createStripeCheckoutSession.run(request);
      const result = await createStripeCheckoutSession.run(request);
      
      expect(result).toEqual({ success: false, message: "Unauthenticated request." });
    });

    it("should reject if auth uid does not match requested userId", async () => {
      const request = {
        auth: { uid: "different_uid" },
        data: { userId: "test_user_uid" },
      } as any;
      
      const result = await createStripeCheckoutSession(request);
      
      expect(result).toEqual({ success: false, message: "Unauthorized: UID mismatch." });
    });

    it("should successfully create a session and return sessionId", async () => {
      const request = {
        auth: { uid: "test_user_uid" },
        data: {
          priceId: "price_XYZ123",
          userId: "test_user_uid",
          successUrl: "https://success.com",
          cancelUrl: "https://cancel.com",
          multiplier: 1.5,
          orderId: "order_789",
        },
      } as any;

      const result = await createStripeCheckoutSession.run(request);

      expect(result).toEqual({ success: true, sessionId: "mock_session_123" });

      // Assert that Stripe was called with the exact parameters we expect
      const stripeInstance = new Stripe("fake_key"); // Retrieves the mocked instance
      expect(stripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [{ price: "price_XYZ123", quantity: 1 }],
          success_url: "https://success.com",
          cancel_url: "https://cancel.com",
          metadata: {
            userId: "test_user_uid",
            orderId: "order_789",
            multiplier: "1.5",
          },
        })
      );
    });
  });

  describe("stripeWebhook", () => {
    it("should process checkout.session.completed and update Firestore", async () => {
      const req = {
        headers: { "stripe-signature": "test_sig" },
        rawBody: "raw_body_data",
      } as any;

      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as any;

      const stripeInstance = new Stripe("fake_key");
      vi.mocked(stripeInstance.webhooks.constructEvent).mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: {
            payment_status: "paid",
            metadata: { userId: "user_123", orderId: "order_456" },
          },
        },
      } as any);

      // Call the webhook
      await stripeWebhook(req, res);

      // Verify signature verification
      expect(stripeInstance.webhooks.constructEvent).toHaveBeenCalledWith(
        "raw_body_data",
        "test_sig",
        expect.any(String)
      );

      // Verify Firestore updates
      expect(mockCollection).toHaveBeenCalledWith("users");
      expect(mockDoc).toHaveBeenCalledWith("user_123");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          hasDonated: true,
          equityTierConfirmed: true,
          lastTransit: "mock_timestamp",
        })
      );

      expect(mockCollection).toHaveBeenCalledWith("orders");
      expect(mockDoc).toHaveBeenCalledWith("order_456");
      expect(mockUpdate).toHaveBeenCalledWith({ status: "paid" });

      // Verify successful response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
    });
  });
});