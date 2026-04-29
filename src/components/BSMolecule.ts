import { IopicKernel } from "./IopicKernel";
import { keccak256, toUtf8Bytes } from "ethers";

export type MoleculeStatus =
  | "PROPOSED"
  | "VERIFYING"
  | "STREAMING"
  | "COMPLETED"
  | "FAILED";

export class BSMolecule {
  public static readonly MAX_TRANSACTION_LIMIT = 1000000;
  public readonly id: string;
  public status: MoleculeStatus = "PROPOSED";

  private streamedAmount: number = 0;
  private temporalHash: string;

  constructor(
    public buyer: IopicKernel,
    public seller: IopicKernel,
    public totalAmount: number,
    public targetDensity: number = 0.95, // Minimum 95% truth consistency required
  ) {
    if (totalAmount < 0) {
      throw new Error(
        "Critical Substrate Error: Transaction amount cannot be negative.",
      );
    }
    if (totalAmount > BSMolecule.MAX_TRANSACTION_LIMIT) {
      throw new Error(
        `Critical Substrate Error: Transaction amount exceeds the maximum limit of ${BSMolecule.MAX_TRANSACTION_LIMIT} IO$.`,
      );
    }
    this.id = `BSM_${keccak256(toUtf8Bytes(Date.now().toString())).substring(0, 10)}`;
    this.temporalHash = this.id;
  }

  /**
   * Phase 1 & 2: Initiation and Relational Verification
   * Ensures both nodes are fully Sovereign before opening the value stream.
   */
  public verifyPairing(): boolean {
    this.status = "VERIFYING";

    const buyerState = this.buyer.getSystemState();
    const sellerState = this.seller.getSystemState();

    if (buyerState === "EMERGENCY" || sellerState === "EMERGENCY") {
      this.fail(
        "Node in EMERGENCY state. Active Defense Kernel rejected pairing.",
      );
      return false;
    }

    // T9: Atomic Pairing Protocol Handshake
    this.buyer.lockThread(8);
    this.seller.lockThread(8);

    return true;
  }

  /**
   * Phase 3: Atomic Flow
   * Simulates the continuous streaming of IO$ between nodes.
   */
  public executeStream(): void {
    if (this.status !== "VERIFYING") return;
    this.status = "STREAMING";

    // T10: Value Escrow and Flow active
    this.buyer.lockThread(9);
    this.seller.lockThread(9);

    // In a live system, this runs over time. For the logic substrate, we evaluate.
    this.streamedAmount = this.totalAmount;
    this.complete();
  }

  /**
   * Phase 4: Truth Synchronization
   * Updates the global Equation of Truth (I = VR²) by increasing the relational bonds.
   */
  private complete(): void {
    this.status = "COMPLETED";

    // T11: Velocity Premium Calculator
    // Higher truth density yields a stronger planetary bond increase
    const vPremium = this.totalAmount * this.targetDensity * 0.001;

    this.buyer.updateRelationalBond(vPremium);
    this.seller.updateRelationalBond(vPremium);

    console.log(
      `[BSMolecule] Transaction ${this.id} COMPLETED: ${this.totalAmount} IO$ streamed. Velocity Premium: +${vPremium.toFixed(4)}`,
    );
  }

  private fail(reason: string): void {
    this.status = "FAILED";
    console.warn(`[BSMolecule] Transaction ${this.id} FAILED: ${reason}`);
    // Cascading Degradation: Drop the atomic pairing threads to penalize noise
    this.buyer.dropThread(8);
    this.seller.dropThread(8);
  }
}
