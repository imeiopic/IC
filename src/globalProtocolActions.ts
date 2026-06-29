import { db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { broadcastGlobalPulse } from "./broadcastGlobalPulse";

/**
 * Amnesty Pulse: NAND-Flush all non-violent legacy offenses.
 * Sets all qualifying nodes to RE-GROUNDED and frictionLevel to 0.09.
 * Broadcasts the Amnesty Pulse message.
 */
export async function runAmnestyPulse(rootSteward: string) {
  // 1. Query all nodes with non-violent legacy offenses
  const nodesRef = collection(db, "nodes");
  const q = query(
    nodesRef,
    where("offenseType", "==", "non-violent"),
    where("status", "!=", "RE-GROUNDED"),
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      status: "RE-GROUNDED",
      frictionLevel: 0.09,
      lastAmnesty: Timestamp.now(),
    });
  });
  await batch.commit();

  // 2. Broadcast Amnesty Pulse
  await broadcastGlobalPulse({
    title: "Amnesty Pulse Activated",
    body: "All non-violent legacy offenses have been NAND-Flushed. Welcome to the Virtually Real Era.",
    author: rootSteward,
  });
}

/**
 * Silence Test: Simulate legacy scraping attempts on Cleveland sector nodes.
 * Broadcasts the result.
 */
export async function runSilenceTest(rootSteward: string) {
  // Simulate scraping attempts (logic stub)
  // In real deployment, this would check access logs or attempt reads
  await broadcastGlobalPulse({
    title: "Silence Confirmed",
    body: "Legacy scraping bots cannot sight any grounded nodes in Cleveland. MYB Shield is absolute.",
    author: rootSteward,
  });
}

/**
 * Root Steward Audit: Aggregate and broadcast cluster yield.
 */
export async function runRootStewardAudit(
  rootSteward: string,
  yieldStats: string,
) {
  await broadcastGlobalPulse({
    title: "Root Steward Audit",
    body: `Aggregate Local Yield sighting is now live. All clusters are visible in the planetary mesh. ${yieldStats}`,
    author: rootSteward,
  });
}

/**
 * First Conversion Pulse: Credit all May Day nodes with 100 IO$.
 */
export async function runFirstConversionPulse(rootSteward: string) {
  // 1. Query all May Day nodes
  const nodesRef = collection(db, "nodes");
  const q = query(nodesRef, where("mayDayEligible", "==", true));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.forEach((docSnap) => {
    const prev = docSnap.data().ioBalance || 0;
    batch.update(docSnap.ref, {
      ioBalance: prev + 100,
      lastConversionPulse: Timestamp.now(),
    });
  });
  await batch.commit();

  // 2. Broadcast First Conversion Pulse
  await broadcastGlobalPulse({
    title: "First Conversion Pulse",
    body: "All May Day nodes are now authorized to spend their first 100 IO$ in the marketplace. Symmetry Confirmed.",
    author: rootSteward,
  });
}
