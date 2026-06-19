/**
 * GeoTools composable
 */
import { ref } from 'vue';

export function useGeoTools() {
  const location = ref({ lat: 0, lng: 0 });

  async function getCurrentLocation() {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition((position) => {
        location.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        resolve(location.value);
      });
    });
  }

  return {
    location,
    getCurrentLocation,
  };
}

export default useGeoTools;
