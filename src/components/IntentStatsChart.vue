<template>
    <div class="intent-stats-container p-4 rounded border border-success border-opacity-25 bg-black shadow-lg">
        <header class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="h6 font-monospace text-uppercase text-success mb-0">
                <i class="bi bi-cpu-fill me-2"></i>USL Intent Distribution
            </h3>
            <div class="d-flex align-items-center gap-3">
                <span class="tiny font-monospace text-info opacity-75">REAL-TIME SYNC ACTIVE</span>
                <button @click="handleClear" :disabled="isClearing"
                    class="btn btn-sm btn-outline-danger font-monospace tiny py-0 px-2 border-opacity-50">
                    {{ isClearing ? 'PURGING...' : 'PURGE SUBSTRATE' }}
                </button>
            </div>
        </header>

        <div class="chart-wrapper" style="height: 300px; position: relative;">
            <Bar v-if="loaded" :data="chartData" :options="chartOptions" />
            <div v-else class="d-flex h-100 align-items-center justify-content-center font-monospace text-success tiny">
                <span class="spinner-border spinner-border-sm me-2"></span>
                SIGHTING SUBSTRATE...
            </div>
        </div>

        <footer
            class="mt-3 pt-3 border-top border-success border-opacity-10 tiny font-monospace opacity-50 text-center">
            SYMMETRY FEEDBACK LOOP | TERMINAL 10 DATA SOURCE
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { IopicTranslator } from '../IopicUniversalTranslator';
import { Bar } from 'vue-chartjs';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    type ChartOptions
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const loaded = ref(false);
const isClearing = ref(false);
const chartData = ref<any>({
    labels: [],
    datasets: []
});

const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Horizontal bars for better readability of intent tokens
    scales: {
        x: {
            grid: { color: 'rgba(0, 255, 65, 0.1)' },
            ticks: { color: '#00ff41', font: { family: 'Share Tech Mono' } }
        },
        y: {
            grid: { display: false },
            ticks: { color: '#00ff41', font: { family: 'Share Tech Mono' } }
        }
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#000',
            titleFont: { family: 'Share Tech Mono' },
            bodyFont: { family: 'Share Tech Mono' },
            borderColor: '#00ff41',
            borderWidth: 1
        }
    }
};

let unsubscribe: any = null;

const handleClear = async () => {
    const confirmed = confirm('Ω WARNING: You are about to purge the collective intent substrate. This action will reset the learned intelligence across the global mesh. Continue?');
    if (!confirmed) return;

    isClearing.value = true;
    try {
        await IopicTranslator.clearLearningSubstrate();
    } finally {
        isClearing.value = false;
    }
};

onMounted(() => {
    unsubscribe = onSnapshot(doc(db, 'system_stats', 'intent_learning'), (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            const sortedIntents = Object.entries(data).sort((a, b) => (b[1] as number) - (a[1] as number));

            chartData.value = {
                labels: sortedIntents.map(([key]) => key),
                datasets: [
                    {
                        label: 'Sighted Frequency',
                        backgroundColor: 'rgba(0, 255, 65, 0.5)',
                        borderColor: '#00ff41',
                        borderWidth: 1,
                        data: sortedIntents.map(([, value]) => value)
                    }
                ]
            };
            loaded.value = true;
        }
    });
});

onUnmounted(() => {
    if (unsubscribe) unsubscribe();
});
</script>

<style scoped>
.intent-stats-container {
    max-width: 600px;
    margin: auto;
}

.tiny {
    font-size: 0.7rem;
}
</style>