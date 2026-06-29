<template>
    <div class="kernel-log-panel font-monospace rounded overflow-hidden">
        <header
            class="d-flex justify-content-between align-items-center mb-2 px-2 py-1 border-bottom border-success border-opacity-25">
            <span class="tiny text-success fw-bold">KERNEL_LOG_BUFFER [v1.0.4]</span>
            <div class="d-flex align-items-center gap-2">
                <button v-if="activeTraceBit !== null" @click="handleClearTrace" class="btn-clear tiny font-monospace"
                    title="Clear Trace Highlight">[RESET_TRACE]</button>
                <button @click="handleClear" class="btn-clear tiny font-monospace"
                    title="Purge Log Buffer">[PURGE]</button>
                <span class="tiny opacity-50">{{ kernelLogs.length }}/50</span>
            </div>
        </header>
        <div class="log-entries" ref="logContainer">
            <TransitionGroup name="log-fade">
                <div v-for="log in kernelLogs" :key="log.id" class="log-entry"
                    :class="[log.type, { 'traceable': log.bitIndex !== undefined, 'tracing': activeTraceBit === log.bitIndex }]"
                    @click="log.bitIndex !== undefined && setTraceBit(log.bitIndex)">
                    <span class="log-time">[{{ formatTime(log.timestamp) }}]</span>
                    <span class="log-message">{{ log.message }}</span>
                </div>
            </TransitionGroup>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useSystemBus } from './useSystemBus';
import { useIOSettings } from '../useIOSettings';

const { kernelLogs, clearLogs, activeTraceBit, setTraceBit } = useSystemBus();
const { playSFX } = useIOSettings();
const logContainer = ref<HTMLElement | null>(null);

const handleClearTrace = () => {
    playSFX('tick');
    setTraceBit(null);
};

const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
};

const handleClear = () => {
    playSFX('reboot');
    clearLogs();
};

watch(() => kernelLogs.value.length, () => {
    nextTick(() => {
        if (logContainer.value) {
            logContainer.value.scrollTop = 0; // Keep focus on latest entry at top
        }
    });
});
</script>

<style scoped>
.kernel-log-panel {
    background: rgba(5, 5, 5, 0.9);
    border: 1px solid rgba(0, 255, 65, 0.3);
    color: #00ff41;
    height: 120px;
    width: 100%;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(4px);
    box-shadow: inset 0 0 10px rgba(0, 255, 65, 0.1);
}

.log-entries {
    flex-grow: 1;
    overflow-y: auto;
    padding: 0.5rem;
    scrollbar-width: none;
}

.log-entries::-webkit-scrollbar {
    display: none;
}

.btn-clear {
    background: transparent;
    border: 1px solid rgba(0, 255, 65, 0.3);
    color: #00ff41;
    cursor: pointer;
    padding: 0 4px;
    font-size: 0.55rem;
    line-height: 1.2;
    transition: all 0.2s;
}

.btn-clear:hover {
    background: rgba(0, 255, 65, 0.2);
    border-color: #00ff41;
    box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
}

.log-entry {
    font-size: 0.62rem;
    margin-bottom: 3px;
    line-height: 1.2;
    display: flex;
    gap: 8px;
    transition: background 0.2s;
}

.log-time {
    opacity: 0.4;
    flex-shrink: 0;
}

.log-entry.traceable {
    cursor: pointer;
    border-left: 2px solid transparent;
}

.log-entry.traceable:hover {
    background: rgba(0, 255, 65, 0.1);
    border-left-color: rgba(0, 255, 65, 0.5);
}

.log-message {
    word-break: break-all;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.success {
    color: #00ff41;
}

.info {
    color: #00d4ff;
}

.warn {
    color: #ffc107;
}

.error {
    color: #ff0000;
    text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}

.log-fade-enter-active {
    transition: all 0.2s ease-out;
}

.log-fade-enter-from {
    opacity: 0;
    transform: translateX(-5px);
}

.tiny {
    font-size: 0.6rem;
}
</style>