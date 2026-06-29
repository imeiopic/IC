const fs = require("fs");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const {
  ref,
  uploadString,
  getBytes,
  deleteObject,
} = require("firebase/storage");

let testEnv;

before(async () => {
  // Initialize the test environment with your local storage rules
  testEnv = await initializeTestEnvironment({
    projectId: "demo-storage-rules-test",
    storage: {
      rules: fs.readFileSync("storage.rules", "utf8"),
    },
  });
});

after(async () => {
  // Cleanup the environment after all tests run
  await testEnv.cleanup();
});

beforeEach(async () => {
  // Clear the simulated storage bucket between each test
  await testEnv.clearStorage();
});

describe("Firebase Cloud Storage Security Rules", () => {
  it("should NOT allow unauthenticated users to upload", async () => {
    const unauthEnv = testEnv.unauthenticatedContext();
    const fileRef = ref(unauthEnv.storage(), "users/alice/public/test.png");

    // Attempting to upload without being signed in should fail
    await assertFails(
      uploadString(fileRef, "mock data", "raw", { contentType: "image/png" }),
    );
  });

  it("should allow a user to upload an image to their own public folder", async () => {
    const aliceEnv = testEnv.authenticatedContext("alice");
    const fileRef = ref(aliceEnv.storage(), "users/alice/public/test.png");

    // Correct UID, correct file type (image/png) -> should succeed
    await assertSucceeds(
      uploadString(fileRef, "mock data", "raw", { contentType: "image/png" }),
    );
  });

  it("should NOT allow a user to upload an invalid file type", async () => {
    const aliceEnv = testEnv.authenticatedContext("alice");
    const fileRef = ref(aliceEnv.storage(), "users/alice/public/test.txt");

    // Even though it's their folder, text/plain is blocked by isValidUpload()
    await assertFails(
      uploadString(fileRef, "mock data", "raw", { contentType: "text/plain" }),
    );
  });

  it("should NOT allow a user to upload a file larger than 5MB", async () => {
    const aliceEnv = testEnv.authenticatedContext("alice");
    const fileRef = ref(aliceEnv.storage(), "users/alice/public/large.png");

    // Create a payload slightly larger than 5MB (5 * 1024 * 1024 + 1 bytes)
    const largeString = "a".repeat(5 * 1024 * 1024 + 1);

    await assertFails(
      uploadString(fileRef, largeString, "raw", { contentType: "image/png" }),
    );
  });

  it("should allow anyone signed in to read a public folder", async () => {
    // Setup: Bob uploads a file to his public folder
    const bobEnv = testEnv.authenticatedContext("bob");
    const bobFileRef = ref(bobEnv.storage(), "users/bob/public/test.png");
    await assertSucceeds(
      uploadString(bobFileRef, "mock data", "raw", {
        contentType: "image/png",
      }),
    );

    // Test: Alice tries to download Bob's public file
    const aliceEnv = testEnv.authenticatedContext("alice");
    const aliceFileRef = ref(aliceEnv.storage(), "users/bob/public/test.png");
    await assertSucceeds(getBytes(aliceFileRef));
  });

  it("should NOT allow users to read a private folder they do not own", async () => {
    // Setup: Bob uploads a file to his private folder
    const bobEnv = testEnv.authenticatedContext("bob");
    const bobFileRef = ref(bobEnv.storage(), "users/bob/private/test.png");
    await assertSucceeds(
      uploadString(bobFileRef, "mock data", "raw", {
        contentType: "image/png",
      }),
    );

    // Test: Alice tries to download Bob's private file
    const aliceEnv = testEnv.authenticatedContext("alice");
    const aliceFileRef = ref(aliceEnv.storage(), "users/bob/private/test.png");

    // Alice is not Bob, so this should fail
    await assertFails(getBytes(aliceFileRef));
  });

  it("should allow a user to delete their own file but NOT another user's file", async () => {
    // Setup: Bob uploads a file to his public folder
    const bobEnv = testEnv.authenticatedContext("bob");
    const bobFileRef = ref(bobEnv.storage(), "users/bob/public/test.png");
    await assertSucceeds(
      uploadString(bobFileRef, "mock data", "raw", {
        contentType: "image/png",
      }),
    );

    // Test 1: Alice tries to delete Bob's file (Should Fail)
    const aliceEnv = testEnv.authenticatedContext("alice");
    const aliceFileRef = ref(aliceEnv.storage(), "users/bob/public/test.png");
    await assertFails(deleteObject(aliceFileRef));

    // Test 2: Bob deletes his own file (Should Succeed)
    await assertSucceeds(deleteObject(bobFileRef));
  });

  it("should allow an admin to delete another user's file", async () => {
    // Setup: Bob uploads a file to his public folder
    const bobEnv = testEnv.authenticatedContext("bob");
    const bobFileRef = ref(bobEnv.storage(), "users/bob/public/test.png");
    await assertSucceeds(
      uploadString(bobFileRef, "mock data", "raw", {
        contentType: "image/png",
      }),
    );

    // Test: Charlie (who has the admin claim) tries to delete Bob's file
    const adminEnv = testEnv.authenticatedContext("charlie", { admin: true });
    const adminFileRef = ref(adminEnv.storage(), "users/bob/public/test.png");

    // Because Charlie has the mocked admin claim, this should succeed!
    await assertSucceeds(deleteObject(adminFileRef));
  });
});
