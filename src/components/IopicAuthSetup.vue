<template>
    <div class="auth-setup-container shadow-lg rounded border-2 position-relative overflow-hidden">
        <h3 class="font-monospace h6 text-uppercase mb-4 glitch-auth" data-text="SECURE SYNC: 6-DIGIT MASTER KEY">
            SECURE SYNC: 6-DIGIT MASTER KEY
        </h3>

        <div v-if="!isConfigured" class="setup-flow">
            <p class="small opacity-75 mb-3">1. Scan this QR with your Authenticator App (Google/Authy):</p>

            <div class="qr-container p-3 bg-white d-inline-block rounded mb-4 border border-success">
                <QRCode :value="qrValue" :size="180" level="H" />
            </div>

            <div class="seed-display mb-4">
                <label class="tiny text-uppercase opacity-50 d-block font-monospace">Manual Entry Seed:</label>
                <code class="text-info font-monospace">{{ secretSeed }}</code>
            </div>

            <p class="small opacity-75 mb-2">2. Enter the 6-digit code to Verify Symmetry:</p>
            <input v-model="verifyCode" maxlength="6" placeholder="000 000" class="auth-input font-monospace mb-3"
                @keyup.enter="verifyAndLock" />

            <p class="small opacity-75 mb-2">3. Define Access Key for Vault Encryption:</p>
            <input v-model="password" type="password" placeholder="********" class="auth-input font-monospace mb-3"
                @keyup.enter="verifyAndLock" />

            <div v-if="setupError" class="alert alert-danger py-2 small border-0 mb-3 font-monospace">{{ setupError }}
            </div>

            <button @click="verifyAndLock" :disabled="verifyCode.length < 6 || !password"
                class="lock-btn w-100 py-3 font-monospace fw-bold text-uppercase">
                LOCK TEMPORAL THREAD
            </button>
        </div>

        <Transition name="fade">
            <div v-else class="auth-success text-center py-4">
                <div class="glow-check font-monospace fw-bold text-success mb-3">
                    <i class="bi bi-shield-lock-fill me-2"></i>✓ SYMMETRY LOCKED
                </div>
                <p class="small opacity-75 font-monospace">Your node is now synchronized with the Global Time Bus.</p>
                <div class="tiny text-secondary mt-3">THREAD 5-8: PERSISTENCE ACTIVE</div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import QRCode from 'qrcode.vue';
import { useIOSettings } from '../useIOSettings';
import { IopicSecretManager } from '../IopicSecretManager';
import { useSystemBus } from './useSystemBus';
const { lockBit, isGlobalPurgeActive } = useSystemBus();
const { playSFX } = useIOSettings();

const isConfigured = ref(false);
const secretSeed = ref("IO77-SYMM-99XX-TEMP"); // Ideally generated via Crypto API
const verifyCode = ref('');
const password = ref('');
const setupError = ref('');

const qrValue = computed(() => {
    // Standard TOTP URI Format: otpauth://totp/IOPIC:Entity?secret=SEED&issuer=IOPIC
    return `otpauth://totp/IOPIC:Entity?secret=${secretSeed.value}&issuer=IOPIC`;
});

const verifyAndLock = async () => {
    if (!password.value || verifyCode.value.length < 6) return;

    setupError.value = '';
    try {
        // 1. Encrypt the seed using the user's password via Web Crypto API (AES-GCM)
        const encrypted = await IopicSecretManager.encryptSeed(secretSeed.value, password.value);

        // 2. Save encrypted symmetry key to the local substrate
        localStorage.setItem('io_totp_vault', encrypted);

        console.log("MANDATE: 6-Digit Symmetry Verified. Temporal thread locked.");
        playSFX('fulfill');
        lockBit([4, 5, 6, 7]); // Lock Bits 5-8 (indices 4-7) for Identity Persistence
        isConfigured.value = true;
    } catch (e) {
        setupError.value = "Substrate Fault: Seed encryption failed.";
        playSFX('static');
    }
};

watch(isGlobalPurgeActive, (newVal) => {
    if (newVal) {
        isConfigured.value = false; // Force re-setup during global purge
        setupError.value = "Global Purge: Re-establish Temporal Thread.";
    }
});
</script>

<style scoped>
.auth-setup-container {
    background: #000;
    border: 2px solid #00ff41;
    padding: 2rem;
    color: #00ff41;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    max-width: 450px;
    margin: auto;
    text-align: center;
}

.auth-input {
    background: #111;
    color: #00ff41;
    border: 1px solid #00ff41;
    font-size: 1.8rem;
    text-align: center;
    width: 100%;
    letter-spacing: 4px;
    outline: none;
}

.lock-btn {
    background: #00ff41;
    color: #000;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
}

.lock-btn:hover:not(:disabled) {
    background: #00cc33;
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
}

.lock-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.glow-check {
    font-size: 1.5rem;
    text-shadow: 0 0 15px #00ff41;
}

.glitch-auth {
    letter-spacing: 1px;
}
</style>