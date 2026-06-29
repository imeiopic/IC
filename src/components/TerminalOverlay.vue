<template>
  <Transition name="overlay-fade" appear>
    <div class="terminal-overlay">
      <div class="terminal-overlay-content">
        <button class="close-terminal-btn" @click="$emit('close')">{{ closeText }}</button>

        <!-- Optional Header Projection Area -->
        <header
          v-if="$slots.header"
          class="terminal-header pb-3 mb-3 border-bottom border-success border-opacity-50"
        >
          <slot name="header" :is-maximized="isMaximized" :toggle-maximize="toggleMaximize"></slot>
        </header>

        <!-- Default / Body Projection Area -->
        <slot></slot>

        <!-- Optional Footer Projection Area -->
        <footer
          v-if="$slots.footer"
          class="terminal-footer mt-4 pt-3 border-top border-success border-opacity-25 text-center"
        >
          <slot name="footer"></slot>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  closeText: string;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const isMaximized = ref(false);

const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value;
};
</script>

<style scoped>
.terminal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.terminal-overlay-content {
  position: relative;
  width: 100%;
  max-width: 750px;
  transition: max-width 0.3s ease;
  padding: 1rem;
  animation: manifestZoom 0.3s ease-out forwards;
}

.close-terminal-btn {
  position: absolute;
  top: -30px;
  right: 1rem;
  background: transparent;
  color: #ff5252;
  border: 1px solid #ff5252;
  font-family: 'Share Tech Mono', monospace;
  cursor: pointer;
  padding: 4px 12px;
  transition: all 0.3s;
}

.close-terminal-btn:hover {
  background: #ff5252;
  color: #000;
  box-shadow: 0 0 15px rgba(255, 82, 82, 0.5);
}

/* --- Vue Transition Classes --- */

/* Smooth fade for the background backdrop */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* Simultaneously shrink and blur the inner content slightly when leaving */
.overlay-fade-leave-active .terminal-overlay-content {
  transition: transform 0.3s ease, filter 0.3s ease;
  transform: scale(0.95);
  filter: blur(4px);
}
</style>
