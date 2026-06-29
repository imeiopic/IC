<template>
  <div class="entity-grid mt-4">
    <input v-model="suid" class="form-control bg-black text-white" placeholder="Enter Peer SUID..." />
    <CButton class="w-100 mt-2" @click="$emit('request-bond', suid)">
      EXECUTE_DIRECT_BOND
    </CButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const suid = ref('');
defineEmits(['request-bond']);
</script>