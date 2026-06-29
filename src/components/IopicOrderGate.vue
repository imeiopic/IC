<template>
    <div class="order-gate-container shadow-lg rounded border-2 position-relative overflow-hidden"
        :class="{ 'purge-active': isGlobalPurgeActive }">
        <div class="gate-header">
            <div class="oscillosope-view">
                <div v-for="i in 16" :key="i" :class="[
                    'wave-bar',
                    { 'synced': i <= syncLevel },
                    { 'noise-warn': currentNoiseLevel === 1 },
                    { 'noise-critical': currentNoiseLevel >= 2 }
                ]" :style="{ height: (Math.random() * 40 + 20) + 'px', animationDelay: (i * 0.03) + 's' }">
                </div>
            </div>
            <h3 class="font-monospace h6 text-uppercase mb-0 glitch-order" data-text="INTERNET ORDER: SIGNAL ANALYZER">
                INTERNET ORDER: SIGNAL ANALYZER
            </h3>
        </div>

        <div class="metrics-bay font-monospace tiny">
            <div class="metric">
                <label class="text-uppercase opacity-75">System Noise (Ω):</label>
                <span class="value ms-2">{{ noiseFloor }}%</span>
            </div>
            <div class="metric">
                <label class="text-uppercase opacity-75">Logic Consistency:</label>
                <span class="value ms-2">{{ consistency }}%</span>
            </div>
            <div class="metric d-flex align-items-center">
                <label class="text-uppercase opacity-75 cursor-pointer" @click="autoTune = !autoTune">Auto-Tune:</label>
                <span class="ms-2 cursor-pointer font-monospace fw-bold"
                    :class="autoTune ? 'text-success' : 'text-danger'" @click="autoTune = !autoTune">
                    {{ autoTune ? '[ACTIVE]' : '[OFF]' }}
                </span>
            </div>
        </div>

        <div class="gate-status mb-4">
            <div class="progress-track bg-black border border-secondary border-opacity-25">
                <div class="progress-fill shadow-glow" :style="{ width: syncLevel * 6.25 + '%' }"></div>
            </div>
            <p v-if="syncLevel < 16" class="font-monospace tiny text-uppercase opacity-75 mt-2">
                Status: Tuning to Terminal 10...
            </p>
            <p v-else class="locked-text font-monospace tiny text-uppercase mt-2">
                Status: Order Established (Symmetry Locked)
            </p>
        </div>

        <button @click="tuneSignal" :disabled="syncLevel >= 16 || isGlobalPurgeActive"
            class="tune-btn w-100 py-3 font-monospace fw-bold text-uppercase">
            {{ syncLevel >= 16 ? 'Signal Stabilized' : 'Purge Asymmetry' }}
        </button>

        <div v-if="isGlobalPurgeActive" class="purge-overlay">
            <div class="purge-msg font-monospace fw-bold">NOISE DETECTED</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useIOSettings } from '../useIOSettings';
import { useSystemBus } from './useSystemBus'; // Corrected path

const { playSFX } = useIOSettings();
const { isGlobalPurgeActive, currentNoiseLevel, lockBit, setSyncing, setSynced, addLog } = useSystemBus();

const syncLevel = ref(4); // Starts with the IDEAL quadrant locked (Threads 1-4)
const autoTune = ref(false);
let tuningInterval: any = null;

const noiseFloor = computed(() => (100 - (syncLevel.value * 6.25)).toFixed(2));
const consistency = computed(() => (syncLevel.value * 6.25).toFixed(0));

const stopTuning = () => {
    if (tuningInterval) {
        clearInterval(tuningInterval);
        tuningInterval = null;
    }
};

const tuneSignal = () => {
    if (syncLevel.value < 16 && !isGlobalPurgeActive.value && !tuningInterval) {
        setSyncing(); // Transition global temporal logic to SYNCING state
        addLog("ORDER_GATE: Signal Tuning Initiated", "info", 8);
        playSFX('order');
        tuningInterval = setInterval(() => {
            if (syncLevel.value < 16 && !isGlobalPurgeActive.value) {
                syncLevel.value++;
                if (syncLevel.value === 16) {
                    stopTuning();
                    lockBit([8, 9, 10, 11]); // Lock Bits 9-12 (indices 8-11) for VALUE quadrant
                    setSynced(); // Signal that temporal logic symmetry is LOCKED
                    addLog("ORDER_GATE: Signal Stabilized. Threads 9-12 Anchored.", "success", 8);
                    playSFX('fulfill');
                    console.log("MANDATE: Internet Order Finalized. Signal is Virtually Real.");
                }
            } else {
                stopTuning();
            }
        }, 200);
    }
};

watch(isGlobalPurgeActive, (active) => {
    if (active) {
        stopTuning();
        syncLevel.value = Math.max(0, syncLevel.value - 4);
    }
});

watch([currentNoiseLevel, autoTune], ([noise, auto]) => {
    if (auto && noise > 0 && syncLevel.value < 16) {
        tuneSignal();
    }
});

onUnmounted(() => stopTuning());
</script>

<style scoped>
.order-gate-container {
    background: #000;
    border: 2px solid #00ff41;
    padding: 1.5rem;
    color: #00ff41;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    max-width: 500px;
    margin: auto;
}

.oscillosope-view {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 60px;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(0, 255, 65, 0.2);
}

.wave-bar {
    width: 5px;
    background: #111;
    transition: all 0.3s ease;
}

.wave-bar.synced {
    background: #00ff41;
    box-shadow: 0 0 8px #00ff41;
}

.metrics-bay {
    display: flex;
    justify-content: space-between;
    margin: 15px 0;
}

.cursor-pointer {
    cursor: pointer;
}

.value {
    font-weight: bold;
    color: #fff;
}

.progress-track {
    width: 100%;
    height: 8px;
    margin-bottom: 5px;
}

.progress-fill {
    height: 100%;
    background: #00ff41;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.shadow-glow {
    box-shadow: 0 0 10px #00ff41;
}

.locked-text {
    color: #fff;
    text-shadow: 0 0 10px #00ff41;
    font-weight: bold;
}

.tune-btn {
    background: transparent;
    border: 1px solid #00ff41;
    color: #00ff41;
    cursor: pointer;
    transition: 0.3s;
    letter-spacing: 2px;
}

.tune-btn:hover:not(:disabled) {
    background: #00ff41;
    color: #000;
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
}

.tune-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.glitch-order {
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.tiny {
    font-size: 0.65rem;
}

.purge-active {
    animation: jitter 0.1s infinite;
    filter: sepia(1) saturate(5) hue-rotate(-50deg);
}

.purge-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.noise-warn {
    background: #ffc107 !important;
    box-shadow: 0 0 10px #ffc107 !important;
    animation: noise-flicker 0.3s infinite ease-in-out;
}

.noise-critical {
    background: #ff0000 !important;
    box-shadow: 0 0 15px #ff0000 !important;
    animation: noise-flicker 0.15s infinite ease-in-out;
    border-left: 1px solid white;
}

.purge-msg {
    color: white;
    font-size: 1.5rem;
    text-shadow: 0 0 10px #f00;
}

@keyframes jitter {
    0% {
        transform: translate(0, 0);
    }

    50% {
        transform: translate(2px, -1px);
    }

    100% {
        transform: translate(-1px, 2px);
    }
}

@keyframes noise-flicker {

    0%,
    100% {
        transform: scaleY(1);
        opacity: 1;
        filter: brightness(1);
    }

    33% {
        transform: scaleY(1.4);
        opacity: 0.7;
        filter: brightness(1.5);
    }

    66% {
        transform: scaleY(0.8);
        opacity: 0.9;
        filter: contrast(2);
    }
}
</style>