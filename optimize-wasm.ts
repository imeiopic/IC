import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync, readFileSync, renameSync, unlinkSync, writeFileSync, rmSync } from 'fs';
import { resolve, basename } from 'path';
import { createHash } from 'crypto';
import { brotliCompressSync, gzipSync, constants } from 'zlib';

// Discovery logic mirrored from verify-wasm.ts
const distAssetsPath = resolve(__dirname, '../dist/browser/assets');
const wasmFiles = existsSync(distAssetsPath) 
  ? readdirSync(distAssetsPath).filter(f => f.startsWith('sovereign_wasm') && f.endsWith('.wasm'))
  : [];

const wasmPath = wasmFiles.length > 0 
  ? resolve(distAssetsPath, wasmFiles[0])
  : resolve(__dirname, '../src/sovereign_wasm.wasm');

if (!existsSync(wasmPath)) {
  console.error(`[WASM_OPTIMIZE] Error: WASM file not found at ${wasmPath}`);
  process.exit(1);
}

if (wasmFiles.length === 0) {
  console.warn('[WASM_OPTIMIZE] No distribution artifact found. Falling back to source file optimization.');
}

// --- Cleanup stale .br, .gz, and old .wasm files ---
// This block runs only if a distribution artifact was found, meaning Vite has already processed the WASM.
if (wasmFiles.length > 0) {
  const currentWasmFilename = basename(wasmPath);
  const currentBrFilename = `${currentWasmFilename}.br`;
  const currentGzFilename = `${currentWasmFilename}.gz`;

  const allAssetFiles = readdirSync(distAssetsPath);
  const staleFiles = allAssetFiles.filter(f => 
    f.startsWith('sovereign_wasm') && 
    (f.endsWith('.wasm') || f.endsWith('.wasm.br') || f.endsWith('.wasm.gz')) &&
    f !== currentWasmFilename &&
    f !== currentBrFilename &&
    f !== currentGzFilename
  );

  if (staleFiles.length > 0) {
    console.log('[WASM_OPTIMIZE] Cleaning up stale WASM-related assets:');
    for (const staleFile of staleFiles) {
      const fullPath = resolve(distAssetsPath, staleFile);
      console.log(`  - Deleting ${staleFile}`);
      rmSync(fullPath); // Using rmSync for direct deletion
    }
  }
}
// --- End Cleanup ---

const getHash = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');

const tempPath = `${wasmPath}.opt.tmp`;
const sizeBefore = statSync(wasmPath).size;
const originalHash = getHash(wasmPath);

console.log(`[WASM_OPTIMIZE] Targeting production artifact: ${wasmPath}`);

try {
  // Execute wasm-opt to a temporary file instead of in-place
  execSync(`wasm-opt --verbose -Oz "${wasmPath}" -o "${tempPath}" --strip-debug`, { stdio: 'inherit' });
  
  if (!existsSync(tempPath)) throw new Error('Optimization failed to produce output.');

  const optimizedHash = getHash(tempPath);
  const sizeAfter = statSync(tempPath).size;
  let skipUpdate = false;

  if (originalHash === optimizedHash) {
    console.log(`[WASM_OPTIMIZE] Optimization result is identical to current file. Preserving stable hash: ${optimizedHash}`);
    unlinkSync(tempPath);
    skipUpdate = true;
  } else if (sizeAfter > sizeBefore) {
    console.warn(`[WASM_OPTIMIZE] Warning: Optimized result (${(sizeAfter / 1024).toFixed(1)} KB) is larger than original (${(sizeBefore / 1024).toFixed(1)} KB). Discarding optimization to preserve smallest footprint.`);
    unlinkSync(tempPath);
    skipUpdate = true;
  }

  if (!skipUpdate) {
    renameSync(tempPath, wasmPath);
    const reduction = ((1 - sizeAfter / sizeBefore) * 100).toFixed(2);
    console.log(`[WASM_OPTIMIZE] Optimization complete.`);
    console.log(`[WASM_OPTIMIZE] Size: ${(sizeBefore / 1024).toFixed(1)} KB -> ${(sizeAfter / 1024).toFixed(1)} KB (${reduction}% reduction)`);
  }
  
  // Generate Brotli sidecar for the production artifact
  const finalBuffer = readFileSync(wasmPath);
  const compressed = brotliCompressSync(finalBuffer, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 }
  });
  writeFileSync(`${wasmPath}.br`, compressed);
  console.log(`[WASM_OPTIMIZE] Brotli compression complete: ${wasmPath}.br (${(compressed.length / 1024).toFixed(1)} KB)`);

  // Generate Gzip sidecar for the production artifact
  const compressedGz = gzipSync(finalBuffer, { level: 9 });
  writeFileSync(`${wasmPath}.gz`, compressedGz);
  console.log(`[WASM_OPTIMIZE] Gzip compression complete: ${wasmPath}.gz (${(compressedGz.length / 1024).toFixed(1)} KB)`);

} catch (error) {
  console.error('[WASM_OPTIMIZE] Critical failure during optimization.');
  process.exit(1);
}