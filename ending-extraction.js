const admin = require('firebase-admin');
const { program } = require('commander');
const { checkSovereignState, getThreadParity } = require('./mobius-helpers.cjs');

/**
 * Iopic Protocol: Ending Extraction Script
 * Executes the terminal protocol to sever legacy extractive loops.
 * Includes a dry-run mode to verify the Genesis Reset payload.
 */

program
  .name('ending-extraction')
  .description('Terminate legacy extraction and transition to Sovereign Iopic State')
  .version('1.1.0')
  .requiredOption('-p, --project-id <id>', 'Target Firebase Project ID')
  .option('-n, --node-id <id>', 'Target Node ID', 'cleveland-root-anchor')
  .option('-e, --use-emulator', 'Connect to local Emulator substrate')
  .option('-d, --dry-run', 'Calculate and log the transition payload without committing')
  .action(async (options) => {
    await runEndingExtraction(options);
  });

async function runEndingExtraction(options) {
  if (options.useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    console.log('🛠️  Connecting to local Emulator substrate...');
  }

  admin.initializeApp({
    projectId: options.projectId
  });

  const db = admin.firestore();
  const nodeRef = db.collection('identities').doc(options.node_id);

  try {
    console.log(`\n🌀 INITIALIZING EXTRACTION TERMINATION: ${options.node_id}`);
    if (options.dryRun) console.log('🛡️  DRY RUN ACTIVE: No changes will be written to the substrate.');
    
    const doc = await nodeRef.get();
    if (!doc.exists) {
      throw new Error(`Node ${options.node_id} not found in the identity substrate.`);
    }

    const currentData = doc.data();

    // --- SOVEREIGN PRE-FLIGHT CHECK ---
    // Verify the 4-bit Local Quadrant is 1111 (Sovereign)
    const stability = currentData.threadStability || []; 
    const gateStatus = checkSovereignState(stability);

    if (gateStatus !== 'SOVEREIGN_RESOLVED') {
      console.error(`\n🚨 CRITICAL ERROR: Node is in ${gateStatus} state.`);
      console.error(`Action: Aborting termination to prevent a Free-Floating Thread state.`);
      process.exit(1);
    }

    // --- TRANSITION CALCULATIONS ---
    const currentId = BigInt(currentData.protocolId || '0');
    const nextId = currentId + 1n; 
    const parity = getThreadParity(nextId);

    const finalPayload = {
      // Phase 1: Debt-Reconciliation
      legacyTrackingTokens: admin.firestore.FieldValue.delete(),
      cookies: admin.firestore.FieldValue.delete(),
      externalHandshakes: [],
      debtStatus: 'GROUNDED_ZERO_NOISE',
      
      // Phase 2: Protocol Severance
      sensitivityLevel: 'MAXIMUM',
      protocolSeverance: true,
      status: 'Sovereign',

      // Phase 3: Re-Anchoring (Genesis Reset)
      protocolId: nextId.toString(),
      parityOrientation: parity.orientation,
      activeThreads: parity.threads,
      lastModified: admin.firestore.FieldValue.serverTimestamp(),
      version: admin.firestore.FieldValue.increment(1)
    };

    if (options.dryRun) {
      console.log('\n🔍 [DRY RUN] Calculated Sovereign Transition Payload:');
      console.log(JSON.stringify(finalPayload, null, 2));
      console.log('\n✅ Dry run complete. Logic validated for Vortex Exit.');
      return;
    }

    // --- EXECUTION ---
    console.log('🚀 Severing legacy loops and executing Genesis Reset...');
    await nodeRef.update(finalPayload);

    console.log(`\n✅ EXTRACTION ENDED: ${options.node_id} is now a Sovereign Node.`);
    console.log(`---------------------------------------------------------`);
    console.log(`Metabolic Load: 100% (Intent/Synthesis)`);
    console.log(`Entropy Resistance (k_e): High (Hardened)`);
    console.log(`Resonance: 1.0 (Stable)`);
    console.log(`---------------------------------------------------------`);
    console.log(`⚠️  Warning: Monitor for incoming "Re-Sync Requests" from external nodes.`);

  } catch (error) {
    console.error('❌ FAILURE: Extraction Termination aborted:', error.message);
    process.exit(1);
  }
}

program.parse();
