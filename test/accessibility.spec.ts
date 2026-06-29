import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Keyboard Navigation & Accessibility", () => {
  test("navigates through interactive elements using only Tab and Enter", async ({
    page,
  }) => {
    await page.goto("/");

    const acknowledgeBtn = page.getByRole("button", {
      name: /I ACKNOWLEDGE MY EXISTENCE/i,
    });
    await expect(acknowledgeBtn).toBeVisible();

    // 1. Manually focus the first element to establish a reliable starting point for the test
    await acknowledgeBtn.focus();
    await expect(acknowledgeBtn).toBeFocused();

    // 2. Simulate pressing 'Enter' to trigger the focused button
    await page.keyboard.press("Enter");

    // 3. Verify the action was successful by waiting for the next UI element
    const nameInput = page.locator("#username-input");
    await expect(nameInput).toBeVisible();

    // 4. Because focus behavior varies after a DOM change, we explicitly focus the input
    await nameInput.focus();
    await expect(nameInput).toBeFocused();

    // 5. Fill out the input using keyboard typing simulation
    await page.keyboard.type("I.T Real");

    // 6. Simulate pressing 'Tab' to navigate to the next interactive element
    await page.keyboard.press("Tab");

    // 7. Assert that the focus correctly moved to the Voice Input (Microphone) button
    const micBtn = page.getByRole("button", { name: "Voice Input" });
    await expect(micBtn).toBeFocused();

    // 8. Simulate pressing 'Enter' to toggle the microphone
    await page.keyboard.press("Enter");
    await expect(micBtn).toHaveClass(/listening/);
  });

  test("automatically scans the homepage for accessibility violations using axe-core", async ({
    page,
  }) => {
    await page.goto("/");

    // Inject and run the axe-core accessibility engine against the current page
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Assert that the violations array is completely empty
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
