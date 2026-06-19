import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCheckoutStore = defineStore('checkout', () => {
  // Persist selection in localStorage to handle page refreshes during the handshake
  const selectedAnchorId = ref<string | null>(localStorage.getItem('io_selected_anchor'));
  const selectedTimestamp = ref<number | null>(
    Number(localStorage.getItem('io_selected_ts')) || null
  );
  const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24-hour validity for pending selections

  const setAnchorSelection = (anchorId: string) => {
    selectedAnchorId.value = anchorId;
    selectedTimestamp.value = Date.now();
    localStorage.setItem('io_selected_anchor', anchorId);
    localStorage.setItem('io_selected_ts', selectedTimestamp.value.toString());
  };

  const clearAnchorSelection = () => {
    selectedAnchorId.value = null;
    selectedTimestamp.value = null;
    localStorage.removeItem('io_selected_anchor');
    localStorage.removeItem('io_selected_ts');
  };

  return {
    selectedAnchorId,
    selectedTimestamp,
    EXPIRATION_MS,
    setAnchorSelection,
    clearAnchorSelection
  };
});