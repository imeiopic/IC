import { test as base, Page } from "@playwright/test";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK for testing
if (!admin.apps.length) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  admin.initializeApp({ projectId: "demo-iopic-world" });
}
const db = admin.firestore();

// 1. Define the types for your custom fixtures
type IopicFixtures = {
  acknowledgedPage: Page;
  loggedInPage: Page;
  mockAuthPage: Page;
  mockDashboardPage: Page;
};

// 2. Extend the base test with your custom fixtures
export const test = base.extend<IopicFixtures>({
  // Define the 'acknowledgedPage' fixture
  acknowledgedPage: async ({ page }, use) => {
    // SETUP: Run the repetitive logic before the test starts
    await page.goto("/");
    await page
      .getByRole("button", { name: /I ACKNOWLEDGE MY EXISTENCE/i })
      .click();
    await page.waitForSelector("#username-input");

    // YIELD: Pass the fully prepared page object to the test
    await use(page);

    // TEARDOWN: Any cleanup logic would go here (runs after the test finishes)
  },

  // Define the 'loggedInPage' fixture
  loggedInPage: async ({ browser }, use) => {
    // Create a brand new context using the saved authentication state
    const context = await browser.newContext({
      storageState: "playwright/.auth/user.json",
    });
    const authenticatedPage = await context.newPage();

    // Jump straight to the dashboard (bypassing the login form completely!)
    await authenticatedPage.goto("/dashboard");

    // YIELD: Pass the authenticated page to the test
    await use(authenticatedPage);

    // TEARDOWN: Clean up the specialized context
    await context.close();
  },

  // Define the 'mockAuthPage' fixture to bypass the UI AND the real backend
  mockAuthPage: async ({ page }, use) => {
    // 1. Intercept Firebase Auth lookup requests to validate our fake token
    await page.route(
      "**/*identitytoolkit.googleapis.com/v1/accounts:lookup*",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            users: [
              {
                localId: "mock-uid-999",
                email: "mock@iopic.world",
                displayName: "Mocked Entity",
                emailVerified: true,
                validSince: "1700000000",
              },
            ],
          }),
        });
      },
    );

    // 2. Navigate to the login route just to establish the correct browser origin
    await page.goto("/login");

    // 3. Inject the mock user directly into Firebase's IndexedDB
    await page.evaluate(() => {
      return new Promise<void>((resolve, reject) => {
        const request = window.indexedDB.open("firebaseLocalStorageDb");

        request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          db.createObjectStore("firebaseLocalStorage", {
            keyPath: "fbase_key",
          });
        };

        request.onsuccess = (event: any) => {
          const db = event.target.result;
          const tx = db.transaction("firebaseLocalStorage", "readwrite");
          const store = tx.objectStore("firebaseLocalStorage");

          store.put({
            // The API Key here must match VITE_FIREBASE_API_KEY in playwright.yml
            fbase_key: "firebase:authUser:mock-key:[DEFAULT]",
            value: {
              uid: "mock-uid-999",
              email: "mock@iopic.world",
              displayName: "Mocked Entity",
              apiKey: "mock-key",
              appName: "[DEFAULT]",
              stsTokenManager: {
                accessToken: "mock-access-token",
                refreshToken: "mock-refresh-token",
                // Set expiration 1 hour into the future to prevent immediate refresh attempts
                expirationTime: Date.now() + 3600000,
              },
            },
          });

          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
      });
    });

    // 4. Navigate to the protected route. Firebase SDK reads IndexedDB and instantly authenticates!
    await page.goto("/dashboard");

    // YIELD: Pass the mocked page to the test
    await use(page);
  },

  // Define the 'mockDashboardPage' fixture to inject specific Firestore data
  mockDashboardPage: async ({ mockAuthPage }, use) => {
    const uid = "mock-uid-999"; // Matches the UID injected by mockAuthPage

    const identityRef = db.collection("identities").doc(uid);
    const inviteRef = db.collection("invitees").doc("mock-invite-123");

    // 1. Seed the Firestore Emulator with the required Dashboard data
    await identityRef.set({
      fullName: "Mocked Vector Entity",
      email: "mock@iopic.world",
      status: "Active",
      level: "Vector",
      isPremium: true,
    });

    await inviteRef.set({
      inviterUid: "system",
      targetUid: uid,
      name: "System Handshake",
      status: "Pending",
      level: "Member",
    });

    // 2. Yield the page. The frontend's onSnapshot listeners will
    // instantly pull this new data and update the UI!
    await use(mockAuthPage);

    // 3. Teardown: Clean up the mock data so future tests start with a blank slate
    await identityRef.delete();
    await inviteRef.delete();
  },
});

export { expect } from "@playwright/test";
