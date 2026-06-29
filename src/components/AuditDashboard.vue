<script setup lang="ts">
import { useAuditStore } from '@/stores/auditStore';
import { globalProgress } from '@/directives/prefetch';
import { CButton, CSpinner } from '@coreui/vue';

const auditStore = useAuditStore();

const handleRetry = () => {
  // Trigger the chunked fetch and pipe progress to the global loading bar
  auditStore.fetchAuditLogsChunked((percent) => {
    globalProgress.value = percent;
  });
};
</script>

<template>
  <div class="audit-substrate p-4 font-mono">
    <!-- Audit Sync Error / Retry Interface -->
    <Transition name="fade">
      <div 
        v-if="auditStore.error" 
        class="audit-fracture-alert p-3 border border-danger bg-danger bg-opacity-10 rounded mb-4 shadow-danger"
      >
        <div class="d-flex align-items-center mb-2">
          <div class="status-orb bg-danger me-2"></div>
          <p class="text-danger font-black italic tiny mb-0 uppercase">[LOG_SYNCHRONIZATION_ERROR]</p>
        </div>
        
        <p class="text-danger extra-tiny mb-3 opacity-75">
          {{ auditStore.error }}
        </p>
        
        <CButton
          color="danger"
          variant="outline"
          class="w-100 py-2 font-black italic extra-tiny shadow-danger"
          :disabled="auditStore.isLoading"
          @click="handleRetry"
        >
          <CSpinner v-if="auditStore.isLoading" component="span" size="sm" class="me-2" />
          {{ auditStore.isLoading ? 'RE-IGNITING_LOG_STREAM...' : 'ATTEMPT_SUBSTRATE_RECOVERY' }}
        </CButton>
      </div>
    </Transition>

    <!-- Standard Content Area -->
    <div v-if="!auditStore.error && auditStore.logs.length > 0">
      <!-- Your log table and visualization logic goes here -->
    </div>
  </div>
</template>

<style scoped>
.status-orb {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}
</style>
