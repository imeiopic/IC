import admin from 'firebase-admin';
import crypto from 'crypto';

// Client SDK imports for Firestore operations subject to rules
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth';
/**
 * Iopic Emulator Seeding Script
 * This script populates the local Firestore emulator with initial test data.
 */

// 1. Force Admin SDK to connect to the local emulators
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

admin.initializeApp({
  projectId: 'calcium-channel-489906-m2'
});

const db = admin.firestore();
const auth = admin.auth();

// Client SDK initialization for operations subject to rules
const firebaseConfig = {
  projectId: 'calcium-channel-489906-m2' // Only project ID needed for emulator
};
const clientApp = initializeApp(firebaseConfig, 'clientSeedApp'); // Use a different app name
const dbClient = getFirestore(clientApp);
const authClient = getAuth(clientApp);

// Connect client SDK to emulators
connectFirestoreEmulator(dbClient, '127.0.0.1', 8080);
connectAuthEmulator(authClient, 'http://127.0.0.1:9099');

// Define a system user for client-side operations
const SYSTEM_UID = 'system';
const SYSTEM_EMAIL = 'system@iopic.world';

// Configuration for performance testing (1000+ users)
const PERF_USER_COUNT = 0; // Year 0: No external noise or performance nodes yet.

// Hashing configuration for auth.importUsers
// For emulator, we use a simple, consistent setup.
const HASH_ALGORITHM = 'HMAC_SHA256';
const HASH_KEY = Buffer.from('emulator-secret-key-for-testing-only-do-not-use-in-prod'); // Must be a Buffer
const HASH_SALT_LENGTH = 16; // bytes

// Function to generate password hash and salt for importUsers
function generatePasswordHashAndSalt(password) {
  const salt = crypto.randomBytes(HASH_SALT_LENGTH);
  const hash = crypto.createHmac('sha256', HASH_KEY).update(password).update(salt).digest();
  return { passwordHash: hash, passwordSalt: salt };
}

async function seed() {
  console.log('🌱 Starting emulator seed sequence...');

  // Add a dedicated system user for client-side operations
  const systemUser = {
    uid: SYSTEM_UID,
    email: SYSTEM_EMAIL,
    password: 'systempassword',
    fullName: "Iopic System",
    isPremium: true, // System user can be premium
    customClaims: { system: true }
  };
  const bootstrapUsers = [
    {
      uid: 'ime-iopic-id',
      email: 'ime@iopic.world',
      password: 'password123', // Plain text for individual createUser
      fullName: "Ime Iopic",
      isPremium: true,
      customClaims: { admin: true }
    },
    systemUser // Add system user to bootstrap
  ];

  // Generate performance test users
  const perfUsersForImport = [];
  const perfUsersForFirestore = []; // Separate array for Firestore batching
  const commonPassword = 'password123'; // Common password for all perf users

  for (let i = 0; i < PERF_USER_COUNT; i++) {
    const userUid = `perf-user-${i}`;
    const userEmail = `perf-${i}@example.com`;
    const userFullName = `Perf Test User ${i}`;
    const userIsPremium = i % 2 === 0;

    const { passwordHash, passwordSalt } = generatePasswordHashAndSalt(commonPassword);

    perfUsersForImport.push({
      uid: userUid,
      email: userEmail,
      passwordHash: passwordHash,
      passwordSalt: passwordSalt,
      displayName: userFullName,
      emailVerified: true
    });

    perfUsersForFirestore.push({
      uid: userUid,
      email: userEmail,
      fullName: userFullName,
      isPremium: userIsPremium
    });
  }

  // Combine all users for Firestore seeding, excluding passwords from bootstrap users
  const allUsersForFirestore = [
    ...bootstrapUsers.map(({ password, ...rest }) => rest),
    ...perfUsersForFirestore
  ];

  const invites = [
    {
      id: 'initial-system-invite',
      inviterUid: 'system',
      targetUid: 'ime-iopic-id',
      name: 'Initial Handshake',
      status: 'Active'
    }
  ];

  try {
    // --- Auth Seeding ---
    // Admin SDK is used here as client SDK cannot create users with arbitrary UIDs or import in bulk.
    console.log(`- Seeding ${bootstrapUsers.length} bootstrap Auth users...`);
    for (const user of bootstrapUsers) {
      try {
        await auth.createUser({
          uid: user.uid,
          email: user.email,
          password: user.password, // Use plain text password for individual creation
          displayName: user.fullName,
          emailVerified: true
        });
      } catch (error) {
        if (error.code !== 'auth/uid-already-exists') throw error;
      }

      // Automatically inject custom claims (admin, editor, etc.) defined in the user object.
      // We do this outside the try/catch to ensure claims are updated even for existing users.
      if (user.customClaims) {
        await auth.setCustomUserClaims(user.uid, user.customClaims);
        console.log(`  ✅ Claims injected for ${user.uid}:`, JSON.stringify(user.customClaims));
      }
    }

    if (perfUsersForImport.length > 0) {
      console.log(`- Importing ${perfUsersForImport.length} performance Auth users...`);
      const importResult = await auth.importUsers(perfUsersForImport, {
        hash: {
          algorithm: HASH_ALGORITHM,
          key: HASH_KEY
        }
      });

      if (importResult.errors.length > 0) {
        console.warn('  Some users failed to import:');
        importResult.errors.forEach(err => console.warn(`    UID: ${err.index}, Reason: ${err.reason}`));
      } else {
        console.log('  All performance users imported successfully.');
      }
    }

    // --- Client SDK Authentication ---
    // We must sign in as the 'system' user so that the Client SDK requests 
    // satisfy the isSystem() check in firestore.rules.
    console.log(`- Authenticating Client SDK as ${SYSTEM_UID}...`);
    await signInWithEmailAndPassword(authClient, SYSTEM_EMAIL, 'systempassword');

    // --- Firestore Seeding ---
    // Using Client SDK writeBatch (limited to 500 operations)
    let batch = writeBatch(dbClient);
    let operationCount = 0;

    console.log(`- Seeding ${allUsersForFirestore.length} total users in Firestore (Bootstrap + Performance Batch)...`);

    for (const user of allUsersForFirestore) {
      const userRef = doc(dbClient, 'identities', user.uid);
      batch.set(userRef, { // Use set for initial creation
        fullName: user.fullName,
        email: user.email,
        status: "Active", // Assuming all seeded users are active
        version: 100, // Custom version to verify isSystem() bypass in rules
        lastModified: serverTimestamp(),
        isPremium: user.isPremium
      });

      operationCount++;

      if (operationCount === 500) {
        await batch.commit();
        console.log('  [Firestore Batch Commit: 500 records synchronized]');
        batch = writeBatch(dbClient);
        operationCount = 0;
      }
    }
    
    // Commit remaining users
    if (operationCount > 0) await batch.commit(); // Commit any remaining records
    console.log(`  [Firestore Batch Commit: ${operationCount} remaining records synchronized]`);

    for (const invite of invites) {
      console.log(`- Seeding invite: ${invite.name} (Client SDK)...`);
      await setDoc(doc(dbClient, 'invitees', invite.id), {
        inviterUid: invite.inviterUid,
        targetUid: invite.targetUid,
        name: invite.name,
        status: invite.status,
        level: "Member",
        inviteePays: false,
        inviteePaysHalf: false,
        version: 50, // Custom version to verify isSystem() bypass in rules
        lastModified: serverTimestamp()
      });
    }

    console.log('✅ Seeding complete. Your local substrate is ready.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed().then(() => {
  // We don't exit if running via a watcher, but for a one-off script we do.
  process.exit(0);
});