<template>
  <transition name="modal-fade">
    <!-- Overlay: @click.self ensures we only close if clicking the background, not the modal content -->
    <div
      v-if="isOpen"
      class="modal-overlay"
      @click.self="handleAttemptClose"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content bg-dark text-light border-secondary shadow-lg">
          <!-- Optional Header if title is provided in modalOptions -->
          <div class="modal-header border-secondary" v-if="modalOptions.title">
            <h5 class="modal-title font-monospace text-uppercase text-primary fw-bold">
              {{ modalOptions.title }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              :disabled="modalOptions.disableClose"
              @click="handleAttemptClose"
              aria-label="Close"
            ></button>
          </div>

          <!-- Dynamic Component Injection -->
          <div class="modal-body p-0">
            <component :is="modalComponent" v-bind="modalProps" />
          </div>

          <!-- Universal Close / Abort button mapped from modalOptions -->
          <div
            class="modal-footer border-secondary border-top-0 pt-0"
            v-if="modalOptions.closeText"
          >
            <button
              type="button"
              class="btn btn-outline-secondary w-100 font-monospace text-uppercase"
              :disabled="modalOptions.disableClose"
              @click="handleAttemptClose"
            >
              {{ modalOptions.closeText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useModal } from '../useModal';

const { isOpen, modalComponent, modalProps, modalOptions, closeModal } = useModal();

// Wrapper to check if the modal is locked before closing
const handleAttemptClose = () => {
  if (!modalOptions.value.disableClose) closeModal();
};

// Close the modal when the user presses the Escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    handleAttemptClose();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// Lock the background scrolling when the modal is active
watch(isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85); /* Dark substrate background */
  backdrop-filter: blur(5px);
  z-index: 1055; /* Bootstrap modal tier */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Smooth Fade and Slide-Up Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}
</style>
