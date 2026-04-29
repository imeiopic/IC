import { ref, onMounted, onUnmounted } from 'vue';

export function useGeolocation() {
  const currentCoords = ref<{ lat: number; lon: number } | null>(null);
  const geolocationError = ref<string | null>(null);
  let watchId: number | null = null;

  onMounted(() => {
    if (!navigator.geolocation) {
      geolocationError.value = 'Geolocation is not supported by your browser.';
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        currentCoords.value = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        geolocationError.value = null;
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            geolocationError.value = 'Spatial Access Denied: Logical Truth requires GPS synchronization.';
            break;
          case error.POSITION_UNAVAILABLE:
            geolocationError.value = 'Spatial Data Stream Disrupted: Location information unavailable.';
            break;
          case error.TIMEOUT:
            geolocationError.value = 'Network Timeout: Spatial resolution timed out.';
            break;
          default:
            geolocationError.value = 'An unknown spatial error occurred.';
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });

  onUnmounted(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  });

  return { currentCoords, geolocationError };
}