const admin = require('firebase-admin');
const { program } = require('commander');

/**
 * Refactored to use Application Default Credentials (ADC).
 * This is more secure for local development as it avoids local JSON keys.
 */

program
  .name('firestore-local-test')
  .description('Tests connection to Firestore (or emulator)')
  .version('1.0.0')
  .requiredOption('-p, --project-id <id>', 'Target Firebase Project ID')
  .option('-e, --use-emulator', 'Connect to local Firestore Emulator', false)
  .parse(process.argv);

const options = program.opts();
const targetProjectId = options.projectId;

if (options.useEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  console.log('🛠️  Connecting to local Firestore Emulator...');
}

async function testFirestoreConnection() {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: targetProjectId
    });
  } catch (initError) {
    console.error('❌ FAILURE: Failed to initialize Firebase Admin SDK:', initError.message);
    process.exit(1);
  }
  const db = admin.firestore();
  try {
    console.log('Attempting to fetch collections from Firestore...');
    const collections = await db.listCollections();

    console.log('✅ Connection Successful!');
    console.log(
      'Available collections:',
      collections.map((col) => col.id)
    );
  } catch (error) {
    console.error('❌ FAILURE: Firestore connection failed:', error.message);
    process.exit(1);
  }
}

testFirestoreConnection();
