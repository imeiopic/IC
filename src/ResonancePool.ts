/**
 * ResonancePool: Manages a fixed-size pool of ResonanceSignature objects.
 * Prevents memory fragmentation and GC pauses.
 */
export class ResonancePool {
  private pool: ResonanceSignature[];
  private size: number;

  constructor(size: number = 1000) {
    this.size = size;
    this.pool = Array.from({ length: size }, () => ({
      nodeId: '',
      frequency: 0,
      phase: 0,
      timestamp: 0,
      active: false
    }));
  }

  acquire(nodeId: string, frequency: number): ResonanceSignature | null {
    const signature = this.pool.find(s => !s.active);
    if (!signature) return null;

    signature.nodeId = nodeId;
    signature.frequency = frequency;
    signature.timestamp = Date.now();
    signature.active = true;
    return signature;
  }

  release(signature: ResonanceSignature) {
    signature.active = false;
  }
}