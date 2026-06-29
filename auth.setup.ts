import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate once for all tests", async ({ page }) => {
  // 1. Perform the UI login flow
  await page.goto("/login");

  await page.getByPlaceholder(/email/i).fill("ime@iopic.world");
  await page.getByPlaceholder(/password/i).fill("password123");
  await page.getByRole("button", { name: /log in|sign in/i }).click();

  await page.waitForURL("**/dashboard");

  // 2. Save the browser state (Cookies, LocalStorage, IndexedDB) to disk
  await page.context().storageState({ path: authFile });
});
