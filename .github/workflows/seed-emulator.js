const admin = require('firebase-admin');
const { program } = require('commander');

/**
 * Iopic Protocol: Firebase Emulator Seeder Utility
 * Populates Firestore and Firebase Auth emulators with mock data for testing.
 */

program
  .name('seed-emulator')
  .description('Populates Firestore and Firebase Auth emulators with mock data')
  .version('1.0.0')
  .requiredOption('-p, --project-id <id>', 'Target Firebase Project ID (e.g., demo-project-id)')
  .option('-e, --use-emulator', 'Connect to local Firestore and Auth Emulators', true) // Default to true for a seed script
  .option('--days <number>', 'Number of days back to generate email logs for', parseInt, 7)
  .option('--logs-per-day <number>', 'Number of email logs to generate per day', parseInt, 100)
  .option('--seed-system-user', 'Also seed a system user in Auth and Firestore', false)
  .parse(process.argv);

const options = program.opts();
const targetProjectId = options.projectId;
const numDays = options.days;
const logsPerDay = options.logsPerDay;
const seedSystemUser = options.seedSystemUser;

if (options.useEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
  console.log('🛠️  Connecting to local Firebase Emulators...');
} else {
  console.warn(
    '⚠️  Warning: Not using emulator. Ensure GOOGLE_APPLICATION_CREDENTIALS is set for a real project.'
  );
}

let db;
let auth;

async function initializeFirebase() {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: targetProjectId
    });
    db = admin.firestore();
    auth = admin.auth();
    console.log('✅ Firebase Admin SDK initialized.');
  } catch (initError) {
    console.error('❌ FAILURE: Failed to initialize Firebase Admin SDK:', initError.message);
    process.exit(1);
  }
}

async function generateMockEmailLogs(numDays, logsPerDay) {
  console.log(`Generating ${logsPerDay} mock email logs for ${numDays} days...`);
  let batch = db.batch();
  let totalLogs = 0;
  const statuses = ['Success', 'Failed', 'Pending'];

  for (let i = 0; i < numDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i); // Go back 'i' days

    for (let j = 0; j < logsPerDay; j++) {
      const logRef = db.collection('email_logs').doc(); // Auto-ID
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomByteSize = Math.floor(Math.random() * 10000) + 100; // 100 to 10100 bytes

      batch.set(logRef, {
        status: randomStatus,
        timestamp: admin.firestore.Timestamp.fromDate(date),
        byteSize: randomByteSize,
        recipient: `user${totalLogs}@example.com`,
        subject: `Mock Email Subject ${totalLogs}`
      });

      totalLogs++;
      if (totalLogs % 500 === 0) {
        await batch.commit();
        console.log(`   - Committed ${totalLogs} email logs...`);
        batch = db.batch(); // Start a new batch
      }
    }
  }

  // Commit any remaining operations in the last batch
  if (totalLogs % 500 !== 0 || totalLogs === 0) {
    await batch.commit();
  }
  console.log(`✅ Successfully generated and committed ${totalLogs} mock email logs.`);
}

async function createMockSystemUser() {
  const email = 'system@example.com';
  const password = 'password123'; // A simple password for emulator testing
  const uid = 'system';
  const displayName = 'System Root Steward';

  console.log(`Attempting to create/update system user (UID: ${uid}, Email: ${email})...`);

  try {
    let userRecord;
    try {
      userRecord = await auth.getUser(uid);
      console.log(`⚠️  System user with UID '${uid}' already exists. Updating...`);
      await auth.updateUser(uid, { email, password, displayName });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`✨ Creating new system user with UID '${uid}'...`);
        userRecord = await auth.createUser({ uid, email, password, displayName });
      } else {
        throw error;
      }
    }

    // Set custom claims
    const claims = { system: true, admin: true };
    await auth.setCustomUserClaims(userRecord.uid, claims);
    console.log(`🚀 System claims granted for ${userRecord.uid}: ${JSON.stringify(claims)}`);

    // Synchronize to Firestore identities collection
    await db.collection('identities').doc(userRecord.uid).set(
      {
        uid: userRecord.uid,
        email: userRecord.email,
        fullName: userRecord.displayName,
        customClaims: claims,
        isSystem: true,
        isAdmin: true,
        lastModified: admin.firestore.FieldValue.serverTimestamp(),
        version: 1
      },
      { merge: true }
    );
    console.log('📑 System user identity synchronized to Firestore.');
    console.log(`✅ System user setup complete for ${email}.`);
  } catch (error) {
    console.error('❌ FAILURE: Failed to create/update system user:', error.message);
    throw error; // Re-throw to be caught by main try-catch
  }
}

async function main() {
  await initializeFirebase();

  try {
    await generateMockEmailLogs(numDays, logsPerDay);

    if (seedSystemUser) {
      await createMockSystemUser();
    }

    console.log('\n🎉 Emulator seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ FAILURE: Emulator seeding aborted:', error.message);
    process.exit(1);
  }
}

main();
