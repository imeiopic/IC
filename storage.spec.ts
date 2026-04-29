import { test, expect } from "@playwright/test";

test.describe("Browser Storage Mocking", () => {
  test("pre-populates localStorage and sessionStorage before the application loads", async ({
    page,
  }) => {
    const mockPrivateKey =
      "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    // 1. Inject a script that executes before the Vue application initializes.
    // We can pass our Node.js variables (like mockPrivateKey) directly into the browser context.
    await page.addInitScript((privateKey) => {
      // Set persistent Local Storage
      window.localStorage.setItem("io_entity_key", privateKey);

      // Set temporary Session Storage
      window.sessionStorage.setItem(
        "google_drive_token",
        JSON.stringify({
          access_token: "mock-token-123",
          expires_at: Date.now() + 9999999,
        }),
      );
    }, mockPrivateKey);

    // 2. Navigate to the application (the init script automatically fires on load)
    await page.goto("/");

    // 3. Fast-track to a component that relies on the localStorage data (the ZKP Vault)
    await page
      .getByRole("button", { name: /I ACKNOWLEDGE MY EXISTENCE/i })
      .click();
    await page.getByRole("button", { name: /OPEN DIVIDEND TERMINAL/i }).click();
    await page.getByRole("button", { name: /Force Pulse Override/i }).click();

    await expect(page.locator('h1:has-text("PERSONAL ZKP VAULT")')).toBeVisible(
      { timeout: 10000 },
    );

    // 4. Assert that the Node Identity correctly generated an address from our injected mock key!
    await expect(page.locator("text=UNKNOWN_NODE")).toBeHidden();
  });

  test("reads and clears localStorage to verify its final state", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Simulate the application writing to localStorage during the test
    await page.evaluate(() =>
      window.localStorage.setItem("io_entity_key", "final-test-key-123"),
    );

    // 2. Read the value directly from the browser context back into Node.js
    const storedKey = await page.evaluate(() =>
      window.localStorage.getItem("io_entity_key"),
    );
    expect(storedKey).toBe("final-test-key-123");

    // 3. Clear localStorage completely
    await page.evaluate(() => window.localStorage.clear());

    // 4. Verify that the storage is empty
    const storageLength = await page.evaluate(() => window.localStorage.length);
    expect(storageLength).toBe(0);
  });
});
