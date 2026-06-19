/**
 * Abstraction_Worker.ts: Dedicated thread for resonance transmutation.
 * Prevents "Golden Harmonic" pulse jitter by offloading compute-heavy legacy mapping.
 */

let wasmInstance: any = null;
let windowPtr: number | null = null;
let sinePtr: number | null = null;
let currentWindowLength = 0;

// Initialize the WASM Spectral Engine
const initWasm = async () => {
  const response = await fetch('/wasm/SovereignSpectral.wasm');
  const bits = await response.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bits);
  wasmInstance = instance;
};

const wasmReady = initWasm();

self.onmessage = async (e: MessageEvent) => {
  await wasmReady;
  const { rawBuffer, windowBuffer, sineBuffer, length } = e.data;
  
  // Wrap SharedArrayBuffer in Float32Array
  const samples = new Float32Array(rawBuffer);
  const window = new Float32Array(windowBuffer);
  const sine = new Float32Array(sineBuffer);
  
  // 1. Allocate memory in WASM heap
  const ptr = wasmInstance.exports.malloc(length * 4);
  const heap = new Float32Array(wasmInstance.exports.memory.buffer, ptr, length);
  
  // Handle Window Buffer Allocation (Cache if length is same)
  if (windowPtr === null || currentWindowLength !== length) {
    if (windowPtr !== null) wasmInstance.exports.free(windowPtr);
    if (sinePtr !== null) wasmInstance.exports.free(sinePtr);
    windowPtr = wasmInstance.exports.malloc(length * 4);
    sinePtr = wasmInstance.exports.malloc(length * 4);
    currentWindowLength = length;
  }
  const windowHeap = new Float32Array(wasmInstance.exports.memory.buffer, windowPtr!, length);
  const sineHeap = new Float32Array(wasmInstance.exports.memory.buffer, sinePtr!, length);

  // 2. Direct copy into WASM memory
  heap.set(samples);
  windowHeap.set(window);
  sineHeap.set(sine);

  // 3. Execute C++ Transmutation
  const resonanceIndex = wasmInstance.exports.transmute_spectral_density(ptr, windowPtr, sinePtr, length);

  // 4. Free memory and return result
  wasmInstance.exports.free(ptr);

  self.postMessage({
    transmutated: true,
    resonanceIndex,
    timestamp: Date.now()
  });
};
