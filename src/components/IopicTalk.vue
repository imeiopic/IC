<template>
    <div class="iopic-talk-container shadow-lg rounded position-relative overflow-hidden"
        :class="{ 'noise-active': currentNoiseLevel > 0 }">
        <h2 class="font-monospace h6 text-uppercase mb-3">Universal Semantic Layer (USL)</h2>

        <!-- Tab Navigation -->
        <div class="nav nav-tabs border-bottom-0 mb-3 gap-2">
            <button class="nav-link bg-transparent border-0 text-uppercase tiny font-monospace p-0 pb-1"
                :class="{ 'text-success border-bottom border-success': activeTab === 'sighting' }"
                @click="activeTab = 'sighting'">
                Sighting
            </button>
            <button class="nav-link bg-transparent border-0 text-uppercase tiny font-monospace p-0 pb-1"
                :class="{ 'text-success border-bottom border-success': activeTab === 'substrate' }"
                @click="activeTab = 'substrate'">
                Substrate
            </button>
        </div>

        <div v-if="activeTab === 'sighting'">
            <div class="communication-zone mb-4">
                <div class="input-signal-display mb-3 p-3 rounded" :class="{ 'noise-glitch': currentNoiseLevel >= 2 }">
                    <label class="small text-secondary text-uppercase d-block mb-1">Incoming Signal (Noise):</label>
                    <p class="font-monospace text-warning mb-0">{{ incomingSignal || 'AWAITING SIGNAL...' }}</p>
                </div>

                <div class="translated-intent-display p-3 rounded">
                    <label class="small text-secondary text-uppercase d-block mb-1">Translated Intent
                        (Symmetry):</label>
                    <p class="font-monospace text-success mb-0">{{ translatedIntent.text || 'PROCESSING...' }}</p>
                </div>
            </div>

            <!-- Manual Entry Section -->
            <div class="manual-entry-zone mb-4 pt-3 border-top border-secondary border-opacity-25">
                <label class="small text-secondary text-uppercase d-block mb-2">Manual Intent Sighting:</label>
                <div class="input-group">
                    <input v-model="manualInput" type="text"
                        class="form-control bg-black text-success border-success border-opacity-50 font-monospace shadow-none"
                        placeholder="Enter foreign syntax..." @keyup.enter="handleManualTranslation">
                    <button @click="handleManualTranslation" class="btn btn-outline-success font-monospace tiny px-3"
                        :disabled="!manualInput">
                        SIGHT
                    </button>
                </div>
            </div>

            <div class="metadata-display d-flex justify-content-between small font-monospace opacity-75">
                <span>Confidence: {{ translatedIntent.confidence }}</span>
                <span>Latency: {{ translatedIntent.latency }}</span>
                <span>Target: {{ nativeLanguage }}</span>
            </div>

            <button @click="simulateIncomingSignal" class="simulate-btn w-100 py-2 mt-4">
                SIMULATE INCOMING NODE
            </button>
        </div>

        <!-- Learning Substrate Statistics Tab -->
        <div v-else-if="activeTab === 'substrate'" class="substrate-zone animate-fade-in">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <label class="small text-secondary text-uppercase">Recorded Intent Frequencies:</label>
                <button @click="handleClearSubstrate"
                    class="btn btn-link btn-sm text-danger tiny text-decoration-none p-0 font-monospace">
                    PURGE DATA
                </button>
            </div>

            <div class="stats-list border border-success border-opacity-25 rounded p-3 bg-black bg-opacity-50">
                <div v-for="(count, intent) in learnedStats" :key="intent" class="mb-3">
                    <div class="d-flex justify-content-between font-monospace mb-1 tiny">
                        <span class="text-info">{{ intent }}</span>
                        <span class="text-success">{{ count }}x</span>
                    </div>
                    <div class="progress bg-dark border border-secondary border-opacity-25" style="height: 6px;">
                        <div class="progress-bar bg-success shadow-glow-small transition-all"
                            :style="{ width: (count / maxStatValue * 100) + '%' }"></div>
                    </div>
                </div>
                <div v-if="Object.keys(learnedStats).length === 0"
                    class="text-center py-3 text-muted italic small font-monospace">
                    No intent patterns grounded in this cycle.
                </div>
            </div>
            <p class="tiny text-secondary mt-3 font-monospace italic">Note: Intents are extracted from real-time
                "Sighting" events.</p>
        </div>

        <!-- Visual noise overlay -->
        <div v-if="currentNoiseLevel > 0" class="noise-overlay"
            :class="{ 'noise-warning': currentNoiseLevel === 1, 'noise-critical': currentNoiseLevel >= 2 }"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { IopicTranslator } from '../IopicUniversalTranslator';
import { useIOSettings } from '../useIOSettings';
import { useSystemBus } from './useSystemBus';

const { playSFX } = useIOSettings();
const { currentNoiseLevel } = useSystemBus();

const activeTab = ref('sighting');
const incomingSignal = ref('');
const manualInput = ref('');
const translatedIntent = ref({ text: '', confidence: 0, latency: '' });
const nativeLanguage = ref('English'); // This would typically be user-configurable

const learnedStats = ref<Record<string, number>>({});

const maxStatValue = computed(() => {
    const counts = Object.values(learnedStats.value);
    return counts.length > 0 ? Math.max(...counts) : 1;
});

let simulationInterval: ReturnType<typeof setInterval> | null = null;

const foreignPhrases = [
    "Guten Tag, wie geht es Ihnen?", // German
    "Bonjour, comment ça va?", // French
    "Hola, ¿cómo estás?", // Spanish
    "你好，你好吗？", // Chinese
    "Привет, как дела?", // Russian
    "こんにちは、お元気ですか？", // Japanese
    "안녕하세요, 잘 지내세요?", // Korean
    "Olá, como você está?", // Portuguese
    "Ciao, come stai?", // Italian
    "Merhaba, nasılsınız?" // Turkish
];

const simulateIncomingSignal = async () => {
    const randomPhrase = foreignPhrases[Math.floor(Math.random() * foreignPhrases.length)];
    incomingSignal.value = randomPhrase;

    // Simulate some delay for processing
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    const result = await IopicTranslator.processSymmetry(randomPhrase, nativeLanguage.value);
    translatedIntent.value = result;
    playSFX('order'); // Play a subtle sound for successful translation
};

const refreshStats = () => {
    learnedStats.value = IopicTranslator.getLearnedStats();
};

const handleClearSubstrate = () => {
    if (confirm('Are you sure you want to purge the semantic learning substrate?')) {
        IopicTranslator.clearLearningSubstrate();
        refreshStats();
        playSFX('static');
    }
};

const handleManualTranslation = async () => {
    if (!manualInput.value.trim()) return;

    incomingSignal.value = manualInput.value;
    manualInput.value = ''; // Clear input after sighting

    // Simulate processing delay
    translatedIntent.value = { text: 'GROUNDING...', confidence: 0, latency: '...' };
    await new Promise(resolve => setTimeout(resolve, 400));

    const result = await IopicTranslator.processSymmetry(incomingSignal.value, nativeLanguage.value);
    translatedIntent.value = result;
    playSFX('order');
};

onMounted(() => {
    // Start periodic simulation
    simulationInterval = setInterval(simulateIncomingSignal, 5000 + Math.random() * 3000);
});

onUnmounted(() => {
    if (simulationInterval) {
        clearInterval(simulationInterval);
    }
});

// Watch for noise level changes and potentially play glitch SFX
watch(currentNoiseLevel, (newVal) => {
    if (newVal >= 2) {
        playSFX('glitch');
    } else if (newVal === 1) {
        playSFX('static', { volume: 0.3 });
    }
});

// Refresh stats whenever user switches to the Substrate tab
watch(activeTab, (newTab) => {
    if (newTab === 'substrate') {
        refreshStats();
    }
});
</script>

<style scoped>
.iopic-talk-container {
    background: #0a0a0a;
    color: #00ff41;
    padding: 2rem;
    border: 1px solid #00ff41;
    font-family: 'Share Tech Mono', monospace;
    max-width: 500px;
    margin: auto;
    position: relative;
}

.shadow-glow-small {
    box-shadow: 0 0 8px rgba(0, 255, 65, 0.6);
}

.animate-fade-in {
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.manual-entry-zone .form-control:focus {
    background-color: #050505;
    border-color: #00ff41;
    color: #00ff41;
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
}

.manual-entry-zone .btn-outline-success {
    border-color: rgba(0, 255, 65, 0.5);
    color: #00ff41;
}

.manual-entry-zone .btn-outline-success:hover:not(:disabled) {
    background: #00ff41;
    color: #000;
}

.input-signal-display,
.translated-intent-display {
    background: rgba(0, 255, 65, 0.05);
    border: 1px solid rgba(0, 255, 65, 0.2);
}

.simulate-btn {
    background: #00ff41;
    color: #000;
    border: none;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
}

.simulate-btn:hover {
    background: #00cc33;
}

.noise-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
}

.noise-warning {
    background: rgba(255, 193, 7, 0.1);
    opacity: 1;
}

.noise-critical {
    background: rgba(255, 0, 0, 0.2);
    opacity: 1;
    animation: critical-noise-pulse 0.5s infinite alternate;
}

.noise-glitch {
    animation: text-glitch 0.1s infinite alternate;
}

@keyframes critical-noise-pulse {
    from {
        opacity: 0.2;
    }

    to {
        opacity: 0.4;
    }
}

@keyframes text-glitch {
    0% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-1px);
    }

    50% {
        transform: translateX(1px);
    }

    75% {
        transform: translateX(-1px);
    }

    100% {
        transform: translateX(0);
    }
}
