// src/composables/useSystemBus.js
// Placeholder composable for system bus functionality
// Replace with actual logic as needed

import { ref } from 'vue';

export function useSystemBus() {
  // Example event bus state
  const events = ref([]);

  function emit(event, payload) {
    events.value.push({ event, payload });
  }

  function on(event, handler) {
    // Placeholder: add real event handling logic
    // For now, just log
    console.log(`Listening for event: ${event}`);
  }

  return {
    events,
    emit,
    on
  };
}
