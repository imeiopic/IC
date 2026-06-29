import { test, expect } from "@playwright/test";

test.describe("Geolocation and Timezone Emulation", () => {
  // 1. Configure the emulation specifically for all tests in this block
  test.use({
    geolocation: { latitude: 48.8584, longitude: 2.2945 }, // Eiffel Tower, Paris
    permissions: ["geolocation"], // Required so the browser doesn't block the request
    timezoneId: "Europe/Paris",
    locale: "fr-FR", // Optional: sets the navigator.language
  });

  test("emulates the timezone correctly", async ({ page }) => {
    await page.goto("/");

    // 2. Execute JavaScript in the browser to check the active timezone
    const timeZone = await page.evaluate(() => {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    });

    expect(timeZone).toBe("Europe/Paris");
  });

  test("emulates the geolocation correctly", async ({ page }) => {
    await page.goto("/");

    // 3. Fetch the mocked GPS coordinates using the native browser API
    const position = await page.evaluate(() => {
      return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(err),
        );
      });
    });

    expect(position.lat).toBeCloseTo(48.8584);
    expect(position.lng).toBeCloseTo(2.2945);
  });
});
