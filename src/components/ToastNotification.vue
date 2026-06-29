<template>
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <transition-group name="toast-fade">
      <div
        v-for="err in errorQueue"
        :key="err.id"
        class="toast show align-items-center text-white bg-danger mb-2"
      >
        <div class="d-flex">
          <div class="toast-body">{{ err.text }}</div>
          <button class="btn-close btn-close-white" @click="removeError(err.id)"></button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useError } from '@/composables/useError';

const { errorQueue, removeError } = useError();

</script>

<style scoped>
.toast-container {
  min-width: 350px;
}
.toast {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.5);
}
</style>
