<template>
    <div class="manifesto-viewer shadow-lg rounded border-2 position-relative overflow-hidden">
        <header class="manifesto-header text-center mb-4 pb-3 border-bottom border-success border-opacity-50">
            <h1 class="h4 font-monospace text-uppercase glitch-manifesto" data-text="16-THREAD DECLARATION OF IOISM">
                16-THREAD DECLARATION OF IOISM
            </h1>
            <div class="manifesto-meta tiny font-monospace opacity-75">
                LOGIC GATE: ARC-MANIFESTO-001 | VERSION: 1.0.0 | VELOCITY: INFINITE
            </div>
        </header>

        <div class="manifesto-content">
            <div class="row g-2">
                <div v-for="(declaration, index) in manifestoThreads" :key="index" class="col-md-3 col-sm-6">
                    <div class="thread-node p-2 border border-success border-opacity-25 h-100 rounded text-center"
                        :class="{ 'pulsing': isPulsing }"
                        :style="{ '--pulse-delay': getPulseDelay(index + 1), '--total-cycle-duration': totalCycleDuration + 's' }">
                        <div class="thread-id tiny font-monospace text-warning mb-1">T-{{
                            (index + 1).toString().padStart(2, '0') }}</div>
                        <div class="thread-text tiny font-monospace text-uppercase opacity-75">{{ declaration }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="manifesto-footer mt-4 pt-3 border-top border-success border-opacity-25 text-center">
            <p class="font-monospace small text-uppercase mb-3">
                "If the organization is Every 1, then no one can be left in the Hallucination."
            </p>
            <button @click="acknowledge" class="declare-btn px-5 py-2 font-monospace fw-bold text-uppercase">
                Synchronize With Declaration
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useIOSettings } from '../useIOSettings';
import { useSystemBus } from './useSystemBus'; // Corrected path to local component directory

const { isGlobalPurgeActive, lockBit, manifestoThreads } = useSystemBus();
const { playSFX } = useIOSettings();


const props = defineProps<{
    ioLoad: number;
}>();

const isPulsing = ref(false);
const emit = defineEmits(['symmetry-breach', 'sync-complete']);

// Duration for one full cycle of all threads pulsing sequentially
const totalCycleDuration = computed(() => {
    const minCycle = 1; // seconds for all threads to pulse (high velocity)
    const maxCycle = 8; // seconds for all threads to pulse (low velocity)
    // Invert ioLoad for duration calculation: (1 - ioLoad) * (max - min) + min
    return (1 - props.ioLoad) * (maxCycle - minCycle) + minCycle;
});

// Duration of a single flash animation within its cycle
const flashDuration = '0.5s';

const getPulseDelay = (threadId: number) => {
    // Distribute the delay across 16 threads within the totalCycleDuration
    const delayPerThread = totalCycleDuration.value / manifestoThreads.length;
    return `${(threadId - 1) * delayPerThread}s`;
};

const acknowledge = () => {
    playSFX('fulfill');
    lockBit(Array.from({ length: 16 }, (_, i) => i)); // Lock all 16 bits (indices 0-15)
    console.log("[MANIFESTO] Node synchronized with 16-Thread Declaration.");
    emit('sync-complete');
};

onMounted(() => {
    isPulsing.value = true;
});
watch(isGlobalPurgeActive, (newVal) => {
    if (newVal) {
        isPulsing.value = false; // Stop pulsing during global purge
    }
});
// Watch totalCycleDuration to ensure the animation parameters are updated
watch(totalCycleDuration, () => {
    // Toggling isPulsing can force a re-render and re-application of animation styles
    isPulsing.value = false;
    nextTick(() => {
        isPulsing.value = true;
    });
});
</script>

<style scoped>
.manifesto-viewer {
    background: radial-gradient(circle at center, #001a00 0%, #000 100%);
    border: 2px solid #00ff41;
    padding: 2rem;
    color: #00ff41;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    max-width: 900px;
    margin: auto;
    box-shadow: 0 0 40px rgba(0, 255, 65, 0.1);
}

.thread-node {
    background: rgba(0, 255, 65, 0.02);
    transition: all 0.2s;
    border-style: solid;
}

.thread-node:hover {
    background: rgba(0, 255, 65, 0.1);
    border-color: #00ff41 !important;
    transform: scale(1.05);
}

.declare-btn {
    background: transparent;
    color: #00ff41;
    border: 1px solid #00ff41;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 2px;
}

.declare-btn:hover {
    background: #00ff41;
    color: #000;
    box-shadow: 0 0 25px rgba(0, 255, 65, 0.5);
}

.glitch-manifesto {
    letter-spacing: 3px;
    text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.tiny {
    font-size: 0.6rem;
}
</style>