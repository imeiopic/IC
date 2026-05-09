import { test, expect } from "@playwright/test";

// UI E2E test for the IopicRide interface

test.describe("IopicRide UI", () => {
  test("should load the ride page and bond a ride", async ({ page }) => {
    await page.goto("/ride");
    await expect(page.locator(".iopic-ride-ui")).toBeVisible();
    await page.fill(".destination-input", "123 Main St");
    await page.click(".ride-btn");
    await expect(page.locator(".ride-status")).toContainText("BONDED");
    await expect(page.locator(".ride-status")).toContainText("Passenger:");
    await expect(page.locator(".ride-status")).toContainText("Driver:");
    await expect(page.locator(".ride-status")).toContainText("Cost:");
    await expect(page.locator(".ride-status")).toContainText("Velocity:");
  });
});
