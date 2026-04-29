const assert = require("assert");
const { mock } = require("node:test");
const admin = require("firebase-admin");
const request = require("supertest");
const nodemailer = require("nodemailer");
const params = require("firebase-functions/params");

// ============================================================================
// 1. SETUP MOCKS (Must be done BEFORE requiring index.js)
// ============================================================================

// Prevent the Admin SDK from trying to connect to a real Firebase project
mock.method(admin, "initializeApp", () => {});

// Mock the Cloud Function Secrets so they return a dummy string instead of failing
mock.method(params, "defineSecret", (name) => ({
  value: () => "mock-secret-value",
}));

// Mock Nodemailer so we can intercept the emails and verify their contents
const sendMailMock = mock.fn(async () => {
  return { messageId: "mock-id" };
});
mock.method(nodemailer, "createTransport", () => ({
  sendMail: sendMailMock,
}));

// Mock Firebase Auth so we can test the Express middleware without real tokens
const verifyIdTokenMock = mock.fn(async (token) => {
  if (token === "mock-admin-token")
    return { uid: "admin_123", email: "admin@iopic.world", admin: true };
  if (token === "mock-user-token")
    return { uid: "user_123", email: "user@iopic.world" };
  throw new Error("Invalid or expired token");
});
mock.method(admin, "auth", () => ({
  verifyIdToken: verifyIdTokenMock,
}));

// Mock Firebase App Check so we can test the middleware without real tokens
const verifyAppCheckTokenMock = mock.fn(async (token) => {
  if (token === "mock-app-check-token")
    return { app_id: "1:1234567890:web:abcdef123456" };
  throw new Error("Invalid or expired App Check token");
});
mock.method(admin, "appCheck", () => ({
  verifyToken: verifyAppCheckTokenMock,
}));

// Mock Firestore to intercept database writes from updateDailyStats
const firestoreDocMock = {
  set: mock.fn(async () => {}),
  update: mock.fn(async () => {}),
  get: mock.fn(async () => ({ exists: true, data: () => ({ count: 1 }) })),
};
const firestoreCollectionMock = {
  doc: mock.fn(() => firestoreDocMock),
};
const firestoreDbMock = {
  collection: mock.fn(() => firestoreCollectionMock),
  runTransaction: mock.fn(async (cb) =>
    cb({
      get: firestoreDocMock.get,
      set: firestoreDocMock.set,
      update: firestoreDocMock.update,
    }),
  ),
};

const firestoreGetter = () => firestoreDbMock;
firestoreGetter.FieldValue = {
  increment: mock.fn((val) => val),
  serverTimestamp: mock.fn(() => "timestamp"),
};
mock.method(admin, "firestore", firestoreGetter);

// Mock Cloud Storage to intercept signed URL generation
const saveMock = mock.fn(async () => {});
const getSignedUrlMock = mock.fn(async () => ["https://mock-signed-url.com"]);
const fileMock = mock.fn(() => ({
  getSignedUrl: getSignedUrlMock,
  save: saveMock,
}));
const bucketMock = mock.fn(() => ({
  file: fileMock,
}));
mock.method(admin, "storage", () => ({
  bucket: bucketMock,
}));

// ============================================================================
// 2. INITIALIZE TEST ENVIRONMENT
// ============================================================================

// Initialize the firebase-functions-test package in "Offline Mode"
const testEnv = require("firebase-functions-test")();

// Now that our mocks are in place, we can safely require your cloud functions!
const myFunctions = require("../../index.js");

describe("Iopic Cloud Functions", () => {
  afterEach(() => {
    // Reset the email interceptor's call count between each test
    sendMailMock.mock.resetCalls();
    firestoreDbMock.collection.mock.resetCalls();
    getSignedUrlMock.mock.resetCalls();
    saveMock.mock.resetCalls();
  });

  after(() => {
    // Clean up the test environment and restore all native functions
    testEnv.cleanup();
    mock.restoreAll();
  });

  describe("notifyAdminOnAccessRequest", () => {
    it("should send an email notification when a valid access request is created", async () => {
      // Wrap the cloud function so we can invoke it locally
      const wrapped = testEnv.wrap(myFunctions.notifyAdminOnAccessRequest);

      // Create a mock DocumentSnapshot matching your Zod schema
      const snap = testEnv.firestore.makeDocumentSnapshot(
        {
          email: "newnode@iopic.world",
          uid: "node_123",
          requestedRole: "admin",
          status: "Pending",
          timestamp: { toDate: () => new Date() }, // Mock Firestore Timestamp
        },
        "access_requests/test_req_123",
      );

      // Execute the wrapped function
      await wrapped({
        data: snap,
        params: { requestId: "test_req_123" },
      });

      // Assert that sendMail was called exactly once
      assert.strictEqual(
        sendMailMock.mock.callCount(),
        1,
        "sendMail should be called exactly once",
      );

      // Inspect the arguments that were passed to the Nodemailer mock
      const mailArgs = sendMailMock.mock.calls[0].arguments[0];
      assert.strictEqual(mailArgs.to, "admin@iopic.world");
      assert.strictEqual(mailArgs.subject, "🚨 New Access Request: admin");
      assert.ok(
        mailArgs.html.includes("newnode@iopic.world"),
        "HTML should contain the user's email",
      );
    });
  });

  describe("Express API Routes (exports.api)", () => {
    it("should block access to /secure-data if no token is provided", async () => {
      // Pass the exported Firebase HTTP function directly into supertest
      const response = await request(myFunctions.api).get("/secure-data");

      assert.strictEqual(response.status, 401);
      assert.strictEqual(
        response.body.error,
        "Unauthorized: No token provided.",
      );
    });

    it("should grant access to /secure-data with a valid user token", async () => {
      const response = await request(myFunctions.api)
        .get("/secure-data")
        .set("Authorization", "Bearer mock-user-token") // Inject our dummy Auth token
        .set("X-Firebase-AppCheck", "mock-app-check-token"); // Inject our dummy App Check token

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.uid, "user_123");
    });

    it("should block standard users from accessing admin-only routes", async () => {
      const response = await request(myFunctions.api)
        .get("/admin-data")
        .set("Authorization", "Bearer mock-user-token") // Standard user token
        .set("X-Firebase-AppCheck", "mock-app-check-token"); // Valid App Check

      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.body.error,
        "Forbidden: Admin clearance required.",
      );
    });

    it("should allow admins to access admin-only routes", async () => {
      const response = await request(myFunctions.api)
        .get("/admin-data")
        .set("Authorization", "Bearer mock-admin-token"); // Admin user token

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.body.message,
        "Access granted to admin substrate.",
      );
    });

    it("should block URL generation if filename or contentType is missing", async () => {
      const response = await request(myFunctions.api)
        .post("/generate-upload-url")
        .set("Authorization", "Bearer mock-admin-token")
        .send({ filename: "test.png" }); // Intentionally missing contentType

      assert.strictEqual(response.status, 400);
      assert.strictEqual(
        response.body.error,
        "Missing filename or contentType in request body.",
      );
    });

    it("should generate a signed upload URL for admins", async () => {
      const response = await request(myFunctions.api)
        .post("/generate-upload-url")
        .set("Authorization", "Bearer mock-admin-token")
        .send({ filename: "test.png", contentType: "image/png" });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.body.uploadUrl,
        "https://mock-signed-url.com",
      );
      assert.ok(response.body.storagePath.includes("test.png"));

      // Verify getSignedUrl was called with the correct exact parameters
      assert.strictEqual(getSignedUrlMock.mock.callCount(), 1);
      const callArgs = getSignedUrlMock.mock.calls[0].arguments[0];
      assert.strictEqual(callArgs.action, "write");
      assert.strictEqual(callArgs.contentType, "image/png");
    });

    it("should block file uploads if no file is provided", async () => {
      const response = await request(myFunctions.api)
        .post("/upload-file")
        .set("Authorization", "Bearer mock-admin-token"); // Intentionally omitting .attach()

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.error, "No file uploaded.");
    });

    it("should upload a file buffer and generate a download URL for admins", async () => {
      const fileContent = "mock file content";
      const fileBuffer = Buffer.from(fileContent);

      const response = await request(myFunctions.api)
        .post("/upload-file")
        .set("Authorization", "Bearer mock-admin-token")
        .field("description", "A mock file description")
        // The .attach() method forces supertest to use multipart/form-data
        .attach("file", fileBuffer, {
          filename: "test.txt",
          contentType: "text/plain",
        });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.body.message,
        "File uploaded to Cloud Storage successfully.",
      );
      assert.strictEqual(response.body.fileDetails.name, "test.txt");
      assert.strictEqual(
        response.body.fileDetails.description,
        "A mock file description",
      );
      assert.strictEqual(
        response.body.fileDetails.downloadUrl,
        "https://mock-signed-url.com",
      );
      assert.ok(response.body.fileDetails.storagePath.includes("test.txt"));

      // Verify fileRef.save was called exactly once
      assert.strictEqual(saveMock.mock.callCount(), 1);

      // Extract the arguments passed to save()
      const [savedBuffer, options] = saveMock.mock.calls[0].arguments;

      assert.strictEqual(
        savedBuffer.toString(),
        fileContent,
        "The uploaded buffer should match the input",
      );
      assert.strictEqual(
        options.contentType,
        "text/plain",
        "The content type should be passed to Cloud Storage",
      );
    });

    it("should return a 500 error if Cloud Storage upload fails", async () => {
      // Force the save mock to throw an error for this specific invocation
      saveMock.mock.mockImplementationOnce(async () => {
        throw new Error("Simulated Cloud Storage Error");
      });

      const fileContent = "mock file content";
      const fileBuffer = Buffer.from(fileContent);

      const response = await request(myFunctions.api)
        .post("/upload-file")
        .set("Authorization", "Bearer mock-admin-token")
        .attach("file", fileBuffer, {
          filename: "fail.txt",
          contentType: "text/plain",
        });

      assert.strictEqual(response.status, 500);
      assert.strictEqual(
        response.body.error,
        "Failed to upload file to Cloud Storage.",
      );
    });
  });
});
