<script setup lang="ts">
import { isPrefetching, globalProgress } from '@/directives/prefetch';
</script>

<template>
  <Transition name="fade">
    <div v-if="isPrefetching" class="prefetch-loading-bar">
      <div 
        class="progress-glow" 
        :class="{ indeterminate: globalProgress === 0 }"
        :style="{ width: globalProgress > 0 ? globalProgress + '%' : '30%' }"
      ></div>
    </div>
  </Transition>
</template>

<style scoped>
.prefetch-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(0, 229, 255, 0.1);
  z-index: 9999;
  overflow: hidden;
}

.progress-glow {
  height: 100%;
  background: #00e5ff;
  box-shadow: 0 0 10px #00e5ff;
  transition: width 0.3s ease;
}

.progress-glow.indeterminate {
  animation: prefetch-slide 1.5s infinite ease-in-out;
}

@keyframes prefetch-slide {
  0% { transform: translateX(-100%); width: 10%; }
  50% { transform: translateX(50%); width: 40%; }
  100% { transform: translateX(200%); width: 10%; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>