/**
 * History Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useHistoryStore = defineStore('history', () => {
  const history = ref<Array<{ id: string; action: string; timestamp: number }>>([]);

  function addHistoryEntry(action: string) {
    history.value.push({
      id: Date.now().toString(),
      action,
      timestamp: Date.now(),
    });
  }

  function clearHistory() {
    history.value = [];
  }

  return {
    history,
    addHistoryEntry,
    clearHistory,
  };
});
