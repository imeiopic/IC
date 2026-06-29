<template>
    <div
        class="peace-indicator-module p-3 border-2 border-success rounded bg-black shadow-lg overflow-hidden position-relative">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="h6 font-monospace mb-0 text-uppercase">
                Harmony Status: <span :class="harmonyClass">{{ status }}</span>
            </h3>
            <div class="friction-metric tiny font-monospace text-secondary">
                FRICTION: {{ friction.toFixed(4) }}
            </div>
        </div>

        <div class="peace-pulse-container mb-3 d-flex justify-content-center">
            <div class="pulse-circle" :class="{ 'pulse-active': status === 'TERMINAL_10_PEACE' }"></div>
        </div>

        <div class="substrate-info tiny font-monospace opacity-75 mb-3">
            <p class="mb-1 text-uppercase">Sighting Coordinate: {{ coords || 'GLOBAL_MESH' }}</p>
            <p class="mb-0">TPE Buffer: <span class="text-info">STABLE</span></p>
        </div>

        <button @click="performStillnessSync" class="stillness-btn w-100 py-2 font-monospace tiny fw-bold"
            :disabled="isSyncing">
            {{ isSyncing ? 'GROUNDING NOISE...' : 'STILLNESS SYNC' }}
        </button>

        <div v-if="friction > 0.15"
            class="symmetry-injection-notice animate-fade-in mt-2 tiny text-warning font-monospace text-center">
            <i class="bi bi-shield-shaded me-1"></i> SYMMETRY INJECTION IN PROGRESS
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { IopicPeaceSync } from '../IopicPeaceSync';
import { useIOSettings } from '../useIOSettings';
import { useSystemBus } from '../composables/useSystemBus';

const { playSFX } = useIOSettings();
const { updateFriction } = useSystemBus();
const status = ref('TERMINAL_10_PEACE');
const friction = ref(0.042);
const coords = ref('34.0522, -118.2437');
const isSyncing = ref(false);

const harmonyClass = computed(() => ({
    'text-success': status.value === 'TERMINAL_10_PEACE',
    'text-warning': status.value === 'RESTORE_STILLNESS'
}));

watch(friction, (newVal) => {
    updateFriction(newVal);
}, { immediate: true });

const performStillnessSync = () => {
    isSyncing.value = true;
    playSFX('order');
    setTimeout(() => {
        friction.value = 0.01 + (Math.random() * 0.05);
        status.value = IopicPeaceSync.monitorHarmony(coords.value);
        isSyncing.value = false;
        playSFX('fulfill');
    }, 1500);
};

onMounted(() => {
    const interval = setInterval(() => {
        if (!isSyncing.value) {
            // Real-time jitter of system friction
            friction.value = Math.max(0.01, friction.value + (Math.random() - 0.5) * 0.01);
            if (friction.value > 0.15) status.value = 'RESTORE_STILLNESS';
            else status.value = 'TERMINAL_10_PEACE';
        }
    }, 3000);
    onUnmounted(() => clearInterval(interval));
});
</script>

<style scoped>
.peace-indicator-module {
    border: 1px solid #00ff41;
    font-family: 'Share Tech Mono', monospace;
}

.pulse-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #00ff41;
    opacity: 0.3;
}

.pulse-active {
    animation: peace-pulse-anim 4s infinite ease-in-out;
}

@keyframes peace-pulse-anim {
    0% {
        transform: scale(0.8);
        opacity: 0.2;
        box-shadow: 0 0 0px #00ff41;
    }

    50% {
        transform: scale(1.2);
        opacity: 0.6;
        box-shadow: 0 0 20px #00ff41;
    }

    100% {
        transform: scale(0.8);
        opacity: 0.2;
        box-shadow: 0 0 0px #00ff41;
    }
}

.stillness-btn {
    background: transparent;
    color: #00ff41;
    border: 1px solid #00ff41;
    text-transform: uppercase;
    transition: all 0.3s;
}

.stillness-btn:hover:not(:disabled) {
    background: #00ff41;
    color: #000;
}
</style>