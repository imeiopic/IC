const { isPrime } = require('./prime-helpers.cjs');

const isPerfectSquare = (n) => {
    if (n < 0n) return false;
    // 1. Fast Residue Check (Mod 16)
    // A perfect square must have a residue of 0, 1, 4, or 9 modulo 16.
    // This bitwise operation eliminates 75% of non-squares before any heavy math.
    const res = Number(n & 15n);
    if (res !== 0 && res !== 1 && res !== 4 && res !== 9) return false;

    if (n < 2n) return true; // 0n and 1n are perfect squares

    // 2. Better Initial Guess (Newton's method for integer square root)
    let x = 1n << BigInt((n.toString(2).length + 1) >> 1);
    let y = (x + n / x) >> 1n;
    while (y < x) {
        x = y;
        y = (x + n / x) >> 1n;
    }
    return x * x === n;
};

const isFibonacci = (n) => {
    if (n < 0n) return false;
    // A number is Fibonacci if 5n^2 + 4 or 5n^2 - 4 is a perfect square
    return isPerfectSquare(5n * n * n + 4n) || isPerfectSquare(5n * n * n - 4n);
};

/**
 * Validates a protocol ID string against a set of numeric and length constraints.
 * @param {string} protocolIdStr The protocol ID string (e.g., "0x123" or "123").
 * @param {object} constraints Configuration object for constraints.
 * @param {boolean} [constraints.enforceSafeInteger=false] Whether to enforce MAX_SAFE_INTEGER.
 * @param {boolean} [constraints.enforceEvenDecimal=false] Whether to enforce evenness for decimal IDs.
 * @param {boolean} [constraints.enforcePrime=false] Whether to enforce primality.
 * @param {boolean} [constraints.enforcePerfectSquare=false] Whether to enforce perfect square.
 * @param {boolean} [constraints.enforceFibonacci=false] Whether to enforce Fibonacci sequence.
 * @param {number} [constraints.minLength=1] Minimum character length for the ID (excluding '0x' for hex).
 * @param {number|null} [constraints.maxLength=null] Maximum character length for the ID (excluding '0x' for hex).
 * @returns {boolean} True if the protocol ID passes all enabled constraints, false otherwise.
 */
function validateProtocolId(protocolIdStr, constraints = {}) {
    const {
        enforceSafeInteger = false,
        enforceEvenDecimal = false,
        enforcePrime = false,
        enforcePerfectSquare = false,
        enforceFibonacci = false,
        minLength = 1,
        maxLength = null
    } = constraints;

    const n = BigInt(protocolIdStr);
    const isHex = protocolIdStr.toLowerCase().startsWith('0x');
    const idCharLength = isHex ? protocolIdStr.length - 2 : protocolIdStr.length;

    if (maxLength !== null && idCharLength > maxLength) return false;
    if (idCharLength < minLength) return false;

    if (enforceSafeInteger && n > BigInt(Number.MAX_SAFE_INTEGER)) return false;
    if (enforceEvenDecimal && !isHex && n % 2n !== 0n) return false;
    if (enforcePrime && !isPrime(n)) return false;
    if (enforcePerfectSquare && !isPerfectSquare(n)) return false;
    if (enforceFibonacci && !isFibonacci(n)) return false;

    return true;
}

module.exports = {
    isPerfectSquare,
    isFibonacci,
    validateProtocolId
};