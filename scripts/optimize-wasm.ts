import { execFileSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distAssetsDir = resolve(projectRoot, 'dist', 'browser', 'assets');

if (!existsSync(distAssetsDir)) {
  console.log('[WASM_OPTIMIZE] dist/browser/assets does not exist yet. Skipping WASM optimization.');
  process.exit(0);
}

const wasmFiles = readdirSync(distAssetsDir).filter((file) => file.endsWith('.wasm'));
if (wasmFiles.length === 0) {
  console.log('[WASM_OPTIMIZE] No WASM files found in dist/browser/assets. Skipping optimization.');
  process.exit(0);
}

const command = process.platform === 'win32' ? 'wasm-opt.cmd' : 'wasm-opt';

console.log(`[WASM_OPTIMIZE] Found ${wasmFiles.length} WASM file(s) to optimize.`);
for (const wasmFile of wasmFiles) {
  const filePath = join(distAssetsDir, wasmFile);
  try {
    console.log(`[WASM_OPTIMIZE] Optimizing ${wasmFile} (Size-Aggressive)...`);
    execFileSync(command, ['-Oz', filePath, '-o', filePath], {
      stdio: 'inherit',
      cwd: projectRoot,
      shell: process.platform === 'win32', // Necessary on some Windows setups to find .cmd files
    });
  } catch (error: any) {
    console.warn(`[WASM_OPTIMIZE] Warning: Failed to optimize ${wasmFile}. Is 'wasm-opt' installed?`, error.message || error);
    console.error(`[WASM_OPTIMIZE] Error: Failed to optimize ${wasmFile}.`, error.message || error);
    console.log('[WASM_OPTIMIZE] Continuing build without WASM optimization.');
  }
}

console.log('[WASM_OPTIMIZE] Completed.');
