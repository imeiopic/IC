import { test, expect } from "@playwright/test";

test.describe("JavaScript Dialogs (Alert, Confirm, Prompt)", () => {
  test("intercepts, verifies, and accepts a window.confirm() popup", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Setup the dialog listener BEFORE triggering the action
    page.on("dialog", async (dialog) => {
      // Verify the dialog type (alert, confirm, prompt, beforeunload)
      expect(dialog.type()).toBe("confirm");

      // Verify the exact message displayed to the user
      expect(dialog.message()).toBe(
        "Are you sure you want to delete this identity?",
      );

      // Accept the confirmation (simulates clicking "OK")
      await dialog.accept();

      // Note: To simulate clicking "Cancel", you would use:
      // await dialog.dismiss();
    });

    // 2. Trigger the frontend action that causes the popup to appear
    await page.evaluate(() => {
      // Simulating a button click that triggers a confirm
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this identity?",
      );
      if (isConfirmed)
        document.body.innerHTML += '<div id="result">Identity Deleted</div>';
    });

    // 3. Verify the frontend logic proceeded as expected after the dialog was accepted
    await expect(page.locator("#result")).toHaveText("Identity Deleted");
  });

  test("fails if an unexpected window.alert() appears", async ({ page }) => {
    await page.goto("/");

    let unexpectedDialogAppeared = false;

    // 1. Setup a listener that flags if any dialog opens
    page.on("dialog", async (dialog) => {
      unexpectedDialogAppeared = true;
      console.error(`Unexpected dialog appeared: ${dialog.message()}`);
      await dialog.dismiss();
    });

    // 2. Trigger frontend actions that should remain silent
    await page.evaluate(() => {
      const safeOperation = 1 + 1; // No alert triggered here
    });

    // 3. Assert that the dialog never appeared
    expect(unexpectedDialogAppeared).toBe(false);
  });
});
