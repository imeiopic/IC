<template>
    <div class="energy-monitor card shadow-sm border-0 bg-dark text-success mb-4 font-monospace" role="region"
        aria-label="System Energy and Friction Monitor" :class="{
            'high-contrast-mode': highContrastMode,
            'critical-instability': systemFriction > 0.28
        }">
        <div class="card-body p-3">
            <!-- Critical Instability Warning -->
            <div v-if="systemFriction > 0.28" class="critical-friction-overlay text-center mb-2">
                <div class="fw-bold tiny text-white bg-danger px-2 py-1">!! CRITICAL SUBSTRATE INSTABILITY !!</div>
            </div>

            <!-- System Breach Alert UI -->
            <div v-if="isBreached" role="alert"
                class="breach-alert border border-danger p-2 mb-3 text-center animate-pulse"
                :class="{ 'hc-alert': highContrastMode }">
                <div class="tiny fw-bold text-danger glitch-warn"
                    :data-text="highContrastMode ? 'BREACH DETECTED' : 'SYSTEM BREACH DETECTED'">
                    SYSTEM BREACH DETECTED
                </div>
                <div class="text-danger" style="font-size: 0.5rem;">FRICTION > 0.200 SUSTAINED</div>
                <div v-if="breachSeconds > 0" class="text-warning fw-bold mt-1" style="font-size: 0.6rem;">
                    AUTO-PURGE IN: {{ 60 - breachSeconds }}s
                </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="text-uppercase m-0 tiny fw-bold letter-spacing-1"
                    :class="{ 'text-white': highContrastMode }">Energy Substrate</h6>
                <span class="badge tiny"
                    :class="[isLowPower ? 'bg-warning text-dark' : 'bg-success', { 'bg-white text-black fw-bold': highContrastMode }]">
                    {{ energyProfile }} {{ isLowPower ? '[LP]' : '' }}
                </span>
            </div>

            <!-- System Load: Visualizes IO Velocity -->
            <div class="mb-3">
                <div class="d-flex justify-content-between tiny mb-1 opacity-75">
                    <span>IO VELOCITY (V)</span>
                    <span>{{ Math.round(ioLoad * 100) }}%</span>
                </div>
                <div class="progress bg-black" style="height: 4px;"
                    :style="{ border: highContrastMode ? '1px solid #FFF' : '1px solid rgba(0, 255, 65, 0.2)' }">
                    <div class="progress-bar" role="progressbar" aria-label="IO Velocity"
                        :aria-valuenow="Math.round(ioLoad * 100)" aria-valuemin="0" aria-valuemax="100"
                        :class="highContrastMode ? 'bg-white' : 'bg-info shadow-glow-blue'"
                        :style="{ width: (ioLoad * 100) + '%' }"></div>
                </div>
            </div>

            <!-- System Friction: Visualizes Substrate Resistance -->
            <div class="mb-3">
                <div class="d-flex justify-content-between tiny mb-1 opacity-75">
                    <span :class="{ 'text-danger fw-bold': systemFriction > 0.22 }">FRICTION (Ω) {{ systemFriction >
                        0.22 ? '!!' : '' }}</span>
                    <span>{{ systemFriction.toFixed(3) }}</span>
                </div>
                <CTooltip v-if="systemFriction > 0.22" content="FRICTION WARNING: Substrate Stability Compromised"
                    placement="top">
                    <div class="progress bg-black" style="height: 4px;"
                        :style="{ border: highContrastMode ? '1px solid #FFF' : (systemFriction > 0.22 ? '1px solid #ff0000' : '1px solid rgba(255, 0, 0, 0.2)') }">
                        <div class="progress-bar" role="progressbar" aria-label="System Friction"
                            :aria-valuenow="Math.round(systemFriction * 1000) / 1000" aria-valuemin="0"
                            aria-valuemax="0.3" :class="highContrastMode ? 'bg-warning' : 'bg-danger'"
                            :style="{ width: Math.min(100, systemFriction * 333) + '%' }">
                        </div>
                    </div>
                </CTooltip>
                <div v-else class="progress bg-black" style="height: 4px;"
                    :style="{ border: highContrastMode ? '1px solid #FFF' : '1px solid rgba(255, 0, 0, 0.2)' }">
                    <div class="progress-bar" role="progressbar" aria-label="System Friction"
                        :aria-valuenow="Math.round(systemFriction * 1000) / 1000" aria-valuemin="0" aria-valuemax="0.3"
                        :class="highContrastMode ? 'bg-warning' : 'bg-danger'"
                        :style="{ width: Math.min(100, systemFriction * 333) + '%' }">
                    </div>
                </div>
                <div v-if="energyProfile === 'ADAPTIVE'" class="tiny text-muted mt-1" style="font-size: 0.5rem;">
                    AUTO-THROTTLE: > 0.150
                </div>
            </div>

            <!-- Friction History (5m Trend) -->
            <div class="mb-3">
                <div class="d-flex justify-content-between tiny mb-1 opacity-75">
                    <span>SUBSTRATE TREND (5M)</span>
                    <span :class="systemFriction > 0.15 ? 'text-danger' : 'text-success'">
                        Δ {{ frictionTrend }}
                    </span>
                </div>
                <div class="friction-graph-container bg-black border border-secondary border-opacity-25 rounded p-1">
                    <svg class="friction-graph" viewBox="0 0 150 40" preserveAspectRatio="none" role="img"
                        aria-label="Friction trend graph over the last 5 minutes">
                        <path :d="sparklinePath" fill="none" :stroke="graphStroke" stroke-width="1.5"
                            stroke-linecap="round" />
                    </svg>
                </div>
            </div>

            <!-- System Stabilization Control -->
            <div class="mb-3">
                <button @click="stabilizeSystem" :disabled="isStabilizing"
                    class="btn btn-outline-success btn-sm w-100 tiny font-monospace text-uppercase stabilization-btn"
                    :class="{ 'active-stabilizing': isStabilizing, 'hc-btn': highContrastMode }">
                    <i class="bi me-1" :class="isStabilizing ? 'bi-shield-fill-check' : 'bi-cpu'"></i>
                    {{ isStabilizing ? `Stabilizing: ${stabilizationTimer}s` : 'System Stabilization' }}
                </button>
            </div>

            <!-- Friction Shield Control -->
            <div class="mb-3">
                <button @click="activateShield" :disabled="isFrictionShielded"
                    class="btn btn-outline-warning btn-sm w-100 tiny font-monospace text-uppercase stabilization-btn"
                    :class="{ 'active-shield': isFrictionShielded, 'hc-btn': highContrastMode }">
                    <i class="bi me-1" :class="isFrictionShielded ? 'bi-shield-shaded' : 'bi-shield-lock'"></i>
                    {{ isFrictionShielded ? `Shield Active: ${shieldTimer}s` : 'Friction Shield' }}
                </button>
            </div>

            <!-- Accessibility & Voice Guidance Controls -->
            <div class="mb-3">
                <div class="d-flex flex-wrap gap-2">
                    <button @click="toggleAccessibilityMode"
                        class="btn btn-outline-info btn-sm flex-grow-1 tiny font-monospace text-uppercase stabilization-btn"
                        :class="{ 'active-accessibility': manualAccessibilityMode }">
                        <i class="bi me-1" :class="isScreenReaderDetected ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                        {{ isScreenReaderDetected ? 'Access: ON' : 'Access: OFF' }}
                    </button>
                    <button @click="toggleVoiceGuidance"
                        class="btn btn-outline-info btn-sm flex-grow-1 tiny font-monospace text-uppercase stabilization-btn"
                        :class="{ 'active-accessibility': voiceGuidanceActive, 'focus-active': isFocusMode }">
                        <i class="bi me-1" :class="voiceGuidanceActive ? 'bi-volume-up-fill' : 'bi-volume-mute'"></i>
                        Voice: {{ voiceGuidanceActive ? 'ON' : 'OFF' }} {{ isFocusMode ? '[FOCUS]' : '' }}
                    </button>
                    <button @click="toggleFocusMode"
                        class="btn btn-outline-info btn-sm flex-grow-1 tiny font-monospace text-uppercase stabilization-btn"
                        :class="{ 'active-accessibility': manualFocusMode, 'focus-active': manualFocusMode }">
                        <i class="bi me-1" :class="manualFocusMode ? 'bi-volume-mute-fill' : 'bi-volume-up'"></i>
                        Ambient: {{ manualFocusMode ? 'MUTED' : 'ON' }}
                    </button>
                </div>
            </div>

            <!-- Efficiency Visualizer -->
            <div class="efficiency-substrate p-2 bg-black rounded border border-secondary border-opacity-25 mt-2">
                <div class="d-flex align-items-center justify-content-between" role="img"
                    :aria-label="isLowPower ? 'Efficiency Flow: Throttled' : 'Efficiency Flow: Nominal'">
                    <div class="status-node" :class="{ 'active': !isLowPower }" aria-hidden="true">⚡</div>
                    <div class="flow-line flex-grow-1 mx-2" :class="{ 'throttled': isLowPower }"></div>
                    <div class="status-node active" aria-hidden="true">⚙️</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CTooltip } from '@coreui/vue';
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useSystemBus } from './useSystemBus';
import { useIOSettings } from '../useIOSettings';

const {
    isLowPower,
    systemFriction,
    energyProfile,
    isStabilizing,
    isBreached,
    breachSeconds,
    highContrastMode,
    isScreenReaderDetected,
    manualAccessibilityMode,
    toggleAccessibilityMode,
    voiceGuidanceActive,
    toggleVoiceGuidance,
    isFocusMode,
    manualFocusMode,
    toggleFocusMode,
    isFrictionShielded
} = useSystemBus();
const { ioLoad, playSFX } = useIOSettings();

const frictionHighDuration = ref(0);
const stabilizationTimer = ref(0);
const shieldTimer = ref(0);
const frictionHistory = ref<number[]>([]);
const MAX_POINTS = 150; // 5 minutes at 2s intervals
let samplingInterval: any = null;
const isAlarming = ref(false);
let alarmNode: { source: AudioBufferSourceNode; gain: GainNode } | null = null;

/**
 * Critical Friction Alarm: Triggers a high-pitched auditory warning 
 * when substrate stability is severely compromised (> 0.28).
 */
watch(systemFriction, (val) => {
    if (val > 0.28) {
        if (!isAlarming.value) {
            isAlarming.value = true;
            // Initialize high-frequency resonance alarm (1500Hz)
            playSFX('static', { volume: 0.3, loop: true, frequency: 1500 }).then(node => {
                if (node) {
                    // Guard against race condition: check if friction normalized during buffer load
                    if (isAlarming.value) alarmNode = node as any;
                    else (node as any).source?.stop();
                }
            });
        }
    } else if (isAlarming.value) {
        isAlarming.value = false;
        if (alarmNode?.source) {
            alarmNode.source.stop();
            alarmNode = null;
        }
    }
});

const graphStroke = computed(() => {
    if (highContrastMode.value) return '#FFFFFF';
    return systemFriction.value > 0.15 ? '#ff0000' : '#00ff41';
});

const frictionTrend = computed(() => {
    if (frictionHistory.value.length < 2) return '0.000';
    const last = frictionHistory.value[frictionHistory.value.length - 1];
    const first = frictionHistory.value[0];
    return (last - first).toFixed(3);
});

const sparklinePath = computed(() => {
    if (frictionHistory.value.length < 2) return '';

    return frictionHistory.value.map((val, i) => {
        const x = (i / (MAX_POINTS - 1)) * 150;
        // Scale 0.0 - 0.3 friction to 40px height (inverted for SVG coords)
        const y = 40 - (Math.min(1, val / 0.3) * 35);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
});

onMounted(() => {
    samplingInterval = setInterval(() => {
        frictionHistory.value.push(systemFriction.value);
        if (frictionHistory.value.length > MAX_POINTS) {
            frictionHistory.value.shift();
        }

        // Breach Detection: Monitor if friction exceeds 0.2 for > 30 seconds
        if (systemFriction.value > 0.2) {
            frictionHighDuration.value += 2;
            if (frictionHighDuration.value >= 30 && !isBreached.value) {
                isBreached.value = true;
                playSFX('static'); // Auditory warning for the logic breach
            }
        } else {
            frictionHighDuration.value = 0;
            isBreached.value = false;
        }
    }, 2000); // 2 second sampling rate
});

onUnmounted(() => {
    if (samplingInterval) clearInterval(samplingInterval);
    if (alarmNode?.source) alarmNode.source.stop();
});

const stabilizeSystem = () => {
    if (isStabilizing.value) return;

    isStabilizing.value = true;
    stabilizationTimer.value = 10;

    // Manually force-reduce system load to minimum stability level
    const targetLoad = 0.05;
    ioLoad.value = targetLoad;
    playSFX('order');

    const countdown = setInterval(() => {
        stabilizationTimer.value--;
        if (stabilizationTimer.value <= 0) {
            clearInterval(countdown);
            isStabilizing.value = false;
            // Allow the system to resume normal load calculations
            playSFX('fulfill');
        } else {
            // Maintain the stabilized load during the interval
            ioLoad.value = targetLoad;
        }
    }, 1000);
};

const activateShield = () => {
    if (isFrictionShielded.value) return;

    isFrictionShielded.value = true;
    shieldTimer.value = 30;
    // Immediate grounding of friction
    systemFriction.value = 0.1;
    playSFX('fulfill');

    const countdown = setInterval(() => {
        shieldTimer.value--;
        // Force lock the substrate friction while the shield is active
        systemFriction.value = 0.1;

        if (shieldTimer.value <= 0) {
            clearInterval(countdown);
            isFrictionShielded.value = false;
            // Auditory feedback that the protection has expired
            playSFX('order');
        }
    }, 1000);
};
</script>

<style scoped>
.tiny {
    font-size: 0.65rem;
}

.letter-spacing-1 {
    letter-spacing: 1px;
}

.shadow-glow-blue {
    box-shadow: 0 0 8px rgba(0, 123, 255, 0.6);
}

.progress-bar {
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.stabilization-btn {
    font-size: 0.6rem;
    border-color: rgba(0, 255, 65, 0.4);
    color: #00ff41;
}

.active-stabilizing {
    background-color: rgba(0, 255, 65, 0.1) !important;
    border-color: #00ff41 !important;
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
}

.active-shield {
    background-color: rgba(255, 193, 7, 0.1) !important;
    border-color: #ffc107 !important;
    box-shadow: 0 0 10px rgba(255, 193, 7, 0.2);
    color: #ffc107 !important;
}

.active-accessibility {
    background-color: rgba(0, 123, 255, 0.1) !important;
    border-color: #007bff !important;
    color: #007bff !important;
}

.focus-active {
    box-shadow: 0 0 12px rgba(0, 123, 255, 0.4);
}

.breach-alert {
    background: rgba(255, 0, 0, 0.1);
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.2);
}

.high-contrast-mode {
    border: 2px solid #FFF !important;
    background-color: #000 !important;
    color: #FFF !important;
}

.hc-alert {
    background-color: #000 !important;
    border: 3px solid #F00 !important;
}

.hc-alert .glitch-warn::before,
.hc-alert .glitch-warn::after {
    display: none;
}

.hc-btn {
    border: 2px solid #FFF !important;
    color: #FFF !important;
    background-color: #000 !important;
}

.critical-instability {
    border: 1px solid #ff0000 !important;
    box-shadow: 0 0 25px rgba(255, 0, 0, 0.5) !important;
    animation: micro-jitter 0.08s infinite !important;
}

.critical-friction-overlay {
    animation: blink-rapid 0.2s infinite;
}

@keyframes micro-jitter {
    0% {
        transform: translate(1px, 1px) rotate(0deg);
    }

    50% {
        transform: translate(-1px, -1px) rotate(0.1deg);
    }

    100% {
        transform: translate(1px, -1px) rotate(-0.1deg);
    }
}

@keyframes blink-rapid {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: breach-pulse 1s infinite ease-in-out;
}

@keyframes breach-pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.6;
    }
}

.glitch-warn {
    position: relative;
    display: inline-block;
}

.glitch-warn::before,
.glitch-warn::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
}

.glitch-warn::before {
    color: #f00;
    z-index: -1;
    animation: glitch-anim 0.3s infinite;
}

.glitch-warn::after {
    color: #ffc107;
    z-index: -2;
    animation: glitch-anim 0.3s reverse infinite;
}

.friction-graph-container {
    height: 40px;
    overflow: hidden;
}

.friction-graph {
    width: 100%;
    height: 100%;
}

.status-node {
    font-size: 0.8rem;
    filter: grayscale(1) brightness(0.5);
    transition: all 0.5s ease;
}

.status-node.active {
    filter: grayscale(0) brightness(1) drop-shadow(0 0 5px #00ff41);
}

.flow-line {
    height: 1px;
    background: rgba(0, 255, 65, 0.2);
    position: relative;
    overflow: hidden;
}

.flow-line::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #00ff41, transparent);
    animation: bus-flow 1.5s linear infinite;
}

.flow-line.throttled::after {
    animation-duration: 4s;
    background: linear-gradient(90deg, transparent, #ffc107, transparent);
}

@keyframes bus-flow {
    from {
        left: -100%;
    }

    to {
        left: 100%;
    }
}
</style>