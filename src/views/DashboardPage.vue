<template>
  <div class="dashboard-grid p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
    <!-- IO$ Heartbeat Counter -->
    <div
      class="io-heartbeat bg-slate-900 border-t-4 border-pink-400 rounded-lg shadow-2xl flex flex-col items-center justify-center p-6"
    >
      <h2 class="text-2xl font-bold text-white tracking-widest uppercase mb-2">IO$ Heartbeat</h2>
      <div class="text-5xl font-mono text-pink-400 mb-2">1,600</div>
      <div class="text-xs text-slate-400">Current Heartbeat Value</div>
    </div>
    <!-- Health Node -->
    <Health />
    <!-- Energy Node -->
    <Energy />
    <!-- Pharmacy Node -->
    <Pharmacy />
    <!-- Education Node -->
    <Education />
  </div>
</template>

<script setup lang="ts">
import Health from '@components/Health.vue';
import Energy from '@components/Energy.vue';
import Pharmacy from '@components/Pharmacy.vue';
import Education from '@components/Education.vue';
</script>

<style scoped>
.dashboard-grid {
  min-height: 80vh;
}
</style>
