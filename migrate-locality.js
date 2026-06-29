const admin = require('firebase-admin');
const { program } = require('commander');

/**
 * Iopic Protocol: Locality Migration Utility
 * Renames the legacy 'city' field to 'locality' within the 'ideals' map
 * to comply with the updated Locality-First security schema.
 */

program
  .name('migrate-locality')
  .description('Migrate "city" to "locality" in user ideals')
  .version('1.0.0')
  .requiredOption('-p, --project-id <id>', 'Target Firebase Project ID')
  .option('-e, --use-emulator', 'Connect to local Firestore Emulator')
  .option('-d, --dry-run', 'Log intended changes without making modifications')
  .action(async (options) => {
    await runMigration(options);
  });

async function runMigration(options) {
  if (options.useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    console.log('🛠️  Connecting to local Firestore Emulator...');
  }

  admin.initializeApp({
    projectId: options.projectId
  });

  const db = admin.firestore();
  const usersRef = db.collection('users');

  try {
    const snapshot = await usersRef.get();
    console.log(`🔍 Found ${snapshot.size} user documents. Scanning for legacy fields...`);

    let batch = db.batch();
    let operationCount = 0;
    let migrateCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Check if 'ideals' exists and contains 'city'
      if (data.ideals && 'city' in data.ideals) {
        const oldCityValue = data.ideals.city;
        
        console.log(`[MATCH] User ${doc.id}: "${oldCityValue}" -> locality`);

        // Construct the new ideals object to replace the old one entirely
        // This ensures compliance with .hasOnly(['locality'])
        const updatedIdeals = {
          locality: oldCityValue
        };

        if (!options.dryRun) {
          batch.update(doc.ref, { ideals: updatedIdeals });
          operationCount++;
          migrateCount++;

          // Firestore batches are limited to 500 operations
          if (operationCount === 500) {
            console.log('📦 Committing batch of 500...');
            batch.commit();
            batch = db.batch();
            operationCount = 0;
          }
        } else {
          migrateCount++;
        }
      }
    });

    if (operationCount > 0 && !options.dryRun) {
      await batch.commit();
    }

    const status = options.dryRun ? 'DRY RUN COMPLETE' : 'MIGRATION COMPLETE';
    console.log(`\n✨ ${status}: Found and processed ${migrateCount} users.`);
  } catch (error) {
    console.error('❌ FAILURE: Migration aborted:', error.message);
  }
}

program.parse();