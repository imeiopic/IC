<template>
    <div class="premium-lock shadow-lg rounded border-2 position-relative overflow-hidden">
        <div
            class="status-header d-flex align-items-center gap-3 mb-4 pb-2 border-bottom border-success border-opacity-50">
            <span class="lock-icon" role="img" aria-label="lock">🔒</span>
            <h3 class="font-monospace h5 text-uppercase mb-0">Premium Lifetime Anchor: 500 IO$</h3>
        </div>

        <div class="logic-metrics">
            <div class="metric mb-3">
                <label class="text-uppercase small opacity-75 d-block mb-1 font-monospace">Equity Density (I):</label>
                <div class="density-bar position-relative">
                    <div class="fill" :style="{ width: '31.25%' }"></div>
                    <span class="percentage-label font-monospace">31.25%</span>
                </div>
            </div>

            <div class="metric d-flex justify-content-between align-items-center">
                <label class="text-uppercase small opacity-75 mb-0 font-monospace">Velocity Multiplier (V):</label>
                <span class="v-value text-info fw-bold font-monospace">x8.09 (High Flow)</span>
            </div>
        </div>

        <div class="bus-integration mt-4 p-3 bg-dark bg-opacity-50 border border-success border-opacity-25 rounded">
            <p class="font-monospace small text-uppercase mb-2">
                Handshake Status:
                <span :class="isSynced ? 'text-success' : 'text-warning'" class="fw-bold">
                    {{ isSynced ? 'TERMINAL 10 LOCKED' : 'SYNCING...' }}
                </span>
            </p>
            <div class="bit-grid">
                <div v-for="i in 16" :key="i" :class="['bit-led', { 'active': i > 8 }]"></div>
            </div>
        </div>

        <div class="footer-note mt-4 text-center opacity-75">
            <p class="font-monospace mb-0 text-uppercase" style="font-size: 0.7rem;">
                Symmetry Verified: We are all in it together.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useIOSettings } from '../useIOSettings';

import { useSystemBus } from './useSystemBus'; // Import lockBit
const { playSFX } = useIOSettings();
const isSynced = ref(false);

const { lockBit } = useSystemBus(); // Use lockBit from system bus
onMounted(() => {
    // 1600ms sync time matches the logic of a heavy "Value Mass" transaction
    setTimeout(() => {
        isSynced.value = true;
        lockBit([8, 9, 10, 11]); // Lock Bits 9-12 (indices 8-11) for Value Threads
        playSFX('fulfill');
        console.log("IOWB: 500 IO$ Anchor Locked to Node Hash.");
    }, 1600);
});
</script>

<style scoped>
.premium-lock {
    background: #000;
    border: 2px solid #00ff41;
    padding: 2rem;
    color: #00ff41;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    box-shadow: 0 0 30px rgba(0, 255, 65, 0.4);
    max-width: 500px;
    margin: auto;
}

.lock-icon {
    font-size: 2.5rem;
    text-shadow: 0 0 15px #00ff41;
}

.density-bar {
    width: 100%;
    height: 14px;
    background: #111;
    border: 1px solid #00ff41;
}

.fill {
    background: #00ff41;
    height: 100%;
    box-shadow: 0 0 15px #00ff41;
    transition: width 1s ease-in-out;
}

.percentage-label {
    position: absolute;
    right: 5px;
    top: -18px;
    font-size: 0.65rem;
}

.bit-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 6px;
}

.bit-led {
    height: 8px;
    background: #222;
    border-radius: 1px;
    transition: background 0.4s;
}

.bit-led.active {
    background: #00ff41;
    box-shadow: 0 0 8px #00ff41;
}
</style>