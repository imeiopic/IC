import semver from 'semver';
import depcheckConfig from '../depcheck.config.ts';
const { parsers, isTestFile, isIgnoredFile, experimentalPackages } = depcheckConfig;
// Parse CLI arguments for configuration
const args = process.argv.slice(2);
const quoteStyle = args.find(a => a.startsWith('--quote='))?.split('=')[1] || 'double';
const idLengthArg = args.find(a => a.startsWith('--idLength='))?.split('=')[1];
const minIdLengthArg = args.find(a => a.startsWith('--minIdLength='))?.split('=')[1];
const maxIdLengthArg = args.find(a => a.startsWith('--maxIdLength='))?.split('=')[1];
const envPrefix = args.find(a => a.startsWith('--envPrefix='))?.split('=')[1] || '';
const maxDefaultArg = args.find(a => a.startsWith('--maxDefaultLength='))?.split('=')[1];
const enforceFibonacci = args.includes('--enforceFibonacci');
const enforceEvenDecimal = args.includes('--enforceEvenDecimal');
const enforcePrime = args.includes('--enforcePrime');
const maxPrimeCheckArg = args.find(a => a.startsWith('--maxPrimeCheck='))?.split('=')[1];
const maxPrimeCheck = BigInt(maxPrimeCheckArg || Number.MAX_SAFE_INTEGER);
const decDefaultPrefix = args.find(a => a.startsWith('--decDefaultPrefix='))?.split('=')[1] || '';
const enforceSafeInteger = args.includes('--enforceSafeInteger');
const maxDefault = maxDefaultArg ? parseInt(maxDefaultArg, 10) : null; // Total length

// Logic Sovereignty: Mirror plugin patterns for decimal and hex defaults
let decDefaultPattern = `[1-9][0-9]*`;
let hexDefaultPattern = `0x(?:[0-9a-f]{2})+`;

if (maxDefault !== null) {
  const remainingDec = Math.max(1, maxDefault - decDefaultPrefix.length);
  decDefaultPattern = remainingDec === 1 ? `[1-9]` : `[1-9][0-9]{0,${Math.max(0, remainingDec - 1)}}`;
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
    { line: `protocol-id: 10000;`, isValid: (enforcePrime && 10000n <= maxPrimeCheck) ? false : true, desc: 'Threshold: Composite above maxPrimeCheck' },
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

const strictIDRegex = new RegExp(`protocol-id:\\s*(0x[0-9a-fA-F]${restQuantifier}|[1-9][0-9]${restQuantifier}|process\\.env\\.${envPrefix}[A-Z0-9_]+|import\\.meta\\.env\\.${envPrefix}[A-Z0-9_]+|\\$${envPrefix}[A-Z0-9_]+|\\\`\\\$\\{(?:process\\.env|import\\.meta\\.env)\\.${envPrefix}[A-Z0-9_]+(?:\\s*\\|\\|\\s*(?:'${hexDefaultPattern}'|"${hexDefaultPattern}"|'${decDefaultPrefix}${decDefaultPattern}'|"${decDefaultPrefix}${decDefaultPattern}"))?\}\\\`)\\s*;?\\s*$`, 'i');

idTests.forEach(({ line, isValid, desc }) => {
    const isComment = /^\s*\/\//.test(line);
    const hasID = line.includes('protocol-id:');
    
    const isPrime = (num) => {
        if (num <= 1n) return false;
        if (num <= 3n) return true;
        if (num % 2n === 0n || num % 3n === 0n) return false;
        for (let i = 5n; i * i <= num; i += 6n) {
            if (num % i === 0n || num % (i + 2n) === 0n) return false;
        }
        return true;
    };

    let result = true;
    if (hasID && !isComment) {
        result = strictIDRegex.test(line);
    }

    const status = result === isValid ? '✅ Pass' : '❌ Fail';
    console.log(`${status}: [${desc}] -> ${line}`);
});