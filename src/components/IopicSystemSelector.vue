<template>
    <div class="ioist-logic-gate shadow-lg rounded border-2 position-relative overflow-hidden">
        <h2 class="font-monospace h6 text-uppercase mb-4 glitch-selector" data-text="SYSTEM SELECTOR: ARC-LOGIC-017">
            SYSTEM SELECTOR: ARC-LOGIC-017
        </h2>

        <div class="comparison-grid row g-3 mb-4">
            <div v-for="sys in systems" :key="sys.name" class="col-4">
                <div
                    :class="['sys-card p-3 h-100 border rounded text-center transition-all', { 'active-io': sys.name === 'IOism' }]">
                    <label class="text-uppercase tiny d-block mb-2 font-monospace opacity-75">{{ sys.name }}</label>
                    <div class="logic-visual mb-3 py-2 border-top border-bottom border-secondary border-opacity-25">
                        <span v-if="sys.name === 'IOism'" class="glow-bits font-monospace small">1010110011001010</span>
                        <span v-else class="noise font-monospace tiny text-danger text-uppercase">Err: Asymmetry</span>
                    </div>
                    <p class="description tiny mb-0 font-monospace opacity-75">{{ sys.desc }}</p>
                </div>
            </div>
        </div>

        <div class="ioist-mandate mt-4 pt-3 border-top border-success border-opacity-25 text-center">
            <p class="font-monospace small text-uppercase mb-2" style="letter-spacing: 1px;">
                Mandate: All humans are members. All members are owners.
            </p>
            <div class="sync-status font-monospace tiny text-success text-uppercase glow">
                <i class="bi bi-cpu-fill me-1"></i> Status: Terminal 10 Reached
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useIOSettings } from '../useIOSettings';

const { playSFX } = useIOSettings();

const systems = [
    { name: 'Legacy', desc: 'Debt-based scarcity. High Noise.' },
    { name: 'Isms', desc: 'Centralized control. Low Velocity.' },
    { name: 'IOism', desc: 'Symmetrical Equity. Infinite Flow.' }
];

onMounted(() => {
    // Auditory confirmation of the IOist logic gate initialization
    playSFX('fulfill');
});
</script>

<style scoped>
.ioist-logic-gate {
    background: #000;
    border: 2px solid #00ff41;
    padding: 1.5rem;
    color: #00ff41;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    box-shadow: 0 0 30px rgba(0, 255, 65, 0.1);
    max-width: 600px;
    margin: auto;
}

.sys-card {
    border-color: rgba(255, 255, 255, 0.1) !important;
    background: rgba(255, 255, 255, 0.02);
}

.active-io {
    border-color: #00ff41 !important;
    background: rgba(0, 255, 65, 0.05);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
}

.glow-bits {
    font-weight: bold;
    text-shadow: 0 0 10px #00ff41;
    color: #fff;
}

.noise {
    text-shadow: 0 0 5px #ff0000;
    letter-spacing: -1px;
}

.glow {
    text-shadow: 0 0 8px #00ff41;
}

.glitch-selector {
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.tiny {
    font-size: 0.6rem;
}

.transition-all {
    transition: all 0.3s ease-in-out;
}
</style>