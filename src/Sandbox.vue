<template>
    <!-- Safety Guard: Only render content if in DEV mode -->
    <div v-if="isDev" class="sandbox-container">
        <nav class="sandbox-nav">
            <h1>Component Sandbox</h1>
            <div class="sandbox-controls">
                <!-- Use this area to add toggles or inputs to test your component props -->
                <label>
                    Mock Data:
                    <input v-model="mockValue" type="text" placeholder="Change prop value..." />
                </label>
            </div>
        </nav>

        <main class="sandbox-preview">
            <!-- Testing the Iopic Handshake Protocol Logic Layer -->
            <IopicHandshake @success="logEvent" />
        </main>

        <!-- Proof Validation Substrate (Drag & Drop) -->
        <section class="proof-validator mt-5 text-center">
            <h3>Audit Proof Validator Substrate</h3>
            <div class="mx-auto" style="max-width: 800px;">
                <IopicAuditValidator />
            </div>
        </section>

        <footer v-if="eventLogs.length" class="sandbox-logs">
            <h3>Event Logger</h3>
            <ul>
                <li v-for="(log, index) in eventLogs" :key="index">
                    <span class="timestamp">[{{ log.time }}]</span> {{ log.message }}
                </li>
            </ul>
        </footer>
    </div>
    <div v-else class="p-5 text-center">
        <h3>404 - Not Found</h3>
        <router-link to="/">Return Home</router-link>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import { verifyMessage } from 'ethers';
// Update this path to the component you are currently building
import IopicHandshake from './components/IopicHandshake.vue';

const isDev = import.meta.env.DEV;

const mockValue = ref('Hello Sandbox');
const eventLogs = ref<{ time: string, message: string }[]>([]);
const isDragging = ref(false);
const validationResult = ref<{ valid: boolean; address: string; timestamp: string; payload?: any; timestampValid: boolean; timestampNearExpiration: boolean; timeRemaining?: string; type?: 'Charter' | 'Bond' | 'Unknown' } | null>(null);
const isPretty = ref(true);
const searchQuery = ref('');
const isCaseSensitive = ref(false);
const isRegex = ref(false);
const isExpanded = ref(false);
const hashCopied = ref(false);
const currentMatchIndex = ref(-1);
const isXorMode = ref(false);
const isVisualDiff = ref(false);
const comparisonHash = ref('');
const payloadCopied = ref(false);

const highlightedPayload = computed(() => {
    if (!validationResult.value?.payload) return '';

    const jsonStr = isPretty.value
        ? JSON.stringify(validationResult.value.payload, null, 2)
        : JSON.stringify(validationResult.value.payload);

    // Escape HTML special characters to prevent XSS and formatting issues
    let text = jsonStr
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    if (!searchQuery.value.trim()) return text;

    try {
        const flags = isCaseSensitive.value ? 'g' : 'gi';
        let pattern = searchQuery.value;
        if (!isRegex.value) {
            // Escape regex special characters in search query and highlight matches
            pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        const regex = new RegExp(`(${pattern})`, flags);
        let index = 0;
        return text.replace(regex, (match) => {
            const isActive = index === currentMatchIndex.value;
            const className = isActive ? 'json-match current-match' : 'json-match';
            const result = `<mark id="match-${index}" class="${className}">${match}</mark>`;
            index++;
            return result;
        });
    } catch (e) {
        // If regex is invalid, just return the escaped text
        return text;
    }
});

/**
 * Match Count: Calculates the number of occurrences of the search query in the formatted JSON.
 */
const matchCount = computed(() => {
    if (!searchQuery.value.trim() || !validationResult.value?.payload) return 0;

    const jsonStr = isPretty.value
        ? JSON.stringify(validationResult.value.payload, null, 2)
        : JSON.stringify(validationResult.value.payload);

    try {
        const flags = isCaseSensitive.value ? 'g' : 'gi';
        let pattern = searchQuery.value;
        if (!isRegex.value) {
            pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        const regex = new RegExp(pattern, flags);

        // Calculating matches against the raw string for intuitive results
        const matches = jsonStr.match(regex);
        return matches ? matches.length : 0;
    } catch (e) {
        return 0;
    }
});

const scrollToCurrentMatch = () => {
    nextTick(() => {
        const el = document.getElementById(`match-${currentMatchIndex.value}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
};

const nextMatch = () => {
    if (matchCount.value === 0) return;
    currentMatchIndex.value = (currentMatchIndex.value + 1) % matchCount.value;
    scrollToCurrentMatch();
};

const prevMatch = () => {
    if (matchCount.value === 0) return;
    currentMatchIndex.value = (currentMatchIndex.value - 1 + matchCount.value) % matchCount.value;
    scrollToCurrentMatch();
};

const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
    if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);

    return parts.join(' ');
};


watch([searchQuery, isPretty, isCaseSensitive, isRegex, isXorMode], () => {
    currentMatchIndex.value = -1;
});

const copyHash = async () => {
    if (!validationResult.value?.verificationHash) return;
    try {
        await navigator.clipboard.writeText(validationResult.value.verificationHash);
        hashCopied.value = true;
        setTimeout(() => { hashCopied.value = false; }, 2000);
    } catch (err) {
        console.error('Failed to copy hash:', err);
    }
};

const copyPayload = async () => {
    if (!validationResult.value?.payload) return;
    try {
        await navigator.clipboard.writeText(JSON.stringify(validationResult.value.payload, null, 2));
        payloadCopied.value = true;
        setTimeout(() => { payloadCopied.value = false; }, 2000);
    } catch (err) {
        console.error('Failed to copy payload:', err);
    }
};

const downloadVerifiedJson = () => {
    if (!validationResult.value?.payload) return;
    const blob = new Blob([JSON.stringify(validationResult.value.payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verified_payload_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const logEvent = (payload: any) => {
    const time = new Date().toLocaleTimeString();
    eventLogs.value.unshift({ time, message: `Captured event with payload: ${JSON.stringify(payload)}` });
};

const handleDrop = (event: DragEvent) => {
    isDragging.value = false;
    const file = event.dataTransfer?.files[0];
    if (!file || !file.name.endsWith('.json')) return;

    comparisonHash.value = ''; // Clear previous comparison hash
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);
            if (!json.header || !json.payload) throw new Error("Invalid format");

            // Generate SHA-256 fingerprint of the raw payload
            const msgUint8 = new TextEncoder().encode(JSON.stringify(json.payload));
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const payloadHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Verify signature against payload using the same logic as IopicCharter export
            const message = JSON.stringify(json.payload);
            const recoveredAddress = verifyMessage(message, json.header.signature);

            const isValid = recoveredAddress.toLowerCase() === json.header.signerAddress.toLowerCase();

            // Temporal Logic: Check if timestamp is within a 24-hour range
            const proofTime = new Date(json.header.timestamp).getTime();
            const now = Date.now();
            const validTolerance = 24 * 60 * 60 * 1000; // 24-hour threshold
            const nearExpirationThreshold = 1 * 60 * 60 * 1000; // 1 hour before 24h limit

            const timeDifference = Math.abs(now - proofTime);
            const isTimestampValid = !isNaN(proofTime) && timeDifference < validTolerance;
            const isTimestampNearExpiration = isTimestampValid && timeDifference >= (validTolerance - nearExpirationThreshold);

            const payloadType = json.header.io === 'IOPIC-CHARTER-v1' ? 'Charter' :
                json.header.io === 'IOPIC-IDEAL-v1' ? 'Bond' : 'Unknown';

            if (payloadType === 'Bond' && json.bond?.id) {
                searchQuery.value = json.bond.id;
            }

            isExpanded.value = payloadType === 'Bond';

            validationResult.value = {
                valid: isValid,
                address: recoveredAddress,
                timestamp: json.header.timestamp,
                payload: json.payload,
                timestampValid: isTimestampValid,
                timestampNearExpiration: isTimestampNearExpiration,
                timeRemaining: isTimestampNearExpiration ? formatDuration(validTolerance - timeDifference) : undefined,
                type: payloadType,
                verificationHash: payloadHash
            };

            logEvent({
                valid: isValid,
                signer: recoveredAddress
            });
        } catch (err) {
            console.error("Validation failed:", err);
            alert("Failed to parse or verify the JSON proof. Ensure it is a valid IOPIC signed export.");
        }
    };
    reader.readAsText(file);
};
</script>

<style scoped>
.sandbox-container {
    padding: 2rem;
    font-family: sans-serif;
    background: #fdfdfd;
    min-height: 100vh;
}

.sandbox-nav {
    border-bottom: 2px solid #eee;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
}

.sandbox-controls {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
}

.sandbox-preview {
    border: 1px dashed #ccc;
    padding: 3rem;
    background: white;
    display: flex;
    justify-content: center;
}

.sandbox-logs {
    margin-top: 2rem;
    background: #1e1e1e;
    color: #4af626;
    padding: 1rem;
    border-radius: 8px;
    font-family: monospace;
    max-height: 200px;
    overflow-y: auto;
}

.sandbox-logs ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.timestamp {
    color: #888;
    margin-right: 0.5rem;
}

h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
}

h3 {
    font-size: 0.9rem;
    margin-top: 0;
    text-transform: uppercase;
    color: #888;
}

input {
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.proof-validator {
    max-width: 500px;
    margin: 2rem auto;
}

.drop-zone {
    border: 2px dashed #ccc;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s;
    background: #f9f9f9;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.drop-zone.dragging {
    border-color: #007bff;
    background: #e7f1ff;
    transform: scale(1.02);
}

.validation-output {
    width: 100%;
    padding: 1rem;
    border-radius: 8px;
    color: white;
}

.validation-output.valid {
    background: #198754;
}

.validation-output.invalid {
    background: #dc3545;
}

.break-all {
    word-break: break-all;
}

.tiny {
    font-size: 0.65rem;
}

.payload-view {
    background: rgba(0, 0, 0, 0.3);
    color: #00ff41;
    font-size: 0.7rem;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
    white-space: pre-wrap;
}

.btn-copy-payload {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
}

.btn-copy-payload:hover {
    color: #00ff41;
}

.search-input {
    width: 100px;
    outline: none;
    transition: width 0.2s;
}

.search-input:focus {
    width: 180px;
    border-color: #00ff41 !important;
}

:deep(.json-match) {
    background-color: rgba(255, 193, 7, 0.6);
    color: #000;
    padding: 0 1px;
    border-radius: 2px;
}

:deep(.current-match) {
    background-color: #00ff41 !important;
    color: #000 !important;
    box-shadow: 0 0 10px #00ff41;
}

.btn-nav-match {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    line-height: 1;
    transition: color 0.2s;
}

.btn-nav-match:hover:not(:disabled) {
    color: #00ff41;
}
</style>