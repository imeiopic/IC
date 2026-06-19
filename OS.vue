<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide } from 'vue';
import { useGlobalMandates } from './ReusableMandate.vue';

/**
 * OS.vue - The Root Anchor Control Center
 * 
 * Acts as the primary orchestrator for the GCP framework.
 * Manages the shared global mandate state and schedules regular
 * metabolic integrity audits.
 */

const globalMandates = useGlobalMandates();

// Provide the global mandate state to all child components (e.g., Connector.vue, Rem.vue)
// to ensure they are all operating on the same 16-thread bus instance.
provide('globalMandates', globalMandates);

const { auditMetabolicIntegrity, groupRegistry } = globalMandates;

let auditIntervalId: number | undefined;
const lastAuditReports = ref<any[]>([]);
const selectedGroupId = ref<string | null>(null);

const selectedGroup = computed(() => selectedGroupId.value ? groupRegistry.value[selectedGroupId.value] : null);

onMounted(() => {
  console.log('[OS] Initializing Root Anchor audit cycle...');
  
  // Initial audit on startup to establish the baseline mesh state
  lastAuditReports.value = auditMetabolicIntegrity();

  // Trigger audit on a set interval (e.g., every 60 seconds)
  // to maintain planetary resonance and detect entropy drift.
  auditIntervalId = window.setInterval(() => {
    lastAuditReports.value = auditMetabolicIntegrity();
    console.log('[OS] Periodic Audit Complete:', lastAuditReports.value);
  }, 60000); 
});

onUnmounted(() => {
  if (auditIntervalId !== undefined) {
    window.clearInterval(auditIntervalId);
    console.log('[OS] Audit cycle terminated.');
  }
});
</script>

<template>
  <div class="os-root-anchor">
    <!-- Global Mesh Status Dashboard -->
    <section class="audit-summary">
      <h2>Root Anchor: Planetary Mesh Audit</h2>
      <div v-if="lastAuditReports.length > 0" class="report-container">
        <div v-for="report in lastAuditReports" :key="report.groupId" 
             class="report-item" :class="[report.status.toLowerCase(), { selected: selectedGroupId === report.groupId }]"
             @click="selectedGroupId = report.groupId">
          <div class="report-header">
            <span class="quadrant-id">QUADRANT: {{ report.groupId }}</span>
            <span class="status-tag">[{{ report.status }}]</span>
          </div>
          <div class="report-stats">
            <span>Schumann Fidelity: {{ (report.resonance * 100).toFixed(1) }}%</span>
            <span>Metabolic Fracture: {{ report.symmetryFracture.toFixed(2) }} IO$</span>
          </div>
        </div>
      </div>
      <div v-else class="searching-mesh">Awaiting initial substrate grounding...</div>
    </section>

    <!-- 16-Thread Bus Detail -->
    <section v-if="selectedGroup" class="thread-detail">
      <h3>Thread Alignment Detail: {{ selectedGroupId }}</h3>
      <div class="thread-grid">
        <div v-for="(aligned, index) in selectedGroup.threadAlignment" :key="index" 
             class="thread-node" :class="{ 'partitioned': !aligned }">
          <span class="thread-index">{{ index.toString(16).toUpperCase() }}</span>
          <span class="thread-label">{{ aligned ? 'ALIGNED' : 'LOCKED' }}</span>
        </div>
      </div>
    </section>

    <slot />
  </div>
</template>

<style scoped>
.os-root-anchor {
  padding: 1.5rem;
  background: #050505;
  color: #00ff41;
  font-family: 'Courier New', Courier, monospace;
  min-height: 100vh;
}
.audit-summary {
  border: 1px solid #00ff41;
  padding: 1rem;
  margin-bottom: 2rem;
  background: rgba(0, 255, 65, 0.02);
}
.report-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1rem;
}
.report-item {
  border: 1px solid #1a1a1a;
  padding: 0.75rem;
  min-width: 260px;
  background: #000;
}
.report-item.unstable { border-color: #ff3b3b; color: #ff3b3b; box-shadow: 0 0 10px rgba(255, 59, 59, 0.2); }
.report-item.selected { border-color: #00ff41; background: rgba(0, 255, 65, 0.1); }
.report-header { display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 0.5rem; }
.report-stats { font-size: 0.85rem; margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
.searching-mesh { font-style: italic; opacity: 0.6; }

.thread-detail {
  border: 1px solid #00ff41;
  padding: 1rem;
  background: #000;
}
.thread-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 1rem;
}
.thread-node {
  border: 1px solid #333;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #0a0a0a;
  transition: all 0.3s ease;
}
.thread-node.partitioned {
  border-color: #ff3b3b;
  color: #ff3b3b;
}
.thread-index { font-size: 1.2rem; font-weight: bold; }
.thread-label { font-size: 0.6rem; margin-top: 4px; }
</style>
