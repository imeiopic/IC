<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 10000">
    <!-- Global Error Notification -->
    <div
      v-if="globalError"
      class="toast show align-items-center text-white bg-danger border-0 mb-2"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ globalError }}
        </div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          @click="clearError"
          aria-label="Close"
        ></button>
      </div>
    </div>

    <!-- Global Success Notification -->
    <div
      v-if="successMessage"
      class="toast show align-items-center text-white bg-success border-0"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi bi-check-circle-fill me-2"></i>
          {{ successMessage }}
        </div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          @click="clearSuccessMessage"
          aria-label="Close"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useError } from '../useError';
import { useSuccess } from '../useSuccess';

const { globalError, clearError } = useError();
const { successMessage, clearSuccessMessage } = useSuccess();

// Automatic grounding of error messages after 5 seconds
watch(globalError, (newVal) => {
  if (newVal) {
    setTimeout(() => clearError(), 5000);
  }
});

// Automatic grounding of success messages after 5 seconds
watch(successMessage, (newVal) => {
  if (newVal) {
    setTimeout(() => clearSuccessMessage(), 5000);
  }
});
</script>

<style scoped>
.toast-container {
  min-width: 350px;
}
.toast {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.5);
}
</style>
