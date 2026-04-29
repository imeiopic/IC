import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onSnapshotsInSync } from 'firebase/firestore';
import { useIOSettings } from '../useIOSettings';
import { db } from '../firebase-config';

export interface KernelLogEntry {
    id: number;
    timestamp: string;
    message: string;
    type: 'info' | 'warn' | 'error' | 'success';
    bitIndex?: number;
}

const busThreads = ref<boolean[]>(Array(16).fill(false));
const isOnline = ref(navigator.onLine);
const isSynced = ref(false);
const isGlobalPurgeActive = ref(false);
const activeTraceBit = ref<number | null>(null);
const kernelLogs = ref<KernelLogEntry[]>([]);
let logIdCounter = 0;

onSnapshotsInSync(db, () => {
    isSynced.value = true;
});

const currentNoiseLevel = ref(0);
const systemFriction = ref(0);
const isLowPower = ref(false);
const energyProfile = ref<'PERFORMANCE' | 'ADAPTIVE'>('PERFORMANCE');
const isStabilizing = ref(false);
const rebootSeconds = ref(0);
const autoFocusActive = ref(false);

const manifestoThreads = [
    "Symmetry is Truth", "Visible Architecture", "Spatial Integrity", "Resource Equity",
    "Universal Membership", "Identity Persistence", "Collective Ownership", "Logic Sovereignty",
    "Symmetrical Distribution", "Infinite Velocity", "Value Synchronization", "Base Dividend Right",
    "Asymmetry Purge", "Noise Deletion", "Substrate Resilience", "Active Defense"
];

export function useSystemBus() {
    const { playSFX } = useIOSettings();

    const updateConnectivity = () => {
        isOnline.value = navigator.onLine;
        if (!isOnline.value) isSynced.value = false;
    };

    onMounted(() => {
        window.addEventListener('online', updateConnectivity);
        window.addEventListener('offline', updateConnectivity);
    });

    onUnmounted(() => {
        window.removeEventListener('online', updateConnectivity);
        window.removeEventListener('offline', updateConnectivity);
    });

    const setSyncing = () => { isSynced.value = false; };
    const setSynced = () => { isSynced.value = true; };

    const lockBit = (index: number | number[], value: boolean = true) => {
        if (Array.isArray(index)) {
            index.forEach(i => { if (i >= 0 && i < 16) busThreads.value[i] = value; });
        } else if (index >= 0 && index < 16) {
            busThreads.value[index] = value;
        }
    };

    const addLog = (message: string, type: KernelLogEntry['type'] = 'info', bitIndex?: number) => {
        const entry: KernelLogEntry = {
            id: logIdCounter++, timestamp: new Date().toISOString(), message, type, bitIndex
        };
        kernelLogs.value = [entry, ...kernelLogs.value].slice(0, 50);
    };

    const clearLogs = () => {
        kernelLogs.value = [];
        activeTraceBit.value = null;
    };

    const triggerGlobalPurge = (durationMs: number = 3000) => {
        isGlobalPurgeActive.value = true;
        playSFX('static', { volume: 0.8 });
        busThreads.value = Array(16).fill(false);
        setTimeout(() => { isGlobalPurgeActive.value = false; }, durationMs);
    };

    const rebootSystem = (durationMs: number = 5000) => {
        playSFX('reboot');
        clearLogs();
        addLog("SYSTEM: MANUAL REBOOT INITIATED. PURGING SUBSTRATE...", "warn");
        triggerGlobalPurge(durationMs);
    };

    const busActivity = computed(() => busThreads.value.filter(bit => bit).length);

    // Add isIOsticAcknowledged for Homepage.vue compatibility
    const isIOsticAcknowledged = computed(() => busThreads.value[0]);
    return {
        busThreads, isOnline, isSynced, kernelLogs, addLog, clearLogs, activeTraceBit,
        setTraceBit: (index: number | null) => { activeTraceBit.value = index; },
        setSyncing, setSynced, isGlobalPurgeActive, currentNoiseLevel, systemFriction,
        isLowPower, energyProfile, isStabilizing, rebootSeconds, lockBit,
        isBitLocked: (index: number) => busThreads.value[index],
        triggerGlobalPurge, rebootSystem,
        isQuadrantLocked: (start: number, end: number) => {
            for (let i = start; i <= end; i++) if (!busThreads.value[i]) return false;
            return true;
        },
        toggleEnergyProfile: () => {
            isLowPower.value = !isLowPower.value;
            energyProfile.value = isLowPower.value ? 'ADAPTIVE' : 'PERFORMANCE';
        },
        autoFocusActive, busActivity, manifestoThreads,
        isIOsticAcknowledged
    };
}