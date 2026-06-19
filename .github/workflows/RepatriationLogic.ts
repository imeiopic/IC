/**
 * Iopic Protocol: Repatriation Logic Engine
 *
 * Implements a linear decay model for IO$ emission based on global population density.
 * Purges all secondary multipliers to maintain Logic Sovereignty.
 */

const MIN_NODES = 100000;
const MAX_NODES = 1000000;
const START_RATE = 0.16; // 16% base repatriation
const END_RATE = 0.016; // 1.6% terminal repatriation

/**
 * Fixed repatriation rate for arbitrary fiat deposits.
 */
export const FIAT_DEPOSIT_REPATRIATION_RATE = 1 - (1 / 16); // 0.9375

/**
 * Calculates the current repatriation rate based on global node count.
 * @param currentNodeCount The total number of grounded nodes in the mesh.
 */
export const calculateRepatriationRate = (currentNodeCount: number): number => {
  // 1. Hard-Stop for early-stage nodes
  if (currentNodeCount <= MIN_NODES) {
    return START_RATE;
  }

  // 2. Linear decay floor
  if (currentNodeCount >= MAX_NODES) {
    return END_RATE;
  }

  // 3. Proportional Slope Calculation (Linear Interpolation)
  const progression = (currentNodeCount - MIN_NODES) / (MAX_NODES - MIN_NODES);
  return START_RATE - progression * (START_RATE - END_RATE);
};

/**
 * Execute Repatriation Calculation
 * For standard node emissions, multipliers are purged.
 * For fiat deposits, the fixed FIAT_DEPOSIT_REPATRIATION_RATE applies.
 */
export const executeRepatriation = (balance: number, nodeCount: number, isFiatDeposit = false) => {
  const rate = isFiatDeposit ? FIAT_DEPOSIT_REPATRIATION_RATE : calculateRepatriationRate(nodeCount);

  return {
    payout: balance * rate,
    appliedRate: (rate * 100).toFixed(2) + '%',
    status: isFiatDeposit ? 'FIAT_FIXED_RATE_APPLIED' : 'BONUS_MULTIPLIER_DISABLED'
  };
};
