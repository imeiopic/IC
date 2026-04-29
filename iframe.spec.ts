import { test, expect } from "@playwright/test";

test.describe("Iframe Interactions", () => {
  test("interacts with elements inside of an embedded iframe", async ({
    page,
  }) => {
    await page.goto("/");

    // Let's assume you have an iframe on your page with the ID "payment-frame"
    // Example: <iframe id="payment-frame" src="https://secure.payment.com"></iframe>

    // 1. Create a FrameLocator targeting the iframe
    const paymentFrame = page.frameLocator("#payment-frame");

    // 2. Chain standard locators off the FrameLocator to interact with elements inside it
    const cardNumberInput = paymentFrame.getByPlaceholder("Card Number");
    const submitButton = paymentFrame.getByRole("button", { name: "Pay Now" });

    // 3. Playwright will automatically pierce the iframe boundary to perform these actions
    await cardNumberInput.fill("4242 4242 4242 4242");
    await submitButton.click();

    // 4. You can also assert against elements inside the iframe
    const successMessage = paymentFrame.locator(".success-toast");
    await expect(successMessage).toHaveText("Payment Successful");

    // Note: If you need to interact with elements on the MAIN page again,
    // you just go back to using the standard `page` object!
    await expect(page.locator("body")).toBeVisible();
  });
});
