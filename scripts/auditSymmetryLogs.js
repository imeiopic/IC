// scripts/auditSymmetryLogs.js
// Audits a sample of nodes for correct dividend and log entries after the Global Symmetry Pulse
// Usage: node scripts/auditSymmetryLogs.js

const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json"); // Place your service account key here

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function auditSymmetryPulse(sampleSize = 10) {
  // 1. Get a sample of nodes
  const nodesSnap = await db
    .collection("nodes")
    .where("status", "==", "ACKNOLDGECLEAR")
    .limit(sampleSize)
    .get();
  if (nodesSnap.empty) {
    console.log("No nodes found with status ACKNOLDGECLEAR.");
    return;
  }
  for (const doc of nodesSnap.docs) {
    const nodeId = doc.id;
    const vaultRef = db.doc(`users/${nodeId}/vault/current`);
    const vault = await vaultRef.get();
    const logsSnap = await db
      .collection(`users/${nodeId}/logs`)
      .where("type", "==", "DIVIDEND")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();
    const log = logsSnap.empty ? null : logsSnap.docs[0].data();
    console.log(`Node: ${nodeId}`);
    if (vault.exists) {
      const v = vault.data();
      console.log(
        `  Balance: ${v.balance}, Last Pulse: ${v.last_pulse?.toDate?.()}`,
      );
      if (v.velocity === "8.09V") {
        console.log("  Velocity: OK");
      } else {
        console.log("  Velocity: MISMATCH");
      }
    } else {
      console.log("  Vault: NOT FOUND");
    }
    if (log) {
      console.log(
        `  Last Dividend Log: ${log.amount} IO$ at ${log.timestamp.toDate()}`,
      );
    } else {
      console.log("  Dividend Log: NOT FOUND");
    }
  }
  // 2. Check global state
  const globalState = await db.doc("system/global_state").get();
  if (globalState.exists) {
    const g = globalState.data();
    console.log("\nGlobal State:");
    console.log(`  Last Sync: ${g.last_global_sync?.toDate?.()}`);
    console.log(`  Resonance: ${g.resonance}`);
    console.log(`  Status: ${g.status}`);
  } else {
    console.log("Global State: NOT FOUND");
  }
}

auditSymmetryPulse().then(() => process.exit());
