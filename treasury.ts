/**
 * TREASURY.TS | IOPIC.01 Framework
 * * Manages the economic pulse, CoinX exchanges, and multiplier logic.
 */

import type { CoinX } from './coinxModel';

export interface Transaction {
  id: string;
  senderId: string;
  recipientId: string;
  amount: number;
  coin: CoinX;
  multiplier: number;
  timestamp: string;
  status: 'PENDING' | 'STABILIZED' | 'FRACTURED';
}

export class TreasuryService {
  /**
   * Calculates the resonant value of a transaction based on the pulse multiplier.
   * Multipliers represent node density or anchor alignment (e.g., 2.2x for ISAAC).
   */
  public calculateResonantValue(amount: number, multiplier: number): number {
    return amount * multiplier;
  }

  /**
   * Executes an exchange between two CoinX substrates.
   * Converts the value from the source asset to the target asset, adjusted for multipliers.
   */
  public processExchange(
    amount: number,
    fromCoin: CoinX,
    toCoin: CoinX,
    nodeMultiplier: number = 1.0
  ): number {
    // Calculate conversion based on relative unit values defined in coinxModel
    const conversionRatio = fromCoin.value / toCoin.value;
    const baseConvertedAmount = amount * conversionRatio;
    
    // Apply the resonant multiplier (Symmetry/Pulse logic)
    const finalizedAmount = this.calculateResonantValue(baseConvertedAmount, nodeMultiplier);

    console.log(
      `[TREASURY] Exchange: ${amount} ${fromCoin.symbol} -> ${finalizedAmount} ${toCoin.symbol} (Multiplier: ${nodeMultiplier}x)`
    );

    return finalizedAmount;
  }

  /**
   * Applies the Maintenance Mandate (1.1x boost for grounded nodes).
   * Reference: ReusableMandate.vue logic for stabilizing pulses.
   */
  public applyMaintenanceBoost(value: number): number {
    return value * 1.1;
  }

  /**
   * Shunts excess metabolic pressure based on the 1:16 Symmetry Mandate.
   * Reference: Entity.vue / ReusableMandate.vue shunt logic.
   */
  public calculateSymmetryShunt(pulse: number, baseline: number): number {
    if (baseline <= 0) return pulse;
    const maxSymmetryBound = baseline * 16;
    return pulse > maxSymmetryBound ? pulse - maxSymmetryBound : 0;
  }
}

export const treasury = new TreasuryService();