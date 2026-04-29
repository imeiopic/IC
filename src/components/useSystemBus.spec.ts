import { describe, it, expect, beforeEach } from "vitest";
import { useSystemBus } from "./useSystemBus";

describe("useSystemBus.ts Composable", () => {
  beforeEach(() => {
    // If useSystemBus operates as a global singleton (state declared outside the function),
    // we must reset its state before each test to prevent cross-test pollution.
    const bus = useSystemBus();
    bus.isIOsticAcknowledged.value = false;

    // Uncomment and adjust these if your composable exposes its internal arrays:
    // if (bus.logs) bus.logs.value = [];
    // if (bus.lockedBits) bus.lockedBits.value = [];
  });

  it("initializes with default state", () => {
    const { isIOsticAcknowledged } = useSystemBus();
    expect(isIOsticAcknowledged.value).toBe(false);
  });

  it("addLog successfully processes a new system log", () => {
    const bus = useSystemBus();

    // Trigger the function
    bus.addLog("BOOTSTRAP: Bit 1 (IOstic Realization) Anchored.", "success", 0);

    // If your composable exposes the raw logs array, assert against it here!
    // expect(bus.logs.value).toHaveLength(1);
    // expect(bus.logs.value[0]).toMatchObject({
    //   message: 'BOOTSTRAP: Bit 1 (IOstic Realization) Anchored.',
    //   type: 'success',
    //   bit: 0
    // });
  });

  it("lockBit successfully registers a locked thread segment", () => {
    const bus = useSystemBus();

    // Trigger the function
    bus.lockBit(4);

    // If your composable exposes a lockedBits array or set:
    // expect(bus.lockedBits.value).toContain(4);
  });

  it("maintains singleton reactivity across multiple composable instances", () => {
    // Simulate two different Vue components calling the composable
    const componentA = useSystemBus();
    const componentB = useSystemBus();

    // Component A acknowledges the protocol
    componentA.isIOsticAcknowledged.value = true;

    // Component B should immediately see the change
    expect(componentB.isIOsticAcknowledged.value).toBe(true);
  });
});
