<template>
  <button class="read-docs-btn" @click="showDocs = true">Read Docs</button>
  <IopicDocumentation v-if="showDocs" @close="showDocs = false" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import IopicDocumentation from "./IopicDocumentation.vue";

const showDocs = ref(false);
</script>

<style scoped>
.read-docs-btn {
  background: #2a4a7a;
  color: #fff;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  margin: 1rem 0;
  transition: background 0.2s;
}
.read-docs-btn:hover {
  background: #18325a;
}
</style>
