import { test, expect } from "./fixtures";
import * as admin from "firebase-admin";

// Ensure the Admin SDK connects to the emulator just like it does in fixtures.ts
if (!admin.apps.length) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  admin.initializeApp({ projectId: "demo-iopic-world" });
}
const db = admin.firestore();

test.describe("Protected Dashboard", () => {
  test("displays personalized profile and invite data from mocked Firestore documents", async ({
    mockDashboardPage: page,
  }) => {
    // 1. Because of our fixtures, the browser is already authenticated
    // and the backend emulator is already seeded with our specific test data!

    // 2. Verify the identity data rendered correctly
    const header = page.locator("h4");
    await expect(header).toHaveText("Mocked Vector Entity");

    // Check that the clearance 'level' and 'status' tags appeared
    await expect(page.locator("text=Vector")).toBeVisible();
    await expect(page.locator("text=Active")).toBeVisible();

    // 3. Verify the outbound connection (invite) data rendered in the table
    const table = page.locator("table");
    await expect(table).toBeVisible();
    await expect(table).toContainText("System Handshake");
    await expect(table).toContainText("Pending");
  });

  test("reflects real-time Firestore updates instantly in the UI", async ({
    mockDashboardPage: page,
  }) => {
    // 1. Verify the initial state established by the fixture
    const header = page.locator("h4");
    await expect(header).toHaveText("Mocked Vector Entity");

    // 2. Perform a backend database update via Firebase Admin
    const uid = "mock-uid-999";
    await db.collection("identities").doc(uid).update({
      fullName: "Real-time Updated Entity",
      level: "Administrator",
    });

    // 3. Verify the frontend's onSnapshot listener automatically caught the update
    // Playwright's auto-waiting will poll the DOM until the text matches or times out!
    await expect(header).toHaveText("Real-time Updated Entity", {
      timeout: 5000,
    });
    await expect(page.locator("text=Administrator")).toBeVisible();
  });

  test("handles user logout correctly and redirects to login", async ({
    mockDashboardPage: page,
  }) => {
    // 1. Verify we are starting on the authenticated dashboard
    await expect(page.locator("h4")).toHaveText("Mocked Vector Entity");

    // 2. Locate and click the Log Out button
    await page.getByRole("button", { name: /log out|sign out/i }).click();

    // 3. Verify the application destroys the session and redirects to the login route
    await page.waitForURL("**/login");

    // 4. Verify the protected dashboard content is completely removed from the DOM
    await expect(
      page.locator("h4", { hasText: "Mocked Vector Entity" }),
    ).toBeHidden();

    // 5. Verify Route Guards: Attempt to navigate back to the protected dashboard
    await page.goto("/dashboard");

    // 6. Assert that the application rejects the navigation and forces a redirect to login
    await page.waitForURL("**/login");
  });
});
