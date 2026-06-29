<template>
    <div class="proof-validator-substrate">
        <div class="drop-zone border-2" :class="{ 'dragging': isDragging, 'has-result': !!validationResult }"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">

            <div v-if="!validationResult" class="drop-prompt text-center py-5">
                <i class="bi bi-file-earmark-code display-4 opacity-50 mb-3"></i>
                <p class="font-monospace text-uppercase small opacity-75">Drop .json proof to verify symmetry</p>
            </div>

            <Transition name="fade">
                <div v-if="validationResult"
                    :class="['validation-output p-4 rounded', (validationResult.valid && validationResult.timestampValid) ? 'valid' : 'invalid']">

                    <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
                        <i
                            :class="['bi fs-2', (validationResult.valid && validationResult.timestampValid) ? 'bi-shield-check' : 'bi-shield-exclamation']"></i>
                        <h4 class="mb-0 font-monospace text-uppercase fs-5">
                            {{ (validationResult.valid && validationResult.timestampValid) ? 'Logical Truth Verified' :
                                'Verification Failure' }}
                        </h4>
                        <span v-if="validationResult.type" class="badge rounded-pill font-monospace"
                            :class="validationResult.type === 'Charter' ? 'bg-warning text-dark' : 'bg-info text-dark'"
                            style="font-size: 0.65rem; letter-spacing: 1px;">
                            <i
                                :class="['bi me-1', validationResult.type === 'Charter' ? 'bi-book' : 'bi-shield-lock']"></i>
                            {{ validationResult.type }}
                        </span>
                    </div>

                    <div
                        class="verification-details small mb-4 bg-black bg-opacity-20 p-3 rounded border border-white border-opacity-10 font-monospace">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <i
                                :class="['bi', validationResult.valid ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger']"></i>
                            <span>Signature Check: {{ validationResult.valid ? 'SYMMETRICAL' : 'BREACHED' }}</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <i
                                :class="['bi', validationResult.timestampValid ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger']"></i>
                            <span>Temporal Logic: {{ validationResult.timestampNearExpiration ? 'DEGRADING' :
                                (validationResult.timestampValid ? 'SYNCHRONIZED' : 'ASYMMETRICAL') }}</span>
                        </div>
                        <div class="mb-2 opacity-75">SIGNER: <span class="text-info break-all">{{
                            validationResult.address }}</span></div>
                        <div v-if="validationResult.vreId" class="mb-2 opacity-75 text-uppercase">VRE ID: <span
                                class="text-warning">{{
                                    validationResult.vreId }}</span></div>
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-fingerprint"></i>
                            <span class="break-all opacity-75">Hash: {{ validationResult.verificationHash }}</span>
                        </div>
                    </div>

                    <!-- Hash Comparison Utility -->
                    <div class="comparison-utility mb-4 pt-3 border-top border-white border-opacity-10">
                        <div class="d-flex justify-content-between align-items-end mb-2">
                            <label class="tiny text-uppercase opacity-75 font-monospace">Compare Logic
                                Fingerprint</label>
                            <div class="d-flex gap-2">
                                <button @click="isVisualDiff = !isVisualDiff" class="btn-link-logic"
                                    :class="{ 'active': isVisualDiff }">
                                    [{{ isVisualDiff ? 'Disable Diff' : 'Visual Diff' }}]
                                </button>
                                <button v-if="isVisualDiff" @click="isXorMode = !isXorMode" class="btn-link-logic"
                                    :class="{ 'active': isXorMode }">
                                    [{{ isXorMode ? 'Hide XOR' : 'Bitwise XOR' }}]
                                </button>
                            </div>
                        </div>
                        <input v-model="comparisonHash" type="text"
                            class="form-control bg-black text-white border-secondary tiny font-monospace shadow-none mb-2"
                            placeholder="Paste external hash...">

                        <div v-if="isVisualDiff && comparisonHash"
                            class="diff-viewer p-2 bg-black rounded font-monospace tiny border border-white border-opacity-10 break-all">
                            <span v-for="(item, idx) in visualDiff" :key="idx"
                                :class="item.isMatch ? 'text-success' : 'text-danger bg-danger bg-opacity-10 fw-bold'"
                                :title="!item.isMatch ? `Truth Index ${idx}: ${item.expected}` : ''">
                                {{ (isXorMode && item.xor) ? item.xor : item.char }}
                            </span>
                        </div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                        <button @click="isExpanded = !isExpanded"
                            class="btn btn-sm btn-outline-light font-monospace tiny px-3">
                            {{ isExpanded ? '[ - ] COLLAPSE INSPECTOR' : '[ + ] EXPAND INSPECTOR' }}
                        </button>
                        <button @click="reset"
                            class="btn btn-sm btn-link text-white opacity-50 text-decoration-none tiny font-monospace">CLEAR
                            LOGIC</button>
                    </div>
                </div>
            </Transition>
        </div>

        <!-- Advanced Payload Inspector -->
        <div v-if="validationResult && isExpanded" class="payload-inspector-container mt-3 animate-slide-down">
            <div
                class="inspector-header d-flex justify-content-between align-items-center p-2 bg-dark border border-secondary border-bottom-0 rounded-top">
                <h5 class="tiny text-uppercase opacity-75 mb-0 font-monospace ms-2">Raw Payload Inspector</h5>
                <div class="d-flex align-items-center gap-2">
                    <div
                        class="search-substrate bg-black rounded px-2 d-flex align-items-center border border-secondary">
                        <input v-model="searchQuery" type="text" class="search-input tiny font-monospace"
                            placeholder="Filter logic..." @keydown.up.prevent="prevMatch"
                            @keydown.down.prevent="nextMatch" @keydown.enter.exact.prevent="nextMatch" />
                        <span v-if="searchQuery" class="match-indicator text-warning tiny font-monospace ms-2">{{
                            currentMatchIndex + 1 }}/{{ matchCount }}</span>
                    </div>
                    <button @click="copyPayload" class="btn-inspector" :class="{ 'text-success': payloadCopied }">
                        <i :class="['bi', payloadCopied ? 'bi-check-lg' : 'bi-clipboard']"></i>
                    </button>
                    <button @click="isPretty = !isPretty" class="btn-inspector" title="Toggle Format">
                        <i :class="['bi', isPretty ? 'bi-text-indent-left' : 'bi-text-paragraph']"></i>
                    </button>
                    <button @click="downloadVerifiedJson" class="btn-inspector" title="Download Verified">
                        <i class="bi bi-file-earmark-arrow-down"></i>
                    </button>
                </div>
            </div>
            <pre class="payload-view font-monospace p-3 rounded-bottom border border-secondary"
                v-html="highlightedPayload"></pre>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { verifyMessage } from 'ethers';
import { useIOSettings } from '../useIOSettings';

const { playSFX } = useIOSettings();

const isDragging = ref(false);
const validationResult = ref<any>(null);
const isExpanded = ref(false);
const isPretty = ref(true);
const isVisualDiff = ref(false);
const isXorMode = ref(false);
const comparisonHash = ref('');
const searchQuery = ref('');
const currentMatchIndex = ref(-1);
const payloadCopied = ref(false);

const reset = () => {
    validationResult.value = null;
    comparisonHash.value = '';
    searchQuery.value = '';
    isExpanded.value = false;
};

const handleDrop = (event: DragEvent) => {
    isDragging.value = false;
    const file = event.dataTransfer?.files[0];
    if (!file || !file.name.endsWith('.json')) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);
            if (!json.header || !json.payload) throw new Error("Invalid Format");

            // Fingerprinting
            const msgUint8 = new TextEncoder().encode(JSON.stringify(json.payload));
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const payloadHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

            // Verification
            const recoveredAddress = verifyMessage(JSON.stringify(json.payload), json.header.signature);
            const isValid = recoveredAddress.toLowerCase() === json.header.signerAddress.toLowerCase();

            // Temporal Analysis
            const proofTime = new Date(json.header.timestamp).getTime();
            const now = Date.now();
            const isTimestampValid = Math.abs(now - proofTime) < (24 * 60 * 60 * 1000);

            const type = json.header.io === 'IOPIC-CHARTER-v1' ? 'Charter' : 'Bond';

            validationResult.value = {
                valid: isValid,
                address: recoveredAddress,
                timestamp: json.header.timestamp,
                payload: json.payload,
                timestampValid: isTimestampValid,
                type,
                verificationHash: payloadHash,
                vreId: json.bond?.vreId || json.payload?.vreId || json.vreId
            };

            isExpanded.value = type === 'Bond';
            if (type === 'Bond' && json.bond?.id) searchQuery.value = json.bond.id;

            playSFX(isValid && isTimestampValid ? 'fulfill' : 'static');
        } catch (err) {
            playSFX('static');
            console.error("[Audit] Substrate Verification Failed:", err);
        }
    };
    reader.readAsText(file);
};

const visualDiff = computed(() => {
    const truth = validationResult.value?.verificationHash || '';
    const input = comparisonHash.value.trim();
    if (!input) return [];
    const result = [];
    const maxLength = Math.max(truth.length, input.length);
    for (let i = 0; i < maxLength; i++) {
        const tChar = truth[i] || '';
        const iChar = input[i] || '';
        const isMatch = tChar.toLowerCase() === iChar.toLowerCase();
        result.push({
            char: iChar || '_',
            isMatch,
            expected: tChar,
            xor: (!isMatch && tChar && iChar) ? (tChar.charCodeAt(0) ^ iChar.charCodeAt(0)).toString(16).toUpperCase().padStart(2, '0') : null
        });
    }
    return result;
});

const highlightedPayload = computed(() => {
    if (!validationResult.value?.payload) return '';
    const text = isPretty.value ? JSON.stringify(validationResult.value.payload, null, 2) : JSON.stringify(validationResult.value.payload);
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (!searchQuery.value.trim()) return escaped;
    const regex = new RegExp(`(${searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    let i = 0;
    return escaped.replace(regex, (m) => `<mark id="match-${i}" class="json-match ${i++ === currentMatchIndex.value ? 'current-match' : ''}">${m}</mark>`);
});

const matchCount = computed(() => (highlightedPayload.value.match(/class="json-match/g) || []).length);

const nextMatch = () => { if (matchCount.value) { currentMatchIndex.value = (currentMatchIndex.value + 1) % matchCount.value; scroll(); } };
const prevMatch = () => { if (matchCount.value) { currentMatchIndex.value = (currentMatchIndex.value - 1 + matchCount.value) % matchCount.value; scroll(); } };
const scroll = () => nextTick(() => document.getElementById(`match-${currentMatchIndex.value}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));

watch([searchQuery, isPretty], () => { currentMatchIndex.value = -1; });

const copyPayload = async () => {
    await navigator.clipboard.writeText(JSON.stringify(validationResult.value.payload, null, 2));
    payloadCopied.value = true;
    setTimeout(() => payloadCopied.value = false, 2000);
};

const downloadVerifiedJson = () => {
    const blob = new Blob([JSON.stringify(validationResult.value.payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `verified_proof_${Date.now()}.json`;
    link.click();
};
</script>

<style scoped>
.drop-zone {
    background: #0a0a0a;
    border: 2px dashed rgba(0, 255, 65, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px;
}

.drop-zone.dragging {
    border-color: #00ff41;
    background: rgba(0, 255, 65, 0.05);
    transform: scale(1.01);
}

.drop-zone.has-result {
    border-style: solid;
    border-color: rgba(255, 255, 255, 0.1);
    background: #000;
}

.validation-output.valid {
    border: 1px solid #198754;
    box-shadow: inset 0 0 20px rgba(25, 135, 84, 0.1);
}

.validation-output.invalid {
    border: 1px solid #dc3545;
    box-shadow: inset 0 0 20px rgba(220, 53, 69, 0.1);
}

.btn-link-logic {
    background: transparent;
    border: none;
    font-family: monospace;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-link-logic:hover,
.btn-link-logic.active {
    color: #00ff41;
    opacity: 1;
}

.payload-view {
    background: #050505;
    color: #00ff41;
    font-size: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
    white-space: pre-wrap;
}

.btn-inspector {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    padding: 4px 8px;
    cursor: pointer;
    transition: color 0.2s;
}

.btn-inspector:hover {
    color: #00ff41;
}

.search-input {
    background: transparent;
    border: none;
    color: white;
    outline: none;
    width: 120px;
}

:deep(.json-match) {
    background: rgba(255, 193, 7, 0.4);
    color: #fff;
}

:deep(.current-match) {
    background: #00ff41 !important;
    color: #000 !important;
    box-shadow: 0 0 10px #00ff41;
}

.tiny {
    font-size: 0.65rem;
}

.break-all {
    word-break: break-all;
}

.fade-enter-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from {
    opacity: 0;
}

.animate-slide-down {
    animation: slide-down 0.4s cubic-bezier(0, 1, 0, 1);
}

@keyframes slide-down {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>