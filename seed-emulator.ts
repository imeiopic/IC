import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";

// 1. Force the Admin SDK to connect to the local emulators
// These ports must match your firebase.json configuration
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

const PROJECT_ID = "demo-iopic-world";

// 2. Initialize the Admin SDK
// We use the same projectId found in your vitest.rules.setup.ts / firestore.spec.ts
admin.initializeApp({
  projectId: PROJECT_ID,
});

const db = admin.firestore();
const auth = admin.auth();

async function seedDatabase() {
  console.log("🌱 Starting emulator seeding process...");

  try {
    console.log("🧹 Wiping existing emulator data to prevent duplication...");
    // Clear Authentication Emulator
    await fetch(
      `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/accounts`,
      { method: "DELETE" },
    );
    // Clear Firestore Emulator
    await fetch(
      `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
      { method: "DELETE" },
    );

    // Use a batch for efficient Firestore writes
    const batch = db.batch();
    const NUM_USERS = 15; // Number of mock users to generate

    // Pre-generate all UIDs so we can link users together relationally
    const allUids = Array.from({ length: NUM_USERS }, () =>
      faker.string.uuid(),
    );

    for (let i = 0; i < NUM_USERS; i++) {
      const uid = allUids[i];

      // Generate realistic fake data
      const email = faker.internet.email();
      const displayName = faker.person.fullName();

      // A. Create the user in Firebase Authentication
      await auth.createUser({
        uid,
        email,
        password: "password123", // Hardcoded password so you can easily log in locally
        displayName,
      });

      // B. Create the corresponding document in the 'invitees' collection
      const inviteeRef = db.collection("invitees").doc(uid);

      const inviteeData = {
        name: displayName,
        level: faker.helpers.arrayElement(["Member", "Vector", "Guest"]),
        status: faker.helpers.arrayElement(["Pending", "Active"]),
        inviteePays: faker.datatype.boolean(),
        targetUid: faker.string.uuid(),
        inviterUid: "system",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(inviteeRef, inviteeData);

      // C. Create a corresponding document in the 'instances' collection
      const instanceId = faker.string.uuid();
      const instanceRef = db.collection("instances").doc(instanceId);

      const instanceData = {
        name: `${displayName}'s Space`,
        status: faker.helpers.arrayElement([
          "INIT",
          "PENDING",
          "ACTIVE_IN_VRE",
        ]),
        vre_id: `vre-${faker.string.numeric(4)}`,
        creatorId: uid,
        participants: [
          uid,
          // Randomly pick 2 other existing mock users to be guests
          ...faker.helpers.arrayElements(
            allUids.filter((id) => id !== uid),
            2,
          ),
        ],
      };

      batch.set(instanceRef, instanceData);

      // D. Save the sensitive access code to the restricted subcollection
      const secretRef = instanceRef.collection("secrets").doc("private");
      batch.set(secretRef, {
        accessCode: faker.string.alphanumeric(8),
      });
    }

    // E. Commit the Firestore batch
    await batch.commit();
    console.log(
      `✅ Successfully seeded ${NUM_USERS} users, invitees, and instance documents!`,
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seedDatabase();
