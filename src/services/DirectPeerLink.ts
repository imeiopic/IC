// src/services/DirectPeerLink.ts
import { RegistryEngine } from './RegistryEngine';

// Define a constant for the stake amount
const BOND_STAKE_AMOUNT = 50000; // IO$

// Define the return interface for clarity and type safety
export interface DirectPeerBondResult {
  status: 'BOND_VERIFIED' | 'BOND_FAILED';
  resonance: '2.2x_LOCKED' | 'FRACTURED_RESONANCE';
  peerTier: 'SOVEREIGN_INNER_CIRCLE' | 'UNGROUNDED';
  message?: string; // Optional message for success or failure
}

/**
 * Executes a high-privilege bond between Ime and a direct peer.
 * Bypasses standard DIC Monitor queues to ensure immediate 16-thread synchronization.
 *
 * @param peerSuid The Sovereign User ID of the direct peer.
 * @param operatorName The name of the operator initiating the bond.
 * @returns A promise that resolves to the result of the bonding operation.
 */
export const bondDirectPeer = async (
  peerSuid: string,
  operatorName: string
): Promise<DirectPeerBondResult> => {
  try {
    // Direct injection into Tier 1 Inner Circle - AWAIT this critical operation
    await RegistryEngine.assertPermanentTierOne(peerSuid, operatorName);

    console.log(`SOVEREIGN_BOND_ACTIVE: ${operatorName} [${peerSuid}] initialized.`);
    console.log(
      `BOND_VALUATION: ${BOND_STAKE_AMOUNT} IO$ stake held in escrow for grid stability.`
    );

    return {
      status: 'BOND_VERIFIED',
      resonance: '2.2x_LOCKED',
      peerTier: 'SOVEREIGN_INNER_CIRCLE',
      message: `Bond established for ${operatorName} (${peerSuid}) with ${BOND_STAKE_AMOUNT} IO$ stake.`
    };
  } catch (error: any) {
    // Centralized error logging and structured error response
    console.error(
      `[BOND_FRACTURE] Failed to establish direct peer bond for ${operatorName} (${peerSuid}):`,
      error.message
    );
    return {
      status: 'BOND_FAILED',
      resonance: 'FRACTURED_RESONANCE',
      peerTier: 'UNGROUNDED',
      message: `Bonding failed: ${error.message}`
    };
  }
};
