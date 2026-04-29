<template>
    <div class="dashboard-substrate p-4 bg-black text-success font-monospace">
        <header
            class="d-flex justify-content-between align-items-center mb-4 border-bottom border-success border-opacity-25 pb-3">
            <div>
                <h2 class="h4 mb-0 text-uppercase">Planetary Statistics Monitor</h2>
                <span class="tiny text-info opacity-75">IDENTITY SUBSTRATE V1.0 | REAL-TIME</span>
            </div>
            <div class="text-end">
                <div class="tiny opacity-50">SYSTEM VELOCITY</div>
                <div class="h5 mb-0">8.09V</div>
            </div>
        </header>

        <!-- Filter Substrate -->
        <div class="d-flex flex-wrap align-items-center gap-3 mb-4 p-3 border border-success border-opacity-10 rounded">
            <div class="input-group input-group-sm w-auto">
                <span
                    class="input-group-text bg-black text-success border-success border-opacity-25 tiny">START_HEX</span>
                <input type="date" v-model="startDate"
                    class="form-control bg-black text-success border-success border-opacity-25 tiny date-input">
            </div>
            <div class="input-group input-group-sm w-auto">
                <span
                    class="input-group-text bg-black text-success border-success border-opacity-25 tiny">END_HEX</span>
                <input type="date" v-model="endDate"
                    class="form-control bg-black text-success border-success border-opacity-25 tiny date-input">
            </div>
            <button @click="resetFilters"
                class="btn btn-sm btn-outline-info font-monospace tiny px-3 border-opacity-50">
                RESET_SUBSTRATE
            </button>
            <button @click="exportToCSV" :disabled="!stats.length || isExporting"
                class="btn btn-sm btn-outline-success font-monospace tiny px-3 border-opacity-50">
                <span v-if="isExporting" class="spinner-border spinner-border-sm me-1" role="status"
                    aria-hidden="true"></span>
                {{ isExporting ? `TRANSMUTING (${exportProgress}%)...` : 'EXPORT_CSV' }}
            </button>
            <button v-if="isExporting" @click="cancelExport"
                class="btn btn-sm btn-outline-danger font-monospace tiny px-3 border-opacity-50">
                CANCEL
            </button>
        </div>

        <!-- Summary Tiles -->
        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <div class="p-3 border border-success border-opacity-25 rounded bg-dark">
                    <div class="tiny opacity-50 text-uppercase">Total Transmissions</div>
                    <div class="h3 mb-0">{{ totalCount.toLocaleString() }}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="p-3 border border-success border-opacity-25 rounded bg-dark">
                    <div class="tiny opacity-50 text-uppercase">Total Data Grounded</div>
                    <div class="h3 mb-0">{{ formatBytes(totalBytes) }}</div>
                </div>
            </div>
        </div>

        <!-- Charts Substrate -->
        <div class="chart-container mb-4 p-3 border border-success border-opacity-10 rounded">
            <h3 class="h6 text-uppercase opacity-75 mb-3">Transmission Frequency (Daily)</h3>
            <div style="height: 250px;">
                <Line v-if="loaded" :data="countChartData" :options="chartOptions" />
            </div>
        </div>

        <div class="chart-container p-3 border border-success border-opacity-10 rounded">
            <h3 class="h6 text-uppercase opacity-75 mb-3">Data Volume (Bytes)</h3>
            <div style="height: 250px;">
                <Line v-if="loaded" :data="byteChartData" :options="chartOptions" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where, documentId } from 'firebase/firestore';
import { Line } from 'vue-chartjs';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    ChartOptions
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const loaded = ref(false);
const stats = ref<any[]>([]);
const dashboardController = new AbortController();
const isExporting = ref(false);
const exportProgress = ref(0);
const currentWorker = ref<Worker | null>(null);
let rejectExport: ((reason?: any) => void) | null = null;

const today = new Date().toISOString().split('T')[0];
const ago = new Date();
ago.setDate(ago.getDate() - 30);
const initialStart = ago.toISOString().split('T')[0];

const startDate = ref(initialStart);
const endDate = ref(today);

function resetFilters() {
    startDate.value = initialStart;
    endDate.value = today;
}

const totalCount = computed(() => stats.value.reduce((acc, curr) => acc + (curr.count || 0), 0));
const totalBytes = computed(() => stats.value.reduce((acc, curr) => acc + (curr.totalByteSize || 0), 0));

const countChartData = computed(() => ({
    labels: stats.value.map(s => s.id),
    datasets: [{
        label: 'Transmissions',
        borderColor: '#00ff41',
        backgroundColor: 'rgba(0, 255, 65, 0.1)',
        data: stats.value.map(s => s.count),
        tension: 0.3,
        fill: true
    }]
}));

const byteChartData = computed(() => ({
    labels: stats.value.map(s => s.id),
    datasets: [{
        label: 'Bytes',
        borderColor: '#0dcaf0',
        backgroundColor: 'rgba(13, 202, 240, 0.1)',
        data: stats.value.map(s => s.totalByteSize),
        tension: 0.3,
        fill: true
    }]
}));

const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: { grid: { color: 'rgba(0, 255, 65, 0.05)' }, ticks: { color: '#00ff41' } },
        y: { grid: { color: 'rgba(0, 255, 65, 0.05)' }, ticks: { color: '#00ff41' } }
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#000',
            borderColor: '#00ff41',
            borderWidth: 1,
            titleFont: { family: 'monospace' },
            bodyFont: { family: 'monospace' }
        }
    }
};

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Terminates the active background substrate worker.
 */
function cancelExport() {
    if (currentWorker.value) {
        currentWorker.value.terminate();
        currentWorker.value = null;
        if (rejectExport) {
            rejectExport(new Error('CANCELLED_BY_USER'));
            rejectExport = null;
        }
    }
}

/**
 * Transmutes the currently sighted stats into a CSV substrate for download.
 */
async function exportToCSV() {
    if (!stats.value.length) return;
    isExporting.value = true;
    exportProgress.value = 0;

    // Yield to the event loop to allow the loading spinner to render
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
        const worker = new Worker(new URL('./csvWorker.ts', import.meta.url), { type: 'module' });
        currentWorker.value = worker;

        const blob = await new Promise<Blob>((resolve, reject) => {
            rejectExport = reject;
            worker.onmessage = (e) => {
                if (e.data.type === 'PROGRESS') {
                    exportProgress.value = e.data.value;
                } else if (e.data.type === 'DONE') {
                    resolve(e.data.blob);
                }
            };
            worker.onerror = (e) => reject(new Error('CSV_SUBSTRATE_FAULT: Worker execution failed.'));

            // structuredClone ensures the background thread receives a decoupled data substrate
            worker.postMessage({
                stats: structuredClone(stats.value),
                totalCount: totalCount.value,
                totalBytes: totalBytes.value
            });
        });

        const now = new Date();
        const timestamp = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
            String(now.getHours()).padStart(2, '0'),
            String(now.getMinutes()).padStart(2, '0'),
            String(now.getSeconds()).padStart(2, '0')
        ].join('-');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `IOPIC_STATS_${startDate.value}_TO_${endDate.value}_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (e: any) {
        if (e.message !== 'CANCELLED_BY_USER') {
            console.error(e);
        }
    } finally {
        if (currentWorker.value) {
            currentWorker.value.terminate();
            currentWorker.value = null;
        }
        isExporting.value = false;
        rejectExport = null;
    }
}

let unsubscribe: any = null;

const fetchStats = () => {
    if (unsubscribe) unsubscribe();

    let q = query(collection(db, 'daily_stats'), orderBy(documentId(), 'asc'));

    if (startDate.value) {
        q = query(q, where(documentId(), '>=', startDate.value));
    }
    if (endDate.value) {
        q = query(q, where(documentId(), '<=', endDate.value));
    }

    unsubscribe = onSnapshot(q, (snapshot) => {
        if (dashboardController.signal.aborted) return;

        stats.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        loaded.value = true;
    }, (error) => {
        if (dashboardController.signal.aborted) return;
        console.error("STATS_SUBSTRATE_FAULT:", error);
    });
};

watch([startDate, endDate], fetchStats);

onMounted(() => {
    fetchStats();
});

onUnmounted(() => {
    // Initialize decoupling sequence for all async operations
    dashboardController.abort();

    // Ground the Firestore listener substrate
    if (unsubscribe) unsubscribe();

    // Terminate active background workers to maintain system velocity
    cancelExport();
});
</script>

<style scoped>
.dashboard-substrate {
    min-height: 100vh;
    border: 1px solid rgba(0, 255, 65, 0.2);
}

.tiny {
    font-size: 0.65rem;
    letter-spacing: 1px;
}

.date-input::-webkit-calendar-picker-indicator {
    filter: invert(1) sepia(100%) saturate(10000%) hue-rotate(90deg);
}

.bg-dark {
    background-color: #0a0a0a !important;
}
</style>