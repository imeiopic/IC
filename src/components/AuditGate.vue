<template>
  <component :is="resolvedComponent" />
</template>

<script setup>
import { ref, onMounted, markRaw } from "vue";

const resolvedComponent = ref(null);

onMounted(() => {
  // Logic related to user authentication has been removed.
});
</script>
