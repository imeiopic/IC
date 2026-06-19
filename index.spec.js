import { vi, describe, it, expect, afterEach, afterAll } from "vitest";
import admin from "firebase-admin";
import request from "supertest";
import nodemailer from "nodemailer";
import * as params from "firebase-functions/params";
import firebaseFunctionsTest from "firebase-functions-test";

// ============================================================================
// 1. SETUP MOCKS (Must be done BEFORE requiring index.js)
// ============================================================================

// Mocking the internal schemas module using the #src alias
vi.mock('#src/schemas.js', () => ({
  emailLogSchema: {
    safeParse: vi.fn((data) => ({ success: true, data })),
  },
  accessRequestSchema: {
    safeParse: vi.fn((data) => ({ success: true, data })),
  },
}));

// Mocking the new multer configuration substrate
vi.mock('./multer-config.js', () => ({
  upload: {
    single: vi.fn(() => (req, res, next) => {
      // By default, simulate a successful file attachment if it's a POST to upload-file
      if (req.url === '/upload-file' && req.method === 'POST') {
        req.file = {
          originalname: 'test.txt',
          buffer: Buffer.from('mock file content'),
          mimetype: 'text/plain',
          size: 100
        };
      }
      next();
    }),
  },
  multerErrorHandler: vi.fn((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Protocol Breach: File exceeds 10MB limit.' });
    }
    if (err.message && err.message.startsWith('VALIDATION_ERROR:')) {
      return res.status(400).json({ error: err.message.replace('VALIDATION_ERROR: ', '') });
    }
    next(err);
  }),
}));

// Trackable mocks for assertions
const getSignedUrlMock = vi.fn(async () => ["https://mock-signed-url.com"]);
const saveMock = vi.fn();

const firestoreWhereMock = {
  limit: vi.fn().mockReturnThis(),
  get: vi.fn(async () => ({ size: 0, docs: [] })),
};

const firestoreCollectionMock = {
  doc: vi.fn(() => ({
    get: vi.fn(async () => ({ exists: true, data: () => ({ count: 1 }) })),
    set: vi.fn(),
    update: vi.fn(),
  })),
  where: vi.fn(() => firestoreWhereMock),
  limit: vi.fn().mockReturnThis(),
};

vi.mock("firebase-admin", () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
    auth: vi.fn(() => ({
      verifyIdToken: vi.fn(async (token) => {
        if (token === "mock-admin-token")
          return { uid: "admin_123", email: "admin@iopic.world", admin: true };
        return { uid: "user_123", email: "user@iopic.world" };
      }),
    })),
    appCheck: vi.fn(() => ({
      verifyToken: vi.fn(async () => ({ app_id: "test-app" })),
    })),
    firestore: Object.assign(vi.fn(() => ({
      ...firestoreDbMock,
      collection: vi.fn((name) => firestoreCollectionMock)
    })), {
      FieldValue: {
        increment: vi.fn((v) => v),
        serverTimestamp: vi.fn(() => "timestamp"),
      },
    }),
    storage: vi.fn(() => ({ bucket: vi.fn(() => ({ file: vi.fn(() => ({ save: saveMock, getSignedUrl: getSignedUrlMock })) })) })),
  },
}));

vi.mock("firebase-functions/params", () => ({
  defineSecret: vi.fn((name) => ({
    value: () => name === "IME_ROOT_SIGNATURE" ? "local_sovereign_test_token" : "mock-value",
  })),
  defineInt: vi.fn((name, opts) => ({ value: () => opts?.default || 0 })),
  defineString: vi.fn((name, opts) => ({ 
    value: () => name === "MAX_SENSITIVITY_MODE" ? maxSensitivityValue : (opts?.default || "") 
  })),
}));

const sendMailMock = vi.fn(async () => ({ messageId: "mock-id" }));
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: sendMailMock })),
  },
}));

let maxSensitivityValue = "false";
const firestoreDbMock = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({
      get: vi.fn(async () => ({ exists: true, data: () => ({ count: 1 }) })),
      set: vi.fn(),
      update: vi.fn(),
    })),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  })),
  runTransaction: vi.fn(async (cb) => cb({ get: vi.fn(), set: vi.fn(), update: vi.fn() })),
  batch: vi.fn(() => ({ delete: vi.fn().mockReturnThis(), commit: vi.fn() })),
};

// ============================================================================
// 2. INITIALIZE TEST ENVIRONMENT
// ============================================================================

// Initialize the firebase-functions-test package in "Offline Mode"
const testEnv = firebaseFunctionsTest();

// Use dynamic import to ensure mocks are applied before index.js executes
const myFunctions = await import("./index.js");

describe("Iopic Cloud Functions", () => {
  afterEach(() => {
    vi.clearAllMocks();
    myFunctions.resetSovereignTokenCache();
  });

  afterAll(() => {
    testEnv.cleanup();
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

      expect(sendMailMock).toHaveBeenCalledTimes(1);

      const mailArgs = sendMailMock.mock.calls[0][0];
      expect(mailArgs.to).toBe("admin@iopic.world");
      expect(mailArgs.subject).toBe("🚨 New Access Request: admin");
      expect(mailArgs.html).toContain("newnode@iopic.world");
    });
  });

  describe("spiceGatekeeper", () => {
    it("should grant LOCAL_ROOT access when using the sovereign token from localhost", async () => {
      const response = await request(myFunctions.api)
        .post("/root-operation")
        .set("Authorization", "Bearer local_sovereign_test_token")
        .set("X-Firebase-AppCheck", "mock-app-check-token");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Operation executed under LOCAL_ROOT context.");
    });

    it("should fallback to standard Firebase Auth if no sovereign token is provided", async () => {
      const response = await request(myFunctions.api)
        .post("/root-operation")
        .set("Authorization", "Bearer mock-user-token")
        .set("X-Firebase-AppCheck", "mock-app-check-token");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Operation executed under STANDARD_USER context.");
    });

    it("should block non-sovereign traffic when MAX_SENSITIVITY_MODE is true (Protocol Severance)", async () => {
      maxSensitivityValue = "true";
      const response = await request(myFunctions.api)
        .post("/root-operation")
        .set("Authorization", "Bearer mock-user-token")
        .set("X-Firebase-AppCheck", "mock-app-check-token");

      expect(response.status).toBe(403);
      expect(response.body.code).toBe("OMEGA_NOISE_BLOCKED");
      maxSensitivityValue = "false"; // Reset state for subsequent tests
    });

    it("should deny access if the token is invalid and no Firebase token is present", async () => {
      const response = await request(myFunctions.api)
        .post("/root-operation")
        .set("Authorization", "Bearer invalid-token")
        .set("X-Firebase-AppCheck", "mock-app-check-token");

      // Since "invalid-token" isn't the sovereign token, it falls back to verifyFirebaseToken,
      // which will fail to verify "invalid-token" as a Firebase JWT.
      expect(response.status).toBe(401);
    });

    it("should nullify the token and deny access if used from a non-local IP (Breach)", async () => {
      // Use the valid sovereign token but from a mocked "external" IP
      const response = await request(myFunctions.api)
        .post("/root-operation")
        .set("Authorization", "Bearer local_sovereign_test_token")
        .set("X-Forwarded-For", "192.168.1.100") // This mocks req.ip as a non-local address
        .set("X-Firebase-AppCheck", "mock-app-check-token");

      expect(response.status).toBe(403);
      expect(response.body.error).toContain("SECURITY_BREACH_TOKEN_NULLIFIED");
    });
  });

  describe("cleanupOldAuditLogs", () => {
    it("should delete audit logs older than the retention period", async () => {
      const wrapped = testEnv.wrap(myFunctions.cleanupOldAuditLogs);

      // Mock some old documents
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31); // 31 days old, should be deleted

      // Simulate multiple pages of results for batch deletion
      firestoreWhereMock.get
        .mock.mockImplementationOnce(async () => ({
          size: 2,
          docs: [
            { id: 'old_audit_1', ref: { path: 'security_audits/old_audit_1' }, data: () => ({ timestamp: oldDate }) },
            { id: 'old_audit_2', ref: { path: 'security_audits/old_audit_2' }, data: () => ({ timestamp: oldDate }) },
          ],
        }))
        .mock.mockImplementationOnce(async () => ({
          size: 0, // Second call returns empty, indicating no more documents
          docs: [],
        }));

      await wrapped(testEnv.scheduler.makeMessage()); // Invoke the scheduled function

      // Assertions
      expect(firestoreCollectionMock.where).toHaveBeenCalledTimes(2);
      expect(firestoreWhereMock.limit).toHaveBeenCalledTimes(2);
      expect(firestoreWhereMock.get).toHaveBeenCalledTimes(2);
      expect(firestoreDbMock.batch).toHaveBeenCalledTimes(1);
      expect(firestoreDbMock.batch().delete).toHaveBeenCalledTimes(2);
      expect(firestoreDbMock.batch().commit).toHaveBeenCalledTimes(1);

      // Verify the arguments to where
      const firstWhereCall = firestoreCollectionMock.where.mock.calls[0].arguments;
      expect(firstWhereCall[0]).toBe('timestamp');
      expect(firstWhereCall[1]).toBe('<');
      expect(firstWhereCall[2]).toBeInstanceOf(Date);
    });

    it("should not delete any logs if none are older than the retention period", async () => {
      const wrapped = testEnv.wrap(myFunctions.cleanupOldAuditLogs);
      await wrapped(testEnv.scheduler.makeMessage());
      
      expect(firestoreCollectionMock.where).toHaveBeenCalledTimes(1);
      expect(firestoreWhereMock.limit).toHaveBeenCalledTimes(1);
      expect(firestoreWhereMock.get).toHaveBeenCalledTimes(1);
      expect(firestoreDbMock.batch).not.toHaveBeenCalled();
    });
  });

  describe("Express API Routes (exports.api)", () => {
    it("should block access to /secure-data if no token is provided", async () => {
      // Pass the exported Firebase HTTP function directly into supertest
      const response = await request(myFunctions.api).get("/secure-data");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized: No token provided.");
    });

    it("should grant access to /secure-data with a valid user token", async () => {
      const response = await request(myFunctions.api)
        .get("/secure-data")
        .set("Authorization", "Bearer mock-user-token") // Inject our dummy Auth token
        .set("X-Firebase-AppCheck", "mock-app-check-token"); // Inject our dummy App Check token

      expect(response.status).toBe(200);
      expect(response.body.uid).toBe("user_123");
    });

    it("should block standard users from accessing admin-only routes", async () => {
      const response = await request(myFunctions.api)
        .get("/admin-data")
        .set("Authorization", "Bearer mock-user-token") // Standard user token
        .set("X-Firebase-AppCheck", "mock-app-check-token"); // Valid App Check

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Forbidden: Admin clearance required.");
    });

    it("should allow admins to access admin-only routes", async () => {
      const response = await request(myFunctions.api)
        .get("/admin-data")
        .set("Authorization", "Bearer mock-admin-token"); // Admin user token

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Access granted to admin substrate.");
    });

    it("should block URL generation if filename or contentType is missing", async () => {
      const response = await request(myFunctions.api)
        .post("/generate-upload-url")
        .set("Authorization", "Bearer mock-admin-token")
        .send({ filename: "test.png" }); // Intentionally missing contentType

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing filename or contentType in request body.");
    });

    it("should generate a signed upload URL for admins", async () => {
      const response = await request(myFunctions.api)
        .post("/generate-upload-url")
        .set("Authorization", "Bearer mock-admin-token")
        .send({ filename: "test.png", contentType: "image/png" });

      expect(response.status).toBe(200);
      expect(response.body.uploadUrl).toBe("https://mock-signed-url.com");
      expect(response.body.storagePath).toContain("test.png");

      // Verify getSignedUrl was called with the correct exact parameters
      expect(getSignedUrlMock).toHaveBeenCalledTimes(1);
      const callArgs = getSignedUrlMock.mock.calls[0].arguments[0];
      expect(callArgs.action).toBe("write");
      expect(callArgs.contentType).toBe("image/png");
    });

    it("should block file uploads if no file is provided", async () => {
      // Import the mock to override its behavior
      const { upload } = await import('./multer-config.js');
      vi.mocked(upload.single).mockImplementationOnce(() => (req, res, next) => next());

      const response = await request(myFunctions.api)
        .post("/upload-file")
        .set("Authorization", "Bearer mock-admin-token"); // Intentionally omitting .attach()

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("No file uploaded.");
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

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("File uploaded to Cloud Storage successfully.");
      expect(response.body.fileDetails.name).toBe("test.txt");
      expect(response.body.fileDetails.description).toBe("A mock file description");
      expect(response.body.fileDetails.downloadUrl).toBe("https://mock-signed-url.com");
      expect(response.body.fileDetails.storagePath).toContain("test.txt");

      const saveMock = admin.storage().bucket().file().save;
      expect(saveMock).toHaveBeenCalledTimes(1);

      const [savedBuffer, options] = saveMock.mock.calls[0];
      expect(savedBuffer.toString()).toBe(fileContent);
      expect(options.contentType).toBe("text/plain");
    });

    it("should return a 500 error if Cloud Storage upload fails", async () => {
      admin.storage().bucket().file().save.mockImplementationOnce(async () => {
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

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to upload file to Cloud Storage.");
    });

    it("should return a 413 error if the file exceeds the 10MB limit", async () => {
      // Trigger the mock error manually since we are mocking the multer config
      const { upload } = await import('./multer-config.js');
      vi.mocked(upload.single).mockImplementationOnce(() => (req, res, next) => {
        const err = new Error('File too large');
        err.code = 'LIMIT_FILE_SIZE';
        next(err);
      });

      // Create a buffer slightly larger than the 10MB limit (10 * 1024 * 1024 bytes)
      const largeFileBuffer = Buffer.alloc(10 * 1024 * 1024 + 1);

      const response = await request(myFunctions.api)
        .post("/upload-file")
        .set("Authorization", "Bearer mock-admin-token")
        .set("X-Firebase-AppCheck", "mock-app-check-token")
        .attach("file", largeFileBuffer, {
          filename: "too-large.png",
          contentType: "image/png",
        });

      expect(response.status).toBe(413);
      expect(response.body.error).toBe("Protocol Breach: File exceeds 10MB limit.");
    });

    it("should return a 400 error if the file type is not permitted", async () => {
      const { upload } = await import('./multer-config.js');
      vi.mocked(upload.single).mockImplementationOnce(() => (req, res, next) => {
        next(new Error("VALIDATION_ERROR: File type 'application/x-msdownload' is not permitted."));
      });

      const invalidFileBuffer = Buffer.from("mock binary content");

      const response = await request(myFunctions.api)
        .post("/upload-file")
        .set("Authorization", "Bearer mock-admin-token")
        .set("X-Firebase-AppCheck", "mock-app-check-token")
        .attach("file", invalidFileBuffer, {
          filename: "malicious.exe",
          contentType: "application/x-msdownload",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("File type 'application/x-msdownload' is not permitted.");
    });
  });
});
