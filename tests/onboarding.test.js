// Automated test for onboarding sequence and backend enforcement
// Run with: npx playwright test tests/onboarding.test.js

const { test, expect } = require("@playwright/test");

const BASE_URL = "http://localhost:5173";

test.describe("Onboarding Flow", () => {
  test("Self-validation is required before peer validation", async ({
    page,
  }) => {
    // 1. Go to PeerValidation directly (should redirect to SelfValidation)
    await page.goto(`${BASE_URL}/peer-validation`);
    await expect(page).toHaveURL(/.*self-validation/);
    await expect(page.locator("h2")).toHaveText(/INTERNAL SYMMETRY TEST/);

    // 2. Complete SelfValidation
    for (let i = 0; i < 3; i++) {
      await page.locator('input[type="checkbox"]').nth(i).check();
    }
    await page.locator('button:has-text("EXECUTE SELF-GROUNDING")').click();
    await expect(page.locator("text=Self-Symmetry Confirmed")).toBeVisible();
    await page.reload();

    // 3. Now PeerValidation is accessible
    await page.goto(`${BASE_URL}/peer-validation`);
    await expect(page).not.toHaveURL(/.*self-validation/);
    await expect(page.locator("h2")).toHaveText(/PEER VALIDATION TERMINAL/);
  });
});
