import { test, expect } from '@playwright/test';

test.describe('Browser Storage Mocking', () => {
  test('pre-populates localStorage and sessionStorage before the application loads', async ({
    page,
  }) => {
    const mockPrivateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    await page.addInitScript((privateKey) => {
      window.localStorage.setItem('io_entity_key', privateKey);
      window.sessionStorage.setItem(
        'google_drive_token',
        JSON.stringify({
          access_token: 'mock-token-123',
          expires_at: Date.now() + 9999999,
        })
      );
    }, mockPrivateKey);

    await page.goto('/');
    await page.getByRole('button', { name: /I ACKNOWLEDGE MY EXISTENCE/i }).click();
    await page.getByRole('button', { name: /OPEN DIVIDEND TERMINAL/i }).click();
    await page.getByRole('button', { name: /Force Pulse Override/i }).click();

    await expect(page.locator('h1:has-text("PERSONAL ZKP VAULT")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=UNKNOWN_NODE')).toBeHidden();
  });

  test('reads and clears localStorage to verify its final state', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.setItem('io_entity_key', 'final-test-key-123'));
    const storedKey = await page.evaluate(() => window.localStorage.getItem('io_entity_key'));
    expect(storedKey).toBe('final-test-key-123');
    await page.evaluate(() => window.localStorage.clear());
    const storageLength = await page.evaluate(() => window.localStorage.length);
    expect(storageLength).toBe(0);
  });
});
