<template>
    <div class="quarantine-vault shadow-lg rounded border-2 position-relative overflow-hidden"
        :class="{ 'purge-active': isGlobalPurgeActive }">
        <header
            class="vault-header d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-danger border-opacity-50">
            <div class="d-flex align-items-center gap-2">
                <i class="bi bi-shield-slash text-danger"></i>
                <h3 class="font-monospace h6 text-uppercase mb-0 text-danger">Quarantine Vault: Isolated Noise</h3>
            </div>
            <div class="item-count tiny font-monospace opacity-75">{{ quarantinedItems.length }} NODES ISOLATED</div>
        </header>

        <div v-if="quarantinedItems.length > 0" class="vault-content overflow-auto" style="max-height: 300px;">
            <div v-for="(item, index) in quarantinedItems" :key="index"
                class="quarantine-node mb-3 p-2 border border-danger border-opacity-25 rounded">
                <div class="d-flex justify-content-between align-items-start mb-1">
                    <span class="text-danger tiny font-monospace fw-bold">NODE_ID: {{ item.key }}</span>
                    <button @click="removeFromQuarantine(index)"
                        class="btn-purge-item tiny text-uppercase font-monospace" title="Permanently Delete">
                        [PURGE]
                    </button>
                </div>
                <div class="data-blob bg-black p-2 rounded mb-2 border border-secondary border-opacity-25">
                    <code class="tiny text-warning break-all">{{ item.value }}</code>
                </div>
                <div class="d-flex justify-content-between align-items-center tiny font-monospace opacity-50">
                    <span>DETECTION_TS: {{ item.timestamp }}</span>
                    <span class="text-danger">STATUS: QUARANTINED</span>
                </div>
            </div>
        </div>

        <div v-else class="empty-vault text-center py-5">
            <i class="bi bi-shield-check display-4 opacity-25 mb-3"></i>
            <p class="font-monospace tiny text-uppercase opacity-50">Active Substrate Sterile. No Noise Detected.</p>
        </div>

        <footer
            class="vault-footer mt-4 pt-3 border-top border-danger border-opacity-25 d-flex justify-content-between">
            <button @click="clearQuarantine" :disabled="quarantinedItems.length === 0"
                class="clear-btn font-monospace tiny text-uppercase px-3 py-2">
                Flush All Isolated Nodes
            </button>
            <div class="status-indicator font-monospace tiny d-flex align-items-center gap-2">
                <span class="status-dot"
                    :class="quarantinedItems.length > 0 ? 'text-danger status-pulse' : 'text-success'">●</span>
                <span class="opacity-75">Triage Substrate: {{ quarantinedItems.length > 0 ? 'INTERFERENCE' : 'NOMINAL'
                    }}</span>
            </div>
        </footer>

        <div v-if="isGlobalPurgeActive" class="purge-overlay">
            <div class="purge-msg font-monospace fw-bold">VAULT SEALED</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSystemBus } from './useSystemBus';

const { quarantinedItems, isGlobalPurgeActive, removeFromQuarantine, clearQuarantine } = useSystemBus();
</script>

<style scoped>
.quarantine-vault {
    background: #000;
    border: 2px solid #dc3545;
    padding: 1.5rem;
    color: #dc3545;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    max-width: 500px;
    margin: auto;
}

.quarantine-node {
    background: rgba(220, 53, 69, 0.02);
}

.btn-purge-item {
    background: transparent;
    border: none;
    color: #dc3545;
    cursor: pointer;
    opacity: 0.7;
}

.btn-purge-item:hover {
    opacity: 1;
    text-shadow: 0 0 5px #dc3545;
}

.data-blob {
    max-height: 60px;
    overflow-y: auto;
}

.clear-btn {
    background: transparent;
    color: #dc3545;
    border: 1px solid #dc3545;
    cursor: pointer;
    transition: all 0.3s;
}

.clear-btn:hover:not(:disabled) {
    background: #dc3545;
    color: #000;
    box-shadow: 0 0 15px rgba(220, 53, 69, 0.4);
}

.clear-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.break-all {
    word-break: break-all;
}

.tiny {
    font-size: 0.65rem;
}

.status-dot {
    font-size: 0.8rem;
}

.status-pulse {
    animation: status-pulse-keyframes 2s infinite ease-in-out;
}

@keyframes status-pulse-keyframes {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.4;
        transform: scale(1.2);
    }
}

.purge-active {
    animation: jitter 0.1s infinite;
}

.purge-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.purge-msg {
    color: #dc3545;
    font-size: 1.5rem;
    text-shadow: 0 0 10px #dc3545;
}

@keyframes jitter {
    0% {
        transform: translate(0, 0);
    }

    50% {
        transform: translate(2px, -1px);
    }

    100% {
        transform: translate(-1px, 2px);
    }
}
</style>