<template>
  <div class="card bg-dark border-secondary shadow-sm h-100">
    <div class="card-body d-flex flex-column">
      <h6 class="card-title text-uppercase text-muted fw-bold mb-3 font-monospace">
        <i class="bi bi-pie-chart-fill me-2 text-info"></i> Bond Protocol Distribution
      </h6>

      <!-- Chart Container -->
      <div
        v-if="bonds.length > 0"
        class="flex-grow-1"
        style="position: relative; min-height: 250px"
      >
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-muted opacity-50"
      >
        <i class="bi bi-activity display-4 mb-2"></i>
        <span class="small font-monospace">AWAITING BOND ACTIVITY</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  bonds: any[];
}>();

const chartData = computed(() => {
  // Tally up the statuses from the incoming Firestore data
  const counts: Record<string, number> = {
    INIT: 0,
    SYNCING: 0,
    LOCKED: 0,
    DISRUPTED: 0,
    FULFILLED: 0
  };
  props.bonds.forEach((bond) => {
    if (counts[bond.status] !== undefined) counts[bond.status]++;
  });

  return {
    labels: ['Init', 'Syncing', 'Locked', 'Disrupted', 'Fulfilled'],
    datasets: [
      {
        backgroundColor: ['#6c757d', '#0dcaf0', '#ffc107', '#dc3545', '#198754'], // CoreUI theme mapped to status
        borderColor: '#222222', // Substrate Grey border to match your app theme
        borderWidth: 2,
        hoverOffset: 4,
        data: [counts.INIT, counts.SYNCING, counts.LOCKED, counts.DISRUPTED, counts.FULFILLED]
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: { color: '#f8f9fa', font: { family: 'monospace', size: 11 } }
    },
    tooltip: { bodyFont: { family: 'monospace' } }
  }
};
</script>
