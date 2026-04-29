<template>
    <div class="serial-ledger shadow-lg rounded border-2 position-relative overflow-hidden">
        <header
            class="ledger-header d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-success border-opacity-50">
            <div class="d-flex align-items-center gap-2">
                <i class="bi bi-list-columns-reverse"></i>
                <h3 class="font-monospace h6 text-uppercase mb-0">Serial Ledger: Grounded Assets</h3>
            </div>
            <div class="bit-tag tiny font-monospace opacity-75">BIT 1101</div>
        </header>

        <div class="ledger-controls mb-3">
            <div class="input-group-custom position-relative">
                <input v-model="searchQuery" type="text" placeholder="Search Grounded Serial..."
                    class="ledger-search font-monospace w-100 p-2" />
                <i class="bi bi-search search-icon"></i>
            </div>
        </div>

        <div class="ledger-body overflow-auto" style="max-height: 250px;">
            <table class="table table-dark table-hover font-monospace tiny mb-0">
                <thead class="sticky-top bg-black">
                    <tr>
                        <th class="text-success border-bottom border-success border-opacity-25">Serial ID</th>
                        <th class="text-success border-bottom border-success border-opacity-25 text-center">Value</th>
                        <th class="text-success border-bottom border-success border-opacity-25 text-end">Grounding TS
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="entry in filteredLedger" :key="entry.serial">
                        <td class="text-white">{{ entry.serial }}</td>
                        <td class="text-info text-center">{{ entry.value.toFixed(2) }} IO$</td>
                        <td class="opacity-50 text-end">{{ entry.timestamp }}</td>
                    </tr>
                    <tr v-if="filteredLedger.length === 0">
                        <td colspan="3" class="text-center text-warning p-4 italic">
                            {{ searchQuery ? 'Serial not found in Blacklist Substrate.' : 'No grounded assets recorded.'
                            }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <footer class="ledger-footer mt-3 pt-2 border-top border-success border-opacity-25 text-center">
            <p class="font-monospace tiny text-uppercase opacity-50 mb-0">
                Database Status: <span class="text-success">Synchronized</span> | Integrity Check: <span
                    class="text-success">Passed</span>
            </p>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const searchQuery = ref('');

// Global database of grounded (retired) analog currency serials
const groundedSerials = ref([
    { serial: 'IO-US-88291022-A', value: 100, timestamp: '2024-05-20 14:22:01' },
    { serial: 'IO-EU-11029384-B', value: 500, timestamp: '2024-05-21 09:11:45' },
    { serial: 'IO-GB-99203112-C', value: 50, timestamp: '2024-05-21 18:05:12' },
    { serial: 'IO-JP-44556677-D', value: 1000, timestamp: '2024-05-22 11:30:00' },
    { serial: 'IO-CN-22334455-E', value: 200, timestamp: '2024-05-22 15:45:33' },
    { serial: 'IO-AU-77889900-F', value: 100, timestamp: '2024-05-23 10:15:22' },
]);

const filteredLedger = computed(() => {
    if (!searchQuery.value) return groundedSerials.value;
    return groundedSerials.value.filter(s =>
        s.serial.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});
</script>

<style scoped>
.serial-ledger {
    background: #000;
    border: 2px solid #00ff41;
    padding: 1.5rem;
    color: #00ff41;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    box-shadow: 0 0 30px rgba(0, 255, 65, 0.1);
}

.ledger-search {
    background: #111;
    color: #00ff41;
    border: 1px solid rgba(0, 255, 65, 0.5);
    outline: none;
    padding-right: 35px !important;
}

.ledger-search:focus {
    border-color: #00ff41;
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
}

.search-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.5;
}

.table-dark {
    --bs-table-bg: transparent;
    --bs-table-hover-bg: rgba(0, 255, 65, 0.05);
}

.tiny {
    font-size: 0.65rem;
}
</style>