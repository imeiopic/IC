import { test, expect } from "@playwright/test";

test.describe("Responsive Layout & Navigation", () => {
  test("hamburger menu visibility adapts to viewport size", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");

    // Replace this locator with whatever matches your actual hamburger menu
    const hamburgerMenu = page.getByRole("button", { name: /menu/i });

    if (isMobile) {
      // On Mobile Chrome and Mobile Safari, the hamburger menu should be visible
      await expect(hamburgerMenu).toBeVisible();

      // You can also test the interaction
      // await hamburgerMenu.click();
      // await expect(page.locator("nav")).toBeVisible();
    } else {
      // On Desktop viewports, the hamburger menu should be hidden
      await expect(hamburgerMenu).toBeHidden();
    }
  });
});
