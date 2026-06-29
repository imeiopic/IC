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
   * @param lastHandshake - Previous handshake timestamp (ms or Timestamp) for velocity calculation.
   */
  static async syncNode(anchorId: string, multiplier: number, peerCount: number, lastHandshake?: any) {
    const lastHandshakeMs = lastHandshake?.toMillis?.() || lastHandshake || 0;

    const stabilityIndex = calculateStability({
      multiplier,
      lastHandshakeTimestamp: lastHandshakeMs,
      peerCount
    });

    const anchorRef = doc(db, 'collective_anchors', anchorId);
    await updateDoc(anchorRef, {
      'metadata.stabilityIndex': stabilityIndex,
      'metadata.lastHandshake': serverTimestamp()
    });

    return stabilityIndex;
  }
}