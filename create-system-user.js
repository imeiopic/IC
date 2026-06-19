const admin = require('firebase-admin');
const { program } = require('commander');

/**
 * Iopic Protocol: System User Creation Utility
 * Creates a dedicated user with UID 'system' and sets the 'system' custom claim.
 */

program
  .name('create-system-user')
  .description('Create a dedicated system user with root claims')
  .version('1.0.0')
  .requiredOption('-p, --project-id <id>', 'Target Firebase Project ID substrate')
  .option('-e, --use-emulator', 'Connect to local Firestore/Auth Emulator substrate')
  .option('-d, --dry-run', 'Log intended changes without making modifications')
  .argument('<email>', 'Email for the system user')
  .argument('<password>', 'Password for the system user')
  .action(async (email, password, options) => {
    await createSystemUser(email, password, options);
  });

async function createSystemUser(email, password, options) {
  const isDryRun = options.dryRun;

  if (options.useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    console.log('🛠️  Connecting to local Emulator substrate...');
  } else if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn(
      '⚠️  Warning: GOOGLE_APPLICATION_CREDENTIALS not set. Ensure you are authenticated via gcloud CLI or service account key.'
    );
  }

  // Initialize Firebase Admin SDK. This should be done once.
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: options.projectId
    });
  } catch (initError) {
    console.error('❌ FAILURE: Failed to initialize Firebase Admin SDK:', initError.message);
    process.exit(1);
  }
  const auth = admin.auth();
  const db = admin.firestore();

  if (isDryRun)
    console.log('🛡️  DRY RUN MODE: No modifications will be made to Auth or Firestore.');

  try {
    let user;
    let userExists = false;

    try {
      // Check existence first to avoid side-effects during dry run
      user = await auth.getUserByEmail(email);
      userExists = true;
    } catch (e) {
      if (e.code !== 'auth/user-not-found') throw e;
    }

    if (userExists) {
      console.log('⚠️  System user already exists. Preparing update sequence...');
      if (isDryRun) {
        console.log(`🔍 [DRY RUN] Would update password and display name for user: ${user.uid}`);
      } else {
        await auth.updateUser(user.uid, { password, displayName: 'System Root Steward' });
        console.log(`✅ Success: Updated system user: ${user.uid}`);
      }
    } else {
      if (isDryRun) {
        console.log(`🔍 [DRY RUN] Would create new system user: ${email} (UID: system)`);
        // Mock user object for script flow
        user = { uid: 'system', email: email, displayName: 'System Root Steward' };
      } else {
        user = await auth.createUser({
          uid: 'system',
          email: email,
          password: password,
          displayName: 'System Root Steward'
        });
        console.log(`✅ Success: Created new system user with UID: ${user.uid}`);
      }
    }

    // Set the critical 'system' claim recognized by Firestore rules
    const claims = { system: true, admin: true };
    if (isDryRun) {
      console.log(`🔍 [DRY RUN] Would set custom claims: ${JSON.stringify(claims)}`);
    } else {
      await auth.setCustomUserClaims(user.uid, claims);
      console.log(`🚀 System claims granted: ${JSON.stringify(claims)}`);
    }

    // Synchronize the identity substrate for protocol queries
    const identityData = {
      uid: user.uid,
      email: user.email,
      fullName: user.displayName,
      customClaims: claims,
      isSystem: true,
      isAdmin: true,
      lastModified: admin.firestore.FieldValue.serverTimestamp(),
      version: 1
    };

    if (isDryRun) {
      console.log(
        `🔍 [DRY RUN] Would synchronize identity document to Firestore: ${JSON.stringify(
          identityData
        )}`
      );
    } else {
      await db.collection('identities').doc(user.uid).set(identityData, { merge: true });
      console.log('📑 Identity substrate synchronized.');
    }

    const resultStatus = isDryRun
      ? 'Dry run complete. Logic validated.'
      : 'Account ready for automated synchronization.';
    console.log(`\n✨ DONE: ${resultStatus}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ FAILURE: System user utility aborted:', error.message);
    process.exit(1);
  }
}

program.parse();
