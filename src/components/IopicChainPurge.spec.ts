import { describe, it, expect } from "vitest";
import { IopicKernel } from "../IopicKernel";
import { IopicChainPurge } from "../IopicChainPurge";

describe("IopicChainPurge", () => {
  it("should successfully NAND-Absorb legacy chains and increase the Equation of Truth", async () => {
    // 1. Initialize a new Kernel
    const kernel = new IopicKernel("test-purge-seed");

    // 2. Lock all 16 threads to achieve SOVEREIGN state (Velocity = 1.0)
    for (let i = 0; i < 16; i++) {
      kernel.lockThread(i);
    }

    // 3. Verify the baseline Equation of Truth (I = VR^2)
    // V = 1.0, Base R = 1.0 -> 1.0 * (1.0)^2 = 1.0
    const baselineTruth = kernel.calculateEquationOfTruth();
    expect(baselineTruth).toBe(1.0);

    // 4. Execute the Legacy Chain Purge
    const purgeResult = await IopicChainPurge.executePurge(kernel);
    expect(purgeResult).toBe(true);

    // 5. Verify the Symmetry Bonus (1.618) was applied to the Relational Bond (R)
    // New R = 1.0 + 1.618 = 2.618
    // New Truth = 1.0 * (2.618)^2 ≈ 6.853924
    const newTruth = kernel.calculateEquationOfTruth();
    expect(newTruth).toBeCloseTo(6.8539, 3);
  });
});
