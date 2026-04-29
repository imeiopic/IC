import { test, expect } from "@playwright/test";

test.describe("Third-Party API Mocking", () => {
  test("mocks a direct Stripe API payment confirmation", async ({ page }) => {
    // 1. Intercept requests going explicitly to Stripe's production API
    await page.route(
      "https://api.stripe.com/v1/payment_intents/*",
      async (route) => {
        // Immediately fulfill the request with a mocked successful payment JSON
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "pi_mock_12345",
            object: "payment_intent",
            status: "succeeded",
            amount: 5000, // $50.00
            currency: "usd",
          }),
        });
      },
    );

    await page.goto("/your-checkout-route");

    // 2. Trigger the frontend logic that calls Stripe.js
    await page.getByRole("button", { name: /Submit Payment/i }).click();

    // 3. Verify your frontend handles the mocked success response correctly
    const successMessage = page.locator("text=Payment Successful!");
    await expect(successMessage).toBeVisible();
  });
});
