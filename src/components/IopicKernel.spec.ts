import { describe, it, expect } from "vitest";
import { IopicKernel } from "../IopicKernel";

describe("IopicKernel State Management", () => {
  it("should gracefully degrade and drop to EMERGENCY state if threads are compromised", () => {
    // 1. Initialize the Kernel
    const kernel = new IopicKernel("test-emergency-seed");

    // 2. Lock all 16 threads to achieve SOVEREIGN state
    for (let i = 0; i < 16; i++) {
      kernel.lockThread(i);
    }

    expect(kernel.getSystemState()).toBe("SOVEREIGN");
    expect(kernel.getSystemVelocity()).toBe(1.0);

    // 3. Compromise a Spatial Lock thread (Bit 0).
    // Based on evaluateCascadingFailures(), dropping Bit 0 automatically drops Bit 8 (Value Flow).
    kernel.dropThread(0);

    // The active thread count should now be 14 (16 - 1 explicit - 1 cascade)
    expect(kernel.getActiveThreadCount()).toBe(14);
    expect(kernel.getSystemState()).toBe("DEGRADED");

    // 4. Compromise enough identity threads to fall below the 12-thread threshold
    kernel.dropThread(4);
    kernel.dropThread(5);
    kernel.dropThread(6);

    // 5. Verify the system enters EMERGENCY mode and zeros out the velocity
    expect(kernel.getActiveThreadCount()).toBe(11);
    expect(kernel.getSystemState()).toBe("EMERGENCY");
    expect(kernel.getSystemVelocity()).toBe(0.0);
  });

  it("should securely update the rolling temporal hash on state changes", () => {
    const kernel = new IopicKernel("test-hash-seed");

    // 1. Capture the initial cryptographic hash
    const initialHash = kernel.getTemporalHash();
    expect(initialHash).toBeDefined();

    // 2. Lock a thread and verify the hash rolls forward
    kernel.lockThread(0);
    const postLockHash = kernel.getTemporalHash();
    expect(postLockHash).not.toBe(initialHash);

    // 3. Update the relational bond and verify the hash rolls forward again
    kernel.updateRelationalBond(0.5);
    const postBondHash = kernel.getTemporalHash();
    expect(postBondHash).not.toBe(postLockHash);

    // 4. Drop a thread and verify the hash rolls forward a final time
    kernel.dropThread(0);
    const finalHash = kernel.getTemporalHash();
    expect(finalHash).not.toBe(postBondHash);
  });

  it("should throw an error when an invalid thread index is passed", () => {
    const kernel = new IopicKernel("test-bounds-seed");
    const expectedError =
      "Critical Substrate Error: Thread index out of bounds (0-15).";

    // 1. Verify upper bounds (index > 15)
    expect(() => kernel.lockThread(16)).toThrowError(expectedError);
    expect(() => kernel.dropThread(99)).toThrowError(expectedError);

    // 2. Verify lower bounds (index < 0)
    expect(() => kernel.lockThread(-1)).toThrowError(expectedError);
    expect(() => kernel.dropThread(-99)).toThrowError(expectedError);
  });

  it("should correctly calculate the I=VR² Equation of Truth across different states", () => {
    const kernel = new IopicKernel("test-math-seed");

    // 1. Base SOVEREIGN state (V = 1.0, R = 1.0) => I = 1.0 * (1.0)² = 1.0
    for (let i = 0; i < 16; i++) kernel.lockThread(i);
    expect(kernel.calculateEquationOfTruth()).toBe(1.0);

    // 2. Increase Relational Bond (R = 1.5, V = 1.0) => I = 1.0 * (1.5)² = 2.25
    kernel.updateRelationalBond(0.5);
    expect(kernel.calculateEquationOfTruth()).toBeCloseTo(2.25, 5);

    // 3. DEGRADED State (14 active threads) => V = (14/16) * 0.75 = 0.65625
    // I = 0.65625 * (1.5)² = 1.4765625
    kernel.dropThread(0); // Drops Bit 0, which cascades to drop Bit 8 as well
    expect(kernel.calculateEquationOfTruth()).toBeCloseTo(1.4765625, 5);

    // 4. EMERGENCY State (< 12 active threads) => V = 0.0
    // I = 0.0 * (1.5)² = 0.0
    [4, 5, 6].forEach((bit) => kernel.dropThread(bit));
    expect(kernel.calculateEquationOfTruth()).toBe(0.0);
  });

  it("should enforce a minimum relational bond threshold of 0.1", () => {
    const kernel = new IopicKernel("test-threshold-seed");

    // Lock all threads so Velocity (V) = 1.0
    for (let i = 0; i < 16; i++) kernel.lockThread(i);

    // Apply a massive negative penalty to the bond
    kernel.updateRelationalBond(-999);

    // If R is clamped at 0.1, the Truth Equation (I = VR²) becomes 1.0 * (0.1)² = 0.01
    expect(kernel.calculateEquationOfTruth()).toBeCloseTo(0.01, 5);
  });
});
