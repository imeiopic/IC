<template>
  <div v-if="userRole === 'AUDITOR'" class="auditor-dashboard">
    <header class="dashboard-header">
      <h2>Planetary Audit Node: {{ userRole }}</h2>
      <div class="equity-anchor">
        <span class="label">Caretaker Mutuality Pool (Healthcare/Education)</span>
        <h1 class="balance">${{ mutualityPoolBalance.toLocaleString() }} USD</h1>
      </div>
    </header>

    <section class="audit-controls">
      <button @click="runAudit" class="audit-btn">Initiate Metabolic Integrity Audit</button>
      <div v-if="auditReport.length" class="report-grid">
        <div v-for="report in auditReport" :key="report.groupId" class="report-card">
          <h3>Group: {{ report.groupId }}</h3>
          <p :class="report.status">Status: {{ report.status }}</p>
          <p>Resonance Fidelity: {{ (report.resonance * 100).toFixed(2) }}%</p>
          <p>Symmetry Fracture: {{ report.symmetryFracture }} IO$</p>
        </div>
      </div>
    </section>

    <section class="notice-feed">
      <h3>Systemic Drift Log</h3>
      <ul>
        <li v-for="notice in planetaryNotices.slice(0, 5)" :key="notice.id" :class="notice.type">
          <strong>{{ notice.type }}:</strong> {{ notice.message }}
        </li>
      </ul>
    </section>
  </div>
  <div v-else class="access-denied">
    <p>[RESONANCE_EXCLUSION] Your node ID does not possess AUDITOR sighting privileges.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGlobalMandates } from './ReusableMandate.vue';

// In a real scenario, the UID would come from your auth store
const props = defineProps<{ nodeUid: string }>();

const { 
  userRole, 
  mutualityPoolBalance, 
  syncCaretakerState, 
  auditMetabolicIntegrity,
  planetaryNotices 
} = useGlobalMandates();

const auditReport = ref<any[]>([]);

const runAudit = () => {
  auditReport.value = auditMetabolicIntegrity();
};

onMounted(() => {
  syncCaretakerState(props.nodeUid);
});
</script>

<style scoped>
.auditor-dashboard {
  background: #0a0a0a;
  color: #00ffcc;
  padding: 2rem;
  border: 1px solid #00ffcc;
  border-radius: 12px;
}
.balance {
  font-family: 'Courier New', Courier, monospace;
  color: #fff;
  text-shadow: 0 0 10px #00ffcc;
}
.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}
.report-card {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #00ffcc;
}
.STABLE { color: #00ffcc; }
.UNSTABLE { color: #ff3333; }
.audit-btn {
  background: transparent;
  border: 1px solid #00ffcc;
  color: #00ffcc;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
}
</style>