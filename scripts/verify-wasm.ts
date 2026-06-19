import { createHash } from 'crypto';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const expectedHash = process.env.EXPECTED_WASM_HASH;
const targets: string[] = [];

// 1. Identify Source Target
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = resolve(projectRoot, 'src', 'sovereign_wasm.wasm');
if (existsSync(srcPath)) {
  targets.push(srcPath);
}

// 2. Identify Distribution Targets (including Vite-hashed files)
const distAssetsPath = resolve(projectRoot, 'dist', 'browser', 'assets');
if (existsSync(distAssetsPath)) {
  const distFiles = readdirSync(distAssetsPath)
    .filter(f => f.startsWith('sovereign_wasm') && f.endsWith('.wasm'))
    .map(f => resolve(distAssetsPath, f));
  targets.push(...distFiles);
}

if (targets.length === 0) {
  console.log('[WASM_VERIFY] No WASM files found to verify in src/ or dist/. Skipping WASM verification.');
  process.exit(0);
}

if (!expectedHash) {
  console.warn('[WASM_VERIFY] Warning: EXPECTED_WASM_HASH is not set. Integrity cannot be strictly enforced.');
}

console.log(`[WASM_VERIFY] Initiating integrity check for ${targets.length} file(s)...`);
let hasFailure = false;

for (const wasmPath of targets) {
  const fileBuffer = readFileSync(wasmPath);
  const hash = createHash('sha256').update(fileBuffer).digest('hex');
  const isDist = wasmPath.includes('dist');

  console.log(`\n[WASM_VERIFY] Path: ${wasmPath}`);
  console.log(`[WASM_VERIFY] SHA-256: ${hash}`);

  if (expectedHash && hash !== expectedHash) {
    if (isDist) {
      console.error(`[WASM_VERIFY] STATUS: INTEGRITY FAILURE (Production Artifact)`);
      hasFailure = true;
    } else {
      console.warn(`[WASM_VERIFY] STATUS: MISMATCH (Source File) - Expected if src/ is unoptimized.`);
    }
  } else if (expectedHash) {
    console.log(`[WASM_VERIFY] STATUS: VERIFIED`);
  }
}

if (hasFailure) process.exit(1);
console.log('\n[WASM_VERIFY] Verification pass complete.');