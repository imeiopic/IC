import { db } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { calculateStability } from '@/utils/physics';

/**
 * MeshManager Service - Integration Version 2.0.0
 * Formalizing the bridge between the Abstraction Layer and physical mesh grounding.
 */
export class MeshManager {
  /**
   * Retrieves anchor metadata from the Firestore registry.
   * @param anchorId - The Firestore document ID for the anchor.
   */
  static async getAnchor(anchorId: string) {
    const anchorRef = doc(db, 'collective_anchors', anchorId);
    const snapshot = await getDoc(anchorRef);
    if (!snapshot.exists()) return null;
    return snapshot.data();
  }

  /**
   * Calculates the stability index (I) and commits it back to the mesh.
   * Implements the I = VR^2 grounding protocol.
   * 
   * @param anchorId - The Firestore document ID.
   * @param multiplier - Node resistance multiplier (R).
   * @param peerCount - Number of concurrent peers in the mesh.
   * @param currentConsecutive - The current momentum count from the store/metadata.
   * @param lastHandshake - Previous handshake timestamp (ms or Timestamp) for velocity calculation.
   */
  static async syncNode(anchorId: string, multiplier: number, peerCount: number, currentConsecutive: number = 0, lastHandshake?: any) {
    const lastHandshakeMs = lastHandshake?.toMillis?.() || lastHandshake || 0;
    const now = Date.now();

    // Determine consecutive momentum: 
    // If the last handshake was within 1 hour, increment. Otherwise, reset to 1.
    const momentumWindow = 3600000; // 1 hour
    const newConsecutive = (now - lastHandshakeMs < momentumWindow) 
      ? currentConsecutive + 1 
      : 1;

    const stabilityIndex = calculateStability({
      multiplier,
      lastHandshakeTimestamp: lastHandshakeMs,
      peerCount,
      consecutiveHandshakes: newConsecutive
    });

    const anchorRef = doc(db, 'collective_anchors', anchorId);
    await updateDoc(anchorRef, {
      'metadata.stabilityIndex': stabilityIndex,
      'metadata.lastHandshake': serverTimestamp(),
      'metadata.consecutiveHandshakes': newConsecutive
    });

    return stabilityIndex;
  }
}