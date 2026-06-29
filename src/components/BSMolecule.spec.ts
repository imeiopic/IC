import { describe, it, expect, vi } from "vitest";
import { IopicKernel } from "./IopicKernel";
import { BSMolecule } from "./BSMolecule";

describe("BSMolecule Value Flow & Velocity Premiums", () => {
  it("successfully executes a stream and applies velocity premiums to both nodes", () => {
    // 1. Initialize two Sovereign nodes
    const buyer = new IopicKernel("buyer-seed");
    const seller = new IopicKernel("seller-seed");
    for (let i = 0; i < 16; i++) {
      buyer.lockThread(i);
      seller.lockThread(i);
    }

    // 2. Create the Molecule (1000 IO$, 0.95 target density)
    const molecule = new BSMolecule(buyer, seller, 1000, 0.95);
    expect(molecule.status).toBe("PROPOSED");

    // 3. Verify the relational pairing
    const isValid = molecule.verifyPairing();
    expect(isValid).toBe(true);
    expect(molecule.status).toBe("VERIFYING");

    // 4. Execute the stream
    molecule.executeStream();

    // 5. Verify completion
    expect(molecule.status).toBe("COMPLETED");

    // 6. Verify Velocity Premium calculation
    // Math: vPremium = 1000 * 0.95 * 0.001 = 0.95
    // Original Relational Bond (R) = 1.0, New R = 1.95
    // New Truth Equation (I = VR²) = 1.0 * (1.95)² = 3.8025
    expect(buyer.calculateEquationOfTruth()).toBeCloseTo(3.8025, 4);
    expect(seller.calculateEquationOfTruth()).toBeCloseTo(3.8025, 4);
  });

  it("fails pairing if a node is in EMERGENCY state and penalizes the active node", () => {
    const buyer = new IopicKernel("buyer-seed");
    const seller = new IopicKernel("seller-seed");

    // Lock buyer fully (16 threads -> SOVEREIGN)
    for (let i = 0; i < 16; i++) buyer.lockThread(i);

    // Leave seller at 0 threads (EMERGENCY)
    const molecule = new BSMolecule(buyer, seller, 1000);

    // Pairing should fail
    const isValid = molecule.verifyPairing();
    expect(isValid).toBe(false);
    expect(molecule.status).toBe("FAILED");

    // The BSMolecule executes a cascading degradation (drops Thread 8)
    // The Buyer goes from 16 to 15 threads due to the failed handshake
    expect(buyer.getActiveThreadCount()).toBe(15);
  });

  it("prevents stream execution if pairing verification is skipped", () => {
    const buyer = new IopicKernel("buyer-seed");
    const seller = new IopicKernel("seller-seed");
    const molecule = new BSMolecule(buyer, seller, 500);

    // Try to stream without calling verifyPairing()
    molecule.executeStream();

    // Should completely ignore the stream request
    expect(molecule.status).toBe("PROPOSED");
  });

  it("compounds relational bonds over multiple back-to-back transactions", () => {
    const nodeA = new IopicKernel("node-a-seed");
    const nodeB = new IopicKernel("node-b-seed");

    // Fully lock both nodes to maintain V = 1.0
    for (let i = 0; i < 16; i++) {
      nodeA.lockThread(i);
      nodeB.lockThread(i);
    }

    // Transaction 1: 1000 IO$ at 0.95 density -> Premium = 0.95
    // Cumulative R = 1.0 (base) + 0.95 = 1.95 -> Truth = 1.0 * (1.95)² = 3.8025
    const tx1 = new BSMolecule(nodeA, nodeB, 1000, 0.95);
    tx1.verifyPairing();
    tx1.executeStream();
    expect(nodeA.calculateEquationOfTruth()).toBeCloseTo(3.8025, 4);

    // Transaction 2: 2000 IO$ at 0.90 density -> Premium = 1.80
    // Cumulative R = 1.95 + 1.80 = 3.75 -> Truth = 1.0 * (3.75)² = 14.0625
    const tx2 = new BSMolecule(nodeA, nodeB, 2000, 0.9);
    tx2.verifyPairing();
    tx2.executeStream();
    expect(nodeA.calculateEquationOfTruth()).toBeCloseTo(14.0625, 4);

    // Transaction 3: 500 IO$ at 1.0 density (Perfect Sync) -> Premium = 0.50
    // Cumulative R = 3.75 + 0.50 = 4.25 -> Truth = 1.0 * (4.25)² = 18.0625
    const tx3 = new BSMolecule(nodeA, nodeB, 500, 1.0);
    tx3.verifyPairing();
    tx3.executeStream();
    expect(nodeA.calculateEquationOfTruth()).toBeCloseTo(18.0625, 4);
    expect(nodeB.calculateEquationOfTruth()).toBeCloseTo(18.0625, 4);
  });

  it("handles an entity losing threads between back-to-back transactions", () => {
    const nodeA = new IopicKernel("node-a-seed");
    const nodeB = new IopicKernel("node-b-seed");

    for (let i = 0; i < 16; i++) {
      nodeA.lockThread(i);
      nodeB.lockThread(i);
    }

    // Transaction 1: Successful stream between Sovereign nodes
    const tx1 = new BSMolecule(nodeA, nodeB, 1000, 1.0);
    tx1.verifyPairing();
    tx1.executeStream();

    // Both nodes accumulated a premium of 1.0. R is now 2.0. Truth = 1.0 * (2.0)² = 4.0
    expect(nodeA.calculateEquationOfTruth()).toBeCloseTo(4.0, 4);

    // Mid-Sequence: Node B suffers a catastrophic loss of identity threads
    [4, 5, 6, 7, 8].forEach((bit) => nodeB.dropThread(bit));
    expect(nodeB.getSystemState()).toBe("EMERGENCY");

    // Transaction 2: Node A attempts to transact with the compromised Node B
    const tx2 = new BSMolecule(nodeA, nodeB, 1000, 1.0);
    expect(tx2.verifyPairing()).toBe(false);
    expect(tx2.status).toBe("FAILED");

    // Validation: Node A is penalized for pairing with an unverified node.
    // Node A drops to 15 threads (DEGRADED). Its velocity drops to (15/16) * 0.75 = 0.703125.
    expect(nodeA.getSystemState()).toBe("DEGRADED");
    // Node A's accumulated R is still 2.0, but its Truth equation is slashed: 0.703125 * (2.0)² = 2.8125
    expect(nodeA.calculateEquationOfTruth()).toBeCloseTo(2.8125, 4);

    // Recovery Phase: Node A realizes the error, drops the bad connection, and re-verifies Thread 8
    nodeA.lockThread(8);

    // Validation: Node A is restored to SOVEREIGN and its Equation of Truth multiplier is fully restored
    expect(nodeA.getSystemState()).toBe("SOVEREIGN");
    expect(nodeA.calculateEquationOfTruth()).toBeCloseTo(4.0, 4);
  });

  it("allows a DEGRADED entity to pair and stream, accumulating bond with a throttled Truth Equation", () => {
    const nodeA = new IopicKernel("degraded-a");
    const nodeB = new IopicKernel("sovereign-b");

    for (let i = 0; i < 16; i++) {
      nodeA.lockThread(i);
      nodeB.lockThread(i);
    }

    // Node A loses a thread (e.g., Thread 1) but stays DEGRADED (15 active threads)
    nodeA.dropThread(1);
    expect(nodeA.getSystemState()).toBe("DEGRADED");

    // Transaction 1: Node A pairs while Degraded
    const tx1 = new BSMolecule(nodeA, nodeB, 1000, 1.0);
    expect(tx1.verifyPairing()).toBe(true);
    tx1.executeStream();

    // Node A Velocity (V) = (15/16) * 0.75 = 0.703125
    // Relational Bond (R) = 1.0 + 1.0 = 2.0
    // Truth (I) = 0.703125 * (2.0)² = 2.8125
    expect(nodeA.calculateEquationOfTruth()).toBeCloseTo(2.8125, 4);

    // Transaction 2: Node A pairs again while STILL Degraded
    const tx2 = new BSMolecule(nodeA, nodeB, 1000, 1.0);
    expect(tx2.verifyPairing()).toBe(true);
    tx2.executeStream();

    // R increases to 3.0, but the velocity multiplier remains penalized
    // Truth (I) = 0.703125 * (3.0)² = 6.328125
    expect(nodeA.calculateEquationOfTruth()).toBeCloseTo(6.328125, 4);
  });

  it("yields no velocity premium if the target density is zero", () => {
    const nodeA = new IopicKernel("zero-density-a");
    const nodeB = new IopicKernel("zero-density-b");

    // Fully lock nodes so baseline Truth is 1.0
    for (let i = 0; i < 16; i++) {
      nodeA.lockThread(i);
      nodeB.lockThread(i);
    }

    // Transaction with 0 target density (e.g., highly noisy or unverified data)
    const tx = new BSMolecule(nodeA, nodeB, 1000, 0);
    tx.verifyPairing();
    tx.executeStream();

    // Relational Bond (R) receives +0, remaining at 1.0. Truth stays 1.0.
    expect(nodeA.calculateEquationOfTruth()).toBeCloseTo(1.0, 4);
    expect(nodeB.calculateEquationOfTruth()).toBeCloseTo(1.0, 4);
  });

  it("rejects the transaction completely if a negative amount is passed", () => {
    const nodeA = new IopicKernel("negative-amount-a");
    const nodeB = new IopicKernel("negative-amount-b");

    for (let i = 0; i < 16; i++) {
      nodeA.lockThread(i);
      nodeB.lockThread(i);
    }

    // Transaction with a negative amount (-500 IO$) should throw an error
    expect(() => new BSMolecule(nodeA, nodeB, -500, 1.0)).toThrowError(
      "Critical Substrate Error: Transaction amount cannot be negative.",
    );
  });

  it("rejects the transaction completely if the amount exceeds the maximum limit", () => {
    const nodeA = new IopicKernel("over-limit-a");
    const nodeB = new IopicKernel("over-limit-b");

    for (let i = 0; i < 16; i++) {
      nodeA.lockThread(i);
      nodeB.lockThread(i);
    }

    // Transaction exceeding the 1,000,000 limit should throw an error
    expect(() => new BSMolecule(nodeA, nodeB, 1000001, 1.0)).toThrowError(
      "Critical Substrate Error: Transaction amount exceeds the maximum limit of 1000000 IO$.",
    );
  });

  it("logs a warning to the console when a transaction fails", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const buyer = new IopicKernel("buyer-seed-fail");
    const seller = new IopicKernel("seller-seed-fail");
    // Both nodes have 0 locked threads, placing them in EMERGENCY state
    const tx = new BSMolecule(buyer, seller, 100, 1.0);

    tx.verifyPairing();

    expect(consoleSpy).toHaveBeenCalledWith(
      `[BSMolecule] Transaction ${tx.id} FAILED: Node in EMERGENCY state. Active Defense Kernel rejected pairing.`,
    );

    consoleSpy.mockRestore();
  });

  it("logs a success message to the console when a transaction completes", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const buyer = new IopicKernel("buyer-seed-success");
    const seller = new IopicKernel("seller-seed-success");

    // Both nodes are fully locked and SOVEREIGN
    for (let i = 0; i < 16; i++) {
      buyer.lockThread(i);
      seller.lockThread(i);
    }

    const tx = new BSMolecule(buyer, seller, 500, 0.95);
    tx.verifyPairing();
    tx.executeStream();

    const expectedPremium = (500 * 0.95 * 0.001).toFixed(4);
    expect(consoleSpy).toHaveBeenCalledWith(
      `[BSMolecule] Transaction ${tx.id} COMPLETED: 500 IO$ streamed. Velocity Premium: +${expectedPremium}`,
    );

    consoleSpy.mockRestore();
  });

  it("handles transactions correctly when nodes have different system velocities", () => {
    const sovereignNode = new IopicKernel("sovereign-node");
    const degradedNode = new IopicKernel("degraded-node");

    for (let i = 0; i < 16; i++) {
      sovereignNode.lockThread(i);
      degradedNode.lockThread(i);
    }

    // Degrade the second node by dropping a thread (e.g., Thread 1)
    // Sovereign V = 1.0, Degraded V = (15/16) * 0.75 = 0.703125
    degradedNode.dropThread(1);
    expect(sovereignNode.getSystemVelocity()).toBe(1.0);
    expect(degradedNode.getSystemVelocity()).toBeCloseTo(0.703125, 6);

    // Execute a standard transaction: 1000 IO$, 1.0 density -> Premium = +1.0
    const tx = new BSMolecule(sovereignNode, degradedNode, 1000, 1.0);
    expect(tx.verifyPairing()).toBe(true);
    tx.executeStream();

    // Both nodes now have a Relational Bond (R) of 2.0 (1.0 base + 1.0 premium).
    // Sovereign Truth (I) = 1.0 * (2.0)² = 4.0
    // Degraded Truth (I) = 0.703125 * (2.0)² = 2.8125
    expect(sovereignNode.calculateEquationOfTruth()).toBeCloseTo(4.0, 4);
    expect(degradedNode.calculateEquationOfTruth()).toBeCloseTo(2.8125, 4);
  });
});
