<template>
  <transition name="pulse-fade">
    <div v-if="show" class="pulse-overlay pointer-events-none">
      <div class="pulse-ripple"></div>
      <div class="pulse-message">
        <span class="font-mono text-cyan-400 text-xs uppercase tracking-widest"
          >1,600 IO$ Dividend Distributed</span
        >
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watchEffect, onUnmounted } from 'vue';

const props = defineProps({
  trigger: Boolean
});

const show = ref(false);
let timeoutId = null;

watchEffect(() => {
  if (props.trigger) {
    show.value = true;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      show.value = false;
    }, 1600);
  }
});

onUnmounted(() => {
  clearTimeout(timeoutId);
});
</script>

<style scoped>
.pulse-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.pulse-ripple {
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(34, 211, 238, 0.4) 0%,
    rgba(8, 47, 73, 0.2) 70%,
    transparent 100%
  );
  animation: pulse-ripple 1.6s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes pulse-ripple {
  0% {
    transform: scale(0.7);
    opacity: 0.7;
  }
  60% {
    transform: scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}
.pulse-message {
  position: absolute;
  bottom: 18%;
  left: 0;
  width: 100%;
  text-align: center;
  pointer-events: none;
}
.pulse-fade-enter-active,
.pulse-fade-leave-active {
  transition: opacity 0.4s;
}
.pulse-fade-enter-from,
.pulse-fade-leave-to {
  opacity: 0;
}
</style>
