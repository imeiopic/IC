import { test, expect } from "@playwright/test";

test.describe("Entity Onboarding Flow", () => {
  test("completes the 16-thread ARC-LOGIC-001 onboarding sequence", async ({
    page,
  }) => {
    // Start at the homepage
    await page.goto("/");

    // Snapshot 1: Initial homepage load
    await expect(page).toHaveScreenshot("homepage-initial.png", {
      fullPage: true,
    });

    // 1. Acknowledge existence
    await page
      .getByRole("button", { name: /I ACKNOWLEDGE MY EXISTENCE/i })
      .click();
    await page.waitForSelector("#username-input"); // Wait for the input to appear
    // Snapshot 2: Homepage with username input visible
    await expect(page).toHaveScreenshot("homepage-acknowledged.png", {
      fullPage: true,
    });

    // 2. Enter username
    const nameInput = page.locator("#username-input");
    await expect(nameInput).toBeVisible();
    await nameInput.fill("I.T Real");
    await nameInput.press("Enter");

    // 3. Verify Onboarding Modal appears
    const onboardingHeader = page.locator(
      'h1:has-text("ARC-LOGIC-001: ENTITY ONBOARDING")',
    );
    await expect(onboardingHeader).toBeVisible();
    // Snapshot 3: Onboarding modal visible
    await expect(page).toHaveScreenshot("onboarding-modal-visible.png", {
      fullPage: true,
    });

    // 4. Progress through the 4 steps
    // Playwright's auto-waiting handles the 1.5s simulated delays perfectly
    await page.getByRole("button", { name: /VERIFY COORDINATES/i }).click();
    await expect(
      page.getByRole("button", { name: /SECURE IDENTITY/i }),
    ).toBeEnabled({ timeout: 5000 });

    await page.getByRole("button", { name: /SECURE IDENTITY/i }).click();
    await expect(
      page.getByRole("button", { name: /RECEIVE EQUITY/i }),
    ).toBeEnabled({ timeout: 5000 });

    await page.getByRole("button", { name: /RECEIVE EQUITY/i }).click();
    await expect(
      page.getByRole("button", { name: /LINK KERNEL/i }),
    ).toBeEnabled({ timeout: 5000 });

    await page.getByRole("button", { name: /LINK KERNEL/i }).click();
    // Wait for all threads to be locked and the success message to appear
    await expect(page.locator("text=SYNCHRONIZATION COMPLETE")).toBeVisible({
      timeout: 5000,
    });
    // Snapshot 4: Onboarding modal completed
    await expect(page).toHaveScreenshot("onboarding-completed.png", {
      fullPage: true,
    });

    // 5. Verify Sovereign status and cinematic transition
    await expect(page.locator("text=SYNCHRONIZATION COMPLETE")).toBeVisible({
      timeout: 5000,
    });

    // The modal should close after 3 seconds, initiating the Gateway zoom
    await expect(onboardingHeader).toBeHidden({ timeout: 5000 });
    // Snapshot 5: Onboarding modal hidden, before cinematic zoom
    await expect(page).toHaveScreenshot("homepage-post-onboarding.png", {
      fullPage: true,
    });
  });

  test("skips onboarding via backdoor admin username", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("button", { name: /I ACKNOWLEDGE MY EXISTENCE/i })
      .click();
    await page.waitForSelector("#username-input");

    const nameInput = page.locator("#username-input");
    await expect(nameInput).toBeVisible();
    await nameInput.fill("Ime Iopic");
    await nameInput.press("Enter");

    // Verify the Onboarding Modal is bypassed completely
    const onboardingHeader = page.locator(
      'h1:has-text("ARC-LOGIC-001: ENTITY ONBOARDING")',
    );
    await expect(onboardingHeader).toBeHidden();
    // Snapshot 6: Homepage after backdoor, onboarding skipped
    await expect(page).toHaveScreenshot("homepage-backdoor-skipped.png", {
      fullPage: true,
    });
  });

  test("simulates network latency to verify loading states", async ({
    page,
  }) => {
    // 1. Intercept the specific API call and artificially delay it by 2000ms
    await page.route("**/api/verify-invitation", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ isValid: true }),
      });
    });

    await page.goto("/");

    // 2. Click the entry link which triggers the delayed API call
    await page.locator(".enter-io").click();

    // 3. Assert the "Processing..." loading state appears while waiting
    await expect(page.locator("text=Processing...")).toBeVisible();

    // 4. Assert the UI eventually recovers and moves to the next step once the delayed request resolves
    await expect(page.locator("#username-input")).toBeVisible({
      timeout: 5000,
    });
  });

  test("simulates offline mode using Chrome DevTools Protocol (CDP)", async ({
    page,
  }) => {
    // 1. Load the page while online to ensure HTML and JS assets are downloaded
    await page.goto("/");

    // 2. Create a new CDP session and forcefully disconnect the network
    const client = await page.context().newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", {
      offline: true,
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
    });

    // 3. Trigger the entry flow (which attempts an API fetch)
    await page.locator(".enter-io").click();

    // 4. Verify the application gracefully catches the offline error and allows retry
    const retryBtn = page.getByRole("button", {
      name: /RETRY INVITATION CHECK/i,
    });
    await expect(retryBtn).toBeVisible({ timeout: 5000 });
  });
});
