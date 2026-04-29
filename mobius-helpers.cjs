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

module.exports = { calculateMobius, getThreadParity };