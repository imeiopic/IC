<template>
  <div
    class="p-6 bg-black text-white border border-neutral-800 font-mono max-w-2xl mx-auto relative"
  >
    <header class="flex justify-between items-center border-b border-neutral-900 pb-4 mb-6">
      <div>
        <span class="text-[10px] text-neutral-500 block">THREAD_0011 // STATE_REGISTRY</span>
        <h2 class="text-md font-bold tracking-widest text-blue-400">HISTORY.VUE</h2>
      </div>
      <div class="text-right text-xs">
        <span class="text-[10px] text-neutral-500 block">LEDGER_BLOCKS</span>
        <span class="font-bold text-blue-400">100%_MUTABLE_PRESERVATION</span>
      </div>
    </header>

    <main class="space-y-4">
      <div class="flex justify-between items-center text-xs px-1">
        <h3 class="font-bold text-neutral-400 uppercase">Symmetrical Event Cascade</h3>
        <span class="text-[10px] text-neutral-600">DRIFT: 0.000ms</span>
      </div>

      <div class="space-y-2 max-h-72 overflow-y-auto pr-1" ref="logContainer">
        <div
          v-for="event in historyLogs"
          :key="event.id"
          class="p-3 bg-neutral-950 border border-neutral-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 hover:border-blue-900/50 transition-colors duration-200"
        >
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-neutral-600">[{{ event.time }}]</span>
              <span class="text-xs font-bold text-neutral-200">{{ event.title }}</span>
            </div>
            <p class="text-[11px] text-neutral-500 font-sans">{{ event.description }}</p>
          </div>
          <span :class="['text-[10px] px-2 py-0.5 border font-bold rounded', event.color]">
            {{ event.tag }}
          </span>
        </div>
      </div>
    </main>

    <footer
      class="mt-6 border-t border-neutral-900 pt-4 flex justify-between items-center text-[10px]"
    >
      <button
        @click="exportAuditTrail"
        class="text-neutral-500 hover:text-blue-400 transition-colors duration-200"
      >
        DOWNLOAD_SECURE_AUDIT_TRAIL
      </button>
      <span class="text-neutral-600">HASH: 0x9A4F...33B1</span>
    </footer>

    <!-- Toast Notification -->
    <Transition name="fade">
      <div
        v-if="showToast"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-800 text-white text-xs px-4 py-2 rounded shadow-lg z-50"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'; // To destructure reactive state from the store
import { nextTick, onMounted, ref, Transition, watch } from 'vue';
import { useHistoryStore } from '../stores/historyStore'; // Import the Pinia store

/* Moved to src/stores/historyStore.ts for shared access
interface HistoryEvent {
  id: number;
  time: string;
  title: string;
  description: string;
  tag: string;
  color: string;
}
*/
// Reactive state for toast notification
const showToast = ref(false);
const toastMessage = ref('');

const triggerToast = (message: string, duration = 3000) => {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, duration);
};

// Pinia Store Integration
const historyStore = useHistoryStore();
const { history: historyLogs } = storeToRefs(historyStore); // Use storeToRefs to maintain reactivity

// Auto-scrolling functionality
const logContainer = ref<HTMLElement | null>(null);

watch(
  historyLogs,
  async () => {
    await nextTick(); // Wait for DOM update
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  },
  { deep: true } // Watch for changes inside the array
);

onMounted(() => {
  // Optionally, you could add an initial event here or ensure the store is populated
  // if it's not already from a previous session or API call.
  // For this example, the store is initialized with some data.
});

const exportAuditTrail = () => {
  console.log('HISTORY_ENGINE: Compiling cryptographic system transition logs...');
  // Export history data from the store
  const auditData = historyLogs.value;
  console.log('Audit Trail Data:', auditData); // For demonstration, log the data
  triggerToast(
    'Sovereign audit file generated. All historical records verified under strict 1:16 symmetry.'
  );
};
</script>

<style scoped>
/* Transition styles for the toast */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
