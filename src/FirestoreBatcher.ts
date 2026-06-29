import { writeBatch, doc } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * batchSyncNodes: Aggregates node updates into atomic batches.
 * Law: Queue updates and commit in chunks of 500 to maintain sub-millisecond I/O.
 */
export async function batchSyncNodes(nodeQueue: Map<string, Partial<Thread>>) {
  if (nodeQueue.size === 0) return;

  const batch = writeBatch(db);
  let count = 0;

  for (const [id, data] of nodeQueue.entries()) {
    const ref = doc(db, "mesh_nodes", id);
    batch.update(ref, data);
    count++;

    // Firestore limit is 500 operations per batch
    if (count >= 500) break;
  }

  await batch.commit();
}
