<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMeshStore } from '@/stores/meshStore';
import { useUserStore } from '@/stores/userStore';

const mesh = useMeshStore();
const user = useUserStore();

const isDeploymentInProgress = ref(false);

/**
 * VERSION_SYNC_CHECK:
 * Compares client manifest with remote thread status.
 */
const checkSystemStatus = async () => {
  try {
    const remoteVersion = await mesh.getRemoteManifestVersion();
    const localVersion = import.meta.env.VITE_APP_VERSION;
    
    if (remoteVersion !== localVersion) {
      isDeploymentInProgress.value = true;
    }
  } catch (err) {
    console.error('[MESH_MANIFEST_SYNC_ERROR]:', err);
  }
};

const reportFracture = () => {
  mesh.logEvent('COMPONENT_MISSING_REPORT', {
    role: user.identity.role,
    thread: mesh.activeThreads,
    timestamp: new Date().toISOString()
  });
  alert('MANIFEST_FAILURE_REPORTED_TO_CORE');
};

onMounted(checkSystemStatus);
</script>

<template>
  <div class="missing-component-substrate">
    <div class="icon-pulse">
      <i class="bi bi-exclamation-triangle-fill text-yellow-500"></i>
    </div>
    
    <h2 v-if="isDeploymentInProgress" class="text-blue-400 font-black tracking-widest mt-4">
      SYSTEM_UPDATE_IN_PROGRESS
    </h2>
    <h2 v-else class="text-white font-black tracking-widest mt-4">
      MANIFEST_ABSENT
    </h2>

    <p v-if="isDeploymentInProgress" class="text-zinc-400 font-mono text-sm max-w-md mt-2">
      The mesh is currently re-indexing for version updates. 
      Please hold for automatic thread-reconnection.
    </p>

    <p v-else class="text-zinc-500 font-mono text-sm max-w-md mt-2">
      The interface requested for ROLE: {{ user.identity.role?.toUpperCase() }} 
      within THREAD: T-{{ mesh.activeThreads }} has not been initialized in the local registry.
    </p>

    <div class="mt-8 flex gap-4">
      <button v-if="!isDeploymentInProgress" @click="reportFracture" class="btn-report">
        REPORT_FRACTURE
      </button>
      <button @click="window.location.reload()" class="btn-retry">
        FORCE_REINITIALIZATION
      </button>
    </div>
  </div>
</template>

<style scoped>
.missing-component-substrate {
  @apply flex flex-col items-center justify-center p-12 bg-black border-l-4 border-yellow-500 min-h-[40vh];
}
.icon-pulse { @apply text-4xl animate-pulse; }
.btn-report { @apply px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white font-mono text-[10px] transition-colors; }
.btn-retry { @apply px-4 py-2 bg-yellow-500/10 border border-yellow-500 text-yellow-500 font-mono text-[10px] hover:bg-yellow-500 hover:text-black transition-all; }
</style>