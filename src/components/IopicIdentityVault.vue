<template>
    <div class="identity-vault shadow-lg rounded border-2 position-relative overflow-hidden"
        :class="{ 'purging': isGlobalPurgeActive, 'sealed': isSealed, 'near-completion-shake': shakeIntensity > 0, 'breached': isBreached }"
        :style="{ '--shake-intensity': shakeIntensity }">
        <header class="vault-header mb-4 text-center border-bottom border-success border-opacity-25 pb-3">
            <div v-if="isIOsticAcknowledged" class="tiny font-monospace text-success mb-1 fw-bold bit-status-text">
                [ BIT 1: ACKNOWLEDGED ]
            </div>
            <h2 class="font-monospace h6 text-uppercase mb-1 glitch-vault" data-text="IDENTITY VAULT: THREADS 5-8">
                IDENTITY VAULT: THREADS 5-8
            </h2>
            <div class="identity-hash tiny font-monospace opacity-50 break-all">
                HASH: {{ identityHash || 'UNRESOLVED_SUBSURFACE_SIGNAL' }}
            </div>
        </header>

        <div class="vault-logic-display mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="tiny font-monospace text-uppercase opacity-75">Symmetry Proof (6-Digit):</label>
                <span v-if="isSealed" class="text-success tiny font-monospace fw-bold">[LOCKED]</span>
            </div>

            <div class="proof-input-container position-relative">
                <input v-model="proofCode" maxlength="6" :disabled="isSealed || isProcessing || isGlobalPurgeActive"
                    class="proof-input font-monospace w-100 text-center py-2" placeholder="000000"
                    @input="handleInput" />
                <div v-if="isProcessing" class="processing-overlay">
                    <div class="spinner-border spinner-border-sm text-success" role="status"></div>
                </div>
            </div>

            <!-- Decryption Progress Visualization -->
            <div v-if="isProcessing" class="decryption-substrate mt-2 animate-slide-down">
                <div class="d-flex justify-content-between font-monospace tiny text-uppercase mb-1">
                    <span class="text-success">Symmetry Search...</span>
                    <span class="text-success">{{ Math.round(decryptionProgress) }}%</span>
                </div>
                <div class="progress bg-black border border-success border-opacity-50" style="height: 4px;">
                    <div class="progress-bar bg-success shadow-glow transition-all" :class="{
                        'noise-warn': currentNoiseLevel === 1 && !isSealed,
                        'noise-critical': currentNoiseLevel >= 2 && !isSealed,
                        'locked-blue': isSealed
                    }" :style="{ width: decryptionProgress + '%' }"></div>
                </div>
            </div>
        </div>

        <div class="persistence-metrics font-monospace tiny mb-4">
            <div class="metric-row d-flex justify-content-between mb-1">
                <span class="opacity-75">Persistence Status:</span>
                <span :class="isSealed ? 'text-success' : 'text-warning'">{{ isSealed ? 'STABILIZED' : 'VOLATILE'
                    }}</span>
            </div>
            <div class="metric-row d-flex justify-content-between">
                <span class="opacity-75">Temporal Link:</span>
                <span class="text-info">{{ isSealed ? 'ENCRYPTED' : 'AWAITING_SYNC' }}</span>
            </div>
        </div>

        <button @click="sealIdentity"
            :disabled="proofCode.length < 6 || isSealed || isProcessing || isGlobalPurgeActive"
            class="seal-btn w-100 py-3 font-monospace fw-bold text-uppercase">
            {{ isSealed ? 'Identity Sealed' : 'Seal Digital Truth' }}
        </button>

        <div v-if="isGlobalPurgeActive" class="purge-mask">
            <div class="purge-text font-monospace">ASYMMETRY DETECTED: PURGING</div>
            <div class="purge-text font-monospace" data-text="ASYMMETRY DETECTED: PURGING">ASYMMETRY DETECTED: PURGING
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useIOSettings } from '../useIOSettings';
import { useSystemBus } from './useSystemBus';
import { IopicSecretManager } from '../IopicSecretManager';

const props = defineProps<{
    accessKey?: string;
}>();

const emit = defineEmits(['success']);

const { playSFX } = useIOSettings();
const {
    isGlobalPurgeActive,
    triggerGlobalPurge,
    currentNoiseLevel,
    autoFocusActive, // This is for UI focus management, not a bit
    lockBit,
    addLog,
    setSyncing,
    setSynced,
    isIOsticAcknowledged
} = useSystemBus();

const proofCode = ref('');
const isSealed = ref(false);
const isProcessing = ref(false);
const isBreached = ref(false);
const decryptionProgress = ref(0);
const MIN_RESOLUTION_TIME = 1500; // Alignment with LoginGate brute-force delay
let processingSource: AudioBufferSourceNode | null = null;
const identityHash = ref<string | null>(null);

watch(isProcessing, (val) => {
    autoFocusActive.value = val;
});

onMounted(async () => {
    // Generate or resolve the Identity Hash from the local mnemonic
    const mnemonic = localStorage.getItem('io_entity_mnemonic');
    if (mnemonic) {
        const msgUint8 = new TextEncoder().encode(mnemonic);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        identityHash.value = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('').substring(0, 32);
    }
});

const shakeIntensity = ref(0);

watch(decryptionProgress, (progress) => {
    if (processingSource) {
        // Dynamically map 0-100 progress to a rising pitch (playbackRate) from 1.0 to 2.5
        // This simulates the node "tuning" into the correct temporal frequency
        processingSource.playbackRate.value = 1.0 + (progress / 100) * 1.5;
    }

    if (progress >= 70 && progress < 100) {
        // Ramp up intensity from 0 to 1 as progress goes from 70 to 100
        shakeIntensity.value = (progress - 70) / 30;
    } else if (progress === 100) {
        shakeIntensity.value = 0; // Stop shaking once sealed
    } else {
        shakeIntensity.value = 0;
    }
});

onUnmounted(() => {
    if (processingSource) processingSource.stop();
    autoFocusActive.value = false; // Reset Focus on teardown
});

const handleInput = () => {
    if (proofCode.value.length === 6) {
        sealIdentity();
    }
};

const sealIdentity = async () => {
    if (isProcessing.value || isSealed.value) return;

    setSyncing(); // Transition global temporal logic to SYNCING state
    addLog("IDENTITY_VAULT: Symmetry Search Initiated", "info");
    isProcessing.value = true;
    isBreached.value = false;
    decryptionProgress.value = 0;

    // Initiate the auditory symmetry search
    const sfx = await playSFX('order');
    if (sfx) {
        processingSource = sfx.source;
        processingSource.loop = true; // Keep the signal alive until locked or purged
    }

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
        if (decryptionProgress.value < 92) {
            decryptionProgress.value += (96 - decryptionProgress.value) * 0.1;
            // No need to manually update shakeIntensity here, the watch will handle it
        }
    }, 50);

    try {
        const vault = localStorage.getItem('io_totp_vault');
        if (!vault) throw new Error("Vault Missing");

        // Use the synchronized access key from parent or fallback to proofCode
        const decryptionKey = props.accessKey || proofCode.value;
        await IopicSecretManager.decryptSeed(vault, decryptionKey);

        // Enforce brute-force delay consistent with the IO Fabric security model
        const elapsed = Date.now() - startTime;
        if (elapsed < MIN_RESOLUTION_TIME) {
            await new Promise(resolve => setTimeout(resolve, MIN_RESOLUTION_TIME - elapsed));
        }

        clearInterval(progressInterval);
        decryptionProgress.value = 100;

        // Terminate the search tone as symmetry is achieved
        if (processingSource) {
            processingSource.stop();
            processingSource = null;
        }

        // Symmetry Validated
        setTimeout(() => {
            isSealed.value = true;
            isProcessing.value = false;
            shakeIntensity.value = 0; // Ensure shake stops on success
            lockBit([4, 5, 6, 7]); // Lock Bits 5-8 (indices 4-7) for Identity Persistence
            setSynced(); // Signal that temporal logic symmetry is LOCKED
            addLog("IDENTITY_VAULT: Symmetry Locked. Threads 5-8 Anchored.", "success", 4);
            playSFX('fulfill');
            console.log("IDENTITY VAULT: Symmetry Locked. Digital Truth Persistent.");
            emit('success', proofCode.value);
        }, 1000);

    } catch (err) {
        // Immediate silence of search tone on asymmetry failure
        if (processingSource) {
            processingSource.stop();
            processingSource = null;
        }
        clearInterval(progressInterval);
        shakeIntensity.value = 0; // Ensure shake stops on failure
        isBreached.value = true;
        playSFX('static'); // Trigger "Data Corruption" sound with animation
        setTimeout(() => { isBreached.value = false; }, 1000);
        addLog("IDENTITY_VAULT: Asymmetry Error. Noise Detected.", "error");
        isProcessing.value = false;
        console.error("IDENTITY VAULT: Asymmetry Error. Noise Detected.");
        triggerGlobalPurge(); // Failed login attempt in IOism is treated as a system breach
    }
};
</script>

<style scoped>
.identity-vault {
    background: #000;
    border: 2px solid #00ff41;
    padding: 1.5rem;
    color: #00ff41;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    max-width: 450px;
    margin: auto;
}

.shadow-glow {
    box-shadow: 0 0 10px #00ff41;
    transition: width 0.2s ease-out;
}

.locked-blue {
    background-color: #007bff !important;
    box-shadow: 0 0 15px #007bff !important;
    filter: none !important;
}

.noise-warn {
    background-color: #ffc107 !important;
    box-shadow: 0 0 10px #ffc107 !important;
    animation: noise-jitter 0.3s infinite ease-in-out;
}

.transition-all {
    transition: all 0.5s ease;
}

.noise-critical {
    background-color: #ff0000 !important;
    box-shadow: 0 0 15px #ff0000 !important;
    animation: noise-jitter 0.15s infinite ease-in-out;
}

@keyframes noise-jitter {

    0%,
    100% {
        transform: translateX(0) scaleY(1);
        opacity: 1;
    }

    25% {
        transform: translateX(-2px) scaleY(1.3);
        opacity: 0.8;
    }

    50% {
        transform: translateX(2px) scaleY(0.7);
        opacity: 0.9;
    }

    75% {
        transform: translateX(-1px) scaleY(1.1);
        opacity: 0.7;
    }
}

.identity-hash {
    letter-spacing: 1px;
    line-height: 1.2;
}

.proof-input {
    background: #111;
    color: #00ff41;
    border: 1px solid #00ff41;
    font-size: 1.5rem;
    letter-spacing: 8px;
    outline: none;
}

.proof-input:focus {
    box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
}

.processing-overlay {
    position: absolute;
    top: 0;
    right: 10px;
    height: 100%;
    display: flex;
    align-items: center;
}

.seal-btn {
    background: transparent;
    border: 1px solid #00ff41;
    color: #00ff41;
    cursor: pointer;
    transition: 0.3s;
}

.seal-btn:hover:not(:disabled) {
    background: #00ff41;
    color: #000;
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
}

.seal-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.glitch-vault {
    text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.tiny {
    font-size: 0.65rem;
}

.break-all {
    word-break: break-all;
}

.sealed {
    border-color: #007bff;
    color: #007bff;
}

.sealed .proof-input {
    border-color: #007bff;
    color: #fff;
    text-shadow: 0 0 10px #007bff;
}

.sealed .seal-btn {
    border-color: #007bff;
    color: #007bff;
}

.purging {
    animation: jitter 0.1s infinite;
    border-color: #ff0000;
}

.animate-slide-down {
    animation: slide-down 0.3s ease-out;
}

@keyframes slide-down {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.purge-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    text-align: center;
}

.purge-text {
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
    text-shadow: 0 0 10px #000;
}

.near-completion-shake {
    animation: subtle-shake calc(0.1s / (var(--shake-intensity) + 0.1)) infinite;
}

@keyframes subtle-shake {
    0% {
        transform: translate(calc(var(--shake-intensity) * 0px), calc(var(--shake-intensity) * 0px));
    }

    15% {
        transform: translate(calc(var(--shake-intensity) * -0.5px), calc(var(--shake-intensity) * 0.5px));
    }

    30% {
        transform: translate(calc(var(--shake-intensity) * 0.5px), calc(var(--shake-intensity) * -0.5px));
    }

    45% {
        transform: translate(calc(var(--shake-intensity) * -0.5px), calc(var(--shake-intensity) * -0.5px));
    }

    60% {
        transform: translate(calc(var(--shake-intensity) * 0.5px), calc(var(--shake-intensity) * 0.5px));
    }

    75% {
        transform: translate(calc(var(--shake-intensity) * -0.5px), calc(var(--shake-intensity) * 0px));
    }

    90% {
        transform: translate(calc(var(--shake-intensity) * 0px), calc(var(--shake-intensity) * -0.5px));
    }

    100% {
        transform: translate(calc(var(--shake-intensity) * 0px), calc(var(--shake-intensity) * 0px));
    }
}


@keyframes jitter {
    0% {
        transform: translate(0, 0);
    }

    50% {
        transform: translate(-2px, 1px);
    }

    100% {
        transform: translate(1px, -2px);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.bit-status-text {
    text-shadow: 0 0 8px #00ff41;
    letter-spacing: 1px;
}
</style>