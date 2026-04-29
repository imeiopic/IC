import { describe, it, expect } from "vitest";
import { useInviteActions } from "./useInviteActions";

describe("useInviteActions.ts Composable", () => {
  it("initializes with empty deleting and flipping states", () => {
    const { deleting, flipping } = useInviteActions();

    expect(deleting).toEqual({});
    expect(flipping).toEqual({});
  });

  it("allows updating the reactive state by tracking ID keys", () => {
    const { deleting, flipping } = useInviteActions();

    deleting["invite-123"] = true;
    flipping["invite-456"] = false;

    expect(deleting["invite-123"]).toBe(true);
    expect(flipping["invite-456"]).toBe(false);
  });

  it("creates isolated states for each component invocation", () => {
    // Simulate two different components calling the composable
    const instanceA = useInviteActions();
    const instanceB = useInviteActions();

    instanceA.deleting["target-alpha"] = true;

    expect(instanceA.deleting["target-alpha"]).toBe(true);
    // Ensure instanceB is completely unaffected because the reactive objects are local
    expect(instanceB.deleting["target-alpha"]).toBeUndefined();
  });
});
