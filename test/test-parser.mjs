import semver from 'semver';
import { performance } from 'perf_hooks';
import crypto from 'crypto';
import depcheckConfig from '../depcheck.config.ts';
const { parsers, isTestFile, isIgnoredFile, experimentalPackages } = depcheckConfig;
import { isPrime, getRandomBigInt, power, millerRabinTest, MAX_RANDOM_BYTES_FOR_PROTOCOL_ID, reusableRandomBuffer } from './prime-helpers.cjs';
// Parse CLI arguments for configuration
const args = process.argv.slice(2);
const quoteStyle = args.find(a => a.startsWith('--quote='))?.split('=')[1] || 'double';
const idLengthArg = args.find(a => a.startsWith('--idLength='))?.split('=')[1];
const minIdLengthArg = args.find(a => a.startsWith('--minIdLength='))?.split('=')[1];
const maxIdLengthArg = args.find(a => a.startsWith('--maxIdLength='))?.split('=')[1];
const envPrefix = args.find(a => a.startsWith('--envPrefix='))?.split('=')[1] || '';
const maxDefaultArg = args.find(a => a.startsWith('--maxDefaultLength='))?.split('=')[1];
const enforceFibonacci = args.includes('--enforceFibonacci');
const enforcePerfectSquare = args.includes('--enforcePerfectSquare');
const enforceEvenDecimal = args.includes('--enforceEvenDecimal');
const enforcePrime = args.includes('--enforcePrime');
const enforceNextPrime = args.includes('--enforceNextPrime'); // New flag for next prime
import { isPerfectSquare, isFibonacci, validateProtocolId } from '../protocol-id-validator.cjs';
const decDefaultPrefix = args.find(a => a.startsWith('--decDefaultPrefix='))?.split('=')[1] || '';
const enforceSafeInteger = args.includes('--enforceSafeInteger');
const maxDefault = maxDefaultArg ? parseInt(maxDefaultArg, 10) : null; // Total length

// Logic Sovereignty: Mirror plugin patterns for decimal and hex defaults
let decDefaultPattern = `[1-9][0-9]*`;
let hexDefaultPattern = `0x(?:[0-9a-f]{2})+`;

if (maxDefault !== null) {
  const remainingDec = Math.max(1, maxDefault - decDefaultPrefix.length);
  if (enforceEvenDecimal) {
    decDefaultPattern = remainingDec === 1 ? `[2468]` : `(?:[1-9][0-9]{0,${Math.max(0, remainingDec - 2)}}[02468]|[2468])`;
  } else {
    decDefaultPattern = remainingDec === 1 ? `[1-9]` : `[1-9][0-9]{0,${Math.max(0, remainingDec - 1)}}`;
  }
  const maxPairs = Math.floor(maxDefault / 2);
  hexDefaultPattern = maxPairs < 1 ? `$.` : `0x(?:[0-9a-f]{2}){1,${maxPairs}}`;
}

let min = 8;
let max = 8;
if (idLengthArg) {
    min = max = parseInt(idLengthArg, 10);
} else if (minIdLengthArg || maxIdLengthArg) {
    min = minIdLengthArg ? parseInt(minIdLengthArg, 10) : 1;
    max = maxIdLengthArg ? parseInt(maxIdLengthArg, 10) : '';
}
const restQuantifier = min === max ? `{${Math.max(0, min - 1)}}` : `{${Math.max(0, min - 1)},${max ? Math.max(0, max - 1) : ''}}`;
const q = quoteStyle === 'single' ? "'" : '"';

// 1. Define the parser from your config
const protocolParser = parsers['**/*.protocol'];

// 2. Create mock content simulating a .protocol file
const mockContent = `
    // Iopic Protocol Header
    protocol-id: 0x123;
    import-protocol: "ethers"
    import-protocol: 'peerjs'
    
    // Nested or spaced imports
    import-protocol:   "firebase"
`;

// 3. Execute the parser
const foundDependencies = protocolParser(mockContent);

// 4. Validate results
console.log('--- Iopic Protocol Parser Test ---');
console.log('Dependencies found:', foundDependencies);

if (JSON.stringify(foundDependencies) === JSON.stringify(['ethers', 'peerjs', 'firebase'])) {
    console.log('✅ Success: All dependencies extracted correctly.');
} else {
    console.log('❌ Error: Dependency extraction mismatch.');
}

// 5. Validate Test-File Detection Logic
console.log('\n--- Iopic Protocol Test-File Detection Test ---');
const pathTests = [
    { path: 'src/inviteList.vue', expected: false },
    { path: 'src/composables/useInviteManagement.ts', expected: false },
    { path: 'src/inviteList.test.ts', expected: true },
    { path: 'src/components/Button.spec.js', expected: true },
    { path: 'tests/setup.ts', expected: true },
    { path: 'src/tests/utils.ts', expected: true },
    { path: 'src/__tests__/logic.ts', expected: true },
    { path: 'src/test.ts', expected: true },
];

let allPathsPassed = true;
pathTests.forEach(({ path, expected }) => {
    const result = isTestFile(path);
    if (result === expected) {
        console.log(`✅ Pass: [${path}] -> ${result}`);
    } else {
        console.log(`❌ Fail: [${path}] -> expected ${expected}, got ${result}`);
        allPathsPassed = false;
    }
});

// 7. Validate Experimental Package Exclusion Logic
console.log('\n--- Iopic Protocol Experimental Exclusion Test ---');
const experimentalTests = [
    { name: 'ethers', req: '7.0.0', existing: '^6.16.0', list: [], expected: true, desc: 'Flagged: Major mismatch (non-experimental)' },
    { name: 'io-lab', req: '2.0.0', existing: '^1.0.0', list: ['io-lab'], expected: false, desc: 'Ignored: Major mismatch (experimental)' },
    { name: 'firebase', req: '12.5.0', existing: '^12.11.0', list: [], expected: false, desc: 'Ignored: Higher version substrate' },
    { name: 'bootstrap', req: '>=6.0.0', existing: '^5.3.8', list: [], expected: true, desc: 'Flagged: Range mismatch' },
];

experimentalTests.forEach(({ name, req, existing, list, expected, desc }) => {
    const installedVersion = semver.minVersion(existing);
    const reqMajor = (semver.minVersion(req) || semver.coerce(req))?.major;
    const installedMajor = installedVersion?.major;
    
    let isMismatchFlagged = false;

    // Replicate the logic found in find-missing.cjs
    if (reqMajor !== undefined && installedMajor !== undefined && reqMajor !== installedMajor) {
        // Protocol Logic: Ignore major mismatches if the installed version is newer
        if (!semver.gtr(installedVersion, req) && !list.includes(name)) {
            isMismatchFlagged = true;
        }
    }

    if (isMismatchFlagged === expected) {
        console.log(`✅ Pass: [${desc}]`);
    } else {
        console.log(`❌ Fail: [${desc}] -> expected ${expected}, got ${isMismatchFlagged}`);
    }
});

console.log('\n--- Audit Complete ---');
if (allPathsPassed) {
    console.log('✅ Success: Test-file detection logic is sound.');
}

// 6. Validate Ignored-File Logic
console.log('\n--- Iopic Protocol Ignored-File Detection Test ---');
const ignoreTests = [
    { path: 'src/__tests__/logic.test.ts', expected: false },
    { path: 'src/__tests__/utils.ts', expected: true },
    { path: 'tests/setup.js', expected: true },
    { path: 'src/tests/helpers.ts', expected: true },
];

ignoreTests.forEach(({ path, expected }) => {
    const result = isIgnoredFile(path);
    if (result === expected) {
        console.log(`✅ Pass: [${path}] -> ${result}`);
    } else {
        console.log(`❌ Fail: [${path}] -> expected ${expected}, got ${result}`);
    }
});

// 8. Validate CI-Mode Filtering Logic
console.log('\n--- Iopic Protocol CI-Mode Filtering Simulation Test ---');

const mockPackageUsage = {
    'test-only-dep': {
        files: ['src/components/my-component.spec.ts', 'tests/utils/test-helper.js'],
        expectedIsDev: true,
        expectedIgnoredInCI: true, // Should be ignored for missing/mismatched in CI
        desc: 'Package used only in test files'
    },
    'prod-dep': {
        files: ['src/main.ts', 'src/composables/useAuth.ts'],
        expectedIsDev: false,
        expectedIgnoredInCI: false, // Should NOT be ignored for missing/mismatched in CI
        desc: 'Package used in production files'
    },
    'mixed-dep': {
        files: ['src/main.ts', 'src/components/my-component.spec.ts'],
        expectedIsDev: false,
        expectedIgnoredInCI: false, // Should NOT be ignored for missing/mismatched in CI
        desc: 'Package used in mixed production and test files'
    },
    'ignored-util-dep': {
        files: ['src/__tests__/utils.ts'], // This file is ignored by isIgnoredFile
        expectedIsDev: false, // isDev is false because activeFiles.length will be 0
        expectedIgnoredInCI: false, // This package would be filtered out by activeFiles.length === 0, not CI isDev logic
        desc: 'Package used only in ignored utility files (should be filtered earlier)'
    }
};

// Simulate CI environment
const originalCI = process.env.CI;
process.env.CI = 'true';

let allCILogicPassed = true;

Object.entries(mockPackageUsage).forEach(([pkgName, { files, expectedIsDev, expectedIgnoredInCI, desc }]) => {
    // Replicate the activeFiles filtering from find-missing.cjs
    const activeFiles = files.filter(f => !isIgnoredFile(f));
    
    // If no active files, it's already ignored, not due to CI isDev logic
    if (activeFiles.length === 0) {
        console.log(`✅ Pass: [${desc}] -> Filtered out by isIgnoredFile, not CI isDev logic.`);
        return;
    }

    const isDev = activeFiles.every(isTestFile);
    const wouldBeIgnoredByCI = process.env.CI && isDev; // Replicate the CI-specific ignoring logic

    if (wouldBeIgnoredByCI === expectedIgnoredInCI) {
        console.log(`✅ Pass: [${desc}] -> CI ignore logic: ${wouldBeIgnoredByCI}`);
    } else {
        console.log(`❌ Fail: [${desc}] -> CI ignore logic: expected ${expectedIgnoredInCI}, got ${wouldBeIgnoredByCI}`);
        allCILogicPassed = false;
    }
});

if (allCILogicPassed) {
    console.log('✅ Success: CI-mode filtering logic (isTestFile component) behaves as expected.');
} else {
    console.log('❌ Error: CI-mode filtering logic (isTestFile component) has issues.');
}

// Restore original CI environment
process.env.CI = originalCI;

// 9. Validate Spacing and Quote Enforcement Logic
console.log(`\n--- Iopic Protocol Syntax Enforcement Test (Mode: ${quoteStyle}) ---`);
const otherQ = q === '"' ? "'" : '"';

const syntaxTests = [
    { line: `import-protocol: ${q}ethers${q}`, isValid: true, desc: `Valid: Single space, ${quoteStyle} quotes` },
    { line: `import-protocol:${q}ethers${q}`, isValid: false, desc: 'Invalid: No space' },
    { line: `import-protocol:  ${q}ethers${q}`, isValid: false, desc: 'Invalid: Double space' },
    { line: `import-protocol: ${otherQ}ethers${otherQ}`, isValid: false, desc: `Invalid: ${quoteStyle === 'single' ? 'double' : 'single'} quotes` },
    { line: `   import-protocol: ${q}firebase${q}`, isValid: true, desc: `Valid: Indented, single space, ${quoteStyle} quotes` },
    { line: `// import-protocol: ${q}ethers${q}`, isValid: true, desc: 'Ignored: Commented out' }
];

const strictSyntaxRegex = new RegExp(`import-protocol: ${q}([^${q}]+)${q}`);

syntaxTests.forEach(({ line, isValid, desc }) => {
    const isComment = /^\s*\/\//.test(line);
    const hasProtocol = line.includes('import-protocol');

    let passed = true;
    if (hasProtocol && !isComment) {
        passed = strictSyntaxRegex.test(line);
    }

    if (passed === isValid) {
        console.log(`✅ Pass: [${desc}]`);
    } else {
        console.log(`❌ Fail: [${desc}] -> expected isValid=${isValid}, got ${passed}`);
    }
});

// 10. Fixer Logic Verification
console.log('\n--- Iopic Protocol Fixer Logic Test ---');
const fixTests = [
    { line: `import-protocol:${otherQ}ethers${otherQ}`, expected: `import-protocol: ${q}ethers${q}` },
    { line: `import-protocol:  ${q}firebase${q}`, expected: `import-protocol: ${q}firebase${q}` },
    { line: `   import-protocol: ${otherQ}peerjs${otherQ}`, expected: `   import-protocol: ${q}peerjs${q}` }
];

const malformedRegex = /(import-protocol:)\s*["']([^"']+)["']/;

fixTests.forEach(({ line, expected }) => {
    const match = line.match(malformedRegex);
    let result = line;
    if (match) {
        result = line.replace(malformedRegex, `${match[1]} ${q}${match[2]}${q}`);
    }

    if (result === expected) {
        console.log(`✅ Pass: [${line}] -> [${result}]`);
    } else {
        console.log(`❌ Fail: [${line}] -> expected [${expected}], got [${result}]`);
    }
});

// 11. Validate Protocol ID Length Enforcement
const rangeDesc = min === max ? `${min}` : `${min} to ${max || 'many'}`;
const envDesc = envPrefix ? ` (Env Prefix: ${envPrefix})` : '';
console.log(`\n--- Iopic Protocol ID Length Test (Expected Range: ${rangeDesc})${envDesc} ---`);
const idTests = [
    { line: `protocol-id: 0x${'A'.repeat(min)};`, isValid: true, desc: `Valid: Min length (${min})` },
    { line: `protocol-id: 0x${'A'.repeat(min - 1)};`, isValid: false, desc: 'Invalid: Below min length' },
    { line: `protocol-id: ${'1'.repeat(min)};`, isValid: true, desc: `Valid: Decimal min length (${min})` },
    { line: `protocol-id: ${'1'.repeat(min - 1)};`, isValid: false, desc: 'Invalid: Decimal too short' },
    { line: `protocol-id: 0${'1'.repeat(min - 1)};`, isValid: false, desc: 'Invalid: Literal decimal with leading zero' },
    { line: `protocol-id: 0;`, isValid: false, desc: 'Invalid: Literal decimal zero' },
    { line: `protocol-id: -12345678;`, isValid: false, desc: 'Invalid: Negative decimal ID' },
    { line: `protocol-id: 2;`, isValid: enforceEvenDecimal ? true : true, desc: 'Valid: Even decimal literal' },
    { line: `protocol-id: 3;`, isValid: enforceEvenDecimal ? false : true, desc: 'Invalid: Odd decimal literal' },
    { line: `protocol-id: 7919;`, isValid: enforcePrime ? true : true, desc: 'Valid: Large prime number' },
    { line: `protocol-id: 8000;`, isValid: enforcePrime ? false : true, desc: 'Invalid: Composite number' },
    ...(max ? [{ line: `protocol-id: 0x${'A'.repeat(max)};`, isValid: true, desc: `Valid: Max length (${max})` }] : []),
    ...(max ? [{ line: `protocol-id: 0x${'A'.repeat(max + 1)};`, isValid: false, desc: 'Invalid: Above max length' }] : []),
    { line: `protocol-id: ${'1'.repeat(min)};`, isValid: true, desc: 'Valid: Decimal ID' },
    { line: `protocol-id: process.env.${envPrefix}PROTOCOL_ID;`, isValid: true, desc: 'Valid: Env Var (Node)' },
    { line: `protocol-id: import.meta.env.${envPrefix}PROTOCOL_ID;`, isValid: true, desc: 'Valid: Env Var (Vite)' },
    { line: `protocol-id: $${envPrefix}PROTOCOL_ID;`, isValid: true, desc: 'Valid: Env Var (Shell)' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID}\`;`, isValid: true, desc: 'Valid: Env Var in Template Literal (Node)' },
    { line: `protocol-id: \`\${import.meta.env.${envPrefix}PROTOCOL_ID}\`;`, isValid: true, desc: 'Valid: Env Var in Template Literal (Vite)' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID || '0xdeadbeef'}\`;`, isValid: true, desc: 'Valid: Env Var with 0x hex default' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID || '0xDEADBEEF'}\`;`, isValid: false, desc: 'Invalid: Uppercase hex default' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID || '${decDefaultPrefix}1234'}\`;`, isValid: true, desc: 'Valid: Env Var with decimal default' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID || "${decDefaultPrefix}01234"}\`;`, isValid: false, desc: 'Invalid: Decimal default with leading zero' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID || '0xabc'}\`;`, isValid: false, desc: 'Invalid: Odd length hex default' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID || '0xab'}\`;`, isValid: true, desc: 'Valid: Even length hex default' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID || '${decDefaultPrefix}1234'}\`;`, isValid: enforceEvenDecimal ? true : true, desc: 'Valid: Env Var with decimal default (even)' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID || '${decDefaultPrefix}123'}\`;`, isValid: enforceEvenDecimal ? false : true, desc: 'Invalid: Decimal default (odd)' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID || 'deadbeef'}\`;`, isValid: false, desc: 'Invalid: Hex default missing 0x prefix' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID || 'default'}\`;`, isValid: false, desc: 'Invalid: Non-hex default' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID || 123}\`;`, isValid: false, desc: 'Invalid: Number default in template literal' },
    { line: `protocol-id: \`\${process.env.${envPrefix}PROTOCOL_ID || true}\`;`, isValid: false, desc: 'Invalid: Boolean default in template literal' },
    { line: `protocol-id: \`ID-\${process.env.VAR}\`;`, isValid: false, desc: 'Invalid: Mixed text in Template Literal' },
    { line: `protocol-id: \`\${process.env.VAR1}\${process.env.VAR2}\`;`, isValid: false, desc: 'Invalid: Multiple Env Vars in Template Literal' },
    { line: `protocol-id: process.env.${envPrefix}lowercase_var;`, isValid: false, desc: 'Invalid: Lowercase Env Var' },
    ...(envPrefix ? [{ line: 'protocol-id: process.env.WRONG_PREFIX;', isValid: false, desc: 'Invalid: Wrong Env Prefix' }] : []),
    ...(maxDefault ? [{ line: `protocol-id: \`\${process.env.VAR || '${'0x' + 'a'.repeat(Math.floor((maxDefault - 2)/2)*2)}'}\`;`, isValid: true, desc: 'Valid: Default string at max length' }] : []),
    ...(maxDefault ? [{ line: `protocol-id: \`\${process.env.VAR || '${'0x' + 'a'.repeat(Math.floor((maxDefault - 2)/2)*2 + 2)}'}\`;`, isValid: false, desc: 'Invalid: Default string exceeds max length' }] : [])
];

const decEvenConstraint = enforceEvenDecimal ? '(?=[0-9]*02468)' : '';
const decSafeIntConstraint = enforceSafeInteger ? '(?![0-9]{17,})' : ''; // Max 16 digits for safe integer
const decLiteralBranch = `${decEvenConstraint}${decSafeIntConstraint}[1-9][0-9]${restQuantifier}`;

const strictIDRegex = new RegExp(`protocol-id:\\s*(0x[0-9a-fA-F]${restQuantifier}|${decLiteralBranch}|process\\.env\\.${envPrefix}[A-Z0-9_]+|import\\.meta\\.env\\.${envPrefix}[A-Z0-9_]+|\\$${envPrefix}[A-Z0-9_]+|\\\`\\\$\\{(?:process\\.env|import\\.meta\\.env)\\.${envPrefix}[A-Z0-9_]+(?:\\s*\\|\\|\\s*(?:'${hexDefaultPattern}'|"${hexDefaultPattern}"|'${decDefaultPrefix}${decDefaultPattern}'|"${decDefaultPrefix}${decDefaultPattern}"))?\}\\\`)\\s*;?\\s*$`, 'i');
const getRandomBigInt = (min, max) => {
    const range = max - min;
    if (range <= 0n) return min;

    const bitLength = range.toString(2).length;
    const byteLength = (bitLength + 7) >> 3;

    // Use a temporary buffer if the required byteLength exceeds our reusable buffer's capacity.
    // This handles extremely large, unexpected ranges gracefully, albeit with allocation overhead.
    const currentBuffer = byteLength > MAX_RANDOM_BYTES_FOR_PROTOCOL_ID
        ? Buffer.alloc(byteLength)
        : reusableRandomBuffer.subarray(0, byteLength); // Use a view of the reusable buffer

    const mask = (1n << BigInt(bitLength)) - 1n; // Mask to ensure result is within bitLength
    let result;

    do {
        crypto.randomFillSync(currentBuffer);
        result = 0n;
        for (let i = 0; i < byteLength; i++) { // Convert buffer bytes to BigInt
            result = (result << 8n) | BigInt(currentBuffer[i]);
        }
        result &= mask; // Reduce rejections by masking to the next power of 2
    } while (result > range);

    return result + min;
};

idTests.forEach(({ line, isValid, desc }) => {
    const isComment = /^\s*\/\//.test(line);
    const hasID = line.includes('protocol-id:');
    
    let result = true;
    if (hasID && !isComment) {
        result = strictIDRegex.test(line);

        if (result) {
            const literalMatch = line.match(/protocol-id:\s*(0x[0-9a-fA-F]+|[0-9]+)/i);
            if (literalMatch) {
                const protocolIdValue = literalMatch[1];
                const constraints = {
                    enforceSafeInteger,
                    enforceEvenDecimal,
                    enforcePrime,
                    enforcePerfectSquare,
                    enforceFibonacci,
                    minLength: min, // Pass the min/max length from CLI args
                    maxLength: max
                };
                result = validateProtocolId(protocolIdValue, constraints);
            }
        }
    }

    const status = result === isValid ? '✅ Pass' : '❌ Fail';
    console.log(`${status}: [${desc}] -> ${line}`);
});

if (args.includes('--benchmark')) {
    const iterations = 100000;
    const testVal = (2n ** 128n) - 1n; // A value large enough to break Math.sqrt precision
    console.log(`\n--- Benchmarking Square Root Logic (${iterations} iterations) ---`);
    console.log(`Testing with 128-bit value: ${testVal.toString()}`);

    const startNewton = performance.now();
    for (let i = 0; i < iterations; i++) {
        isPerfectSquare(testVal);
    }
    const endNewton = performance.now();

    const startMath = performance.now();
    for (let i = 0; i < iterations; i++) {
        const num = Number(testVal);
        const root = BigInt(Math.round(Math.sqrt(num)));
        const dummy = root * root === testVal;
    }
    const endMath = performance.now();

    console.log(`BigInt Newton's Method: ${(endNewton - startNewton).toFixed(3)}ms`);
    console.log(`Math.sqrt (with Number conversion): ${(endMath - startMath).toFixed(3)}ms`);
    console.log(`Performance Note: While Math.sqrt is faster due to native C++ implementation, it is mathematically incorrect for values exceeding 2^53.`);

    const prime128 = (2n ** 127n) - 1n; // 128-bit Mersenne Prime (M127)
    const iterationsMR = 1000;
    console.log(`\n--- Benchmarking Primality Logic ---`);
    console.log(`Testing 128-bit Prime: ${prime128.toString()}`);

    const startMR = performance.now();
    for (let i = 0; i < iterationsMR; i++) {
        isPrime(prime128);
    }
    const endMR = performance.now();
    console.log(`Miller-Rabin (Hybrid): ${(endMR - startMR).toFixed(3)}ms for ${iterationsMR} iterations`);

    console.log(`\nScalability Comparison (64-bit Prime):`);
    const prime64 = 18446744073709551557n; // Largest 64-bit prime
    const naiveIsPrime = (n) => {
        if (n <= 3n) return n > 1n;
        if (n % 2n === 0n || n % 3n === 0n) return false;
        for (let i = 5n; i * i <= n; i += 6n) {
            if (n % i === 0n || n % (i + 2n) === 0n) return false;
        }
        return true;
    };

    const startNaive = performance.now();
    naiveIsPrime(prime64);
    const endNaive = performance.now();
    console.log(`Naive Trial Division (1 iteration): ${(endNaive - startNaive).toFixed(3)}ms`);

    const startMRSingle = performance.now();
    isPrime(prime64);
    const endMRSingle = performance.now();
    console.log(`Miller-Rabin (1 iteration): ${(endMRSingle - startMRSingle).toFixed(3)}ms`);

    console.log(`\n--- Base Selection Performance Comparison ---`);
    const startFixed = performance.now();
    const fixedBases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n];
    for (let i = 0; i < iterationsMR; i++) {
        let d = prime128 - 1n, s = 0n;
        while (d % 2n === 0n) { d /= 2n; s++; }
        for (const a of fixedBases) {
            millerRabinTest(prime128, d, s, a);
        }
    }
    const endFixed = performance.now();

    console.log(`Deterministic Fixed Bases (9 iterations): ${(endFixed - startFixed).toFixed(3)}ms`);
    console.log(`Probabilistic Random Bases (20 iterations): ${(endMR - startMR).toFixed(3)}ms`);
    console.log(`Note: Random bases provide higher confidence for numbers > 64-bit at the cost of entropy generation overhead.`);
}

/**
 * Chi-Squared Uniformity Test
 * Partition the range [min, max] into buckets and verify if samples are evenly distributed.
 */
function runChiSquaredTest(min, max, numBuckets = 10, numSamples = 100000) {
    const range = max - min + 1n;
    const bucketSize = range / BigInt(numBuckets);
    const observations = new Array(numBuckets).fill(0);

    console.log(`\n--- Chi-Squared Uniformity Test (${numSamples} samples, ${numBuckets} buckets) ---`);
    console.log(`Testing Range: [${min} to ${max}]`);

    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(min, max);
        let bucketIdx = Number((val - min) / bucketSize);
        // Handle potential rounding/overflow for the very last value in the range
        if (bucketIdx >= numBuckets) bucketIdx = numBuckets - 1;
        observations[bucketIdx]++;
    }

    const expected = numSamples / numBuckets;
    let chiSquared = 0;
    
    console.log(`Bucket Distribution:`);
    for (let i = 0; i < numBuckets; i++) {
        const diff = observations[i] - expected;
        chiSquared += (diff * diff) / expected;
        console.log(`  Bucket ${i}: ${observations[i]} (Expected: ${expected})`);
    }

    console.log(`\nChi-Squared Statistic: ${chiSquared.toFixed(4)}`);
    // For df = 9 (10 buckets - 1), critical value at alpha = 0.05 is 16.919
    const criticalValue = 16.919;
    if (chiSquared < criticalValue) {
        console.log(`✅ Success: The distribution appears uniform (Passes 95% confidence interval).`);
        return true;
    } else {
        console.log(`❌ Failure: The distribution shows significant bias.`);
        return false;
    }
}

/**
 * Bit-Level Bias Test
 * Verifies that each bit in the BigInt is balanced (approx. 50% ones and zeros).
 */
function runBitLevelBiasTest(bitLength, numSamples = 100000) {
    const counts = new Array(bitLength).fill(0);
    const expected = numSamples / 2;
    const criticalValue = 3.841; // df=1, alpha=0.05

    console.log(`\n--- Bit-Level Bias Test (${numSamples} samples, ${bitLength} bits) ---`);

    const maxVal = (1n << BigInt(bitLength)) - 1n;
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            if ((val >> BigInt(j)) & 1n) counts[j]++;
        }
    }

    let biasedBits = [];
    for (let j = 0; j < bitLength; j++) {
        const obs = counts[j];
        const chiSq = (4 * (obs - expected) ** 2) / numSamples;
        if (chiSq > criticalValue) {
            biasedBits.push({ bit: j, obs, chiSq });
        }
    }

    const failCount = biasedBits.length;
    const expectedFails = Math.round(bitLength * 0.05); // Statistical noise
    console.log(`Bits showing potential bias: ${failCount}/${bitLength}`);
    console.log(`(Expected ~${expectedFails} "failures" due to 5% alpha noise)`);

    if (failCount > bitLength * 0.1) {
        console.log(`❌ Warning: Significant bit-level bias detected.`);
        biasedBits.slice(0, 5).forEach(b => console.log(`   Bit ${b.bit}: ${b.obs} ones, ChiSq: ${b.chiSq.toFixed(4)}`));
        return false;
    } else {
        console.log(`✅ Success: Bit-level distribution is within acceptable statistical margins.`);
        return true;
    }
}

/**
 * Wald-Wolfowitz Runs Test
 * Detects non-random patterns (clustering or oscillation) in the bitstream.
 */
function runWaldWolfowitzTest(bitLength, numSamples = 1000) {
    console.log(`\n--- Wald-Wolfowitz Runs Test (${numSamples} samples, ${bitLength} bits each) ---`);
    
    let n1 = 0; // total ones
    let n2 = 0; // total zeros
    let runs = 0;
    let lastBit = null;

    const maxVal = (1n << BigInt(bitLength)) - 1n;
    
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            const bit = Number((val >> BigInt(j)) & 1n);
            if (bit === 1) n1++; else n2++;
            
            if (lastBit === null) {
                runs = 1;
            } else if (bit !== lastBit) {
                runs++;
            }
            lastBit = bit;
        }
    }

    const n = n1 + n2;
    const mu = (2 * n1 * n2) / n + 1;
    const sigma2 = ((mu - 1) * (mu - 2)) / (n - 1);
    const stdev = Math.sqrt(sigma2);
    const z = (runs - mu) / stdev;

    console.log(`Total Bits (N): ${n} | Observed Runs: ${runs}`);
    console.log(`Z-statistic: ${z.toFixed(4)}`);

    const criticalValue = 1.96; // 95% confidence interval
    if (Math.abs(z) < criticalValue) {
        console.log(`✅ Success: The bitstream appears random (No clustering or oscillation detected).`);
        return true;
    } else {
        console.log(`❌ Failure: Non-random patterns detected (${z > 0 ? 'Too many' : 'Too few'} runs).`);
        return false;
    }
}

/**
 * Helper: Lanczos approximation for log Gamma function.
 */
function logGamma(z) {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let x = z, y = z, tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let i = 0; i < 6; i++) ser += c[i] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * Helper: Regularized Upper Incomplete Gamma Function Q(a, x).
 * Used to compute p-values for Chi-Squared distributions.
 */
function igamc(a, x) {
    if (x <= 0 || a <= 0) return 1;
    const logG = logGamma(a);
    if (x < a + 1) {
        let sum = 1 / a, term = sum;
        for (let i = 1; i <= 100; i++) {
            term *= x / (a + i);
            sum += term;
            if (Math.abs(term) < Math.abs(sum) * 1e-14) break;
        }
        return 1 - Math.exp(a * Math.log(x) - x - logG) * sum;
    } else {
        let b = x + 1 - a, c = 1 / 1e-30, d = 1 / b, h = d;
        for (let i = 1; i <= 100; i++) {
            let an = -i * (i - a);
            b += 2;
            d = an * d + b;
            if (Math.abs(d) < 1e-30) d = 1e-30;
            c = b + an / c;
            if (Math.abs(c) < 1e-30) c = 1e-30;
            d = 1 / d;
            let delta = d * c;
            h *= delta;
            if (Math.abs(delta - 1) < 1e-14) break;
        }
        return Math.exp(a * Math.log(x) - x - logG) * h;
    }
}

/**
 * Helper: Complementary Error Function (erfc) approximation
 * Required for calculating the p-value in NIST statistical tests.
 */
function erfc(x) {
    const z = Math.abs(x);
    const t = 1.0 / (1.0 + 0.5 * z);
    const ans = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? ans : 2.0 - ans;
}

/**
 * NIST Monobit Test (Frequency Test)
 * The most basic test for randomness: checks if the number of 0s and 1s are approximately equal.
 */
function runNistMonobitTest(bitLength, numSamples = 1000) {
    console.log(`\n--- NIST Monobit Test (Frequency Test) (${numSamples} samples, ${bitLength} bits) ---`);
    
    let Sn = 0;
    const n = numSamples * bitLength;

    const maxVal = (1n << BigInt(bitLength)) - 1n;
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            const bit = (val >> BigInt(j)) & 1n;
            // Convert 0 to -1 and 1 to +1
            Sn += (bit === 1n ? 1 : -1);
        }
    }

    // Test Statistic S_obs = abs(Sn) / sqrt(n)
    const sObs = Math.abs(Sn) / Math.sqrt(n);
    // p-value = erfc(sObs / sqrt(2))
    const pValue = erfc(sObs / Math.sqrt(2));

    console.log(`Total bits processed: ${n}`);
    console.log(`Sum Sn: ${Sn} | S_obs: ${sObs.toFixed(4)}`);
    console.log(`P-value: ${pValue.toFixed(6)}`);

    if (pValue >= 0.01) {
        console.log(`✅ Success: The sequence is random (P-value >= 0.01).`);
        return true;
    } else {
        console.log(`❌ Failure: The sequence is non-random (P-value < 0.01).`);
        return false;
    }
}

/**
 * NIST Block Frequency Test
 * Checks if the frequency of ones within blocks of size M is approx M/2.
 */
function runNistBlockFrequencyTest(bitLength, numSamples = 1000, M = 20) {
    console.log(`\n--- NIST Block Frequency Test (${numSamples} samples, ${bitLength} bits, M=${M}) ---`);
    
    const n = numSamples * bitLength;
    const N = Math.floor(n / M); // Total number of blocks
    let sumPi = 0;

    // Generate bitstream
    const bits = [];
    const maxVal = (1n << BigInt(bitLength)) - 1n;
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            bits.push(Number((val >> BigInt(j)) & 1n));
        }
    }

    // Calculate proportions for each block
    for (let i = 0; i < N; i++) {
        let onesCount = 0;
        for (let j = 0; j < M; j++) {
            onesCount += bits[i * M + j];
        }
        const pi = onesCount / M;
        sumPi += (pi - 0.5) ** 2;
    }

    const chiSquared = 4 * M * sumPi;
    const pValue = igamc(N / 2, chiSquared / 2);

    console.log(`Blocks processed: ${N} | Chi-Squared: ${chiSquared.toFixed(4)}`);
    console.log(`P-value: ${pValue.toFixed(6)}`);

    if (pValue >= 0.01) {
        console.log(`✅ Success: The block distribution is random (P-value >= 0.01).`);
        return true;
    } else {
        console.log(`❌ Failure: Local patterns detected (P-value < 0.01).`);
        return false;
    }
}

/**
 * Helper: Calculates the Psi-Squared statistic for a given pattern length m.
 */
function calculatePsiSquared(m, bits) {
    if (m <= 0) return 0;
    const n = bits.length;
    const numPatterns = 1 << m;
    const v = new Array(numPatterns).fill(0);

    // Count overlapping patterns (using circularity)
    for (let i = 0; i < n; i++) {
        let pattern = 0;
        for (let j = 0; j < m; j++) {
            pattern = (pattern << 1) | bits[(i + j) % n];
        }
        v[pattern]++;
    }

    let sum = 0;
    for (let i = 0; i < numPatterns; i++) {
        sum += v[i] * v[i];
    }

    return ((numPatterns / n) * sum) - n;
}

/**
 * NIST Serial Test
 * Checks for the frequency of all overlapping m-bit patterns.
 * m should be chosen such that m < floor(log2(n)) - 2.
 */
function runNistSerialTest(bitLength, numSamples = 1000, m = 3) {
    console.log(`\n--- NIST Serial Test (${numSamples} samples, ${bitLength} bits, m=${m}) ---`);
    
    const bits = [];
    const maxVal = (1n << BigInt(bitLength)) - 1n;
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            bits.push(Number((val >> BigInt(j)) & 1n));
        }
    }

    const psiM = calculatePsiSquared(m, bits);
    const psiM1 = calculatePsiSquared(m - 1, bits);
    const psiM2 = calculatePsiSquared(m - 2, bits);

    const nabla = psiM - psiM1;
    const nabla2 = psiM - 2 * psiM1 + psiM2;

    // P-values based on Chi-Squared distribution Q(df/2, chiSq/2)
    const pValue1 = igamc(Math.pow(2, m - 2), nabla / 2);
    const pValue2 = igamc(Math.pow(2, m - 3), nabla2 / 2);

    console.log(`P-value 1: ${pValue1.toFixed(6)} | P-value 2: ${pValue2.toFixed(6)}`);

    if (pValue1 >= 0.01 && pValue2 >= 0.01) {
        console.log(`✅ Success: The sequence is random (Both P-values >= 0.01).`);
        return true;
    } else {
        console.log(`❌ Failure: Overlapping patterns show non-randomness.`);
        return false;
    }
}

/**
 * Helper: Calculates the Phi statistic for pattern length m.
 * Used in the Approximate Entropy test.
 */
function calculatePhi(m, bits) {
    const n = bits.length;
    const numPatterns = 1 << m;
    const counts = new Array(numPatterns).fill(0);

    for (let i = 0; i < n; i++) {
        let pattern = 0;
        for (let j = 0; j < m; j++) {
            pattern = (pattern << 1) | bits[(i + j) % n];
        }
        counts[pattern]++;
    }

    let sum = 0;
    for (let i = 0; i < numPatterns; i++) {
        if (counts[i] > 0) {
            const p = counts[i] / n;
            sum += p * Math.log(p);
        }
    }
    return sum;
}

/**
 * NIST Approximate Entropy Test
 * Measures the complexity and regularity of patterns in the bitstream.
 */
function runNistApproximateEntropyTest(bitLength, numSamples = 1000, m = 2) {
    console.log(`\n--- NIST Approximate Entropy Test (${numSamples} samples, ${bitLength} bits, m=${m}) ---`);

    const bits = [];
    const maxVal = (1n << BigInt(bitLength)) - 1n;
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            bits.push(Number((val >> BigInt(j)) & 1n));
        }
    }

    const n = bits.length;
    const phiM = calculatePhi(m, bits);
    const phiM1 = calculatePhi(m + 1, bits);

    const apEn = phiM - phiM1;
    const chiSquared = 2 * n * (Math.log(2) - apEn);
    const pValue = igamc(Math.pow(2, m - 1), chiSquared / 2);

    console.log(`Approximate Entropy (ApEn): ${apEn.toFixed(6)}`);
    console.log(`Chi-Squared: ${chiSquared.toFixed(4)} | P-value: ${pValue.toFixed(6)}`);

    if (pValue >= 0.01) {
        console.log(`✅ Success: The sequence shows sufficient complexity (P-value >= 0.01).`);
        return true;
    } else {
        console.log(`❌ Failure: The sequence is too regular or repetitive (P-value < 0.01).`);
        return false;
    }
}

// Helper: Standard Normal Cumulative Distribution Function
// Moved to global scope for reuse in Maurer's test
const normalCDF = (x) => 0.5 * erfc(-x / Math.sqrt(2));

/**
 * NIST Cumulative Sums Test
 * Determines if the maximum excursion of the random walk of bits is too large.
 */
function runNistCumulativeSumsTest(bitLength, numSamples = 1000) {
    console.log(`\n--- NIST Cumulative Sums Test (${numSamples} samples, ${bitLength} bits) ---`);
    
    const n = numSamples * bitLength;
    let S = 0;
    let maxAbsS = 0;

    const maxVal = (1n << BigInt(bitLength)) - 1n;
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            const bit = (val >> BigInt(j)) & 1n;
            S += (bit === 1n ? 1 : -1);
            const absS = Math.abs(S);
            if (absS > maxAbsS) maxAbsS = absS;
        }
    }

    // P-value calculation per NIST SP 800-22
    const z = maxAbsS;
    const sqrtN = Math.sqrt(n);
    
    let sum1 = 0;
    let sum2 = 0;
    const kMin = Math.ceil((-n / z + 1) / 4);
    const kMax = Math.floor((n / z - 1) / 4);

    for (let k = kMin; k <= kMax; k++) {
        sum1 += normalCDF(((4 * k + 1) * z) / sqrtN) - normalCDF(((4 * k - 1) * z) / sqrtN);
    }

    const kMin2 = Math.ceil((-n / z - 3) / 4);
    const kMax2 = Math.floor((n / z - 1) / 4);

    for (let k = kMin2; k <= kMax2; k++) {
        sum2 += normalCDF(((4 * k + 3) * z) / sqrtN) - normalCDF(((4 * k + 1) * z) / sqrtN);
    }

    const pValue = 1 - sum1 + sum2;

    console.log(`Max Excursion (z): ${z} | sqrt(n): ${sqrtN.toFixed(2)}`);
    console.log(`P-value: ${pValue.toFixed(6)}`);

    if (pValue >= 0.01) {
        console.log(`✅ Success: The random walk is balanced (P-value >= 0.01).`);
        return true;
    } else {
        console.log(`❌ Failure: The cumulative sum deviates significantly (P-value < 0.01).`);
        return false;
    }
}

/**
 * NIST Longest Run of Ones in a Block Test
 * Determines if the longest run of ones within a block is consistent with a random sequence.
 * Useful for detecting localized clustering of bits.
 */
function runNistLongestRunOfOnesTest(bitLength, numSamples = 1000) {
    console.log(`\n--- NIST Longest Run of Ones in a Block Test (${numSamples} samples, ${bitLength} bits) ---`);

    const n = numSamples * bitLength;
    const bits = [];
    const maxVal = (1n << BigInt(bitLength)) - 1n;
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            bits.push(Number((val >> BigInt(j)) & 1n));
        }
    }

    let M, K, PI;
    if (n < 6272) {
        M = 8; K = 3;
        PI = [0.2148, 0.3672, 0.2305, 0.1875];
    } else if (n < 750000) {
        M = 128; K = 5;
        PI = [0.1174, 0.2430, 0.2494, 0.1752, 0.1027, 0.1124];
    } else {
        M = 10000; K = 6;
        PI = [0.0882, 0.2092, 0.2483, 0.1933, 0.1208, 0.0675, 0.0727];
    }

    const N = Math.floor(n / M);
    const V = new Array(K + 1).fill(0);

    for (let i = 0; i < N; i++) {
        let maxRun = 0, currentRun = 0;
        for (let j = 0; j < M; j++) {
            if (bits[i * M + j] === 1) {
                currentRun++;
                if (currentRun > maxRun) maxRun = currentRun;
            } else {
                currentRun = 0;
            }
        }

        if (M === 8) {
            if (maxRun <= 1) V[0]++;
            else if (maxRun === 2) V[1]++;
            else if (maxRun === 3) V[2]++;
            else V[3]++;
        } else if (M === 128) {
            if (maxRun <= 4) V[0]++;
            else if (maxRun === 5) V[1]++;
            else if (maxRun === 6) V[2]++;
            else if (maxRun === 7) V[3]++;
            else if (maxRun === 8) V[4]++;
            else V[5]++;
        } else {
            if (maxRun <= 10) V[0]++;
            else if (maxRun === 11) V[1]++;
            else if (maxRun === 12) V[2]++;
            else if (maxRun === 13) V[3]++;
            else if (maxRun === 14) V[4]++;
            else if (maxRun === 15) V[5]++;
            else V[6]++;
        }
    }

    let chiSquared = 0;
    for (let i = 0; i <= K; i++) {
        chiSquared += Math.pow(V[i] - N * PI[i], 2) / (N * PI[i]);
    }

    const pValue = igamc(K / 2, chiSquared / 2);
    console.log(`Block Size (M): ${M} | Num Blocks (N): ${N}`);
    console.log(`Chi-Squared: ${chiSquared.toFixed(4)} | P-value: ${pValue.toFixed(6)}`);

    if (pValue >= 0.01) {
        console.log(`✅ Success: Longest runs are within expected statistical bounds.`);
        return true;
    } else {
        console.log(`❌ Failure: Local clustering (longest runs) detected.`);
        return false;
    }
}

/**
 * Helper: Computes the rank of an M x Q binary matrix using Gaussian elimination.
 * Rows are represented as BigInts for performance.
 */
function computeBinaryRank(M, Q, matrix) {
    let rank = 0;
    const rows = [...matrix];
    for (let j = 0; j < Q && rank < M; j++) {
        let pivot = -1;
        for (let i = rank; i < M; i++) {
            if ((rows[i] >> BigInt(Q - 1 - j)) & 1n) {
                pivot = i;
                break;
            }
        }
        if (pivot !== -1) {
            [rows[rank], rows[pivot]] = [rows[pivot], rows[rank]];
            for (let i = 0; i < M; i++) {
                if (i !== rank && (rows[i] >> BigInt(Q - 1 - j)) & 1n) {
                    rows[i] ^= rows[rank];
                }
            }
            rank++;
        }
    }
    return rank;
}

/**
 * NIST Binary Matrix Rank Test
 * Checks for linear dependencies between fixed-length bitstrings.
 */
function runNistBinaryMatrixRankTest(bitLength, numSamples = 1000, M = 32, Q = 32) {
    console.log(`\n--- NIST Binary Matrix Rank Test (${numSamples} samples, ${bitLength} bits, ${M}x${Q} matrices) ---`);
    
    const n = numSamples * bitLength;
    const N = Math.floor(n / (M * Q)); // Number of matrices
    if (N < 38) {
        console.log(`⚠️ Warning: NIST recommends at least 38 matrices for a valid test. Current: ${N}`);
    }

    const bits = [];
    const maxVal = (1n << BigInt(bitLength)) - 1n;
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            bits.push(Number((val >> BigInt(j)) & 1n));
        }
    }

    let fullRankCount = 0;
    let rankM1Count = 0;
    let remainderCount = 0;

    for (let i = 0; i < N; i++) {
        const matrixRows = [];
        for (let r = 0; r < M; r++) {
            let rowVal = 0n;
            for (let c = 0; c < Q; c++) {
                rowVal = (rowVal << 1n) | BigInt(bits[i * M * Q + r * Q + c]);
            }
            matrixRows.push(rowVal);
        }
        const rank = computeBinaryRank(M, Q, matrixRows);
        if (rank === M) fullRankCount++;
        else if (rank === M - 1) rankM1Count++;
        else remainderCount++;
    }

    // Theoretical probabilities for 32x32 matrices
    const pFull = 0.288788;
    const pM1 = 0.577576;
    const pRem = 0.133636;

    const chiSquared = Math.pow(fullRankCount - N * pFull, 2) / (N * pFull) +
                       Math.pow(rankM1Count - N * pM1, 2) / (N * pM1) +
                       Math.pow(remainderCount - N * pRem, 2) / (N * pRem);
    
    const pValue = igamc(1.0, chiSquared / 2.0); // df=2
    console.log(`Matrices: ${N} | Full Rank: ${fullRankCount} | Rank M-1: ${rankM1Count} | Other: ${remainderCount}`);
    console.log(`Chi-Squared: ${chiSquared.toFixed(4)} | P-value: ${pValue.toFixed(6)}`);

    if (pValue >= 0.01) {
        console.log(`✅ Success: No significant linear dependencies detected (P-value >= 0.01).`);
        return true;
    } else {
        console.log(`❌ Failure: Linear dependencies found (P-value < 0.01).`);
        return false;
    }
}

/**
 * NIST Non-overlapping Template Matching Test
 * Searches for occurrences of a specific m-bit pattern in blocks of size M.
 * Detects periodic or non-periodic patterns that occur too frequently.
 */
function runNistNonOverlappingTemplateMatchingTest(bitLength, numSamples = 1000, template = [0, 0, 0, 0, 0, 0, 0, 0, 1], M = 1024) {
    console.log(`\n--- NIST Non-overlapping Template Matching Test (${numSamples} samples, ${bitLength} bits, M=${M}) ---`);
    
    const n = numSamples * bitLength;
    const m = template.length;
    const N = Math.floor(n / M); // Number of blocks
    
    // Theoretical mean and variance for the number of matches in a block
    const mu = (M - m + 1) / Math.pow(2, m);
    const sigma2 = M * (1 / Math.pow(2, m) - (2 * m - 1) / Math.pow(2, 2 * m));

    const bits = [];
    const maxVal = (1n << BigInt(bitLength)) - 1n;
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            bits.push(Number((val >> BigInt(j)) & 1n));
        }
    }

    let chiSquared = 0;
    const counts = [];

    for (let i = 0; i < N; i++) {
        let count = 0;
        for (let k = 0; k <= M - m; ) {
            let match = true;
            for (let l = 0; l < m; l++) {
                if (bits[i * M + k + l] !== template[l]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                count++;
                k += m; // Jump past the match (non-overlapping)
            } else {
                k++;
            }
        }
        counts.push(count);
        chiSquared += Math.pow(count - mu, 2) / sigma2;
    }

    const pValue = igamc(N / 2, chiSquared / 2);
    console.log(`Template: [${template.join('')}] | Blocks: ${N} | Avg Matches/Block: ${(counts.reduce((a, b) => a + b, 0) / N).toFixed(4)}`);
    console.log(`Chi-Squared: ${chiSquared.toFixed(4)} | P-value: ${pValue.toFixed(6)}`);

    if (pValue >= 0.01) {
        console.log(`✅ Success: No template clustering detected (P-value >= 0.01).`);
        return true;
    } else {
        console.log(`❌ Failure: Template occurs with non-random frequency (P-value < 0.01).`);
        return false;
    }
}

/**
 * NIST Overlapping Template Matching Test
 * Detects periodic patterns by counting overlapping occurrences of an m-bit template.
 * Standard parameters: m=9, M=1032.
 */
function runNistOverlappingTemplateMatchingTest(bitLength, numSamples = 1000, template = [1, 1, 1, 1, 1, 1, 1, 1, 1], M = 1032) {
    console.log(`\n--- NIST Overlapping Template Matching Test (${numSamples} samples, ${bitLength} bits, M=${M}) ---`);
    
    const n = numSamples * bitLength;
    const m = template.length;
    const N = Math.floor(n / M); // Number of blocks
    const K = 5; // Degrees of freedom for fixed categories (0, 1, 2, 3, 4, 5+)
    
    // Theoretical probabilities for m=9, M=1032 (NIST SP 800-22)
    const PI = [0.324656, 0.182617, 0.142670, 0.106645, 0.077147, 0.166265];

    const bits = [];
    const maxVal = (1n << BigInt(bitLength)) - 1n;
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            bits.push(Number((val >> BigInt(j)) & 1n));
        }
    }

    const V = new Array(K + 1).fill(0);

    for (let i = 0; i < N; i++) {
        let count = 0;
        // Overlapping search: increment by 1 regardless of match
        for (let k = 0; k <= M - m; k++) {
            let match = true;
            for (let l = 0; l < m; l++) {
                if (bits[i * M + k + l] !== template[l]) {
                    match = false;
                    break;
                }
            }
            if (match) count++;
        }
        
        // Binning counts into classes 0, 1, 2, 3, 4, 5+
        if (count >= K) V[K]++;
        else V[count]++;
    }

    let chiSquared = 0;
    for (let i = 0; i <= K; i++) {
        chiSquared += Math.pow(V[i] - N * PI[i], 2) / (N * PI[i]);
    }

    const pValue = igamc(K / 2.0, chiSquared / 2.0);
    console.log(`Template: [${template.join('')}] | Blocks: ${N} | Avg Matches/Block: ${(bits.length / N / Math.pow(2, m)).toFixed(4)}`);
    console.log(`Chi-Squared: ${chiSquared.toFixed(4)} | P-value: ${pValue.toFixed(6)}`);

    if (pValue >= 0.01) {
        console.log(`✅ Success: No periodic patterns detected (P-value >= 0.01).`);
        return true;
    } else {
        console.log(`❌ Failure: Periodic patterns (template clusters) detected (P-value < 0.01).`);
        return false;
    }
}

/**
 * NIST Maurer's Universal Statistical Test
 * Checks for the compressibility of the bitstream, indicating long-term patterns.
 * L: block length (pattern size), typically 6 to 16.
 * Q: number of blocks for initialization (Q = 10 * 2^L recommended).
 * K: number of blocks for testing (K = 10 * 2^L recommended).
 */
function runNistMaurersUniversalTest(bitLength, numSamples = 1000, L = 10) {
    console.log(`\n--- NIST Maurer's Universal Statistical Test (${numSamples} samples, ${bitLength} bits, L=${L}) ---`);

    const n = numSamples * bitLength;
    const Q = 10 * (1 << L); // Initialization blocks
    const K = 10 * (1 << L); // Testing blocks
    const totalBlocksNeeded = Q + K;

    if (n < totalBlocksNeeded * L) {
        console.log(`⚠️ Warning: Not enough bits for a proper test. Need ${totalBlocksNeeded * L} bits, got ${n}.`);
        console.log(`   Consider increasing numSamples or bitLength, or decreasing L.`);
        return null;
    }

    // Theoretical mean and variance for L=10 (from NIST SP 800-22)
    // For other L values, these would need to be adjusted.
    let mu, sigma2;
    if (L === 10) {
        mu = 9.76453107;
        sigma2 = 5.760;
    } else {
        console.log(`⚠️ Warning: Using default mu/sigma2 for L=10. For L=${L}, these values may be inaccurate.`);
        // Fallback to general formulas if specific L not handled, though NIST provides tables.
        // These are approximations and might not be precise enough for strict NIST compliance.
        mu = Math.log2(1 << L) - Math.log2(L) + 0.577; // Euler-Mascheroni constant approx
        sigma2 = Math.PI * Math.PI / 6 - 0.577 * 0.577; // Approx
    }

    const bits = [];
    const maxVal = (1n << BigInt(bitLength)) - 1n;
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            bits.push(Number((val >> BigInt(j)) & 1n));
        }
    }

    const lastOccurrence = new Map(); // Stores last index for each L-bit pattern
    let sumLogDistances = 0;

    // Initialization phase (first Q blocks)
    for (let i = 0; i < Q; i++) {
        let pattern = 0;
        for (let j = 0; j < L; j++) {
            pattern = (pattern << 1) | bits[i * L + j];
        }
        lastOccurrence.set(pattern, i);
    }

    // Testing phase (next K blocks)
    for (let i = Q; i < Q + K; i++) {
        let pattern = 0;
        for (let j = 0; j < L; j++) {
            pattern = (pattern << 1) | bits[i * L + j];
        }
        const lastIdx = lastOccurrence.get(pattern);
        if (lastIdx !== undefined) {
            sumLogDistances += Math.log2(i - lastIdx);
        }
        lastOccurrence.set(pattern, i);
    }

    const fn = sumLogDistances / K;
    const pValue = erfc(Math.abs(fn - mu) / Math.sqrt(2 * sigma2));

    console.log(`Block Length (L): ${L} | Init Blocks (Q): ${Q} | Test Blocks (K): ${K}`);
    console.log(`Observed fn: ${fn.toFixed(4)} | Expected mu: ${mu.toFixed(4)} | Expected sigma2: ${sigma2.toFixed(4)}`);
    console.log(`P-value: ${pValue.toFixed(6)}`);

    if (pValue >= 0.01) {
        console.log(`✅ Success: The bitstream is not significantly compressible (P-value >= 0.01).`);
        return true;
    } else {
        console.log(`❌ Failure: The bitstream shows evidence of compressibility (P-value < 0.01).`);
        return false;
    }
}

/**
 * Helper: Iterative Cooley-Tukey FFT algorithm with bit-reversal permutation.
 * Operates on complex numbers represented as [real, imaginary] arrays.
 */
function iterativeFFT(x) {
    const N = x.length;
    const logN = Math.log2(N);

    // Ensure N is a power of 2
    if (N & (N - 1) !== 0) {
        throw new Error("FFT input size must be a power of 2.");
    }

    // Bit-reversal permutation
    const X = new Array(N);
    for (let i = 0; i < N; i++) {
        let rev = 0;
        for (let j = 0; j < logN; j++) {
            if ((i >> j) & 1) {
                rev |= (1 << (logN - 1 - j));
            }
        }
        X[rev] = x[i];
    }

    // Cooley-Tukey butterfly operations
    for (let s = 1; s <= logN; s++) {
        const m = 1 << s; // 2^s
        const m2 = m >> 1; // m/2
        const w_m_real = Math.cos(-2 * Math.PI / m);
        const w_m_imag = Math.sin(-2 * Math.PI / m);
        let w_real = 1;
        let w_imag = 0;

        for (let j = 0; j < m2; j++) {
            for (let k = j; k < N; k += m) {
                const t_real = X[k + m2][0] * w_real - X[k + m2][1] * w_imag;
                const t_imag = X[k + m2][0] * w_imag + X[k + m2][1] * w_real;

                const u_real = X[k][0];
                const u_imag = X[k][1];

                X[k] = [u_real + t_real, u_imag + t_imag];
                X[k + m2] = [u_real - t_real, u_imag - t_imag];
            }
            // Update w_real, w_imag for next j
            const temp_w_real = w_real * w_m_real - w_imag * w_m_imag;
            const temp_w_imag = w_real * w_m_imag + w_imag * w_m_real;
            w_real = temp_w_real;
            w_imag = temp_w_imag;
        }
    }
    return X;
}

/**
 * NIST Discrete Fourier Transform (Spectral) Test
 * Detects periodic features in the bitstream.
 */
function runNistDiscreteFourierTransformTest(bitLength, numSamples = 1000) {
    console.log(`\n--- NIST Discrete Fourier Transform (Spectral) Test (${numSamples} samples, ${bitLength} bits) ---`);

    const n = numSamples * bitLength;
    const bits = [];
    const maxVal = (1n << BigInt(bitLength)) - 1n;
    for (let i = 0; i < numSamples; i++) {
        const val = getRandomBigInt(0n, maxVal);
        for (let j = 0; j < bitLength; j++) {
            bits.push(Number((val >> BigInt(j)) & 1n));
        }
    }

    // Convert bits to -1, 1 and pad to next power of 2
    let M = 1;
    while (M < n) M <<= 1;
    const x_n_complex = new Array(M).fill([0, 0]);
    for (let i = 0; i < n; i++) {
        x_n_complex[i] = [bits[i] === 1 ? 1 : -1, 0];
    }

    const fft_result = iterativeFFT(x_n_complex);

    const T = Math.sqrt(Math.log(1 / 0.05) * M); // Threshold
    let N_0 = 0; // Number of peaks exceeding threshold
    for (let k = 0; k < M / 2; k++) { // Only consider first half of spectrum (excluding DC)
        const magnitude = Math.sqrt(fft_result[k][0] * fft_result[k][0] + fft_result[k][1] * fft_result[k][1]);
        if (magnitude < T) N_0++;
    }

    const d = N_0 - (0.95 * M / 2);
    const pValue = erfc(Math.abs(d) / Math.sqrt(M / 4 * 0.95 * 0.05));

    console.log(`Total bits (n): ${n} | FFT size (M): ${M}`);
    console.log(`Threshold (T): ${T.toFixed(4)} | Observed N_0: ${N_0}`);
    console.log(`P-value: ${pValue.toFixed(6)}`);

    if (pValue >= 0.01) {
        console.log(`✅ Success: No significant periodic features detected (P-value >= 0.01).`);
        return true;
    } else {
        console.log(`❌ Failure: Periodic features detected (P-value < 0.01).`);
        return false;
    }
}

if (args.includes('--test-uniformity')) {
    const results = [];
    // Testing a typical 256-bit Protocol ID range
    results.push({ name: 'Chi-Squared (Buckets)', pass: runChiSquaredTest(0n, (2n ** 256n) - 1n) });
    results.push({ name: 'Bit-Level Bias', pass: runBitLevelBiasTest(256) });
    results.push({ name: 'Wald-Wolfowitz Runs', pass: runWaldWolfowitzTest(256) });
    results.push({ name: 'NIST Monobit', pass: runNistMonobitTest(256) });
    results.push({ name: 'NIST Block Frequency', pass: runNistBlockFrequencyTest(256) });
    results.push({ name: 'NIST Serial', pass: runNistSerialTest(256) });
    results.push({ name: 'NIST Approximate Entropy', pass: runNistApproximateEntropyTest(256) });
    results.push({ name: 'NIST Cumulative Sums', pass: runNistCumulativeSumsTest(256) });
    results.push({ name: 'NIST Longest Run of Ones', pass: runNistLongestRunOfOnesTest(256) });
    results.push({ name: 'NIST Binary Matrix Rank', pass: runNistBinaryMatrixRankTest(256) });
    results.push({ name: 'NIST Non-overlapping Template', pass: runNistNonOverlappingTemplateMatchingTest(256) });
    results.push({ name: 'NIST Overlapping Template', pass: runNistOverlappingTemplateMatchingTest(256) });
    results.push({ name: "NIST Maurer's Universal", pass: runNistMaurersUniversalTest(256) });
    results.push({ name: 'NIST DFT (Spectral)', pass: runNistDiscreteFourierTransformTest(256) });

    console.log('\n=================================================');
    console.log('      PROTOCOL ID UNIFORMITY AUDIT SUMMARY');
    console.log('=================================================');
    results.forEach(r => {
        const icon = r.pass === true ? '✅' : (r.pass === null ? '⚠️' : '❌');
        const status = r.pass === true ? 'PASS' : (r.pass === null ? 'SKIP' : 'FAIL');
        console.log(`${icon} ${r.name.padEnd(35)} : ${status}`);
    });
    console.log('=================================================\n');

    const hasFailures = results.some(r => r.pass === false);
    if (hasFailures) {
        console.error('❌ Audit Failed: The Protocol ID substrate did not pass all statistical randomness checks.\n');
        process.exit(1);
    }

    console.log('✅ Audit Passed: Substrate randomness verified.\n');
}