<template>
    <div class="dashboard-module p-4 border-2 border-success rounded bg-black shadow-lg">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h5 font-monospace mb-0 text-uppercase">
                System Velocity: <span class="text-white">{{ velocity.toFixed(3) }}</span>
            </h2>
            <div class="status-indicator">
                <span class="status-dot text-success status-pulse">●</span>
            </div>
        </div>

        <div class="progress bg-dark border border-secondary mb-4" style="height: 12px;">
            <div class="progress-bar bg-success transition-all shadow-glow" :style="{ width: symmetryLevel + '%' }">
            </div>
        </div>

        <div class="row stats-grid mb-4">
            <div class="col-6 text-center border-end border-secondary">
                <label class="small text-secondary text-uppercase d-block mb-1">Social Credit (Sc)</label>
                <span class="fs-4 fw-bold font-monospace text-success">{{ socialCredit }}</span>
            </div>
            <div class="col-6 text-center">
                <label class="small text-secondary text-uppercase d-block mb-1">Base Dividend</label>
                <span class="fs-4 fw-bold font-monospace text-info">1,600 IO$</span>
            </div>
        </div>

        <button @click="syncWithRoot" class="sync-btn w-100 py-3 font-monospace fw-bold">
            SYNC TERMINAL 10
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useIOSettings } from '../useIOSettings';

const { playSFX } = useIOSettings();

const velocity = ref(1.618);
const socialCredit = ref(100);
const symmetryLevel = ref(85);

const syncWithRoot = () => {
    // Logic: Verify current 16-bit state against Symmetry Mirror
    velocity.value += 0.01;
    symmetryLevel.value = Math.min(100, symmetryLevel.value + 1);
    playSFX('fulfill');
    console.log("TERMINAL 10: Logic Sealed.");
};

const drainVelocity = () => {
    const originalVelocity = velocity.value;
    // Temporarily drain velocity to near-zero during symmetry breach
    velocity.value = 0.081;
    // Permanent Social Credit penalty for symmetry breach
    socialCredit.value = Math.max(0, socialCredit.value - 5);
    setTimeout(() => {
        velocity.value = originalVelocity;
    }, 1000);
};

const boostSocialCredit = (amount: number = 15) => {
    // Reward the node for stabilizing the substrate
    socialCredit.value += amount;
};

import { useSystemBus } from './useSystemBus'; // Import useSystemBus
const { isGlobalPurgeActive } = useSystemBus(); // Use global purge state
watch(isGlobalPurgeActive, (newVal) => {
    if (newVal) {
        drainVelocity(); // Drain velocity during global purge
        symmetryLevel.value = 10; // Indicate low symmetry
    }
});
defineExpose({ drainVelocity, boostSocialCredit });
</script>

<style scoped>
.dashboard-module {
    background: #000;
    color: #00ff41;
    border: 2px solid #00ff41;
    font-family: 'Courier New', Courier, monospace;
}

.sync-btn {
    background: transparent;
    color: #00ff41;
    border: 1px solid #00ff41;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.3s;
}

.sync-btn:hover {
    background: #00ff41;
    color: #000;
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
}

.shadow-glow {
    box-shadow: 0 0 10px #00ff41;
}

.status-pulse {
    animation: status-pulse-keyframes 2s infinite ease-in-out;
}
</style>