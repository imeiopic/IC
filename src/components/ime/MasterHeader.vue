<template>
  <header
    class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3 relative"
  >
    <div class="brand d-flex align-items-center gap-3">
      <img
        :src="photoURL || '/images/iologo.png'"
        :alt="displayName || 'IOPIC'"
        width="40"
        height="40"
        class="rounded-circle border border-info"
      />
      <h1 class="text-glow text-info m-0 italic font-black">Ime.MASTER_CONTROL</h1>
    </div>
    <div class="system-health tiny text-info opacity-75 d-none d-md-block">
      <span>GLOBAL_FREQ: 7.83Hz</span> |
      <span v-if="displayName">OPERATOR: {{ displayName }}</span>
      <span v-else>NODE: {{ userId }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  userId: string;
  displayName?: string | null;
  photoURL?: string | null;
}>();
</script>
