const admin = require('firebase-admin');
const { program } = require('commander');

/**
 * Iopic Protocol: Daily Stats Backfill Utility
 * Synchronizes the 'daily_stats' collection with historical data from 'email_logs'.
 */

program
  .name('backfill-daily-stats')
  .description('Synchronizes the daily_stats collection with historical data from email_logs')
  .version('1.0.0')
  .requiredOption('-p, --project-id <id>', 'Target Firebase Project ID substrate')
  .option('-e, --use-emulator', 'Connect to local Firestore Emulator substrate')
  .option('-s, --status <type>', 'Filter logs by specific status', 'Success')
  .option('-d, --dry-run', 'Log intended changes without writing to Firestore')
  .parse(process.argv);

const options = program.opts();
const targetStatus = options.status;
const isDryRun = options.dryRun;
const targetProjectId = options.projectId;

if (options.useEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  console.log('🛠️  Connecting to local Firestore Emulator substrate...');
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: targetProjectId
});

const db = admin.firestore();

async function backfillDailyStats() {
  console.log(`🌱 Initializing backfill sequence for status: ${targetStatus}...`);

  const statsMap = new Map();
  let processedLogs = 0;
  let lastDoc = null;
  const PAGE_SIZE = 1000;

  try {
    console.log('🔍 Scanning email_logs for historical data points...');

    // Paging through the collection to handle high-volume substrates efficiently
    while (true) {
      // IMPORTANT: This query requires a composite index in Firestore:
      // Collection: 'email_logs'
      // Fields: 'status' (Ascending), 'timestamp' (Ascending)
      // Without this index, the query will fail for large datasets.
      let q = db
        .collection('email_logs')
        .where('status', '==', targetStatus)
        .orderBy('timestamp')
        .limit(PAGE_SIZE);
      if (lastDoc) q = q.startAfter(lastDoc);

      const snapshot = await q.get();
      if (snapshot.empty) break;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const ts = data.timestamp;
        if (!ts) return;

        // Maintain Logic Sovereignty by using the same date ID format as the Cloud Function
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        const dateId = date.toISOString().split('T')[0];
        const bytes = data.byteSize || 0;

        if (!statsMap.has(dateId)) {
          statsMap.set(dateId, { count: 0, totalByteSize: 0 });
        }

        const day = statsMap.get(dateId);
        day.count += 1;
        day.totalByteSize += bytes;
        processedLogs++;
      });

      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      console.log(`   - Processed ${processedLogs} logs...`);
    }

    console.log(`📊 Aggregation complete: ${statsMap.size} distinct days mapped.`);
    if (isDryRun) console.log('🛡️  DRY RUN MODE: No data will be written to the substrate.');

    console.log('🔄 Synchronizing daily_stats substrate...');

    const batchLimit = 500;
    let batch = db.batch();
    let opsCount = 0;

    for (const [dateId, stats] of statsMap.entries()) {
      const updateData = {
        count: stats.count,
        totalByteSize: stats.totalByteSize,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      };

      if (isDryRun) {
        console.log(
          `🔍 [DRY RUN] Would write ${dateId}: Count ${stats.count}, Size ${stats.totalByteSize} bytes`
        );
      } else {
        const statsRef = db.collection('daily_stats').doc(dateId);
        // Overwrite with absolute calculated totals to restore definitive state
        batch.set(statsRef, updateData);

        if (++opsCount === batchLimit) {
          await batch.commit();
          batch = db.batch();
          opsCount = 0;
        }
      }
    }

    if (!isDryRun && opsCount > 0) await batch.commit();

    const resultStatus = isDryRun
      ? 'Dry run complete. Logic validated.'
      : 'Substrate synchronized.';
    console.log(
      `✨ SUCCESS: ${resultStatus} ${processedLogs} logs analyzed across ${statsMap.size} days.`
    );
  } catch (error) {
    console.error('❌ FAILURE: Backfill sequence aborted:', error.message);
    process.exit(1);
  }
}

backfillDailyStats();
