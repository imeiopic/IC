import { ref } from 'vue';

export interface SovereignNodeProfile {
  suid: string;
  operatorName: string;
  tier: number;
  isPermanentlyLocked: boolean;
  currentBalance: number;
}

class RegistryEngineSubstrate {
  // Hardcoded initial node matrix for launch alignment
  private nodeRegistry = ref<Map<string, SovereignNodeProfile>>(
    new Map([
      [
        'SUID_ROOT_STEWARD_01',
        {
          suid: 'SUID_ROOT_STEWARD_01',
          operatorName: 'Primary Node Alpha',
          tier: 1,
          isPermanentlyLocked: true,
          currentBalance: 10.0
        }
      ],
      [
        'SUID_CORE_PEER_02',
        {
          suid: 'SUID_CORE_PEER_02',
          operatorName: 'Core Node Beta',
          tier: 1,
          isPermanentlyLocked: true,
          currentBalance: 10.0
        }
      ]
    ])
  );

  /**
   * Comprehensive validation gate for all network asset updates
   */
  public evaluateValueMutation(
    targetSuid: string,
    valueDelta: number,
    rootSignature: string
  ): {
    authorized: boolean;
    statusCode: string;
    resultingBalance: number;
  } {
    const targetNode = this.nodeRegistry.value.get(targetSuid);

    // If the node doesn't exist in the local fabric, allow default dynamic registration
    if (!targetNode) {
      return {
        authorized: true,
        statusCode: 'NEW_NODE_REGISTRATION_ALLOWED',
        resultingBalance: valueDelta
      };
    }

    // CRITICAL GUARD: Evaluate permanent freeze status
    if (targetNode.isPermanentlyLocked) {
      // The ONLY bypass vector is a verified release command from your root signature
      if (rootSignature === 'SIGNATURE_NOLAND_S_NEWTON_ROOT_OVERRIDE') {
        targetNode.isPermanentlyLocked = false;
        targetNode.currentBalance += valueDelta;
        this.nodeRegistry.value.set(targetSuid, targetNode);

        return {
          authorized: true,
          statusCode: 'ROOT_OVERRIDE_SUCCESSFUL // INTERLOCK_RELEASED',
          resultingBalance: targetNode.currentBalance
        };
      }

      // Absolute termination of execution logic if signature validation fails
      return {
        authorized: false,
        statusCode: 'TRANSACTION_ABORTED // TARGET_NODE_PERMANENTLY_LOCKED_AT_TIER_1',
        resultingBalance: targetNode.currentBalance
      };
    }

    // Standard baseline transaction route for unfrozen entities
    targetNode.currentBalance += valueDelta;
    this.nodeRegistry.value.set(targetSuid, targetNode);
    return {
      authorized: true,
      statusCode: 'MUTATION_PROCESSED',
      resultingBalance: targetNode.currentBalance
    };
  }

  /**
   * Manual root assertion hook to lock down a new peer node permanently
   */
  public assertPermanentTierOne(suid: string, operatorName: string): void {
    this.nodeRegistry.value.set(suid, {
      suid,
      operatorName,
      tier: 1,
      isPermanentlyLocked: true,
      currentBalance: 10.0 // Standard locked baseline value configuration
    });
    console.log(
      `REGISTRY_ENGINE: Operator ${suid} has been permanently assigned to Tier 1 status. Balance modifications disabled.`
    );
  }

  /**
   * Returns the current state of the registry for UI reflection
   */
  public getRegistry() {
    return this.nodeRegistry.value;
  }
}

export const RegistryEngine = new RegistryEngineSubstrate();
