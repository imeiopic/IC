/**
 * Global Computational Physics Engine - Version 2.0.0
 * Formalizing the bridge between the Abstraction Layer and physical mesh grounding.
 */

export interface NodeMetadata {
  multiplier: number;
  lastHandshakeTimestamp?: number;
  peerCount?: number;
  consecutiveHandshakes?: number;
}

/**
 * Calculates the stability index (I) based on the I=VR^2 specification.
 * 
 * @param metadata - Metadata M including node multiplier and temporal history.
 * @returns The stability index I to be committed to the mesh.
 */
export const calculateStability = (metadata: NodeMetadata): number => {
  const { 
    multiplier, 
    lastHandshakeTimestamp, 
    peerCount = 1, 
    consecutiveHandshakes = 0 
  } = metadata;

  // 1. Calculate Resistivity (Rn): Inverse of the anchor's multiplier.
  const Rn = multiplier > 0 ? 1 / multiplier : 1.0;

  // 2. Calculate Velocity Factor (Vh): Based on time delta between connection requests.
  const now = Date.now();
  let Vh = 1.0;

  if (lastHandshakeTimestamp && lastHandshakeTimestamp > 0) {
    const deltaMs = now - lastHandshakeTimestamp;
    // Convert delta to seconds. Higher frequency (lower delta) increases velocity.
    const deltaSec = deltaMs / 1000;
    Vh = deltaSec > 0 ? 1 / deltaSec : 1.0;
  }

  // 3. Calculate Heat Factor (H): Based on concurrent mesh peers.
  // Higher peer density increases mesh entropy, slightly dampening stability.
  const heatCoefficient = 0.02;
  const H = 1 + (peerCount * heatCoefficient);

  // 4. Calculate Acceleration (A): Momentum boost for consecutive grounding.
  // Each consecutive handshake adds 5% stability, capped at a 2x boost (20 handshakes).
  const A = 1 + (Math.min(consecutiveHandshakes, 20) * 0.05);

  // 5. Compute Integration / Stability Index (I = (Vh * Rn^2 * A) / H)
  const stabilityIndex = (Vh * Math.pow(Rn, 2) * A) / H;

  return stabilityIndex;
};