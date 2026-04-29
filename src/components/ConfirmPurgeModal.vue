<template>
  <div class="p-3 text-center">
    <i class="bi bi-exclamation-triangle text-danger display-1 mb-3"></i>
    <h4 class="text-danger fw-bold text-uppercase">Critical Warning</h4>
    <p class="text-muted small mb-4">
      You are about to irreversibly purge protocol logs from the identity substrate. This action
      cannot be undone. Are you absolutely sure you want to proceed?
    </p>
    <button
      @click="handleConfirm"
      :disabled="isProcessing"
      class="btn btn-danger fw-bold text-uppercase w-100 shadow-sm"
    >
      <span
        v-if="isProcessing"
        class="spinner-border spinner-border-sm me-2"
        role="status"
        aria-hidden="true"
      ></span>
      {{ isProcessing ? 'Purging...' : 'Acknowledge & Purge' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useModal } from '../useModal';

const props = defineProps<{
  onConfirm: () => Promise<void> | void;
}>();

const isProcessing = ref(false);
const { modalOptions } = useModal();

const handleConfirm = async () => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  modalOptions.value.disableClose = true; // Lock the modal
  try {
    await props.onConfirm();
  } finally {
    isProcessing.value = false;
    modalOptions.value.disableClose = false; // Unlock the modal
  }
};

// Ensure we unlock if the component is somehow unmounted unexpectedly
onUnmounted(() => {
  modalOptions.value.disableClose = false;
});
</script>
