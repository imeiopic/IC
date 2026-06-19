const admin = require('firebase-admin');
const { program } = require('commander');

/**
 * Iopic Protocol: Jubilee.js (Global Zero-Point Reset)
 * Wipes legacy debt buffers and restores the mesh to a ground state of 
 * unconstrained flow.
 */

program
  .name('jubilee-reset')
  .description('Execute a Global Zero-Point Reset on the identity mesh')
  .version('1.0.0')
  .requiredOption('-p, --project-id <id>', 'Target Firebase Project ID')
  .option('--force', 'Execute reset without individual node confirmation')
  .action(async (options) => {
    await executeJubilee(options);
  });

async function executeJubilee(options) {
  admin.initializeApp({
    projectId: options.project_id
  });

  const db = admin.firestore();
  const identitiesRef = db.collection('identities');

  try {
    const snapshot = await identitiesRef.get();
    console.log(`[JUBILEE_INITIALIZED] Sighting ${snapshot.size} nodes for Zero-Point Reset...`);

    const batch = db.batch();
    
    snapshot.forEach((doc) => {
      console.log(`[RESET] Clearing legacy debt buffer for Node: ${doc.id}`);
      
      batch.update(doc.ref, {
        debt_log: 0,
        status: 'UNCONSTRAINED_FLOW',
        lastJubilee: admin.firestore.FieldValue.serverTimestamp(),
        // Incrementing version to signify a fundamental state change
        version: admin.firestore.FieldValue.increment(1)
      });
    });

    if (!snapshot.empty) {
      await batch.commit();
      console.log('✅ SYSTEM_RESET: COMPLETE. ALL NODES RETURNED TO EQUILIBRIUM.');
    } else {
      console.log('⚠️ No nodes found in the identity substrate.');
    }
  } catch (error) {
    console.error('❌ JUBILEE_FRACTURE: Reset aborted:', error.message);
  }
}

program.parse();
