import { test, expect } from "@playwright/test";

test.describe("Clipboard (Copy/Paste) Operations", () => {
  test("copies text to the clipboard and reads it back programmatically", async ({
    page,
  }) => {
    await page.goto("/");

    const expectedKey = "IOPIC-SECURE-KEY-12345";

    // 1. Write to the clipboard
    // This simulates what happens when a user clicks a "Copy to Clipboard" button in your UI
    await page.evaluate(
      (text) => navigator.clipboard.writeText(text),
      expectedKey,
    );

    // 2. Read from the clipboard
    // This verifies the exact string that is currently held in the system clipboard
    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );

    expect(clipboardText).toBe(expectedKey);
  });

  test("simulates a user pasting from the clipboard into an input via keyboard", async ({
    page,
  }) => {
    await page.goto("/");

    // Setup: Inject a known string into the clipboard
    const expectedKey = "IOPIC-SECURE-KEY-12345";
    await page.evaluate(
      (text) => navigator.clipboard.writeText(text),
      expectedKey,
    );

    // 1. Acknowledge existence to reach the username input
    await page
      .getByRole("button", { name: /I ACKNOWLEDGE MY EXISTENCE/i })
      .click();

    const nameInput = page.locator("#username-input");
    await expect(nameInput).toBeVisible();

    // 2. Focus the input and simulate the Paste keyboard shortcut
    await nameInput.focus();
    const modifier = process.platform === "darwin" ? "Meta" : "Control";
    await page.keyboard.press(`${modifier}+V`);

    // 3. Verify the pasted text correctly populated the input field
    await expect(nameInput).toHaveValue(expectedKey);
  });
});
