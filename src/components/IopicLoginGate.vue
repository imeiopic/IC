<template>
    <div class="login-gate shadow-lg rounded border-2" role="form" aria-label="Identity Access Gateway"
        :class="{ 'purging': isLockedOut, 'logic-distorted': isDistorted }">

        <!-- Accessibility Substrate: ARIA Live Status -->
        <div class="visually-hidden" aria-live="assertive" role="status">
            {{ accessibilityStatus }}
        </div>

        <!-- Matrix Stream Background -->
        <canvas ref="matrixCanvas" class="matrix-bg" v-show="isProcessing || isLockedOut || isReconstructing"
            aria-hidden="true"></canvas>

        <!-- Syncing Scanline Effect -->
        <div v-if="isProcessing" class="scanline-overlay" aria-hidden="true"></div>
        <div v-if="isProcessing" class="scanline" :style="scanlineStyle" aria-hidden="true"></div>

        <div class="gate-content">
            <!-- Recovery Mode UI -->
            <div v-if="isRecovering" class="recovery-mode">
                <label class="font-monospace tiny text-uppercase opacity-75 mb-2 d-block text-warning">
                    Seed Recovery Protocol
                </label>
                <textarea v-model="recoveryMnemonic" class="recovery-textarea font-monospace mb-3 p-2"
                    placeholder="Enter your 12-word mnemonic seed phrase..." rows="3"></textarea>

                <label class="font-monospace tiny text-uppercase opacity-75 mb-2 d-block">
                    Define New Access Key:
                </label>
                <input v-model="newPassword" type="password" class="symmetry-input font-monospace mb-4"
                    placeholder="********" style="font-size: 1.5rem; letter-spacing: 4px;" />

                <div v-if="isProcessing" class="decryption-substrate mb-4">
                    <div class="d-flex justify-content-between font-monospace tiny text-uppercase mb-1">
                        <span class="text-warning">Reconstructing Vault...</span>
                        <span class="text-warning">{{ Math.round(decryptionProgress) }}%</span>
                    </div>
                    <div class="progress bg-black border border-warning border-opacity-50" style="height: 4px;">
                        <div class="progress-bar bg-warning shadow-glow-warning" role="progressbar"
                            aria-label="Vault Reconstruction Progress" :aria-valuenow="Math.round(decryptionProgress)"
                            aria-valuemin="0" aria-valuemax="100" :style="{ width: decryptionProgress + '%' }"></div>
                    </div>
                </div>

                <button v-else @click="handleRecovery"
                    class="btn btn-outline-warning w-100 mb-2 font-monospace tiny fw-bold py-2">
                    RESET VAULT SYMMETRY
                </button>
                <button v-if="!isProcessing" @click="isRecovering = false"
                    class="btn btn-link btn-sm text-secondary text-decoration-none tiny font-monospace w-100">CANCEL</button>
            </div>

            <!-- Standard Login UI -->
            <div v-else>
                <label class="font-monospace tiny text-uppercase opacity-75 mb-2 d-block">
                    Enter Access Key:
                </label>
                <input v-model="password" type="password" class="symmetry-input font-monospace mb-4"
                    placeholder="********" :disabled="isLockedOut" style="font-size: 1.5rem; letter-spacing: 4px;" />

                <!-- Integrated Identity Vault: Replacing standard proof input -->
                <div class="vault-integration mb-4" v-if="!isSymmetrical">
                    <IopicIdentityVault :accessKey="password" @success="handleVaultSuccess" />
                </div>

                <div v-if="isProcessing" class="decryption-substrate mb-4">
                    <div class="d-flex justify-content-between font-monospace tiny text-uppercase mb-1">
                        <span class="text-success">Bus Sync: Deriving Key...</span>
                        <span class="text-success">{{ Math.round(decryptionProgress) }}%</span>
                    </div>
                    <div class="progress bg-black border border-success border-opacity-50" style="height: 4px;">
                        <div class="progress-bar bg-success shadow-glow" role="progressbar"
                            aria-label="Access Key Derivation Progress" :aria-valuenow="Math.round(decryptionProgress)"
                            aria-valuemin="0" aria-valuemax="100" :style="{ width: decryptionProgress + '%' }">
                        </div>
                    </div>
                </div>

                <div v-else class="status-bar font-monospace tiny text-uppercase" role="status"
                    :class="{ 'active': isSymmetrical, 'error': attempts > 0 && !isSymmetrical }">
                    <template v-if="isLockedOut">NOISE DETECTED: PURGING THREADS...</template>
                    <template v-else-if="isSymmetrical">Terminal 10: Logic Sealed</template>
                    <template v-else-if="attempts > 0">Asymmetry Error ({{ attempts }}/3)</template>
                    <template v-else-if="isIOsticAcknowledged" class="bit-active-pulse">BIT 1: ACTIVE</template>
                    <template v-else>Awaiting Logic...</template>
                </div>

                <div class="mt-4 border-top border-secondary pt-3">
                    <a href="#" @click.prevent="isRecovering = true"
                        class="tiny font-monospace text-decoration-none text-info">
                        [ SEED RECOVERY ]
                    </a>
                </div>
            </div>
        </div>

        <!-- Kernel Feedback Overlay during NAND Purge -->
        <div v-if="isLockedOut || isReconstructing" class="kernel-feedback-overlay" aria-hidden="true">
            <div class="kernel-label font-monospace">KERNEL_FEEDBACK:</div>
            <div class="kernel-command font-monospace">{{ kernelCommand }}</div>
            <div class="kernel-hex font-monospace">{{ kernelFeedbackHex }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch } from 'vue';
import { useIOSettings } from '../useIOSettings';
import { IopicSecretManager } from '../IopicSecretManager';
import { useSystemBus } from './useSystemBus'; // Import useSystemBus
import IopicIdentityVault from './IopicIdentityVault.vue';

const { playSFX } = useIOSettings();

const loginCode = ref('');
const password = ref('');
const MIN_RESOLUTION_TIME = 1500; // Minimum 1.5s delay for temporal resolution
const isProcessing = ref(false);
const decryptionProgress = ref(0);
const matrixCanvas = ref<HTMLCanvasElement | null>(null);
let matrixTimer: any = null;
const isRecovering = ref(false);
const recoveryMnemonic = ref('');
const newPassword = ref('');
const isSymmetrical = ref(false);
const attempts = ref(0);
const isLockedOut = ref(false);
const lockoutCount = ref(0);
const currentLockoutDuration = ref(30);
const lockoutTimer = ref(0);
const isDistorted = ref(false);
const isReconstructing = ref(false);
let activeStaticSource: AudioBufferSourceNode | null = null;
let activeStaticGain: GainNode | null = null;
const kernelFeedbackHex = ref('');
const {
    isGlobalPurgeActive,
    isLowPower,
    isScreenReaderDetected,
    isIOsticAcknowledged,
    lockBit,
    setSyncing,
    setSynced
} = useSystemBus(); // Use global system states
const kernelCommand = ref('');

const KERNEL_COMMANDS = [
    "PURGE_BUFFER",
    "RECONSTRUCT_SYMMETRY",
    "RECALIBRATE_THREADS",
    "VERIFY_INTEGRITY",
    "INITIATE_DEFENSE_PROTOCOL"
];

/**
 * Accessibility Substrate: Dynamic status reporting for screen readers.
 */
const accessibilityStatus = computed(() => {
    if (isLockedOut.value) {
        const reportTime = lockoutTimer.value % 10 === 0 || lockoutTimer.value <= 5;
        return `System Breach Lockout: Defense kernel engaged. Access restricted${reportTime ? ` for ${lockoutTimer.value} seconds` : ''}.`;
    }
    if (isReconstructing.value) return "Reconstructing identity symmetry. Please wait.";
    if (isProcessing.value) return "Synchronizing with system bus. Deriving access key.";
    if (isDistorted.value) return "Logic distortion detected. Failure to establish symmetry.";
    if (isSymmetrical.value) return "Identity verified. Terminal 10 logic sealed.";
    if (isRecovering.value) return "Seed recovery protocol active.";
    if (attempts.value > 0) return `Asymmetry error. Login attempt ${attempts.value} of 3.`;
    if (isIOsticAcknowledged.value) return "IOstic realization complete. Bit 1 active.";
    return "Awaiting access key entry.";
});

const scanlineStyle = computed(() => {
    // Velocity increases (duration decreases) as the 16-thread bus resolves the logic
    const duration = 2.5 - (decryptionProgress.value / 100) * 2.2;
    const color = isRecovering.value ? '#ffc107' : '#00ff41';
    return {
        '--scan-duration': `${duration}s`,
        '--scan-color': color
    };
});

const startMatrix = (color = '#00ff41', speed = 50) => {
    const canvas = matrixCanvas.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    const mojibake = "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ$+-*/=%\"'#&_<>[]{}";

    if (matrixTimer) clearInterval(matrixTimer);

    matrixTimer = setInterval(() => {
        ctx.fillStyle = 'rgba(5, 5, 5, 0.15)'; // Trail effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px monospace`;

        // Calculate corruption probability based on lockout progress
        const intensity = isLockedOut.value ? (currentLockoutDuration.value - lockoutTimer.value) / currentLockoutDuration.value : 0;

        for (let i = 0; i < drops.length; i++) {
            // Performance Optimization: Skip alternate columns in Low Power mode
            if (isLowPower.value && i % 2 !== 0) continue;

            // Transition from binary to Mojibake as intensity increases
            const text = (isLockedOut.value && Math.random() < intensity)
                ? mojibake.charAt(Math.floor(Math.random() * mojibake.length))
                : Math.floor(Math.random() * 2).toString();

            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }

        // Adaptive Mode Status Overlay: Displayed during resource throttling
        if (isLowPower.value) {
            ctx.save();
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#00ff41'; // Standard Logic Green
            ctx.textAlign = 'center';
            // Subtle pulsing animation for the warning text
            ctx.globalAlpha = 0.4 + Math.sin(Date.now() * 0.003) * 0.3;
            ctx.fillText('ADAPTIVE MODE ENGAGED', canvas.width / 2, 15);
            ctx.restore();
        }

        // Digital Static Distortion (Intensifies as lockoutTimer approaches zero)
        if (isLockedOut.value) {
            const intensity = (currentLockoutDuration.value - lockoutTimer.value) / currentLockoutDuration.value; // Scales 0 to 1 as timer drops
            const noiseAmount = Math.floor(intensity * 2000);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + intensity * 0.2})`;
            for (let j = 0; j < noiseAmount; j++) {
                ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
            }
            // Occasional horizontal glitch bars
            if (Math.random() < intensity * 0.5) {
                ctx.fillStyle = `rgba(255, 0, 0, ${0.1 + 0.3 * intensity})`;
                const glitchY = Math.random() * canvas.height;
                const glitchHeight = Math.random() * 2 + 1;
                ctx.fillRect(0, glitchY, canvas.width, glitchHeight);
            }
        }
    }, speed);
};

watch([isProcessing, isLockedOut, isReconstructing, isLowPower, isScreenReaderDetected], ([proc, lock, recon, lp, sr]) => {
    // If a screen reader is detected, we kill the background matrix animation entirely to keep the CPU quiet
    if ((proc || lock || recon) && !sr) {
        // Calculate speed: 50ms default (20fps), slowed to 100ms in LP mode
        const baseSpeed = lock ? 30 : 50;
        const speed = lp ? baseSpeed * 2 : baseSpeed;
        nextTick(() => startMatrix(lock ? '#ff0000' : '#00ff41', speed));
    } else {
        if (matrixTimer) clearInterval(matrixTimer);
        matrixTimer = null;
    }
});

const startSimulation = () => {
    isProcessing.value = true;
    decryptionProgress.value = 0;

    return setInterval(() => {
        if (decryptionProgress.value < 90) {
            decryptionProgress.value += (95 - decryptionProgress.value) * 0.1;
        }
    }, 50);
};

const stopSimulation = (interval: any) => {
    clearInterval(interval);
    if (matrixTimer) clearInterval(matrixTimer);
    decryptionProgress.value = 100;
    setTimeout(() => {
        isProcessing.value = false;
        decryptionProgress.value = 0;
    }, 400);
};

const handleVaultSuccess = (code: string) => {
    loginCode.value = code;
    checkSymmetry();
};

const checkSymmetry = async () => {
    if (isProcessing.value) return;

    if (loginCode.value.length === 6 && password.value) {
        const vault = localStorage.getItem('io_totp_vault');
        if (!vault) {
            handleFailure();
            return;
        }

        setSyncing(); // Transition global temporal logic to SYNCING state
        const startTime = Date.now();
        const interval = startSimulation();
        try {
            // Decrypting the vault verifies the Access Key symmetry
            await IopicSecretManager.decryptSeed(vault, password.value);

            // Terminal 10: Logic Sealed
            isSymmetrical.value = true;
            attempts.value = 0;
            lockoutCount.value = 0; // Reset backoff on successful synchronization
            lockBit([4, 5, 6, 7]); // Lock Bits 5-8 (indices 4-7) for Identity Persistence
            setSynced(); // Signal that temporal logic symmetry is LOCKED
            playSFX('fulfill');
            console.log("BUS SYNC: Identity Authenticated.");
        } catch (error) {
            handleFailure();
        } finally {
            // Enforce a brute-force delay tied to the temporal logic of the bus
            const elapsed = Date.now() - startTime;
            if (elapsed < MIN_RESOLUTION_TIME) {
                await new Promise(resolve => setTimeout(resolve, MIN_RESOLUTION_TIME - elapsed));
            }
            stopSimulation(interval);
        }
    }
};

const handleRecovery = async () => {
    const storedMnemonic = localStorage.getItem('io_entity_mnemonic');

    // Normalize and compare mnemonic symmetry
    if (recoveryMnemonic.value.trim().toLowerCase() === storedMnemonic?.trim().toLowerCase()) {
        setSyncing(); // Transition global temporal logic to SYNCING state
        const interval = startSimulation();
        try {
            // Reconstruct the vault using the recovery seed and new password
            const recoverySeed = "IO77-SYMM-99XX-TEMP";
            const encrypted = await IopicSecretManager.encryptSeed(recoverySeed, newPassword.value);
            localStorage.setItem('io_totp_vault', encrypted);

            isRecovering.value = false;
            password.value = newPassword.value;
            recoveryMnemonic.value = '';
            newPassword.value = '';
            lockoutCount.value = 0; // Reset backoff on successful recovery
            lockBit([4, 5, 6, 7]); // Lock Bits 5-8 (indices 4-7) for Identity Persistence
            setSynced(); // Signal that temporal logic symmetry is LOCKED

            playSFX('fulfill');
            console.log("RECOVERY: Vault logic reconstructed via Mnemonic Symmetry.");
        } catch (error) {
            playSFX('static');
        } finally {
            stopSimulation(interval);
        }
    } else {
        handleFailure();
    }
};

const handleFailure = () => {
    attempts.value++;
    loginCode.value = '';
    playSFX('static');

    // Trigger Logic Distortion warp
    isDistorted.value = true;
    setTimeout(() => {
        isDistorted.value = false;
    }, 500);

    if (attempts.value >= 3) {
        triggerNandPurge();
    }
};

const triggerNandPurge = async () => {
    isLockedOut.value = true;

    // Exponential Backoff: 30s, 60s, 120s... max 1 hour (3600s)
    currentLockoutDuration.value = Math.min(30 * Math.pow(2, lockoutCount.value), 3600);
    lockoutTimer.value = currentLockoutDuration.value;
    lockoutCount.value++;

    console.error("NOISE DETECTED: Active Defense Kernel engaged.");

    const sfx = await playSFX('static');
    if (sfx) {
        activeStaticSource = sfx.source;
        activeStaticGain = sfx.gain ?? null;
        activeStaticSource.loop = true;
    } else {
        activeStaticSource = null;
        activeStaticGain = null;
    }

    const hexInterval = setInterval(() => {
        kernelFeedbackHex.value = Array.from({ length: 24 }, () =>
            Math.floor(Math.random() * 16).toString(16).toUpperCase()
        ).join('');
    }, 80);

    const commandInterval = setInterval(() => {
        kernelCommand.value = KERNEL_COMMANDS[Math.floor(Math.random() * KERNEL_COMMANDS.length)];
    }, 200);

    const interval = setInterval(() => {
        lockoutTimer.value--;
        if (lockoutTimer.value <= 0) {
            clearInterval(interval);
            clearInterval(hexInterval);
            clearInterval(commandInterval);

            // Initiate Reconstruction Sequence
            isLockedOut.value = false;
            isReconstructing.value = true;
            kernelFeedbackHex.value = '';
            kernelCommand.value = 'RECONSTRUCTING_SYMMETRY';
            attempts.value = 0;

            setTimeout(() => {
                isReconstructing.value = false;
                kernelCommand.value = '';
            }, 2000);

            if (activeStaticSource) activeStaticSource.stop();
            activeStaticSource = null;
            activeStaticGain = null;
        }
    }, 1000);
};
</script>

<style scoped>
.login-gate {
    background: #050505;
    border: 2px solid #00ff41;
    padding: 2.5rem;
    text-align: center;
    max-width: 400px;
    margin: auto;
    position: relative;
    overflow: hidden;
}

.symmetry-input {
    font-size: 2.5rem;
    background: transparent;
    border: none;
    border-bottom: 2px solid #00ff41;
    color: #00ff41;
    width: 100%;
    text-align: center;
    letter-spacing: 12px;
    outline: none;
    transition: all 0.3s;
}

.scanline-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%);
    background-size: 100% 4px;
    z-index: 1;
    pointer-events: none;
    opacity: 0.5;
}

.scanline {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--scan-color);
    box-shadow: 0 0 20px var(--scan-color);
    z-index: 2;
    pointer-events: none;
    animation: scanline-move var(--scan-duration) linear infinite;
}

@keyframes scanline-move {
    0% {
        top: 0;
        opacity: 0;
        filter: brightness(1);
    }

    10% {
        opacity: 1;
    }

    50% {
        filter: brightness(2);
    }

    90% {
        opacity: 1;
    }

    100% {
        top: 100%;
        opacity: 0;
        filter: brightness(1);
    }
}

.matrix-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    opacity: 0.4;
}

.gate-content {
    position: relative;
    z-index: 1;
}

.recovery-textarea {
    background: #111;
    color: #ffc107;
    border: 1px solid #ffc107;
    width: 100%;
    outline: none;
    resize: none;
}

.shadow-glow {
    box-shadow: 0 0 10px #00ff41;
}

.shadow-glow-warning {
    box-shadow: 0 0 10px #ffc107;
}

.status-bar {
    margin-top: 20px;
    opacity: 0.5;
    transition: all 0.3s;
}

.active {
    opacity: 1;
    color: #fff;
    text-shadow: 0 0 10px #00ff41;
}

.error {
    color: #ff0000;
    opacity: 1;
}

.bit-active-pulse {
    color: #00ff41;
    opacity: 1;
    text-shadow: 0 0 10px #00ff41;
    animation: bit-pulse 1.5s infinite ease-in-out;
}

@keyframes bit-pulse {

    0%,
    100% {
        text-shadow: 0 0 10px #00ff41;
    }

    50% {
        text-shadow: 0 0 20px #00ff41, 0 0 30px rgba(0, 255, 65, 0.5);
    }
}

.purging {
    animation: glitch-shake 0.1s infinite;
    border-color: #ff0000;
}

@keyframes glitch-shake {
    0% {
        transform: translate(1px, 1px);
    }

    100% {
        transform: translate(-1px, -1px);
    }
}

.logic-distorted {
    animation: logic-warp 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95);
    z-index: 10;
}

.logic-distorted .matrix-bg {
    animation: matrix-warp 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95);
}

@keyframes logic-warp {
    0% {
        transform: perspective(1000px) rotateX(0) rotateY(0) scale(1) skew(0);
        filter: hue-rotate(0deg) blur(0);
    }

    25% {
        transform: perspective(1000px) rotateX(15deg) rotateY(-10deg) scale(1.1) skew(5deg);
        filter: hue-rotate(90deg) blur(2px) contrast(1.5);
    }

    50% {
        transform: perspective(1000px) rotateX(-20deg) rotateY(20deg) scale(0.9) skew(-10deg);
        filter: hue-rotate(180deg) blur(5px) invert(0.2);
    }

    75% {
        transform: perspective(1000px) rotateX(10deg) rotateY(-5deg) scale(1.05) skew(2deg);
        filter: hue-rotate(270deg) blur(1px) saturate(2);
    }

    100% {
        transform: perspective(1000px) rotateX(0) rotateY(0) scale(1) skew(0);
        filter: hue-rotate(360deg) blur(0);
    }
}

@keyframes matrix-warp {
    0% {
        transform: skew(0) scale(1);
    }

    25% {
        transform: skew(15deg, 10deg) scale(1.4);
    }

    50% {
        transform: skew(-30deg, -20deg) scale(1.8);
    }

    75% {
        transform: skew(10deg, 5deg) scale(1.3);
    }

    100% {
        transform: skew(0) scale(1);
    }
}

.kernel-feedback-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: rgba(255, 0, 0, 0.2);
    padding: 4px 10px;
    display: flex;
    justify-content: space-between;
    z-index: 10;
    pointer-events: none;
    border-top: 1px solid rgba(255, 0, 0, 0.5);
    backdrop-filter: blur(2px);
}

.kernel-label {
    color: #ff0000;
    font-size: 0.6rem;
    font-weight: bold;
    letter-spacing: 1px;
}

.kernel-hex {
    color: #ff0000;
    font-size: 0.65rem;
    text-shadow: 0 0 5px #f00;
}

.kernel-command {
    color: #ffc107;
    /* Warning yellow for commands */
    font-size: 0.6rem;
    font-weight: bold;
    letter-spacing: 1px;
}
</style>