import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useCheckoutStore = defineStore('checkout', () => {
  const STORAGE_KEY = 'iopic_selected_anchor';
  const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  // Initialize state from localStorage with expiration check
  const getInitialData = (): { id: string | null; timestamp: number | null } => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { id: null, timestamp: null };

    try {
      const data = JSON.parse(stored);
      if (data.id && data.timestamp && Date.now() - data.timestamp < EXPIRATION_MS) {
        return { id: data.id, timestamp: data.timestamp };
      }
    } catch (e) {
      // Handle legacy string format or invalid JSON by clearing
    }
    localStorage.removeItem(STORAGE_KEY);
    return { id: null, timestamp: null };
  };

  const initial = getInitialData();
  const selectedAnchorId = ref<string | null>(initial.id);
  const selectedTimestamp = ref<number | null>(initial.timestamp);

  function setAnchorSelection(id: string) {
    console.log(`[CHECKOUT_STORE] Anchor selected: ${id}`);
    selectedTimestamp.value = Date.now();
    selectedAnchorId.value = id;
  }

  function clearAnchorSelection() {
    selectedAnchorId.value = null;
    selectedTimestamp.value = null;
  }

  // Synchronize state changes to localStorage
  watch(selectedAnchorId, (newId) => {
    if (newId) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          id: newId,
          timestamp: selectedTimestamp.value
        })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  });

  return {
    selectedAnchorId,
    selectedTimestamp,
    EXPIRATION_MS,
    setAnchorSelection,
    clearAnchorSelection
  };
});
