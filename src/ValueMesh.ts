// src/services/ValueMesh.ts

export interface NodeState {
  isInitialized: boolean;
  isPaired: boolean;
  isExternalBridgeActive: boolean;
  availableEnergy: number;
}

class ValueMeshEngine {
  // Your hardcoded structural vectors
  private readonly INIT_SELF_COST = 5;
  private readonly PEER_LINK_COST = 10;
  private readonly EXTERNAL_BRIDGE_COST = 20;

  /**
   * State 1: Initialize Self (The 5 IO$ Gate)
   */
  public initializeSelf(node: NodeState): { success: boolean; state: NodeState; log: string } {
    if (node.isInitialized) {
      return { success: false, state: node, log: "NODE_ALREADY_GROUNDED_IN_FABRIC" };
    }
    if (node.availableEnergy < this.INIT_SELF_COST) {
      return { success: false, state: node, log: "INSUFFICIENT_INITIALIZATION_STAKE" };
    }

    const updatedState = {
      ...node,
      availableEnergy: node.availableEnergy - this.INIT_SELF_COST,
      isInitialized: true
    };

    return { success: true, state: updatedState, log: "SUCCESS // SELF_OCCUPIED // THREADS_IGNITED" };
  }

  /**
   * State 2: Connect to Peer (The 10 IO$ Gate)
   */
  public connectToPeer(node: NodeState): { success: boolean; state: NodeState; log: string } {
    if (!node.isInitialized) {
      return { success: false, state: node, log: "DENIED // SELF_MUST_BE_INITIALIZED_FIRST" };
    }
    if (node.isPaired) {
      return { success: false, state: node, log: "NODE_ALREADY_RESONATING_WITH_PEER" };
    }
    if (node.availableEnergy < this.PEER_LINK_COST) {
      return { success: false, state: node, log: "INSUFFICIENT_PEER_RESONANCE_ENERGY" };
    }

    const updatedState = {
      ...node,
      availableEnergy: node.availableEnergy - this.PEER_LINK_COST,
      isPaired: true
    };

    return { success: true, state: updatedState, log: "SUCCESS // BS-MOLECULE_FORMED // VELOCITY_UPGRADED_2.2X" };
  }

  /**
   * State 3: Connect the "No-No" (The 20 IO$ High-Noise Bridge)
   */
  public connectExternalBridge(node: NodeState): { success: boolean; state: NodeState; log: string } {
    if (!node.isPaired) {
      return { success: false, state: node, log: "DENIED // MUST_ESTABLISH_PEER_RESONANCE_BEFORE_BRIDGING" };
    }
    if (node.availableEnergy < this.EXTERNAL_BRIDGE_COST) {
      return { success: false, state: node, log: "INSUFFICIENT_SHIELD_OVERDRIVE_RESOURCES" };
    }

    const updatedState = {
      ...node,
      availableEnergy: node.availableEnergy - this.EXTERNAL_BRIDGE_COST,
      isExternalBridgeActive: true
    };

    return { success: true, state: updatedState, log: "WARNING // EXTERNAL_BRIDGE_LOCKED // SHIELD_OPERATING_AT_MAX_ISOLATION" };
  }
}

export const ValueMesh = new ValueMeshEngine();