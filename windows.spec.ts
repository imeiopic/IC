import { test, expect } from "@playwright/test";

test.describe("Multi-Tab / New Window Handling", () => {
  test("intercepts and interacts with a newly opened tab", async ({
    page,
    context,
  }) => {
    await page.goto("/");

    // 1. Set up the promise to wait for the new page (tab) event
    const newPagePromise = context.waitForEvent("page");

    // 2. Trigger the action that opens the new tab
    await page.evaluate(() => {
      // Simulating a target="_blank" link click
      window.open("https://example.com", "_blank");
    });

    // 3. Await the promise to get the new Page object
    const newPage = await newPagePromise;
    await newPage.waitForLoadState();

    // 4. Interact with the new tab independently
    await expect(newPage).toHaveURL("https://example.com/");
    await expect(newPage.locator("h1")).toHaveText("Example Domain");

    // 5. Close the new tab and verify focus can return to the original page
    await newPage.close();
    await expect(page.locator("body")).toBeVisible();
  });
});
