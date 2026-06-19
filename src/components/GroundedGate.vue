<script setup lang="ts">
/**
 * GroundedGate.vue
 * Helper component to conditionally render UI based on the Node's grounding state.
 */
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';

const userStore = useUserStore();

// Determine if the store is still in a transitional/loading phase
const isLoading = computed(() => userStore.isLoadingAuth || userStore.isLoadingRole || userStore.isInitialLoad);

// Identity Grounding status
const isGrounded = computed(() => userStore.isGrounded);
</script>

<template>
  <div class="grounded-gate-substrate">
    <!-- 1. Loading State: Phase alignment in progress -->
    <slot v-if="isLoading" name="loading">
      <div class="p-4 text-center font-mono text-zinc-500 animate-pulse text-xs tracking-widest">
        [SIGHTING_NODE_STABILITY...]
      </div>
    </slot>

    <!-- 2. Grounded State: Node is phase-locked and equity is verified -->
    <slot v-else-if="isGrounded" name="grounded" />

    <!-- 3. Ungrounded State: Default fallback for uninitialized nodes -->
    <slot v-else name="ungrounded">
      <div class="p-6 border border-dashed border-zinc-800 bg-zinc-950/50 text-center rounded flex flex-col items-center">
        <div class="w-2 h-2 rounded-full bg-red-500 animate-ping mb-3"></div>
        <p class="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">
          Access Restricted: Node Pulse Ungrounded
        </p>
        
        <!-- Optional slot for a call-to-action (e.g., checkout button) -->
        <slot name="action" />
      </div>
    </slot>
  </div>
</template>

<style scoped>
.grounded-gate-substrate {
  width: 100%;
  position: relative;
  transition: opacity 0.3s ease;
}
</style>
