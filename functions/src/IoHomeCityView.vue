<template>
  <div
    class="city-view-container bg-black border border-zinc-800 rounded overflow-hidden position-relative"
    style="height: 500px"
  >
    <div class="search-bar-wrapper position-absolute top-0 start-0 p-3 z-index-2 w-100">
      <div class="d-flex gap-2 mb-2">
        <input
          type="text"
          v-model="searchQuery"
          @keyup.enter="searchAddress"
          placeholder="Enter address or location..."
          class="form-control extra-tiny bg-black border border-zinc-700 text-white p-2 rounded flex-grow-1"
        />
        <button @click="searchAddress" class="btn btn-sm btn-outline-info extra-tiny font-black">
          SEARCH
        </button>
      </div>
      <div v-if="errorMessage" class="text-center text-danger extra-tiny mb-2">
        {{ errorMessage }}
      </div>

      <!-- New: Save Location UI -->
      <div
        class="save-location-section bg-black-50 blur-bg p-2 rounded border border-zinc-700 mb-2"
      >
        <div class="d-flex gap-2 align-items-center mb-2">
          <input
            type="text"
            v-model="locationName"
            placeholder="Name this location..."
            class="form-control extra-tiny bg-black border border-zinc-700 text-white p-1 rounded flex-grow-1"
          />
          <button
            @click="saveCurrentLocation"
            class="btn btn-sm btn-outline-success extra-tiny font-black"
            :disabled="!locationName.trim()"
          >
            SAVE
          </button>
        </div>
        <div v-if="sharedMessage" class="text-center text-success extra-tiny mb-2">
          {{ sharedMessage }}
        </div>
        <div v-if="savedLocations.length > 0">
          <h6 class="extra-tiny text-info uppercase font-black mb-1">Saved Locations:</h6>
          <div
            v-for="(loc, index) in savedLocations"
            :key="index"
            class="d-flex justify-content-between align-items-center gap-2 mb-1"
          >
            <span class="tiny text-zinc-300 flex-grow-1">{{ loc.name }}</span>
            <button
              @click="loadLocation(loc)"
              class="btn btn-sm btn-outline-primary extra-tiny font-black"
            >
              LOAD
            </button>
            <button
              @click="shareLocation(loc)"
              class="btn btn-sm btn-outline-secondary extra-tiny font-black"
              title="Share this location"
            >
              SHARE
            </button>
            <button
              @click="deleteLocation(index)"
              class="btn btn-sm btn-outline-danger extra-tiny font-black"
            >
              DEL
            </button>
          </div>
        </div>
        <p v-else class="extra-tiny text-zinc-500">No saved locations yet.</p>
      </div>
    </div>

    <!-- New: VRE Locality Selector -->
    <div class="vre-locality-selector position-absolute bottom-0 start-0 p-3 z-index-2 w-100">
      <label for="vre-select" class="extra-tiny text-zinc-400 uppercase mb-1 d-block"
        >SIGHT VRE LOCALITY:</label
      >
      <select
        id="vre-select"
        v-model="selectedVRELocality"
        class="form-select form-select-sm bg-black border border-zinc-700 text-white extra-tiny"
        @change="updateMapFromVRELocality"
      >
        <option value="">-- Select a VRE Locality --</option>
        <option v-for="loc in vreDisplayStrings" :key="loc" :value="loc">
          {{ loc }}
        </option>
      </select>
      <div v-if="vreLocalityError" class="text-danger extra-tiny mt-2">
        {{ vreLocalityError }}
      </div>
    </div>
    <div id="street-view-panorama" class="w-100 h-100"></div>
    <div
      class="overlay-text position-absolute top-50 start-50 translate-middle text-center text-white opacity-50"
    >
      <h4 class="font-black mb-0">CLUSTER_STREET_VIEW: CLE_US</h4>
      <p class="extra-tiny text-zinc-500 uppercase">Sighting Grounded Reality</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'; // Added 'computed'
import { useRoute, useRouter } from 'vue-router'; // Import useRoute and useRouter

import { parseVRELocality, VRE_LOCALITIES, type VRELocalityData } from '../../src/utils/spatial'; // Import the new utility
const route = useRoute();
const router = useRouter();

// Define props for dynamic location
const props = defineProps({
  lat: {
    type: Number,
    default: 41.4993 // Default to Cleveland's latitude
  },
  lng: {
    type: Number,
    default: -81.6944 // Default to Cleveland's longitude
  }
});

const panorama = ref<google.maps.StreetViewPanorama | null>(null);
const searchQuery = ref(''); // Holds the user's search input
const geocoder = ref<google.maps.Geocoder | null>(null); // Google Maps Geocoder service
const errorMessage = ref(''); // Stores error messages for the user
const sharedMessage = ref(''); // Message for sharing feedback

// Declared missing reactive variables
const locationName = ref('');
interface SavedLocation { name: string; lat: number; lng: number; }
const savedLocations = ref<SavedLocation[]>([]);


const googleMapsScriptLoaded = ref(false);

// New: VRE Locality State
const selectedVRELocality = ref<string>('');
const vreLocalityError = ref<string | null>(null);

const vreLocalities = ref<VRELocalityData[]>(VRE_LOCALITIES);

// Computed property to get just the display strings for the dropdown
const vreDisplayStrings = computed(() =>
  vreLocalities.value.map((loc) => loc.displayString)
);

/**
 * Loads the Google Maps JavaScript API script dynamically.
 * It sets a global callback function `initStreetView` which is called once the API is loaded.
 */
const loadGoogleMapsScript = () => {
  if (googleMapsScriptLoaded.value) return;

  const script = document.createElement('script');
  // Ensure you have VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY in your .env file.
  // The 'places' library is included, which provides the Geocoding service.
  script.src = `https://maps.googleapis.com/maps/api/js?key=${
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY // import.meta.env is now correctly typed via env.d.ts and tsconfig.json
  }&libraries=places&callback=initStreetView`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  window.initStreetView = () => {
    googleMapsScriptLoaded.value = true; // Mark script as loaded
    geocoder.value = new window.google.maps.Geocoder(); // Initialize Geocoder once API is loaded
    initPanorama();
  };
};

/**
 * Initializes the Street View Panorama once the Google Maps API is loaded.
 */
const initPanorama = () => {
  if (!googleMapsScriptLoaded.value || !window.google) return;

  // Determine initial position: URL query params > props > default
  let initialLat = props.lat;
  let initialLng = props.lng;
  let initialName = '';

  if (route.query.lat && route.query.lng) {
    initialLat = parseFloat(route.query.lat as string);
    initialLng = parseFloat(route.query.lng as string);
    initialName = (route.query.name as string) || '';
    if (initialName) searchQuery.value = initialName; // Pre-fill search if name provided
    errorMessage.value = ''; // Clear any error if loading from URL
  }

  const streetViewDiv = document.getElementById('street-view-panorama');
  if (streetViewDiv) {
    panorama.value = new window.google.maps.StreetViewPanorama(streetViewDiv, {
      position: { lat: initialLat, lng: initialLng },
      pov: { heading: 270, pitch: 0 }, // Default POV
      zoom: 1,
      addressControl: false,
      linksControl: false,
      panControl: false,
      zoomControl: false,
      enableCloseButton: false,
      fullscreenControl: false,
      motionTrackingControl: false,
      showRoadLabels: false,
      source: window.google.maps.StreetViewSource.OUTDOOR // Prioritize outdoor panoramas
    });
  }

  // Update overlay text if a name was provided via URL
  if (initialName) {
    // You might want to update the overlay text dynamically here
  }
};

/**
 * Searches for an address using the Geocoding service and updates the Street View panorama.
 */
const searchAddress = () => {
  errorMessage.value = ''; // Clear any previous error messages
  if (!searchQuery.value.trim()) {
    errorMessage.value = 'Please enter an address or location.';
    return;
  }

  if (!geocoder.value) {
    errorMessage.value = 'Google Maps Geocoder not initialized. Please try again.';
    return;
  }

  geocoder.value.geocode({ address: searchQuery.value }, (results, status) => {
    if (status === 'OK' && results && results[0]) {
      const location = results[0].geometry.location;
      if (panorama.value) {
        panorama.value.setPosition(location);
        // Optionally, you could update the overlay text here to reflect the new location
        // e.g., CLUSTER_STREET_VIEW: {{ results[0].formatted_address }}
      }
    } else {
      errorMessage.value = `Could not find location: ${status}. Please try a different address.`;
      console.error('Geocode was not successful for the following reason:', status);
    }
  });
};

/**
 * Saves the current Street View panorama's location to the list of favorites.
 */
const saveCurrentLocation = () => {
  if (!panorama.value) {
    errorMessage.value = 'Street View not loaded yet.';
    return;
  }
  if (!locationName.value.trim()) {
    errorMessage.value = 'Please enter a name for this location.';
    return;
  }

  const position = panorama.value.getPosition();
  if (position) {
    savedLocations.value.push({ // Corrected: savedLocations is now a ref
      name: locationName.value.trim(),
      lat: position.lat(),
      lng: position.lng()
    });
    locationName.value = ''; // Clear input after saving
    errorMessage.value = ''; // Clear any error messages
  } else {
    errorMessage.value = 'Could not get current panorama position.';
  }
};

/**
 * Loads a saved location into the Street View panorama.
 * @param location The saved location object.
 */
const loadLocation = (location: SavedLocation) => { // Typed 'location'
  if (panorama.value) {
    panorama.value.setPosition({ lat: location.lat, lng: location.lng });
    errorMessage.value = ''; // Clear any error messages
  } else {
    errorMessage.value = 'Street View not loaded yet.';
  }
};

/**
 * Deletes a saved location from the list.
 * @param index The index of the location to delete.
 */
const deleteLocation = (index: number) => { // Corrected: savedLocations is now a ref
  savedLocations.value.splice(index, 1);
};

/**
 * Generates a shareable URL for a given location and copies it to the clipboard.
 * @param location The location object to share.
 */
const shareLocation = async (location: SavedLocation) => { // Typed 'location'
  const baseUrl = window.location.origin + router.resolve({ path: route.path }).href.split('?')[0];
  const shareUrl = `${baseUrl}?lat=${location.lat}&lng=${location.lng}&name=${encodeURIComponent(
    location.name
  )}`;

  try {
    await navigator.clipboard.writeText(shareUrl);
    sharedMessage.value = 'Link copied to clipboard!';
    setTimeout(() => {
      sharedMessage.value = '';
    }, 3000); // Clear message after 3 seconds
  } catch (err) {
    console.error('Failed to copy: ', err);
    sharedMessage.value = 'Failed to copy link.';
    setTimeout(() => {
      sharedMessage.value = '';
    }, 3000);
  }
};

const LOCAL_STORAGE_KEY = 'io_home_city_view_saved_locations';

onMounted(() => {
  loadGoogleMapsScript();

  // Check for URL parameters immediately after script load is initiated
  // The actual panorama initialization will use these if present.
  if (route.query.lat && route.query.lng) {
    // Ensure the script is loaded before trying to initialize panorama with URL params
    // This is handled by initStreetView callback, but we set searchQuery here for UI
    const nameFromUrl = route.query.name as string;
    if (nameFromUrl) {
      searchQuery.value = decodeURIComponent(nameFromUrl);
    }
  }

  // Load saved locations from localStorage
  const storedLocations = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedLocations) { // Corrected: savedLocations is now a ref
    savedLocations.value = JSON.parse(storedLocations);
  }
});

onUnmounted(() => {
  // Clean up the global callback if it was set
  if (window.initStreetView) {
    delete (window as any).initStreetView; // Cast to any to allow delete on non-optional property
  }
});

// Function to update the map based on the selected VRE locality
const updateMapFromVRELocality = async () => {
  if (selectedVRELocality.value && panorama.value && googleMapsScriptLoaded.value) {
    vreLocalityError.value = null; // Clear previous errors
    try {
      const selectedData = vreLocalities.value.find(
        (loc) => loc.displayString === selectedVRELocality.value
      );

      if (selectedData) {
        await nextTick();
        panorama.value.setPosition({ lat: selectedData.lat, lng: selectedData.lng });
        // Update search bar for context, parsing the city name from the display string
        const parsed = parseVRELocality(selectedVRELocality.value); // Use the new utility
        searchQuery.value = parsed.cityName; // Display the parsed city name directly
      } else {
        vreLocalityError.value = `LOGIC_FRACTURE: VRE locality data not found for "${selectedVRELocality.value}".`;
      }
    } catch (error: any) {
      vreLocalityError.value = error.message;
    } finally {
      selectedVRELocality.value = ''; // Clear selection after updating map
    }
  }
});

// Watch for changes in props.lat or props.lng to update the panorama if it's already loaded
watch([() => props.lat, () => props.lng], async ([newLat, newLng]: [number, number]) => { // Added type annotation for newLat, newLng
  // Only update if the change didn't come from a URL parameter initially
  if (!route.query.lat && !route.query.lng) {
    // Ensure panorama is ready before setting position
    if (panorama.value && googleMapsScriptLoaded.value) {
      await nextTick(); // Wait for DOM updates if any
      panorama.value.setPosition({ lat: newLat, lng: newLng });
    }
  }
});
</script>

<style scoped>
.city-view-container {
  position: relative;
}
.overlay-text {
  z-index: 1;
}
.font-black {
  font-weight: 900;
}
.extra-tiny {
  font-size: 0.6rem;
}

/* Ensure search bar is above the map */
.search-bar-wrapper {
  z-index: 2;
}

.blur-bg {
  backdrop-filter: blur(8px);
}
.bg-black-50 {
  background: rgba(0, 0, 0, 0.7);
}
.tiny {
  font-size: 0.75rem;
}
.vre-locality-selector {
  max-width: 300px; /* Adjust as needed */
  left: 50%;
  transform: translateX(-50%);
}
</style>
