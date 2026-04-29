const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const {
  defineSecret,
  defineInt,
  defineString,
} = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { emailLogSchema, accessRequestSchema } = require("./src/schemas");

admin.initializeApp();

const express = require("express");
// Define secrets for secure access
const adminEmailUser = defineSecret("ADMIN_EMAIL_USER");
const adminEmailPass = defineSecret("ADMIN_EMAIL_PASSWORD");
const myApiKey = defineSecret("MY_API_KEY");

// Define parameterized configuration
const apiConcurrency = defineInt("API_CONCURRENCY", {
  default: 80,
  description: "Concurrent requests per instance",
});
const apiRegion = defineString("API_REGION", { default: "us-east1" });

/**
 * Helper to create a Nodemailer transporter using defined secrets.
 */
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: adminEmailUser.value(),
      pass: adminEmailPass.value(),
    },
  });
}

const DEFAULT_FROM = '"Iopic Protocol System" <noreply@iopic.world>';
const ADMIN_EMAIL = "admin@iopic.world";

/**
 * Core transmission logic for protocol notifications.
 */
async function sendProtocolEmail(options) {
  const transporter = createTransporter();
  const mailOptions = {
    from: DEFAULT_FROM,
    ...options,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Extracts common log metadata (dateId, byteSize) from an event data object.
 */
function getLogMetadata(data) {
  const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
  return {
    dateId: timestamp.toISOString().split("T")[0],
    byteSize: data.byteSize || 0,
  };
}

/**
 * Cloud Function to notify admins of new access requests.
 * Triggered when a document is created in 'access_requests'.
 */
exports.notifyAdminOnAccessRequest = onDocumentCreated(
  {
    document: "access_requests/{requestId}",
    secrets: [adminEmailUser, adminEmailPass],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }
    const data = snapshot.data();

    // Validate the access request document structure
    const result = accessRequestSchema.safeParse(data);
    if (!result.success) {
      console.error(
        `❌ Notification aborted: Invalid access request structure for ${event.params.requestId}:`,
        result.error.format(),
      );
      return;
    }

    const validData = result.data;

    try {
      await sendProtocolEmail({
        to: ADMIN_EMAIL,
        subject: `🚨 New Access Request: ${validData.requestedRole}`,
        html: `
        <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #d9534f;">Protocol Access Request Detected</h2>
          <p>A user has requested elevated clearance on the identity substrate.</p>
          <hr>
          <p><strong>Email:</strong> ${validData.email}</p>
          <p><strong>UID:</strong> ${validData.uid}</p>
          <p><strong>Requested Role:</strong> <span style="background: #f0ad4e; padding: 2px 5px; border-radius: 3px;">${validData.requestedRole}</span></p>
          <p><strong>Current Status:</strong> ${validData.status}</p>
          <p><strong>Timestamp:</strong> ${validData.timestamp ? validData.timestamp.toDate().toLocaleString() : "N/A"}</p>
          <hr>
          <p style="font-size: 0.8rem; color: #777;">Process this request using the 'grant-system-claim.js' utility or via the Firebase Console.</p>
        </div>
      `,
      });
      console.log(
        `✅ Notification successfully transmitted for request: ${event.params.requestId}`,
      );
    } catch (error) {
      console.error("❌ Failed to transmit admin notification:", error);
    }
  },
);

/**
 * Cloud Function to notify users when their access request is approved.
 * Triggered when a document in 'access_requests' is updated.
 */
exports.notifyUserOnAccessRequestUpdate = onDocumentUpdated(
  {
    document: "access_requests/{requestId}",
    secrets: [adminEmailUser, adminEmailPass],
  },
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    // Detect the transition to 'Approved' to ensure we only send one email
    if (beforeData.status !== "Approved" && afterData.status === "Approved") {
      console.log(
        `Approval detected for ${afterData.email}. Transmitting notification...`,
      );

      try {
        await sendProtocolEmail({
          to: afterData.email,
          subject: "✅ Protocol Access Approved",
          html: `
          <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #5cb85c;">Access Request Approved</h2>
            <p>Greetings,</p>
            <p>Your request for elevated clearance on the Iopic identity substrate has been processed successfully.</p>
            <hr>
            <p><strong>Granted Role:</strong> <span style="background: #5cb85c; color: white; padding: 2px 5px; border-radius: 3px;">${afterData.requestedRole}</span></p>
            <hr>
            <p>To initialize your new permissions, please refresh your application substrate or use the <strong>Synchronize Identity Substrate</strong> button on the Access Denied page.</p>
            <p style="font-size: 0.8rem; color: #777;">This is an automated synchronization notification from the Iopic Protocol.</p>
          </div>
        `,
        });
        console.log(
          `✅ Approval notification successfully transmitted to: ${afterData.email}`,
        );
      } catch (error) {
        console.error("❌ Failed to transmit user notification:", error);
      }
    } else if (
      beforeData.status !== "Denied" &&
      afterData.status === "Denied"
    ) {
      console.log(
        `Denial detected for ${afterData.email}. Transmitting notification...`,
      );

      try {
        await sendProtocolEmail({
          to: afterData.email,
          subject: "❌ Protocol Access Denied",
          html: `
          <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #d9534f;">Access Request Denied</h2>
            <p>Greetings,</p>
            <p>Your request for elevated clearance on the Iopic identity substrate has been reviewed and declined at this time.</p>
            <hr>
            <p><strong>Reason for Denial:</strong> ${afterData.denialReason || "Insufficient credentials or protocol mismatch."}</p>
            <hr>
            <p style="font-size: 0.8rem; color: #777;">This is an automated synchronization notification from the Iopic Protocol.</p>
          </div>
        `,
        });
        console.log(
          `✅ Denial notification successfully transmitted to: ${afterData.email}`,
        );
      } catch (error) {
        console.error("❌ Failed to transmit denial notification:", error);
      }
    }
  },
);

/**
 * Cloud Function to pre-aggregate daily email statistics.
 * Triggered when a document is created in 'email_logs'.
 */
exports.aggregateDailyStats = onDocumentCreated(
  "email_logs/{logId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();

    // Validate document structure before processing
    const result = emailLogSchema.safeParse(data);
    if (!result.success) {
      console.error(
        `❌ Aggregation skipped: Invalid log structure for ${event.params.logId}:`,
        result.error.format(),
      );
      return;
    }

    await updateDailyStats(result.data, event.params.logId, 1);
  },
);

/**
 * Cloud Function to decrement daily email statistics.
 * Triggered when a document is deleted from 'email_logs'.
 */
exports.decrementDailyStats = onDocumentDeleted(
  "email_logs/{logId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();

    // Validate document structure before processing
    const result = emailLogSchema.safeParse(data);
    if (!result.success) {
      console.warn(
        `⚠️ Decrement skipped: Could not validate deleted log ${event.params.logId}. Statistics may diverge.`,
      );
      return;
    }

    await updateDailyStats(result.data, event.params.logId, -1);
  },
);

// ============================================================================
// SECURE EXPRESS API
// ============================================================================
const app = express();

// Initialize Multer with Memory Storage for serverless file handling
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to automatically parse JSON request bodies
app.use(express.json());
// Middleware to automatically parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

/**
 * Express Middleware to Verify Firebase Auth Tokens
 */
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided." });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach decoded token (UID, email, claims) to the request
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid or expired token." });
  }
}

/**
 * Express Middleware to require 'admin' custom claim
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res
      .status(401)
      .json({ error: "Unauthorized: No user session found." });
  }

  if (req.user.admin === true) {
    next();
  } else {
    return res
      .status(403)
      .json({ error: "Forbidden: Admin clearance required." });
  }
}

// Apply the security middleware to specific routes
app.get("/secure-data", verifyFirebaseToken, (req, res) => {
  res.json({
    message: "Access granted.",
    uid: req.user.uid,
    email: req.user.email,
  });
});

// Apply BOTH middlewares to protect an admin-only route
app.get("/admin-data", verifyFirebaseToken, requireAdmin, (req, res) => {
  res.json({ message: "Access granted to admin substrate." });
});

// Example POST route handling a JSON body
app.post("/admin-action", verifyFirebaseToken, requireAdmin, (req, res) => {
  // The parsed JSON payload is now available on req.body
  const payload = req.body;

  // Process the payload...
  res.json({
    message: "Admin action received successfully.",
    receivedData: payload,
  });
});

// Example POST route handling a multipart/form-data file upload
app.post(
  "/upload-file",
  verifyFirebaseToken,
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    // Multer attaches the file to `req.file` and any extra text fields to `req.body`
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    try {
      // Get a reference to the default Cloud Storage bucket
      const bucket = admin.storage().bucket();

      // Create a unique destination path to prevent overwriting files
      const destinationPath = `uploads/${Date.now()}_${req.file.originalname}`;
      const fileRef = bucket.file(destinationPath);

      // Upload the raw buffer directly to Cloud Storage
      await fileRef.save(req.file.buffer, {
        contentType: req.file.mimetype,
      });

      // Generate a signed URL that expires in 1 hour
      const [downloadUrl] = await fileRef.getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000, // 1 hour from now
        version: "v4", // Use the recommended v4 signing process
      });

      res.json({
        message: "File uploaded to Cloud Storage successfully.",
        fileDetails: {
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          storagePath: destinationPath,
          downloadUrl: downloadUrl,
        },
      });
    } catch (error) {
      console.error("Cloud Storage upload failed:", error);
      res
        .status(500)
        .json({ error: "Failed to upload file to Cloud Storage." });
    }
  },
);

// Example POST route to generate a signed URL for direct-to-storage uploads
app.post(
  "/generate-upload-url",
  verifyFirebaseToken,
  requireAdmin,
  async (req, res) => {
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
      return res
        .status(400)
        .json({ error: "Missing filename or contentType in request body." });
    }

    try {
      const bucket = admin.storage().bucket();
      const destinationPath = `uploads/direct/${Date.now()}_${filename}`;
      const fileRef = bucket.file(destinationPath);

      // Generate a signed URL that allows a PUT request for 15 minutes
      const [uploadUrl] = await fileRef.getSignedUrl({
        version: "v4",
        action: "write", // Generates a URL specifically for uploading
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: contentType, // Enforces that the client sends this exact content type
      });

      res.json({
        message: "Signed upload URL generated successfully.",
        uploadUrl,
        storagePath: destinationPath,
      });
    } catch (error) {
      console.error("Failed to generate signed URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL." });
    }
  },
);

// Expose the Express app as a Firebase HTTP Function
// Notice that we omit the "/api" prefix here because Vite/Nginx automatically proxy "/api/*" to this function
exports.api = onRequest(
  {
    cors: true,
    region: apiRegion,
    memory: "1GiB",
    concurrency: apiConcurrency,
    vpcConnector: "your-vpc-connector-name",
    vpcConnectorEgressSettings: "PRIVATE_RANGES_ONLY", // or "ALL_TRAFFIC"
    secrets: [myApiKey], // Explicitly grant this function access to the secret
  },
  app,
);
