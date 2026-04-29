<template>
  <div class="container mt-4">
    <div class="row mb-4 align-items-center">
      <div class="col">
        <h2 class="h4 text-uppercase fw-bold" style="letter-spacing: 1px">
          Email Protocol Audit Substrate
        </h2>
        <p class="text-muted small">
          Monitoring synchronization transmissions across the identity substrate.
        </p>
      </div>
      <div class="col-auto d-flex align-items-center gap-2">
        <div class="d-flex align-items-center gap-1">
          <label class="text-muted text-uppercase mb-0" style="font-size: 0.7rem">From:</label>
          <input
            type="date"
            v-model="startDate"
            @change="resetAndFetch"
            class="form-control form-control-sm shadow-sm"
            style="width: 135px"
          />
        </div>
        <div class="d-flex align-items-center gap-1">
          <label class="text-muted text-uppercase mb-0" style="font-size: 0.7rem">To:</label>
          <input
            type="date"
            v-model="endDate"
            @change="resetAndFetch"
            class="form-control form-control-sm shadow-sm"
            style="width: 135px"
          />
        </div>
        <label class="text-muted small text-uppercase ms-2">Status:</label>
        <select
          v-model="statusFilter"
          @change="resetAndFetch"
          class="form-select form-select-sm shadow-sm"
          style="width: 150px"
        >
          <option value="All">All Statuses</option>
          <option value="Success">Success</option>
          <option value="Error">Error</option>
        </select>
        <button
          @click="clearFilters"
          :disabled="isLoading || isExporting || (!startDate && !endDate && statusFilter === 'All')"
          class="btn btn-sm btn-outline-secondary shadow-sm text-nowrap"
        >
          <i class="bi bi-x-circle"></i> Clear
        </button>
        <button
          @click="resetAndFetch"
          :disabled="isLoading || isExporting"
          class="btn btn-sm btn-outline-info shadow-sm text-nowrap"
        >
          <i class="bi bi-arrow-clockwise" :class="{ 'spin-icon': isLoading }"></i> Refresh
        </button>
        <button
          @click="downloadCSV"
          :disabled="isLoading || isExporting || logs.length === 0"
          class="btn btn-sm btn-outline-primary shadow-sm text-nowrap"
        >
          <i
            class="bi"
            :class="isExporting ? 'spinner-border spinner-border-sm' : 'bi-download'"
          ></i>
          {{ isExporting ? 'Exporting...' : 'Download CSV' }}
        </button>
        <button
          @click="recalculateAnalytics"
          :disabled="isLoading || isRecalculating || (!startDate && !endDate)"
          class="btn btn-sm btn-outline-warning shadow-sm text-nowrap"
        >
          <i class="bi bi-calculator" :class="{ 'spin-icon': isRecalculating }"></i> Recalculate
          Analytics
        </button>
        <button
          @click="openPurgeModal"
          :disabled="isLoading || isClearing || logs.length === 0"
          class="btn btn-sm btn-outline-danger shadow-sm text-nowrap"
        >
          <i class="bi bi-trash"></i> Purge Substrate
        </button>
        <div class="form-check form-switch ms-2 d-flex align-items-center">
          <input
            class="form-check-input"
            type="checkbox"
            v-model="autoRefresh"
            id="autoRefreshSwitch"
          />
          <label
            class="form-check-label ms-2 text-muted text-uppercase fw-bold"
            for="autoRefreshSwitch"
            style="font-size: 0.65rem; white-space: nowrap"
          >
            Auto-Sync
          </label>
        </div>
      </div>
    </div>

    <!-- Visual Analytics Substrate -->
    <div v-show="!isLoading && logs.length > 0" class="row mb-4">
      <!-- Trend Analysis -->
      <div class="col-md-8">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body p-4">
            <h5 class="card-title text-uppercase text-muted fw-bold mb-3" style="font-size: 0.8rem">
              30-Day Protocol Velocity
            </h5>
            <canvas ref="historyCanvas" style="height: 200px"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm border-0 d-flex flex-row">
          <!-- Summary Card -->
          <div
            class="card-body d-flex flex-column justify-content-center align-items-start p-4"
            style="flex: 1"
          >
            <h5 class="card-title text-uppercase text-muted fw-bold mb-3" style="font-size: 0.8rem">
              Transmission Substrate Overview
            </h5>
            <div class="d-flex align-items-baseline mb-2">
              <h3 class="fw-bold mb-0 me-2">{{ totalTransmissions }}</h3>
              <span class="text-muted small">Total Transmissions</span>
            </div>
            <div class="d-flex align-items-baseline mb-2">
              <h3 class="fw-bold mb-0 me-2" style="font-size: 1.25rem">
                {{ formatBytes(totalBytes) }}
              </h3>
              <span class="text-muted small">Total Data Transmitted</span>
            </div>
            <div class="d-flex align-items-baseline">
              <h3
                class="fw-bold mb-0 me-2"
                :class="
                  successPercentage >= 90
                    ? 'text-success'
                    : successPercentage >= 70
                    ? 'text-warning'
                    : 'text-danger'
                "
              >
                {{ successPercentage }}%
              </h3>
              <span class="text-muted small">Success Rate</span>
            </div>
          </div>
          <!-- Chart Canvas -->
          <div
            class="card-body d-flex justify-content-center align-items-center p-3"
            style="height: 200px; position: relative"
          >
            <StatusDistributionChart
              v-if="totalTransmissions > 0"
              :success-count="successCount"
              :error-count="errorCount"
              @filter-status="handleChartFilter"
            />
            <div v-else class="text-muted small font-monospace opacity-50">NO DATA</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Syncing Substrate...</span>
      </div>
    </div>

    <div
      v-else-if="logs.length === 0"
      class="alert alert-secondary border-0 shadow-sm text-center py-5"
    >
      <i class="bi bi-info-circle d-block mb-2 fs-3"></i>
      No synchronization logs detected in the current audit window.
    </div>

    <div v-else class="table-responsive shadow-sm border rounded bg-white">
      <table class="table table-hover mb-0 align-middle">
        <thead class="table-dark">
          <tr>
            <th class="ps-3">Timestamp</th>
            <th>Recipient</th>
            <th>Context</th>
            <th>Subject</th>
            <th class="pe-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="log in logs"
            :key="log.id"
            :class="{ 'table-danger-subtle': log.status === 'Error' }"
          >
            <td class="ps-3 text-nowrap small text-muted">{{ formatTimestamp(log.timestamp) }}</td>
            <td
              class="text-truncate font-monospace small"
              style="max-width: 180px"
              :title="log.recipient"
            >
              {{ log.recipient }}
            </td>
            <td>
              <span
                class="badge bg-light text-dark border small shadow-none fw-normal opacity-75"
                >{{ log.context }}</span
              >
            </td>
            <td class="text-truncate small" style="max-width: 250px" :title="log.subject">
              {{ log.subject }}
            </td>
            <td class="pe-3">
              <span
                :class="[
                  'badge rounded-pill',
                  log.status === 'Success' ? 'bg-success' : 'bg-danger'
                ]"
                style="font-size: 0.7rem"
              >
                {{ log.status }}
              </span>
              <div
                v-if="log.errorMessage"
                class="x-small text-danger mt-1 opacity-75 fw-light"
                style="font-size: 0.7rem; line-height: 1.1"
              >
                {{ log.errorMessage }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Substrate -->
    <div class="d-flex justify-content-between align-items-center mt-3 px-1">
      <div class="text-muted small">
        Page <strong>{{ currentPage }}</strong>
      </div>
      <div class="btn-group shadow-sm">
        <button
          @click="fetchPreviousPage"
          :disabled="currentPage === 1 || isLoading"
          class="btn btn-sm btn-outline-secondary"
        >
          <i class="bi bi-chevron-left"></i> Previous
        </button>
        <button
          @click="fetchNextPage"
          :disabled="isAtEnd || isLoading"
          class="btn btn-sm btn-outline-secondary"
        >
          Next <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { db } from '../firebase';
import { useErrorSubstrate } from './src/errorHandler';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  where,
  QueryDocumentSnapshot,
  endBefore,
  limitToLast,
  getAggregateFromServer,
  count,
  sum,
  writeBatch,
  doc,
  serverTimestamp,
  documentId
} from 'firebase/firestore';
import Chart from 'chart.js/auto';
import { useModal } from '@/useModal';
import ConfirmPurgeModal from '@/components/ConfirmPurgeModal.vue';
import StatusDistributionChart from '@/components/StatusDistributionChart.vue';

interface EmailLog {
  id: string;
  context: string;
  recipient: string;
  subject: string;
  status: 'Success' | 'Error';
  timestamp: any;
  errorMessage?: string;
}

const logs = ref<EmailLog[]>([]);
const { lastSubstrateError, notifySuccess } = useErrorSubstrate();
const statusFilter = ref('All');
const isLoading = ref(true);
const currentPage = ref(1);
const pageSize = 20;
const isAtEnd = ref(false);
const isExporting = ref(false);
const isClearing = ref(false);
const isRecalculating = ref(false);
const startDate = ref('');
const endDate = ref('');
const autoRefresh = ref(false);
let refreshInterval: any = null;

const { openModal, closeModal } = useModal();
const totalTransmissions = ref(0);
const successPercentage = ref(0);
const totalBytes = ref(0);
const successCount = ref(0);
const errorCount = ref(0);
const historyCanvas = ref<HTMLCanvasElement | null>(null);
let historyChartInstance: Chart | null = null;

// Cursors for navigation
const firstVisible = ref<QueryDocumentSnapshot | null>(null);
const lastVisible = ref<QueryDocumentSnapshot | null>(null);

function formatTimestamp(ts: any) {
  if (!ts) return 'N/A';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString();
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function fetchLogs(q: any, direction: 'next' | 'prev' | 'initial' = 'initial') {
  isLoading.value = true;
  try {
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      if (direction === 'next') isAtEnd.value = true;
      logs.value = [];
      return;
    }

    logs.value = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data()
        } as EmailLog)
    );

    firstVisible.value = snapshot.docs[0];
    lastVisible.value = snapshot.docs[snapshot.docs.length - 1];

    // If we fetched fewer than the pageSize, we've reached the end of the substrate
    isAtEnd.value = snapshot.docs.length < pageSize;
  } catch (error) {
    console.error('Audit substrate synchronization failure:', error);
  } finally {
    isLoading.value = false;
  }
}

function buildBaseQuery() {
  const logsRef = collection(db, 'email_logs');
  let q = query(logsRef, orderBy('timestamp', 'desc'));

  if (statusFilter.value !== 'All') {
    q = query(q, where('status', '==', statusFilter.value));
  }

  if (startDate.value) {
    q = query(q, where('timestamp', '>=', new Date(startDate.value + 'T00:00:00')));
  }

  if (endDate.value) {
    q = query(q, where('timestamp', '<=', new Date(endDate.value + 'T23:59:59')));
  }

  return q;
}

/**
 * Builds a query specifically for the chart, ignoring the status filter
 * to show the full Success vs Error distribution for the date range.
 */
function buildChartQuery() {
  const logsRef = collection(db, 'email_logs');
  let q = query(logsRef, orderBy('timestamp', 'desc'));

  if (startDate.value) {
    q = query(q, where('timestamp', '>=', new Date(startDate.value + 'T00:00:00')));
  }
  if (endDate.value) {
    q = query(q, where('timestamp', '<=', new Date(endDate.value + 'T23:59:59')));
  }
  return q;
}

async function updateChartSubstrate() {
  const q = buildChartQuery();
  const successQuery = query(q, where('status', '==', 'Success'));
  const errorQuery = query(q, where('status', '==', 'Error'));

  // Reset summary values before aggregation
  const [successSnap, errorSnap] = await Promise.all([
    getAggregateFromServer(successQuery, {
      transmissionCount: count(),
      payloadSize: sum('byteSize')
    }),
    getAggregateFromServer(errorQuery, { transmissionCount: count(), payloadSize: sum('byteSize') })
  ]);

  successCount.value = successSnap.data().transmissionCount;
  errorCount.value = errorSnap.data().transmissionCount;

  // Update summary values
  totalTransmissions.value = successCount.value + errorCount.value;
  successPercentage.value =
    totalTransmissions.value > 0
      ? Math.round((successCount.value / totalTransmissions.value) * 100)
      : 0;
  totalBytes.value = (successSnap.data().payloadSize || 0) + (errorSnap.data().payloadSize || 0);
}

/**
 * Synchronizes the 'daily_stats' substrate for the currently filtered range.
 * Strictly targets 'Success' logs to maintain statistical symmetry with live triggers.
 */
async function recalculateAnalytics() {
  isRecalculating.value = true;
  try {
    const logsRef = collection(db, 'email_logs');
    // We ignore the UI status filter to ensure the analytics collection stays pure
    let q = query(logsRef, where('status', '==', 'Success'), orderBy('timestamp', 'asc'));

    if (startDate.value)
      q = query(q, where('timestamp', '>=', new Date(startDate.value + 'T00:00:00')));
    if (endDate.value)
      q = query(q, where('timestamp', '<=', new Date(endDate.value + 'T23:59:59')));

    const snapshot = await getDocs(q);
    const statsMap = new Map<string, { count: number; size: number }>();

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const dateId = data.timestamp.toDate().toISOString().split('T')[0];
      const existing = statsMap.get(dateId) || { count: 0, size: 0 };

      statsMap.set(dateId, {
        count: existing.count + 1,
        size: existing.size + (data.byteSize || 0)
      });
    });

    const batch = writeBatch(db);
    statsMap.forEach((stats, dateId) => {
      const statsRef = doc(db, 'daily_stats', dateId);
      batch.set(statsRef, {
        count: stats.count,
        totalByteSize: stats.size,
        lastUpdated: serverTimestamp()
      });
    });

    await batch.commit();
    await Promise.all([updateChartSubstrate(), updateHistorySubstrate()]);
    notifySuccess(`Recalculation Successful: ${statsMap.size} days synchronized.`);
  } catch (error) {
    console.error('Recalculation failure:', error);
    lastSubstrateError.value = 'Failed to synchronize analytics substrate.';
  } finally {
    isRecalculating.value = false;
  }
}

/**
 * Aggregates daily volume and payload size for the last 30 days by
 * fetching pre-computed data from the 'daily_stats' collection.
 */
async function updateHistorySubstrate() {
  const days = 30;
  const labels: string[] = [];
  const volumeData: number[] = [];
  const payloadData: number[] = [];

  // Calculate the date 30 days ago to establish the substrate window
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - (days - 1));
  const startDateId = startDate.toISOString().split('T')[0];

  try {
    const statsRef = collection(db, 'daily_stats');
    const q = query(statsRef, where(documentId(), '>=', startDateId), orderBy(documentId(), 'asc'));
    const snapshot = await getDocs(q);

    const statsMap = new Map();
    snapshot.forEach((doc) => {
      statsMap.set(doc.id, doc.data());
    });

    // Iterate through the last 30 days and synchronize with the map
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateId = d.toISOString().split('T')[0];

      labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

      const dayData = statsMap.get(dateId);
      volumeData.push(dayData ? dayData.count : 0);
      payloadData.push(dayData ? dayData.totalByteSize : 0);
    }

    renderHistoryChart(labels, volumeData, payloadData);
  } catch (error) {
    console.error('Failed to synchronize history substrate:', error);
  }
}

function renderHistoryChart(labels: string[], volumes: number[], payloads: number[]) {
  if (!historyCanvas.value) return;
  if (historyChartInstance) historyChartInstance.destroy();

  historyChartInstance = new Chart(historyCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Transmission Volume',
          data: volumes,
          backgroundColor: 'rgba(13, 202, 240, 0.2)',
          borderColor: '#0dcaf0',
          borderWidth: 2,
          yAxisID: 'y',
          type: 'line',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Payload Size (Bytes)',
          data: payloads,
          backgroundColor: 'rgba(108, 117, 125, 0.5)',
          yAxisID: 'y1',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              if (context.datasetIndex === 1) return `Size: ${formatBytes(context.raw as number)}`;
              return `Volume: ${context.raw}`;
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { display: false },
          ticks: { font: { size: 10 } }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { callback: (val) => formatBytes(val as number, 0), font: { size: 10 } }
        },
        x: { ticks: { font: { size: 9 } } }
      }
    }
  });
}

async function resetAndFetch() {
  currentPage.value = 1;
  const q = query(buildBaseQuery(), limit(pageSize));
  await Promise.all([fetchLogs(q, 'initial'), updateChartSubstrate(), updateHistorySubstrate()]);
}

async function performPurge() {
  isClearing.value = true;
  try {
    const q = buildBaseQuery();
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    // Firestore limits batches to 500 operations
    for (let i = 0; i < snapshot.docs.length; i += 500) {
      const batch = writeBatch(db);
      const chunk = snapshot.docs.slice(i, i + 500);
      chunk.forEach((document) => {
        batch.delete(doc(db, 'email_logs', document.id));
      });
      await batch.commit();
    }

    notifySuccess(`Successfully purged ${snapshot.size} protocol logs.`);
    await resetAndFetch();
  } catch (error) {
    console.error('Purge failure:', error);
    lastSubstrateError.value = 'Failed to purge protocol substrate.';
  } finally {
    isClearing.value = false;
  }
}

function openPurgeModal() {
  openModal(
    ConfirmPurgeModal,
    {
      onConfirm: async () => {
        await performPurge();
        closeModal();
      }
    },
    { closeText: '[X] ABORT PURGE' }
  );
}

async function clearFilters() {
  startDate.value = '';
  endDate.value = '';
  statusFilter.value = 'All';
  await resetAndFetch();
}

async function downloadCSV() {
  isExporting.value = true;
  try {
    // Fetch ALL matching logs for the current filter (bypassing pagination)
    const q = buildBaseQuery();
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    // Define headers and map documents to CSV rows
    const headers = ['Timestamp', 'Recipient', 'Context', 'Subject', 'Status', 'Error Message'];
    const rows = snapshot.docs.map((doc) => {
      const data = doc.data();
      return [
        formatTimestamp(data.timestamp),
        data.recipient,
        data.context,
        data.subject,
        data.status,
        data.errorMessage || ''
      ]
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(','); // Escape quotes and wrap in quotes
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    // Trigger browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      'download',
      `protocol_audit_${statusFilter.value.toLowerCase()}_${
        new Date().toISOString().split('T')[0]
      }.csv`
    );
    link.click();
  } catch (error) {
    console.error('CSV Export failure:', error);
    lastSubstrateError.value = 'Failed to synchronize CSV export. Check substrate console.';
  } finally {
    isExporting.value = false;
  }
}

async function fetchNextPage() {
  if (!lastVisible.value) return;
  currentPage.value++;
  const q = query(buildBaseQuery(), startAfter(lastVisible.value), limit(pageSize));
  await fetchLogs(q, 'next');
}

async function fetchPreviousPage() {
  if (!firstVisible.value) return;
  currentPage.value--;
  const q = query(buildBaseQuery(), endBefore(firstVisible.value), limitToLast(pageSize));
  await fetchLogs(q, 'prev');
}

function handleChartFilter(status: string) {
  if (statusFilter.value !== status) {
    statusFilter.value = status;
    resetAndFetch();
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  refreshInterval = setInterval(() => {
    if (!isLoading.value && !isExporting.value) {
      resetAndFetch();
    }
  }, 60000); // 60 seconds
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

watch(autoRefresh, (enabled) => {
  if (enabled) startAutoRefresh();
  else stopAutoRefresh();
});

onMounted(() => {
  resetAndFetch();
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped>
.table-danger-subtle {
  background-color: rgba(220, 53, 69, 0.03);
}

.x-small {
  display: block;
  max-width: 200px;
  white-space: normal;
  word-break: break-word;
}

.spin-icon {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
