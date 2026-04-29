<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  successCount: number;
  errorCount: number;
}>();

const emit = defineEmits<{
  (e: 'filter-status', status: string): void;
}>();

const chartData = computed(() => ({
  labels: ['Success', 'Error'],
  datasets: [
    {
      data: [props.successCount, props.errorCount],
      backgroundColor: ['#198754', '#dc3545'], // Matches your status badge colors
      borderWidth: 0,
      hoverOffset: 4
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      position: 'right' as const,
      labels: { boxWidth: 12, usePointStyle: true, font: { size: 11 }, color: '#6c757d' },
      onClick: (e: any, legendItem: any) => {
        emit('filter-status', legendItem.text);
      }
    },
    tooltip: { bodyFont: { family: 'monospace' } }
  },
  onClick: (event: any, elements: any[], chart: any) => {
    if (elements && elements.length > 0) {
      const index = elements[0].index;
      const label = chart.data.labels[index];
      emit('filter-status', label);
    }
  }
};
</script>
