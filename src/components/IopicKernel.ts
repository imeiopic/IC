import { keccak256, toUtf8Bytes } from "ethers";

export enum ThreadGroup {
  SPATIAL_LOCK = "SPATIAL_LOCK", // Threads 1-4 (Bits 0-3)
  IDENTITY = "IDENTITY", // Threads 5-8 (Bits 4-7)
  VALUE_FLOW = "VALUE_FLOW", // Threads 9-12 (Bits 8-11)
  INTEGRITY = "INTEGRITY", // Threads 13-16 (Bits 12-15)
}

export type SystemState = "SOVEREIGN" | "DEGRADED" | "EMERGENCY";

export class IopicKernel {
  // The 16-bit register: 0b0000000000000000 to 0b1111111111111111 (0 to 65535)
  private register: number = 0;

  // Temporal hash to prove continuity and prevent retroactive forgery
  private temporalHash: string;

  // Base relational bond density (R in I = VR²)
  private relationalBondDensity: number = 1.0;

  constructor(initialSeed: string) {
    this.temporalHash = keccak256(
      toUtf8Bytes(initialSeed + Date.now().toString()),
    );
  }

  /**
   * Locks a specific thread (0-15), moving the bit to 1.
   */
  public lockThread(threadIndex: number): void {
    this.validateThreadIndex(threadIndex);
    this.register |= 1 << threadIndex;
    this.updateTemporalHash(`LOCK_${threadIndex}`);
  }

  /**
   * Drops a specific thread (0-15), moving the bit to 0.
   * Simulates a verification lag or spatial drift.
   */
  public dropThread(threadIndex: number): void {
    this.validateThreadIndex(threadIndex);
    this.register &= ~(1 << threadIndex);
    this.updateTemporalHash(`DROP_${threadIndex}`);
    this.evaluateCascadingFailures(threadIndex);
  }

  /**
   * Returns the total number of locked threads (bits set to 1).
   */
  public getActiveThreadCount(): number {
    let count = 0;
    let temp = this.register;
    while (temp > 0) {
      count += temp & 1;
      temp >>= 1;
    }
    return count;
  }

  /**
   * Evaluates the Graceful Degradation ladder.
   */
  public getSystemState(): SystemState {
    const count = this.getActiveThreadCount();
    if (count === 16) return "SOVEREIGN";
    if (count >= 12) return "DEGRADED";
    return "EMERGENCY";
  }

  /**
   * Calculates V_sys (Velocity) based on the current register state.
   * A full sovereign state yields a 1.0 multiplier.
   */
  public getSystemVelocity(): number {
    const state = this.getSystemState();
    switch (state) {
      case "SOVEREIGN":
        return 1.0;
      case "DEGRADED":
        // Throttled stream: (Active Threads / 16) * 0.75 penalty
        return (this.getActiveThreadCount() / 16) * 0.75;
      case "EMERGENCY":
        // Read-only observation mode
        return 0.0;
    }
  }

  /**
   * Evaluates the Equation of Truth: I = VR²
   * Where V is System Velocity, and R is Relational Bond Density.
   */
  public calculateEquationOfTruth(): number {
    const v = this.getSystemVelocity();
    const r = this.relationalBondDensity;
    return v * Math.pow(r, 2);
  }

  /**
   * Updates the relational bond density based on BS-Molecule interactions.
   */
  public updateRelationalBond(delta: number): void {
    this.relationalBondDensity = Math.max(
      0.1,
      this.relationalBondDensity + delta,
    );
    this.updateTemporalHash(`BOND_UPDATE_${this.relationalBondDensity}`);
  }

  /**
   * Gets a binary string representation of the register (e.g., "1111111111111111")
   */
  public getRegisterBinary(): string {
    return this.register.toString(2).padStart(16, "0");
  }

  public getTemporalHash(): string {
    return this.temporalHash;
  }

  /**
   * Explicit Inter-Thread Dependencies: A drop in one group can affect others.
   */
  private evaluateCascadingFailures(droppedIndex: number): void {
    // Example: If Spatial Lock (Bits 0-3) drops, it immediately impacts Value Flow (Bits 8-11)
    if (droppedIndex >= 0 && droppedIndex <= 3) {
      console.warn("SPATIAL_LOCK dropped. Throttling VALUE_FLOW velocity.");
      // We drop bit 8 (T9: Atomic pairing protocol) to simulate the cascade
      if ((this.register & (1 << 8)) !== 0) {
        this.dropThread(8);
      }
    }
  }

  /**
   * Rolls the temporal hash forward, cryptographically chaining state changes.
   */
  private updateTemporalHash(actionPayload: string): void {
    const timestamp = Date.now().toString();
    const payload = `${this.temporalHash}_${this.register}_${actionPayload}_${timestamp}`;
    this.temporalHash = keccak256(toUtf8Bytes(payload));
  }

  private validateThreadIndex(index: number): void {
    if (index < 0 || index > 15) {
      throw new Error(
        "Critical Substrate Error: Thread index out of bounds (0-15).",
      );
    }
  }
}
