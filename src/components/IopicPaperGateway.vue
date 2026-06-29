<template>
    <div class="paper-gateway shadow-lg rounded border-2 position-relative overflow-hidden">
        <div
            class="terminal-header d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-success border-opacity-50">
            <div class="d-flex align-items-center gap-2">
                <span class="status-pulse-dot"></span>
                <h3 class="font-monospace h6 text-uppercase mb-0">Node Terminal: Analog-to-IO Sync</h3>
            </div>
            <div class="bit-tag tiny font-monospace opacity-75">BIT 1100</div>
        </div>

        <div class="scanner-interface" v-if="!isSynced">
            <div class="viewfinder p-4 border border-success border-dashed rounded mb-3 text-center position-relative">
                <label class="text-uppercase small opacity-75 d-block mb-2 font-monospace">Scanning Analog
                    Value...</label>
                <div class="serial-ghost font-monospace tiny opacity-25">SERIAL: [UNRESOLVED]</div>
                <div class="scan-line"></div>
            </div>
            <button @click="verifyPaper" :disabled="isScanning"
                class="verify-btn w-100 py-3 font-monospace fw-bold text-uppercase">
                {{ isScanning ? 'Processing Atomic Proof...' : 'Lock Physical Asset' }}
            </button>
        </div>

        <Transition name="fade">
            <div v-else class="sync-success text-center">
                <div
                    class="thread-confirmation mb-3 p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded">
                    <label class="text-uppercase tiny d-block mb-1 opacity-75 font-monospace">Value Threads
                        (9-12):</label>
                    <span class="bit-status font-monospace text-uppercase glow">Symmetrical</span>
                </div>
                <div class="deposit-amount fs-4 fw-bold font-monospace text-white mb-2">+500.00 IO$</div>
                <div class="equity-label tiny text-uppercase font-monospace opacity-75 mb-3 text-info">Added to TPE
                    Share</div>
                <p
                    class="warning-text font-monospace text-warning px-3 py-2 border border-warning border-opacity-25 rounded">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i>
                    Physical paper now grounded (De-activated)
                </p>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useIOSettings } from '../useIOSettings';
import { useSystemBus } from './useSystemBus';
const { lockBit, isGlobalPurgeActive } = useSystemBus();
const { playSFX } = useIOSettings();

const emit = defineEmits(['symmetry-breach']);

const isSynced = ref(false);
const isScanning = ref(false);

const verifyPaper = () => {
    isScanning.value = true;
    playSFX('order');
    console.log("MANDATE: Converting Analog Noise to Virtually Real Equity.");

    // Logic: 1. Optical Symmetry Check, 2. Serial Verification, 3. Bus Sync
    setTimeout(() => {
        isSynced.value = true;
        isScanning.value = false;
        playSFX('fulfill');
    }, 1500);
};

watch(isGlobalPurgeActive, (newVal) => {
    if (newVal) {
        isSynced.value = false; // Force unsynced state during global purge
    }
});
</script>

<style scoped>
.paper-gateway {
    background: #000;
    border: 2px solid #00ff41;
    padding: 1.5rem;
    color: #00ff41;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    box-shadow: 0 0 30px rgba(0, 255, 65, 0.15);
    max-width: 450px;
    margin: auto;
}

.viewfinder {
    height: 120px;
    background: rgba(0, 255, 65, 0.02);
    overflow: hidden;
}

.scan-line {
    position: absolute;
    left: 0;
    width: 100%;
    height: 3px;
    background: #00ff41;
    box-shadow: 0 0 15px #00ff41;
    animation: scan-move 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scan-move {
    0% {
        top: 0;
        opacity: 0;
    }

    10% {
        opacity: 1;
    }

    90% {
        opacity: 1;
    }

    100% {
        top: 100%;
        opacity: 0;
    }
}

.status-pulse-dot {
    width: 8px;
    height: 8px;
    background: #00ff41;
    border-radius: 50%;
    animation: status-blink 1s infinite;
}

@keyframes status-blink {

    0%,
    100% {
        opacity: 1;
        box-shadow: 0 0 5px #00ff41;
    }

    50% {
        opacity: 0.3;
        box-shadow: none;
    }
}

.glow {
    text-shadow: 0 0 10px #00ff41;
    letter-spacing: 2px;
}

.verify-btn {
    background: #00ff41;
    color: #000;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
}

.verify-btn:hover:not(:disabled) {
    background: #00cc33;
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
}

.verify-btn:disabled {
    opacity: 0.5;
    cursor: wait;
}
</style>