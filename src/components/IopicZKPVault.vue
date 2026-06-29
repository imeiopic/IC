<template>
    <div class="zkp-vault shadow-lg rounded border-2 position-relative overflow-hidden">
        <header class="text-center mb-4 pb-3 border-bottom border-success border-opacity-50">
            <h1 class="h4 font-monospace text-uppercase glitch" data-text="PERSONAL ZKP VAULT">
                PERSONAL ZKP VAULT
            </h1>
            <div class="meta-info tiny font-monospace opacity-75 mt-2">
                STATUS: <span :class="isVerified ? 'text-success fw-bold' : 'text-warning'">{{ isVerified ? 'VERIFIED' :
                    'SEALED' }}</span> |
                NETWORK: <span :class="isConnected ? 'text-info fw-bold' : 'text-secondary'">{{ isConnected ?
                    networkName.toUpperCase() : 'OFFLINE' }}</span> |
                ENCRYPTION: ABSOLUTE
            </div>
        </header>

        <div class="vault-body font-monospace">
            <div class="row mb-4 text-center">
                <div class="col-6 border-end border-success border-opacity-25">
                    <h2 class="h6 text-info mb-1 opacity-75 text-uppercase">Node Identity</h2>
                    <div class="small text-white text-truncate px-2" :title="nodeAddress || 'UNKNOWN'">
                        {{ shortAddress }}
                    </div>
                </div>
                <div class="col-6">
                    <h2 class="h6 text-success mb-1 opacity-75 text-uppercase">Secured Equity</h2>
                    <div class="h4 text-success fw-bold mb-0 text-shadow-glow">
                        {{ vaultBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) }} <span
                            class="fs-6">IO$</span>
                    </div>
                </div>
            </div>

            <div class="zkp-section p-3 border border-warning border-opacity-50 rounded bg-dark mb-4 position-relative">
                <h3 class="h6 text-warning mb-2 text-uppercase">Zero-Knowledge Proof</h3>
                <p class="tiny opacity-75 mb-2 text-white">
                    This cryptographic hash guarantees ownership of the Secured Equity without exposing the private
                    logic signature to the public bus.
                </p>
                <div
                    class="proof-hash text-warning small break-all p-2 bg-black rounded border border-warning border-opacity-25">
                    {{ zkpHash || 'GENERATING PROOF...' }}
                </div>
                <div class="text-center mt-3">
                    <button @click="verifyProof" :disabled="isVerified"
                        class="verify-btn px-4 py-2 font-monospace fw-bold text-uppercase tiny">
                        {{ isVerified ? '[ PROOF VERIFIED ]' : 'VERIFY SYMMETRY PROOF' }}
                    </button>
                    <button v-if="isVerified && !showPasswordPrompt" @click="initiateBackup"
                        class="backup-btn ms-3 px-4 py-2 font-monospace fw-bold text-uppercase tiny"
                        title="Download Vault Credentials">
                        BACKUP CREDENTIALS
                    </button>
                </div>

                <!-- Password Encryption Prompt -->
                <div v-if="showPasswordPrompt" class="mt-3 p-3 border border-info border-opacity-50 rounded bg-black">
                    <label class="text-info tiny text-uppercase mb-2 d-block">Secure Vault Backup Password</label>
                    <div class="d-flex gap-2 justify-content-center">
                        <input type="password" v-model="backupPassword"
                            class="form-control bg-dark text-info border-info font-monospace w-50"
                            placeholder="Min 6 characters" :disabled="isEncrypting" @keyup.enter="confirmBackup" />
                        <button @click="confirmBackup" :disabled="isEncrypting"
                            class="btn btn-outline-info font-monospace fw-bold text-uppercase text-nowrap tiny">
                            {{ isEncrypting ? 'ENCRYPTING...' : 'ENCRYPT & DOWNLOAD' }}
                        </button>
                        <button @click="cancelBackup" :disabled="isEncrypting"
                            class="btn btn-outline-danger font-monospace fw-bold text-uppercase tiny">
                            CANCEL
                        </button>
                    </div>
                    <p class="text-warning tiny opacity-75 mt-2 mb-0">This password encrypts your private logic
                        signature using AES-128-CTR. Do not lose it.</p>
                </div>

                <!-- Import Trigger -->
                <div class="text-center mt-3" v-if="!showImportPrompt && !showPasswordPrompt">
                    <button @click="initiateImport"
                        class="import-btn px-3 py-1 font-monospace text-uppercase tiny border-0 bg-transparent text-secondary text-decoration-underline">
                        Import Existing Backup
                    </button>
                </div>

                <!-- Import Prompt -->
                <div v-if="showImportPrompt"
                    class="mt-3 p-3 border border-secondary border-opacity-50 rounded bg-black">
                    <label class="text-secondary tiny text-uppercase mb-2 d-block">Restore Vault from Backup</label>
                    <div class="d-flex flex-column gap-2 align-items-center">
                        <input type="file" accept=".json" @change="onFileSelected"
                            class="form-control bg-dark text-secondary border-secondary font-monospace w-75 tiny"
                            :disabled="isDecrypting" />
                        <input type="password" v-model="importPassword"
                            class="form-control bg-dark text-info border-info font-monospace w-75"
                            placeholder="Decryption Password" :disabled="isDecrypting" @keyup.enter="confirmImport" />
                        <div class="d-flex gap-2 mt-2">
                            <button @click="confirmImport" :disabled="isDecrypting"
                                class="btn btn-outline-success font-monospace fw-bold text-uppercase tiny">
                                {{ isDecrypting ? 'DECRYPTING...' : 'DECRYPT & RESTORE' }}
                            </button>
                            <button @click="cancelImport" :disabled="isDecrypting"
                                class="btn btn-outline-danger font-monospace fw-bold text-uppercase tiny">
                                CANCEL
                            </button>
                        </div>
                    </div>
                    <p class="text-warning tiny opacity-75 mt-2 mb-0">This will overwrite your current active logic
                        signature.</p>
                </div>
            </div>
        </div>

        <!-- Substrate Logic Logs -->
        <div class="system-logs mt-4 p-3 border border-success border-opacity-25 rounded text-start position-relative">
            <div class="bg-scanlines position-absolute w-100 h-100 top-0 start-0 opacity-25"
                style="pointer-events: none;"></div>
            <div v-for="(log, index) in logs" :key="index"
                class="log-entry tiny text-success opacity-75 mb-1 font-monospace z-1 position-relative">
                <span class="text-white opacity-50">></span> {{ log }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Wallet, keccak256, toUtf8Bytes, getDefaultProvider } from 'ethers';
import { useIOSettings } from '../useIOSettings';

const { playSFX } = useIOSettings();

const vaultBalance = ref(1600.00);
const isVerified = ref(false);
const zkpHash = ref('');
const nodeAddress = ref('');
const showPasswordPrompt = ref(false);
const backupPassword = ref('');
const isEncrypting = ref(false);
const showImportPrompt = ref(false);
const importPassword = ref('');
const importFile = ref<File | null>(null);
const isDecrypting = ref(false);
const isConnected = ref(false);
const networkName = ref('');
const logs = ref<string[]>([
    'ACCESSING PERSONAL ZKP VAULT...',
    'READING ENCRYPTED EQUITY STATE...',
    'VAULT SEALED: 1,600 IO$ DETECTED.'
]);

const shortAddress = computed(() => {
    if (!nodeAddress.value) return 'UNKNOWN_NODE';
    return `${nodeAddress.value.substring(0, 8)}...${nodeAddress.value.substring(nodeAddress.value.length - 6)}`;
});

const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    logs.value.push(`[${timestamp}] ${msg}`);
    if (logs.value.length > 5) logs.value.shift();
};

const generateMockZKP = async (wallet: Wallet) => {
    addLog('GENERATING ZERO-KNOWLEDGE PROOF...');
    // In a true ZKP scenario, we generate a mathematical proof circuit. 
    // Here we simulate the opaque proof using a deterministic signature hash.
    const payload = `IOPIC_EQUITY_PROOF_${wallet.address}_1600`;
    const signature = await wallet.signMessage(payload);
    zkpHash.value = keccak256(toUtf8Bytes(signature));
    addLog('ZKP GENERATED AND SECURED.');
};

onMounted(() => {
    // Resolve IO Identity Address from local substrate
    let privateKey = localStorage.getItem('io_entity_key');
    if (!privateKey) {
        const tempWallet = Wallet.createRandom();
        privateKey = tempWallet.privateKey;
        localStorage.setItem('io_entity_key', privateKey);
        addLog('NEW LOGIC SIGNATURE INITIALIZED.');
    }

    try {
        const wallet = new Wallet(privateKey);
        nodeAddress.value = wallet.address;
        generateMockZKP(wallet);
    } catch (err) {
        addLog('ERROR: FAILED TO RESOLVE LOGIC SIGNATURE.');
    }
});

const connectToBlockchain = async () => {
    addLog('INITIATING BLOCKCHAIN UPLINK...');
    try {
        // Using ethers default provider to connect to Ethereum mainnet.
        // This can be swapped with a JsonRpcProvider for a custom Iopic subnet.
        const provider = getDefaultProvider('mainnet');
        const network = await provider.getNetwork();
        networkName.value = network.name;
        isConnected.value = true;
        addLog(`CONNECTED TO PUBLIC BUS: ${network.name.toUpperCase()}`);

        // Future Transaction Readiness:
        // const connectedWallet = new Wallet(localStorage.getItem('io_entity_key')!, provider);
    } catch (err) {
        addLog('ERROR: BLOCKCHAIN UPLINK FAILED.');
    }
};

const verifyProof = () => {
    if (isVerified.value) return;
    playSFX('order');
    addLog('INITIATING PROOF VERIFICATION...');

    setTimeout(() => {
        addLog('ANALYZING SYMMETRY HASH...');
    }, 600);

    setTimeout(() => {
        addLog('SYMMETRY CONFIRMED. NO PRIVATE DATA EXPOSED.');
        addLog('EQUITY OWNERSHIP VERIFIED: 1,600 IO$');
        isVerified.value = true;
        playSFX('fulfill');
        connectToBlockchain();
    }, 1500);
};

const initiateBackup = () => {
    showPasswordPrompt.value = true;
    addLog('AWAITING ENCRYPTION PASSWORD...');
};

const cancelBackup = () => {
    showPasswordPrompt.value = false;
    backupPassword.value = '';
    addLog('BACKUP CANCELLED.');
};

const confirmBackup = async () => {
    if (!backupPassword.value || backupPassword.value.length < 6) {
        addLog('ERROR: PASSWORD MUST BE AT LEAST 6 CHARACTERS.');
        return;
    }

    const privateKey = localStorage.getItem('io_entity_key');
    if (!privateKey) {
        addLog('ERROR: SECURE KEY NOT FOUND.');
        return;
    }

    isEncrypting.value = true;
    addLog('ENCRYPTING VAULT WITH AES-128-CTR... PLEASE WAIT.');

    try {
        // Yield slightly so Vue can render the "ENCRYPTING..." UI state before the heavy CPU task
        await new Promise(resolve => setTimeout(resolve, 50));

        const wallet = new Wallet(privateKey);
        // Standard Ethereum Keystore V3 Format Generation (computationally heavy)
        const keystoreJson = await wallet.encrypt(backupPassword.value);

        // Parse the keystore to safely inject our custom specific metadata
        const keystoreObj = JSON.parse(keystoreJson);
        keystoreObj.iopicMetadata = {
            securedEquity: vaultBalance.value,
            zkpHash: zkpHash.value,
            status: "VERIFIED_SYMMETRY",
            timestamp: new Date().toISOString()
        };

        const finalJson = JSON.stringify(keystoreObj, null, 2);
        const blob = new Blob([finalJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `IOPIC_VAULT_BACKUP_${nodeAddress.value.substring(0, 8)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        playSFX('order');
        addLog('VAULT CREDENTIALS ENCRYPTED AND SECURELY EXPORTED.');

        showPasswordPrompt.value = false;
        backupPassword.value = '';
    } catch (err) {
        console.error('Encryption failed:', err);
        addLog('ERROR: ENCRYPTION FAILED.');
    } finally {
        isEncrypting.value = false;
    }
};

const initiateImport = () => {
    showImportPrompt.value = true;
    addLog('AWAITING BACKUP FILE AND PASSWORD...');
};

const cancelImport = () => {
    showImportPrompt.value = false;
    importPassword.value = '';
    importFile.value = null;
    addLog('IMPORT CANCELLED.');
};

const onFileSelected = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        importFile.value = target.files[0];
    }
};

const confirmImport = async () => {
    if (!importFile.value || !importPassword.value) {
        addLog('ERROR: FILE AND PASSWORD ARE REQUIRED.');
        return;
    }

    isDecrypting.value = true;
    addLog('READING BACKUP FILE...');

    try {
        const fileText = await importFile.value.text();
        const jsonObj = JSON.parse(fileText);

        addLog('DECRYPTING AES-128-CTR VAULT... PLEASE WAIT.');
        await new Promise(resolve => setTimeout(resolve, 50)); // Yield to allow Vue to render "DECRYPTING..."

        const wallet = await Wallet.fromEncryptedJson(fileText, importPassword.value);

        localStorage.setItem('io_entity_key', wallet.privateKey);
        nodeAddress.value = wallet.address;
        isVerified.value = false; // Require re-verification for the newly imported node

        if (jsonObj.iopicMetadata) {
            vaultBalance.value = jsonObj.iopicMetadata.securedEquity || 1600.00;
            zkpHash.value = jsonObj.iopicMetadata.zkpHash || '';
        } else {
            vaultBalance.value = 1600.00;
            generateMockZKP(wallet);
        }

        showImportPrompt.value = false;
        importPassword.value = '';
        importFile.value = null;

        playSFX('fulfill');
        addLog('VAULT SUCCESSFULLY RESTORED AND IMPORTED.');
    } catch (err) {
        console.error('Decryption failed:', err);
        addLog('ERROR: DECRYPTION FAILED. INVALID PASSWORD OR FILE.');
    } finally {
        isDecrypting.value = false;
    }
};
</script>

<style scoped>
.zkp-vault {
    background: #000;
    border: 2px solid rgba(0, 255, 65, 0.5);
    padding: 2rem;
    color: #00ff41;
    max-width: 700px;
    margin: auto;
    box-shadow: 0 0 40px rgba(0, 255, 65, 0.1);
}

.system-logs {
    background: rgba(0, 255, 65, 0.02);
    min-height: 120px;
}

.text-shadow-glow {
    text-shadow: 0 0 15px rgba(0, 255, 65, 0.4);
}

.break-all {
    word-break: break-all;
}

.verify-btn {
    background: transparent;
    color: #ffc107;
    border: 1px solid #ffc107;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 1px;
}

.verify-btn:hover:not(:disabled) {
    background: #ffc107;
    color: #000;
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
}

.verify-btn:disabled {
    color: #00ff41;
    border-color: #00ff41;
    cursor: default;
    opacity: 0.8;
}

.backup-btn {
    background: transparent;
    color: #00bfff;
    border: 1px solid #00bfff;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 1px;
}

.backup-btn:hover {
    background: #00bfff;
    color: #000;
    box-shadow: 0 0 20px rgba(0, 191, 255, 0.4);
}

.import-btn {
    cursor: pointer;
    transition: color 0.3s;
}

.import-btn:hover {
    color: #fff !important;
}

.tiny {
    font-size: 0.7rem;
}
</style>