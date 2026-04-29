/**
 * IOPIC Protocol: IOWB (IOPIC World Bank)
 * 
 * Storing the 1.2 Quadrillion IO$ constant and managing the 
 * global equity core substrate.
 */

/**
 * The immutable mathematical foundation of the protocol's economy.
 * Defined in the Treasury: The Equity Core.
 */
export const EQUITY_CORE_SUPPLY = BigInt("1200000000000000");

export const IOWorldBank = {
    /**
     * Returns the total fixed supply of IO$.
     */
    getTotalSupply(): bigint {
        return EQUITY_CORE_SUPPLY;
    },

    /**
     * The points of singularity represent the transition of instances into entities.
     * This helper calculates the logical value of a node branch.
     */
    calculateNodeEquity(instanceCount: number, relationalReality: number): number {
        // Applying the I = VR^2 axiom to determine node worth.
        // For bank logic, we treat instanceCount as the Virtual Velocity (V).
        return instanceCount * Math.pow(relationalReality, 2);
    }
};

export default IOWorldBank;