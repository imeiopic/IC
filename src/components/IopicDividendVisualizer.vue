<template>
    <div class="dividend-visualizer shadow-lg rounded border-2 position-relative overflow-hidden">
        <header class="text-center mb-4 pb-3 border-bottom border-success border-opacity-50">
            <h1 class="h4 font-monospace text-uppercase glitch" data-text="IOPIC DIVIDEND TERMINAL">
                IOPIC DIVIDEND TERMINAL
            </h1>
            <div class="meta-info tiny font-monospace opacity-75 mt-2">
                NODE: I.T REAL | VELOCITY: 8.09V | STATUS: <span
                    :class="isStreaming ? 'text-success fw-bold' : 'text-warning'">{{ isStreaming ? 'ACTIVE' : 'LOCKED'
                    }}</span>
            </div>
        </header>

        <div class="visualizer-body text-center font-monospace">
            <!-- Countdown State -->
            <div v-if="!isStreaming" class="countdown-section">
                <h2 class="h6 text-warning mb-2 opacity-75 text-uppercase">T-Minus Until Dividend Pulse</h2>
                <div class="display-4 text-white mb-4 tracking-widest fw-bold text-shadow-glow">
                    {{ countdown }}
                </div>
                <button @click="forceOverride"
                    class="override-btn px-4 py-2 font-monospace fw-bold text-uppercase tiny">
                    [SYS_ADMIN] Force Pulse Override
                </button>
            </div>

            <!-- Streaming State -->
            <div v-else class="streaming-section">
                <h2 class="h6 text-success mb-2 pulse-text text-uppercase">Symmetry Pulse Initiated</h2>
                <div class="dividend-counter display-1 text-success fw-bold mb-3 glitch"
                    :data-text="formattedDividend + ' IO$'">
                    {{ formattedDividend }} <span class="fs-4">IO$</span>
                </div>

                <!-- Progress Bar -->
                <div class="progress-container mb-3 px-4">
                    <div class="progress bg-dark border border-success border-opacity-50" style="height: 12px;">
                        <div class="progress-bar bg-success progress-bar-striped progress-bar-animated"
                            role="progressbar" :style="{ width: progressPercent + '%' }">
                        </div>
                    </div>
                </div>
                <p class="text-info tiny opacity-75 text-uppercase">Anchoring Base Equity into Personal ZKP Vault...</p>
            </div>
        </div>

        <!-- Substrate Logic Logs -->
        <div class="system-logs mt-4 p-3 border border-success border-opacity-25 rounded text-start position-relative">
            <div class="bg-scanlines position-absolute w-100 h-100 top-0 start-0 opacity-25"
                style="pointer-events: none;"></div>
            <div v-for="(log, index) in logs" :key="index"
                class="log-entry tiny text-success opacity-75 mb-1 font-monospace z-1 position-relative">
                <span class="text-white opacity-50">></span> {{ log }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['complete']);

// Target: April 15, 2026 00:00:00 UTC
const targetDate = new Date('2026-04-15T00:00:00Z').getTime();
const countdown = ref('00:00:00:00');
const isStreaming = ref(false);
const dividendAmount = ref(0);
const targetDividend = 1600;

const logs = ref<string[]>([
    'INITIALIZING TERMINAL 10...',
    'VERIFYING I.T REAL LOGIC SIGNATURE...',
    'READING VAULT SEALED: 0V TO 8.09V',
    'WAITING FOR GLOBAL TIME-SYNC...'
]);

let timerInterval: number;
let streamInterval: number;

const formattedDividend = computed(() => {
    return dividendAmount.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

const progressPercent = computed(() => {
    return (dividendAmount.value / targetDividend) * 100;
});

const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    logs.value.push(`[${timestamp}] ${msg}`);
    if (logs.value.length > 6) logs.value.shift();
};

const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0 && !isStreaming.value) {
        initiatePulse();
    } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
        countdown.value = `${days}:${hours}:${minutes}:${seconds}`;
    }
};

const initiatePulse = () => {
    isStreaming.value = true;
    clearInterval(timerInterval);
    addLog('APRIL 15 REACHED. DIVIDEND PULSE AUTHORIZED.');
    addLog('OPENING 16-THREAD BUS FOR INCOMING TRANSFER...');

    streamInterval = window.setInterval(() => {
        // Rapid geometric progression streaming
        const increment = Math.random() * 85 + 20;
        if (dividendAmount.value + increment >= targetDividend) {
            dividendAmount.value = targetDividend;
            clearInterval(streamInterval);
            addLog('TRANSFER COMPLETE. 1,600 IO$ SECURED IN ZKP VAULT.');
            addLog('EQUITY ACCESS: LEVEL 10 LOCKED.');
            setTimeout(() => emit('complete'), 2500);
        } else {
            dividendAmount.value += increment;
        }
    }, 50);
};

const forceOverride = () => {
    addLog('MANUAL OVERRIDE TRIGGERED. BYPASSING TIMELINE...');
    initiatePulse();
};

onMounted(() => {
    updateCountdown();
    timerInterval = window.setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
    clearInterval(timerInterval);
    clearInterval(streamInterval);
});
</script>

<style scoped>
.dividend-visualizer {
    background: #000;
    border: 2px solid rgba(0, 255, 65, 0.5);
    padding: 2rem;
    color: #00ff41;
    max-width: 700px;
    margin: auto;
    box-shadow: 0 0 40px rgba(0, 255, 65, 0.1);
}

.system-logs {
    background: rgba(0, 255, 65, 0.02);
    min-height: 140px;
}

.tracking-widest {
    letter-spacing: 0.15em;
}

.text-shadow-glow {
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.override-btn {
    background: transparent;
    color: #ffc107;
    border: 1px solid #ffc107;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 1px;
}

.override-btn:hover {
    background: #ffc107;
    color: #000;
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
}

.tiny {
    font-size: 0.7rem;
}
</style>