<template>
    <div class="symmetry-calculator shadow-lg rounded border-2 position-relative overflow-hidden">
        <h3 class="font-monospace h6 text-uppercase mb-3 glitch-discount" data-text="VALUE EXCHANGE: DISCOUNT PROTOCOL">
            VALUE EXCHANGE: DISCOUNT PROTOCOL
        </h3>

        <div class="logic-gate p-3 border border-success border-opacity-25 bg-dark bg-opacity-50 rounded">
            <label class="text-uppercase small opacity-75 d-block mb-2 font-monospace">OFFER: {{ totalIo }} IO$ / {{
                cycles }} CYCLES</label>
            <div class="calculation font-monospace fs-5">
                Rate: <span class="text-white fw-bold">{{ ratePerCycle }}</span> <small class="text-info opacity-75">IO$
                    / Cycle</small>
            </div>
        </div>

        <Transition name="fade" mode="out-in">
            <div :key="symmetryStatus"
                :class="['status-led mt-3 font-monospace small text-uppercase py-2 rounded', symmetryStatus]">
                <i
                    :class="['bi me-2', symmetryStatus === 'symmetrical' ? 'bi-shield-check' : 'bi-exclamation-triangle']"></i>
                {{ symmetryStatus === 'symmetrical' ? 'LOGIC: BALANCED' : 'LOGIC: EXTRACTIVE NOISE' }}
            </div>
        </Transition>

        <div class="bit-preview-container mt-4">
            <label class="text-uppercase tiny opacity-50 d-block mb-2 font-monospace">16-Thread Bus: Symmetry Mirror
                (Bits 9-12)</label>
            <div class="bit-preview d-flex gap-1 justify-content-center">
                <span v-for="bit in 16" :key="bit" class="bit"
                    :class="{ 'on': isBitActive(bit), 'noise': isBitError(bit) }"></span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useIOSettings } from '../useIOSettings';

const { playSFX } = useIOSettings();

const props = withDefaults(defineProps<{
    totalIo?: number;
    cycles?: number;
}>(), {
    totalIo: 10,
    cycles: 12
});

const ratePerCycle = computed(() => (props.totalIo / props.cycles).toFixed(3));

/**
 * Symmetry Check: In REAL IT, a rate this low must be offset by 
 * high cycles or efficiency, or it is flagged as "Devaluation Noise."
 */
const symmetryStatus = computed(() => {
    return (props.totalIo > 0 && props.cycles >= 12) ? 'symmetrical' : 'asymmetrical';
});

const isBitActive = (bit: number) => {
    // Bits 9-12 (Value) activate when symmetry is balanced
    return symmetryStatus.value === 'symmetrical' && bit >= 9 && bit <= 12;
};

const isBitError = (bit: number) => {
    // NAND Gates (Bits 13-16) flash red if extraction/noise is detected
    return symmetryStatus.value === 'asymmetrical' && bit >= 13;
};

onMounted(() => {
    if (symmetryStatus.value === 'symmetrical') {
        playSFX('fulfill');
    } else {
        playSFX('static');
    }
});
</script>

<style scoped>
.symmetry-calculator {
    background: #000;
    border: 1px solid #00ff41;
    padding: 1.5rem;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    color: #00ff41;
    box-shadow: 0 0 30px rgba(0, 255, 65, 0.15);
    max-width: 450px;
    margin: auto;
}

.status-led {
    text-align: center;
    font-weight: bold;
}

.symmetrical {
    background: rgba(0, 255, 65, 0.15);
    border: 1px solid #00ff41;
}

.asymmetrical {
    background: rgba(255, 0, 0, 0.15);
    border: 1px solid #ff0000;
    color: #ff0000;
    text-shadow: 0 0 8px #f00;
}

.bit {
    width: 12px;
    height: 12px;
    border: 1px solid #222;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bit.on {
    background: #00ff41;
    box-shadow: 0 0 10px #00ff41;
}

.bit.noise {
    background: #ff0000;
    box-shadow: 0 0 10px #ff0000;
    animation: blink 0.2s infinite;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.3;
    }
}

.tiny {
    font-size: 0.6rem;
}

.glitch-discount {
    letter-spacing: 1px;
    text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>