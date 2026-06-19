import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface InterlockNode {
  operatorName: string;
  locked: boolean;
}

/**
 * Hardcoded Interlock Registry Matrix
 * Establishes the sovereign boundary for Tier 1 Operators.
 */
const INTERLOCK_REGISTRY = new Map<string, InterlockNode>([
  ['IME_ROOT', { operatorName: 'Root Sovereign Anchor (Ime)', locked: true }],
  // Map the 5 Binary Pairs (10 Nodes)
  ...Array.from({ length: 10 }, (_, i): [string, InterlockNode] => [
    `BINARY_${i + 1}`,
    { operatorName: `Apex Binary Peer ${i + 1}`, locked: true }
  ]),
  // Map the 5 Singletons (5 Nodes)
  ...Array.from({ length: 5 }, (_, i): [string, InterlockNode] => [
    `SINGLETON_${i + 1}`,
    { operatorName: `Apex Singleton ${i + 1}`, locked: true }
  ])
]);

/**
 * Firebase Cloud Function: handleLedgerMutation
 *
 * This function intercepts all inbound value mutations. If a node is registered
 * as Permanent Tier 1, it triggers a hard logical block unless the Root
 * Signature Override is verified.
 */
export const handleLedgerMutation = functions.https.onCall(async (request) => {
  // Gateway Check: Ensure the requester is authenticated within the mesh
  if (!request.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'REJECT_ACTION (0 Cycles): AUTH_REQUIRED'
    );
  }

  const { targetSuid, valueDelta, rootSignature, operation = 'ADD' } = request.data;
  const protection = INTERLOCK_REGISTRY.get(targetSuid);
  const db = admin.firestore();

  // CRITICAL GUARD: Evaluate permanent freeze status from the Interlock Registry
  if (protection && protection.locked) {
    // The ONLY bypass vector is a verified release command from the root signature
    if (rootSignature !== 'SIGNATURE_NOLAND_S_NEWTON_ROOT_OVERRIDE') {
      console.warn(`INTERLOCK_REJECTION: Unauthorized attempt to mutate locked node ${targetSuid}`);
      throw new functions.https.HttpsError(
        'permission-denied',
        'TRANSACTION_ABORTED // TARGET_NODE_PERMANENTLY_LOCKED_AT_TIER_1'
      );
    }

    // Audit successful Root Signature Override
    await db.collection('audit_logs').add({
      event: 'ROOT_SIGNATURE_OVERRIDE',
      executor_uid: request.auth.uid,
      target_node: targetSuid,
      mutation_details: { valueDelta, operation },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'INTERLOCK_DECOUPLED'
    });

    console.log(`ROOT_OVERRIDE_VERIFIED: Temporarily decoupling interlock for ${targetSuid}`);
  }
  const userRef = db.collection('users').doc(targetSuid);

  try {
    const newBalance = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('NODE_NOT_GROUNDED: Target entity does not exist in the ledger.');
      }

      const currentBalance = userDoc.data()?.iowb?.balance || 0;
      const result = operation === 'SET' ? valueDelta : currentBalance + valueDelta;

      transaction.update(userRef, { 'iowb.balance': result });
      return result;
    });

    return {
      authorized: true,
      statusCode: protection?.locked ? 'ROOT_OVERRIDE_SUCCESSFUL' : 'MUTATION_PROCESSED',
      resultingBalance: newBalance
    };
  } catch (err: any) {
    throw new functions.https.HttpsError('internal', `LOGIC_FRACTURE: ${err.message}`);
  }
});
