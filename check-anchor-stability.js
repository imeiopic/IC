const admin = require('firebase-admin');
const { program } = require('commander');
const { checkSovereignState } = require('./mobius-helpers.cjs');

program
  .name('check-anchor-stability')
  .description('Check the current thread stability state of a specific node anchor')
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
      console.log(`📡 Fetching stability data for node: ${options.nodeId}...`);
      const doc = await nodeRef.get();
      
      if (!doc.exists) {
        console.error(`❌ Error: Node ${options.nodeId} not found in the identity substrate.`);
        process.exit(1);
      }

      const data = doc.data();
      const threads = data.threadStability || [];
      const status = checkSovereignState(threads);

      console.log(`\n--- Anchor Stability Report: ${options.nodeId} ---`);
      console.log(`Thread State: [${threads.join(', ')}]`);
      console.log(`Gate Resolution: ${status}`);
      console.log(`Protocol ID: ${data.protocolId || 'N/A'}`);
      console.log(`Parity Orientation: ${data.parityOrientation || 'N/A'}`);
      console.log(`Last Modified: ${data.lastModified ? data.lastModified.toDate().toLocaleString() : 'N/A'}`);
      console.log(`---------------------------------------------------\n`);
      
      if (status === 'SOVEREIGN_RESOLVED') {
        console.log('✅ Node is synchronized and ready for terminal extraction.');
      } else {
        console.warn('⚠️  Node is in drift. Run sync-anchor-stability.js to align the threads.');
      }
    } catch (error) {
      console.error('❌ Failure:', error.message);
      process.exit(1);
    }
  });

program.parse();
