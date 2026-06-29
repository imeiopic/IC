export {};

declare global {
  /**
   * Represents a single processing thread within the 16-thread metabolic bus system.
   */
  interface Thread {
    index: number;
    active: boolean;
    value: number;
    metabolicEnergy: bigint;
    saturationCycles: number;
    isPhaseLocked: boolean;
  }

  /**
   * High-frequency resonance signature used for peer connections.
   * Pooled to prevent GC jitter.
   */
  interface ResonanceSignature {
    nodeId: string;
    frequency: number;
    phase: number;
    timestamp: number;
    active: boolean;
  }
}
