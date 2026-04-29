// src/composables/useRankHistory.js
// Placeholder composable for rank history functionality
// Replace with actual logic as needed

import { ref } from 'vue';

export function useRankHistory() {
  const rankHistory = ref([]);
  function addRankEntry(entry) {
    rankHistory.value.push(entry);
  }
  function clearHistory() {
    rankHistory.value = [];
  }
  return {
    rankHistory,
    addRankEntry,
    clearHistory
  };
}
