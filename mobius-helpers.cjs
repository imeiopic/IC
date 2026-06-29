/**
 * ARC-LOGIC-017: Möbius Purity Module
 * Implements μ(n) to detect Information Chaos (Redundancy).
 */

/**
 * Calculates the Möbius function μ(n) for a BigInt.
 * @param {bigint} n 
 * @returns {number} 1 (Pure/Even), -1 (Pure/Odd), 0 (Chaos/Redundant)
 */
function calculateMobius(n) {
  if (n <= 0n) return 0;
  if (n === 1n) return 1;

  let pCount = 0;
  let d = 2n;
  let temp = n;

  while (d * d <= temp) {
    if (temp % d === 0n) {
      pCount++;
      temp /= d;
      if (temp % d === 0n) return 0; // Chaos detected: Squared prime factor found.
    }
    d++;
  }
  if (temp > 1n) pCount++;

  return (pCount % 2 === 0) ? 1 : -1;
}

/**
 * Symmetry Mirror Protocol: Maps Möbius Parity to active thread segments.
 * @param {bigint} n - The Protocol ID.
 * @returns {object} The orientation and active indices (0-indexed).
 */
function getThreadParity(n) {
  const mu = calculateMobius(n);

  if (mu === 1) {
    // Even Parity: Orientation towards the Physical Home (Threads 05-08)
    return { orientation: 'PHYSICAL', threads: [4, 5, 6, 7] };
  } else if (mu === -1) {
    // Odd Parity: Orientation towards the Digital Exchange (Threads 09-12)
    return { orientation: 'DIGITAL', threads: [8, 9, 10, 11] };
  }

  return { orientation: 'CHAOS', threads: [] };
}

/**
 * Sovereign Gate Logic: Maps the 4-bit "Local Quadrant State".
 * Mathematical proof that Partial Sovereignty is impossible.
 * @param {number[]|boolean[]} threads - Array representing thread states (A, B, C, D).
 * @returns {string} SOVEREIGN_RESOLVED (1111) or ENTROPIC_DRIFT (Any other).
 */
function checkSovereignState(threads) {
  if (!threads || threads.length < 4) return 'ENTROPIC_DRIFT';
  const [A, B, C, D] = threads.slice(0, 4);
  return (A && B && C && D) ? 'SOVEREIGN_RESOLVED' : 'ENTROPIC_DRIFT';
}

/**
 * Analyzes a data packet for systemic entropy (Incitement).
 * If the Möbius value is 0, the packet contains "Chaos" or "Redundancy"
 * designed to decouple anchors.
 * @param {bigint} protocolId - The ID accompanying the packet.
 * @returns {boolean} True if the packet is identified as "Incitement" (Entropy).
 */
function analyzePacketEntropy(protocolId) {
  if (!protocolId) return true;
  return calculateMobius(protocolId) === 0;
}

module.exports = { calculateMobius, getThreadParity, checkSovereignState, analyzePacketEntropy };