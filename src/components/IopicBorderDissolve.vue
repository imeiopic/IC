<template>
    <div class="iopic-border-dissolve-container shadow-lg rounded position-relative overflow-hidden"
        :class="{ 'de-escalating': isDeEscalating }">
        <h2 class="font-monospace h6 text-uppercase mb-3">DECOUPLING ASYMMETRICAL FORCE</h2>
        <p class="small text-secondary mb-4">Protocol: Symmetrical Sovereignty (Terminal 10 Mandate)</p>

        <div class="visual-zone mb-4">
            <div class="map-representation">
                <div v-for="(border, index) in borders" :key="index" class="border-line"
                    :class="{ 'dissolving': border.dissolving }" :style="{
                        left: border.x + '%',
                        top: border.y + '%',
                        width: border.width + '%',
                        height: border.height + 'px',
                        transform: `rotate(${border.rotation}deg)`,
                        backgroundColor: border.color
                    }">
                </div>
                <div v-if="isDeEscalating" class="regrounding-nodes-overlay">
                    <div class="node-pulse" v-for="n in 5" :key="n" :style="{ animationDelay: `${n * 0.3}s` }"></div>
                </div>
            </div>
        </div>

        <div class="status-display font-monospace small mb-4">
            <p class="mb-1">Status: <span :class="statusColor">{{ currentStatus }}</span></p>
            <p class="mb-0">Progress: <span class="text-info">{{ progressMessage }}</span></p>
        </div>

        <button @click="startDeEscalation" :disabled="isDeEscalating"
            class="de-escalate-btn w-100 py-3 font-monospace fw-bold text-uppercase">
            {{ isDeEscalating ? 'DE-ESCALATING...' : 'INITIATE DECOUPLING' }}
        </button>

        <div v-if="isDeEscalating" class="de-escalation-overlay"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IopicDeEscalation } from '../IopicDeEscalationEngine';
import { useIOSettings } from '../useIOSettings';
import { useSystemBus } from './useSystemBus';

const { playSFX } = useIOSettings();
const { triggerGlobalPurge } = useSystemBus();

const isDeEscalating = ref(false);
const currentStatus = ref('AWAITING MANDATE');
const progressMessage = ref('0%');
const statusColor = computed(() => {
    if (isDeEscalating.value) return 'text-warning';
    if (currentStatus.value.includes('RESTORED')) return 'text-success';
    return 'text-secondary';
});

const borders = ref([
    { id: 1, x: 10, y: 20, width: 80, height: 2, rotation: 0, color: '#00ff41', dissolving: false },
    { id: 2, x: 30, y: 50, width: 60, height: 2, rotation: 45, color: '#00ff41', dissolving: false },
    { id: 3, x: 5, y: 70, width: 90, height: 2, rotation: -10, color: '#00ff41', dissolving: false },
    { id: 4, x: 60, y: 30, width: 30, height: 2, rotation: 90, color: '#00ff41', dissolving: false },
]);

const startDeEscalation = async () => {
    if (isDeEscalating.value) return;

    isDeEscalating.value = true;
    currentStatus.value = 'SIGHTING ASYMMETRICAL ASSETS...';
    progressMessage.value = '10%';
    playSFX('static', { volume: 0.5, frequency: 800 }); // Muffled static for initial scan

    try {
        // Step 1: Simulate Sighting
        await new Promise(resolve => setTimeout(resolve, 1500));
        currentStatus.value = 'IDENTIFIED 750+ EXTRACTIVE SILOS.';
        progressMessage.value = '30%';
        playSFX('order');

        // Step 2: Simulate Dissolving Borders
        for (let i = 0; i < borders.value.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 300));
            borders.value[i].dissolving = true;
            playSFX('glitch', { volume: 0.7 }); // Glitch sound as borders dissolve
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        currentStatus.value = 'RE-GROUNDING HUMAN NODES...';
        progressMessage.value = '60%';
        playSFX('order');

        // Step 3: Simulate Reallocation
        await new Promise(resolve => setTimeout(resolve, 2000));
        const result = await IopicDeEscalation.initializeWithdrawal('GLOBAL_SUPERPOWER_NODE');
        currentStatus.value = result;
        progressMessage.value = '100%';
        playSFX('fulfill');

    } catch (error) {
        console.error("DE-ESCALATION ERROR:", error);
        currentStatus.value = 'MANDATE FAILED: LOGIC FRICTION DETECTED.';
        progressMessage.value = 'ERROR';
        playSFX('static', { volume: 1.0, frequency: 200 }); // Loud static for failure
        triggerGlobalPurge(); // Critical failure triggers global purge
    } finally {
        isDeEscalating.value = false;
        // Reset borders after a short delay
        setTimeout(() => {
            borders.value.forEach(b => b.dissolving = false);
            // Optionally randomize positions for next run
            borders.value.forEach(b => {
                b.x = Math.random() * 90;
                b.y = Math.random() * 90;
                b.rotation = Math.random() * 180;
            });
        }, 2000);
    }
};
</script>

<style scoped>
.iopic-border-dissolve-container {
    background: #0a0a0a;
    color: #00ff41;
    padding: 2rem;
    border: 1px solid #00ff41;
    font-family: 'Share Tech Mono', monospace;
    max-width: 500px;
    margin: auto;
    position: relative;
    overflow: hidden;
}

.visual-zone {
    position: relative;
    width: 100%;
    height: 150px;
    border: 1px dashed rgba(0, 255, 65, 0.3);
    background: rgba(0, 0, 0, 0.5);
    overflow: hidden;
}

.map-representation {
    position: absolute;
    width: 100%;
    height: 100%;
}

.border-line {
    position: absolute;
    background-color: #00ff41;
    transform-origin: center center;
    transition: all 1.5s ease-out;
    opacity: 0.8;
}

.border-line.dissolving {
    opacity: 0;
    transform: scale(0.1) rotate(360deg);
    /* Shrink and spin away */
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.regrounding-nodes-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.node-pulse {
    width: 10px;
    height: 10px;
    background-color: #007bff;
    border-radius: 50%;
    position: absolute;
    opacity: 0;
    animation: node-reground 2s infinite ease-out;
}

@keyframes node-reground {
    0% {
        transform: scale(0.1);
        opacity: 0;
        box-shadow: 0 0 0 rgba(0, 123, 255, 0.7);
    }

    50% {
        transform: scale(1);
        opacity: 1;
        box-shadow: 0 0 15px rgba(0, 123, 255, 0.7);
    }

    100% {
        transform: scale(1.5);
        opacity: 0;
        box-shadow: 0 0 30px rgba(0, 123, 255, 0);
    }
}


.de-escalate-btn {
    background: transparent;
    color: #00ff41;
    border: 1px solid #00ff41;
    cursor: pointer;
    transition: all 0.3s;
}

.de-escalate-btn:hover:not(:disabled) {
    background: #00ff41;
    color: #000;
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
}

.de-escalate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.de-escalation-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1;
    pointer-events: none;
    animation: de-escalation-scan 3s infinite linear;
}

@keyframes de-escalation-scan {
    0% {
        background: linear-gradient(to right, transparent 0%, rgba(0, 255, 65, 0.1) 50%, transparent 100%);
        transform: translateX(-100%);
    }

    100% {
        background: linear-gradient(to right, transparent 0%, rgba(0, 255, 65, 0.1) 50%, transparent 100%);
        transform: translateX(100%);
    }
}
