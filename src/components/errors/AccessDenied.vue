<script setup lang="ts">
import { useMeshStore } from '@/stores/meshStore';
import { useUserStore } from '@/stores/userStore';

const mesh = useMeshStore();
const user = useUserStore();

const handleResync = () => {
  window.location.reload(); // Force full state re-initialization
};
</script>

<template>
  <div class="access-denied-gate">
    <div class="glitch-container">
      <h1 class="font-black text-red-500 tracking-tighter">ACCESS_DENIED</h1>
      <p class="text-zinc-400 font-mono">
        SECURITY_DRIFT_DETECTED: Node ID {{ user.identity.uid.substring(0, 8) }} 
        lacks authorization for current thread T-{{ mesh.activeThreads }}.
      </p>
    </div>

    <div class="diagnostic-grid">
      <div class="stat">
        <label>NODE_ROLE</label>
        <span>{{ user.identity.role || 'GUEST' }}</span>
      </div>
      <div class="stat">
        <label>ACTIVE_THREAD</label>
        <span>T-{{ mesh.activeThreads }}</span>
      </div>
    </div>

    <button @click="handleResync" class="resync-btn">
      INITIATE_MESH_RESYNC
    </button>
  </div>
</template>

<style scoped>
.access-denied-gate {
  @apply flex flex-col items-center justify-center min-h-[50vh] p-8 bg-zinc-950 border border-red-900/50;
}
.glitch-container { @apply mb-8 text-center; }
.diagnostic-grid { @apply flex gap-8 mb-8 font-mono text-[10px] text-zinc-500; }
.stat { @apply flex flex-col items-center uppercase; }
.resync-btn { @apply px-6 py-2 bg-red-900/20 border border-red-500 text-red-500 font-mono hover:bg-red-500 hover:text-black transition-all; }
</style>