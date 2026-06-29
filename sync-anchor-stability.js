const admin = require('firebase-admin');
const { program } = require('commander');

program
  .name('sync-anchor-stability')
  .description('Synchronize the thread stability of a specific node anchor')
  .requiredOption('-p, --project-id <id>', 'Target Firebase Project ID')
  .option('-e, --use-emulator', 'Connect to local Firestore Emulator')
  .option('-n, --node-id <id>', 'Target Node ID', 'cleveland-root-anchor')
  .action(async (options) => {
    if (options.useEmulator) {
      process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
      console.log('🛠️  Connecting to local Firestore Emulator...');
    }

    admin.initializeApp({
      projectId: options.projectId
    });

    const db = admin.firestore();
    const nodeRef = db.collection('identities').doc(options.nodeId);

    try {
      console.log(`📡 Updating stability for node: ${options.nodeId}...`);
      await nodeRef.update({
        threadStability: [true, true, true, true],
        lastModified: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Success: ${options.nodeId} thread stability set to [true, true, true, true].`);
    } catch (error) {
      console.error('❌ Failure:', error.message);
      process.exit(1);
    }
  });

program.parse();
