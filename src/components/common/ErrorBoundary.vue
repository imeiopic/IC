<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const error = ref<Error | null>(null);
const retryCount = ref(0);
const maxRetries = 3;

onErrorCaptured((err) => {
  error.value = err;
  
  if (retryCount.value < maxRetries) {
    retryCount.value++;
    const backoff = Math.pow(2, retryCount.value) * 1000; // Exponential delay: 2s, 4s, 8s
    
    console.warn(`[MESH_RETRY] Attempt ${retryCount.value} in ${backoff}ms`);
    
    setTimeout(() => {
      error.value = null;
    }, backoff);
    
    return false; // Suppress error
  }
  
  return true; // Allow error to propagate if max retries reached
});
</script>

<template>
  <slot v-if="!error" />
  <div v-else-if="retryCount < maxRetries" class="retry-indicator">
    <p>MESH_SIGNAL_LOST. REATTEMPTING_SYNC... ({{ retryCount }}/{{ maxRetries }})</p>
  </div>
  <div v-else class="error-fallback">
    <p>CRITICAL_MESH_FRACTURE. REINITIALIZE_NODE_MANUALLY.</p>
    <button @click="retryCount = 0; error = null">RESET_SEQUENCE</button>
  </div>
</template>