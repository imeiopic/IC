<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { useMeshStore } from '@/stores/meshStore';

const userStore = useUserStore();
const authStore = useAuthStore();
const meshStore = useMeshStore();

/**
 * THREAD_AWARE_RESOLVER:
 * Maps { Role, ThreadID } to specific component implementations.
 */
const ActiveComponent = computed(() => {
  const role = userStore.identity.role;
  const tId = meshStore.activeThreads;

  // 1. Security Gate: Verify access before resolution
  if (!authStore.canAccess(role)) {
    return defineAsyncComponent(() => import('@/components/errors/AccessDenied.vue'));
  }

  // 2. Thread-Specific Component Mapping
  // Example: Driver on T-05 gets high-performance transit dash; T-12 gets audit tools.
  const componentPath = resolvePath(role, tId);
  
  return defineAsyncComponent(() => import(`@/components/roles/${componentPath}.vue`)
    .catch(() => import('@/components/errors/ComponentMissing.vue'))
  );
});

function resolvePath(role: string, tId: number): string {
  // Logic for branching interfaces based on thread density/function
  if (role === 'driver' && tId >= 10) return 'DriverAuditDash';
  if (role === 'driver') return 'DriverTransitDash';
  
  return `${role.charAt(0).toUpperCase() + role.slice(1)}Interface`;
}
</script>

<template>
  <div class="role-router-substrate">
    <transition name="mesh-transition" mode="out-in">
      <component :is="ActiveComponent" :key="meshStore.activeThreads" />
    </transition>
  </div>
</template>

<style scoped>
.mesh-transition-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.mesh-transition-enter-from { opacity: 0; transform: translateY(10px); }
</style>