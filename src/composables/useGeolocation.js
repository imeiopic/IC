// src/composables/useGeolocation.js
// Placeholder composable for geolocation functionality
// Replace with actual logic as needed

import { ref } from 'vue';

export function useGeolocation() {
  const position = ref({ lat: null, lng: null });
  const error = ref(null);

  function getCurrentPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          position.value = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
        },
        (err) => {
          error.value = err.message;
        }
      );
    } else {
      error.value = 'Geolocation is not supported.';
    }
  }

  return {
    position,
    error,
    getCurrentPosition
  };
}
