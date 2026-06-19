// @ts-ignore
import loadSovereignModule from './sovereign_wasm.js';

let wasmModule: any = null;
let node: any = null;
let syncView: Int32Array;

self.onmessage = async (e) => {
    const { type, data } = e.data;

    if (type === 'INIT') {
        wasmModule = await loadSovereignModule();
        node = new wasmModule.SovereignNode();
        
        const ptr = node.getStatePtr();
        syncView = new Int32Array(wasmModule.HEAPU8.buffer, ptr + 32, 1);
        
        self.postMessage({ type: 'READY', buffer: wasmModule.HEAPU8.buffer, ptr });
        
        startSimulation();
    } else if (type === 'TERMINATE') {
        // Explicitly delete Embind objects to call C++ destructors
        if (node) {
            node.delete();
            node = null;
        }
        wasmModule = null;
        self.close();
    }
};

function startSimulation() {
    while (true) {
        // Wait for syncView[0] to be 0 (meaning the Main thread set it to 1 to trigger us)
        // Atomics.wait(typedArray, index, valueToWaitOn)
        // It sleeps if syncView[0] == 0.
        Atomics.wait(syncView, 0, 0);

        const syncKey = Math.floor(Math.random() * 0xFFFF);
        node.pulse(syncKey, 100n, false);

        // syncTrigger is set back to 0 by node.pulse() in C++
    }
}