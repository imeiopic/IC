<script setup lang="ts">
import EntityOrderTaker from '@components/EntityOrderTaker.vue';
import EntityTreasuryTracker from '@components/EntityTreasuryTracker.vue';
import SPICE from '@components/SPICE.vue';
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'; // Added computed
import { CommerceNode, fetchNearbyGooglePlaces, groundPhysicalPlace } from './PlacesConnector'; // Import CommerceNode
import RepatriationDash from './RepatriationDash.vue';
import { useGlobalMandates } from './ReusableMandate.vue'; // Import useGlobalMandates

// Define an extended CommerceNode type for UI purposes, adding a messages array
interface ExtendedCommerceNode extends CommerceNode {
  messages: { senderId: string; link: string }[]; // Updated to store message objects
}

declare global {
  interface Window {
    initConnectorMap?: () => void;
  }
}

const toast = inject('toast', { 
  error: (msg: string) => console.error(msg), 
  success: (msg: string) => console.log(msg) 
});

const { 
  checkIOWBIdentityMandate, 
  processImeBusyMandate, 
  nodeMessageStore, 
  startMessageSync,
  startNoticeSync,
  planetaryNotices,
  partitionedNodes,
  getOrCreateGroup,
  prioritizeLocalityFirstMandate
} = useGlobalMandates(); // Get the specific mandate functions and the message store

// Reactive state for demonstration
const currentLocality = ref('Auto-Detected'); 
const manualLat = ref(0); 
const manualLng = ref(0); 
const foundNodes = ref<ExtendedCommerceNode[]>([]); // Use ExtendedCommerceNode
const searchStatus = ref('');
const selectedNode = ref<ExtendedCommerceNode | null>(null); // Use ExtendedCommerceNode

// Local Node Identity (Assumed for Dashboard)
const currentNodeId = ref('Anonymous_Node'); 
const localMessages = computed(() => nodeMessageStore.value[currentNodeId.value] || []);

const isLoading = ref(false); // New reactive state for loading indicator

// Google Maps related state
const mapInstance = ref<google.maps.Map | null>(null);
const heatmapLayer = ref<google.maps.visualization.HeatmapLayer | null>(null);
const centerMarker = ref<google.maps.Marker | null>(null);
const nodeMarkers = ref<google.maps.Marker[]>([]);
const googleMapsScriptLoaded = ref(false);
let unsubscribeMessageSync: (() => void) | undefined | null;
let unsubscribeNoticeSync: (() => void) | undefined;

// New: Saved Locations Feature
interface SavedLocation {
  name: string;
  lat: number;
  lng: number;
}
const locationName = ref('');
const savedLocations = ref<SavedLocation[]>([]);

// New: Search History Feature
const recentSearches = ref<{ lat: number; lng: number }[]>([]);
const MAX_HISTORY_SIZE = 5; // Limit the number of recent searches
// The LOCAL_STORAGE_KEY is already defined in the provided context.
const LOCAL_STORAGE_KEY = 'iopic_saved_search_locations';

// Derive IDs for synchronization mandate
const sightedNodeIds = computed(() => foundNodes.value.map(n => n.id));

/**
 * Simulates finding nodes within a specific locality.
 * @param locality The locality coordinate to search within.
 * @returns An array of CommerceNode found in that locality.
 */
const findNodesInLocality = async (locality: string): Promise<ExtendedCommerceNode[]> => {
  // In a real scenario, 'locality' might be derived from currentGeoLocation
  // and used to fetch Google Places.
  console.log(`Searching for nodes in locality: ${locality} and nearby geo-location.`);
  const nearbyPlaces = await fetchNearbyGooglePlaces(
    // Use manualLat and manualLng
    manualLat.value,
    manualLng.value,
    5000 // 5km radius
  );
  // Convert Google Places to CommerceNode format and ground them
  const groundedGoogleNodes: ExtendedCommerceNode[] = await Promise.all( // Use ExtendedCommerceNode
    nearbyPlaces.map(async (p) => {
      const grounded = await groundPhysicalPlace(p); // This returns a CommerceNode with iowbIdentityGrounded: false
      // Now, check the IOWB Identity Mandate for each grounded node
      // Use original place_id for mandate check as the contract expects it.

      // --- PRODUCTION BUILD NOTE ---
      // The `checkIOWBIdentityMandate` function relies on a blockchain RPC URL and contract address.
      // Ensure `VITE_BLOCKCHAIN_RPC_URL` and `VITE_IOWB_REGISTRY_ADDRESS` are correctly configured
      // in your production environment variables.
      const isGrounded = await checkIOWBIdentityMandate(p.place_id);
      // Update the iowbIdentityGrounded status on the grounded node
      return {
        ...grounded,
        iowbIdentityGrounded: isGrounded,
        messages: [] // Initialize messages array for the UI
      };
    })
  );
  return groundedGoogleNodes;
};

/**
 * This function is no longer needed as node discovery relies solely on Google Places.
 * The concept of a separate "global mesh" beyond what Google Places provides is removed.
 */

/**
 * Initiates a peer-to-peer commerce event, respecting the Locality-First Mandate.
 */
const initiateCommerceSearch = async () => {
  // Basic validation for manual input
  if (isNaN(manualLat.value) || manualLat.value < -90 || manualLat.value > 90) {
    searchStatus.value = 'Error: Invalid Latitude. Please enter a value between -90 and 90.';
    return;
  }
  if (isNaN(manualLng.value) || manualLng.value < -180 || manualLng.value > 180) {
    searchStatus.value = 'Error: Invalid Longitude. Please enter a value between -180 and 180.';
    return;
  }

  isLoading.value = true; // Set loading to true
  searchStatus.value = 'Initiating commerce search...';
  foundNodes.value = [];
  selectedNode.value = null;

  try {
    const nodesFromGooglePlaces = await findNodesInLocality(currentLocality.value);

    // NSN Mandate: Automatically register sighted nodes into their locality Group substrate
    const group = getOrCreateGroup(currentLocality.value);
    nodesFromGooglePlaces.forEach(node => {
      group.nodeIdentities.add(node.id);
    });

    const localNodesAvailable = nodesFromGooglePlaces.length > 0;

    // Apply the Locality-First Mandate
    if (prioritizeLocalityFirstMandate(localNodesAvailable)) {
      searchStatus.value = `Locality-First Mandate active. Prioritizing search in ${currentLocality.value}.`;
      foundNodes.value = nodesFromGooglePlaces;
      if (foundNodes.value.length === 0) {
        searchStatus.value += ' No nodes found in this locality via Google Places.';
      }
    } else {
      searchStatus.value =
        'Locality-First Mandate not strictly prioritizing local. Searching via Google Places.';
      foundNodes.value = nodesFromGooglePlaces;
    }

    console.log('Commerce search complete. Found nodes:', foundNodes.value);
    if (foundNodes.value.length === 0) {
      searchStatus.value = 'No commerce nodes found.';
    } else {
      searchStatus.value = `Found ${foundNodes.value.length} nodes.`;
    }
  } catch (error) {
    // Error handling for the search process
    console.error('Error during commerce search:', error);
    searchStatus.value = `Error during search: ${
      error instanceof Error ? error.message : String(error)
    }`;
  } finally {
    isLoading.value = false; // Set loading to false after search completes or fails
  }
  addSearchToHistory(manualLat.value, manualLng.value); // Add current search to history
};

const initiateSpiceConnection = async (node: ExtendedCommerceNode) => { // Use ExtendedCommerceNode here
  // Real-time busy check against partitioned (REM) nodes and mesh status
  const isNodeBusy = partitionedNodes.value.has(node.id);

  if (isNodeBusy) {
    const senderId = currentNodeId.value; 
    const pendingLink = `spice://handshake/${Date.now()}`;
    
    // Call the mandate function to process the busy state and store the message
    const result = await processImeBusyMandate(node.id, node.name, senderId, pendingLink);
    searchStatus.value = result;
    if (result.includes('Error')) toast.error(result);
    console.log(`[IME_BUSY] Connection diverted. Target: ${node.name}. Message stored on node.`);
  } else {
    selectedNode.value = node;
    searchStatus.value = `Initiating SPICE connection to ${node.name}...`;
  }
};

/**
 * Clears all saved locations from the list and local storage.
 */
const clearAllSavedLocations = () => {
  if (window.confirm('Are you sure you want to delete all saved locations?')) {
    savedLocations.value = [];
    searchStatus.value = 'All saved locations cleared.';
  }
};

const clearAllRecentSearches = () => {
  if (window.confirm('Are you sure you want to clear all recent searches?')) {
    recentSearches.value = [];
    searchStatus.value = 'All recent searches cleared.';
  }
};

/**
 * Saves the current manual latitude and longitude as a named location to local storage.
 */
const saveCurrentLocation = () => {
  if (!locationName.value.trim()) {
    searchStatus.value = 'Error: Please enter a name for the location.';
    return;
  }

  const newLocation: SavedLocation = {
    name: locationName.value.trim(),
    lat: manualLat.value,
    lng: manualLng.value
  };

  // Check for duplicates by name
  const existingIndex = savedLocations.value.findIndex(
    (loc: SavedLocation) => loc.name === newLocation.name
  );
  if (existingIndex !== -1) {
    // Overwrite existing location if name matches
    savedLocations.value[existingIndex] = newLocation;
    searchStatus.value = `Location "${newLocation.name}" updated.`;
  } else {
    savedLocations.value.push(newLocation);
    searchStatus.value = `Location "${newLocation.name}" saved.`;
  }
  locationName.value = ''; // Clear input after saving
};

/**
 * Loads a saved location's coordinates into the manual input fields.
 * @param location The SavedLocation object to load.
 */
const loadLocation = async (location: SavedLocation) => {
  manualLat.value = location.lat;
  manualLng.value = location.lng;
  searchStatus.value = `Loaded location: ${location.name}.`;
  // Optionally, trigger a search immediately after loading
  await nextTick(); // Ensure inputs are updated before search
  initiateCommerceSearch();
};

/**
 * Deletes a saved location from the list and local storage.
 * @param index The index of the location to delete.
 */
const deleteLocation = (index: number) => {
  const locationToDelete = savedLocations.value[index];
  if (window.confirm(`Are you sure you want to delete the location "${locationToDelete.name}"?`)) {
    savedLocations.value.splice(index, 1);
    searchStatus.value = `Location "${locationToDelete.name}" deleted.`;
  } else {
    searchStatus.value = `Deletion of "${locationToDelete.name}" cancelled.`;
  }
};

/**
 * Adds the current search coordinates to the recent searches history.
 * Handles uniqueness and limits history size.
 */
const addSearchToHistory = (lat: number, lng: number) => {
  const newEntry = { lat, lng };
  // Remove existing entry if coordinates are identical
  recentSearches.value = recentSearches.value.filter(
    (entry: { lat: number; lng: number }) => !(entry.lat === lat && entry.lng === lng)
  );
  // Add new entry to the beginning
  recentSearches.value.unshift(newEntry);
  // Trim history if it exceeds max size
  if (recentSearches.value.length > MAX_HISTORY_SIZE) {
    recentSearches.value = recentSearches.value.slice(0, MAX_HISTORY_SIZE);
  }
};

/**
 * Loads a history entry's coordinates into the manual input fields and triggers a search.
 * @param entry The history entry to load.
 */
const loadHistoryEntry = async (entry: { lat: number; lng: number }) => {
  manualLat.value = entry.lat;
  manualLng.value = entry.lng;
  searchStatus.value = `Loaded history entry: Lat ${entry.lat.toFixed(4)}, Lng ${entry.lng.toFixed(
    4
  )}.`;
  await nextTick(); // Ensure inputs are updated before search
  initiateCommerceSearch();
};

/**
 * Loads the Google Maps JavaScript API script dynamically.
 * It sets a global callback function `initConnectorMap` which is called once the API is loaded.
 */
const loadGoogleMapsScript = () => {
  if (googleMapsScriptLoaded.value || document.getElementById('google-maps-connector-script')) {
    return;
  }

  const script = document.createElement('script');
  script.id = 'google-maps-connector-script';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${
    import.meta.env.VITE_GOOGLE_API_KEY
  }&libraries=places,visualization&callback=initConnectorMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  window.initConnectorMap = () => {
    googleMapsScriptLoaded.value = true;
    initMap();
  };
};

/**
 * Initializes the Google Map and places the initial center marker.
 */
const initMap = () => {
  if (!googleMapsScriptLoaded.value || !window.google || mapInstance.value) return;

  const mapDiv = document.getElementById('map-container');
  if (mapDiv) {
    const initialPosition = { lat: manualLat.value, lng: manualLng.value };
    mapInstance.value = new window.google.maps.Map(mapDiv, {
      // --- PRODUCTION BUILD NOTE ---
      // The initial map center could be dynamic based on user location or a default.
      center: initialPosition, // Using manualLat/Lng for initial center
      zoom: 12,
      mapId: import.meta.env.VITE_GOOGLE_MAP_ID || 'YOUR_MAP_ID_FALLBACK', // Use environment variable for Map ID
      disableDefaultUI: true, // Keep it clean for IOPIC aesthetic
      zoomControl: true,
      styles: [
        // Dark mode map style
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#263c3f' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6b9a76' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#38414e' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#212a37' }]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca5b3' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#1f2835' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#f3d19c' }]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#2f3948' }]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#17263c' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#515c6d' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#17263c' }]
        }
      ]
    });

    centerMarker.value = new window.google.maps.Marker({
      position: initialPosition,
      map: mapInstance.value,
      title: 'Current Search Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: '#00e5ff', // IOPIC blue
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff'
      }
    });
    updateNodeMarkers();
    updateHeatmap();
  }
};

/**
 * Computes and updates the Heatmap of Truth based on planetary notices.
 * Weights are assigned by NoticeClass severity.
 */
const updateHeatmap = () => {
  if (!mapInstance.value || !window.google?.maps?.visualization) return;

  const heatmapData = planetaryNotices.value
    .filter(n => n.lat !== undefined && n.lng !== undefined)
    .map(n => ({
      location: new window.google.maps.LatLng(n.lat!, n.lng!),
      weight: n.type === 'INTERRUPTION' ? 10 : n.type === 'DRIFT' ? 5 : 1
    }));

  if (!heatmapLayer.value) {
    heatmapLayer.value = new window.google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: mapInstance.value,
      radius: 30,
      opacity: 0.7
    });
  } else {
    heatmapLayer.value.setData(heatmapData);
  }
};

/**
 * Updates the map center and the position of the central marker.
 */
const updateMapCenter = () => {
  if (mapInstance.value && centerMarker.value) {
    const newPosition = { lat: manualLat.value, lng: manualLng.value };
    mapInstance.value.setCenter(newPosition);
    centerMarker.value.setPosition(newPosition);
  }
};

/**
 * Updates markers for sighted CommerceNodes on the map.
 */
const updateNodeMarkers = () => {
  // Clear existing node markers
  nodeMarkers.value.forEach((marker: google.maps.Marker) => marker.setMap(null));
  nodeMarkers.value = [];

  if (mapInstance.value && foundNodes.value.length > 0) {
    foundNodes.value.forEach((node: CommerceNode) => {
      const marker = new window.google.maps.Marker({
        position: { lat: node.lat, lng: node.lng },
        map: mapInstance.value,
        title: node.name,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 5,
          fillColor: node.iowbIdentityGrounded ? '#00ff00' : '#ff0000', // Green for grounded, red for ungrounded
          fillOpacity: 0.8,
          strokeWeight: 1,
          strokeColor: '#ffffff'
        }
      });
      nodeMarkers.value.push(marker);
    });
  }
};

// Load saved locations from local storage when the component mounts
onMounted(() => {
  // Establish hardware grounding via device geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      manualLat.value = position.coords.latitude;
      manualLng.value = position.coords.longitude;
      currentLocality.value = `Sector-${manualLat.value.toFixed(2)}-${manualLng.value.toFixed(2)}`;
      updateMapCenter();
    });
  }

  // Load saved locations
  const storedLocs = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedLocs) {
    try {
      savedLocations.value = JSON.parse(storedLocs) as SavedLocation[];
    } catch (e) {
      console.error('Failed to parse saved locations from local storage:', e);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
    }
  }

  // Load recent searches
  const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY + '_history');
  if (storedHistory) {
    try {
      recentSearches.value = JSON.parse(storedHistory) as { lat: number; lng: number }[];
    } catch (e) {
      console.error('Failed to parse recent searches from local storage:', e);
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_history'); // Clear corrupted data
    }
  }

  // Initialize external scripts
  loadGoogleMapsScript();
  
  // Initialize distributed message sync
  if (startMessageSync) {
    unsubscribeMessageSync = startMessageSync(sightedNodeIds);
  }

  if (startNoticeSync) {
    unsubscribeNoticeSync = startNoticeSync();
  }
});

// Watch for changes in the global nodeMessageStore and update local node messages
watch(nodeMessageStore, (newStore) => {
  foundNodes.value.forEach(node => {
    if (newStore && newStore[node.id]) {
      node.messages = Array.isArray(newStore[node.id]) ? [...newStore[node.id]] : [];
    }
  });
}, { deep: true });

// Watch for changes in planetaryNotices to refresh the Heatmap of Truth
watch(planetaryNotices, () => {
  updateHeatmap();
}, { deep: true });

onUnmounted(() => {
  // Clean up the global callback if it was set
  window.initConnectorMap = undefined;
  nodeMarkers.value.forEach((marker) => marker.setMap(null));
  if (heatmapLayer.value) {
    heatmapLayer.value.setMap(null);
    heatmapLayer.value = null;
  }

  // Properly dispose of the Firestore listener to prevent memory leaks
  if (unsubscribeMessageSync) {
    unsubscribeMessageSync();
  }
  if (unsubscribeNoticeSync) {
    unsubscribeNoticeSync();
  }
});

const getNoticeColor = (type: string) => {
  if (type === 'ALIGNMENT') return '#FFFFFF';
  if (type === 'DRIFT') return '#FFBF00';
  if (type === 'INTERRUPTION') return '#FF0000';
  return '#888888';
};

// Watch for changes in savedLocations and persist to local storage
watch(
  savedLocations,
  (newLocations: SavedLocation[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLocations));
  },
  { deep: true }
); // Use deep watch for array changes
// Watch for changes in recentSearches and persist to local storage
watch(
  recentSearches,
  (newHistory: { lat: number; lng: number }[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_history', JSON.stringify(newHistory));
  },
  { deep: true }
);
</script>

<template>
  <div class="connector-component">
    <EntityTreasuryTracker />

    <!-- Order Sighting Substrate -->
    <EntityOrderTaker class="mb-4" />

    <!-- Node Dashboard Section: View messages intended for this node -->
    <div class="node-dashboard">
      <h4>Node Dashboard (Identity: {{ currentNodeId }})</h4>
      <div v-if="localMessages.length > 0" class="dashboard-messages">
        <p>Pending links left while you were phase-locked:</p>
        <ul>
          <li v-for="(msg, idx) in localMessages" :key="idx" class="dashboard-message">
            <strong>From {{ msg.senderId }}:</strong> {{ msg.link }}
          </li>
        </ul>
      </div>
      <p v-else>No pending messages for your node identity.</p>
    </div>

    <!-- Real-time Population Density & Repatriation Curve Monitor -->
    <RepatriationDash class="mb-6" />

    <h3>Connector.vue - Peer-to-Peer Commerce</h3>
    <div class="search-inputs">
      <label for="manualLat">Latitude:</label>
      <input type="number" id="manualLat" v-model.number="manualLat" step="0.000001" />
      <label for="manualLng">Longitude:</label>
      <input type="number" id="manualLng" v-model.number="manualLng" step="0.000001" />
    </div>
    <p>
      Searching in Locality: {{ currentLocality }} (using coordinates: {{ manualLat }},
      {{ manualLng }})
    </p>

    <!-- New: Save/Load Locations Section -->
    <div class="saved-locations-section">
      <h4>Saved Search Locations</h4>
      <div class="save-input">
        <input type="text" v-model="locationName" placeholder="Name this location" />
        <button @click="saveCurrentLocation" :disabled="!locationName.trim()">Save Current</button>
      </div>
      <ul v-if="savedLocations.length > 0">
        <li v-for="(loc, index) in savedLocations" :key="index">
          <span>{{ loc.name }} ({{ loc.lat.toFixed(4) }}, {{ loc.lng.toFixed(4) }})</span>
          <div class="location-actions">
            <button @click="loadLocation(loc)">Load</button>
            <button @click="deleteLocation(index)">Delete</button>
          </div>
        </li>
      </ul>
      <p v-else>No saved locations.</p>
    </div>

    <div class="clear-buttons">
      <button
        @click="clearAllSavedLocations"
        :disabled="savedLocations.length === 0"
        class="clear-all-btn"
      >
        Clear All Saved Locations
      </button>
      <button
        @click="clearAllRecentSearches"
        :disabled="recentSearches.length === 0"
        class="clear-all-btn"
      >
        Clear All Recent Searches
      </button>
    </div>
    <!-- New: Recent Searches Section -->
    <div class="recent-searches-section">
      <h4>Recent Searches</h4>
      <ul v-if="recentSearches.length > 0">
        <li v-for="(entry, index) in recentSearches" :key="index">
          <span>Lat: {{ entry.lat.toFixed(4) }}, Lng: {{ entry.lng.toFixed(4) }}</span>
          <div class="location-actions">
            <button @click="loadHistoryEntry(entry)">Load & Search</button>
            <!-- No delete for history, it's managed by size and recency -->
          </div>
        </li>
      </ul>
      <p v-else>No recent searches.</p>
    </div>

    <!-- Map Container -->
    <div id="map-container" class="map-container"></div>

    <button @click="initiateCommerceSearch" :disabled="isLoading">Search for Commerce Nodes</button>
    <p v-if="isLoading">Loading commerce nodes...</p>
    <p>Status: {{ searchStatus }}</p>

    <div v-if="foundNodes.length > 0 && !selectedNode">
      <h4>Sighted Nodes:</h4>
      <ul>
        <li v-for="node in foundNodes" :key="node.id" :class="{ 'partitioned-blur': partitionedNodes?.has(node.id) }">
          <div v-if="partitionedNodes?.has(node.id)" class="partition-overlay">
            ⚠️ REM_PARTITION_ACTIVE
          </div>
          <span class="node-info">{{ node.name }} ({{ node.localityCoordinate }})</span>
          <span v-if="node.address" class="node-detail">Address: {{ node.address }}</span>
          <span v-if="node.type" class="node-detail">Type: {{ node.type }}</span>
          <button @click="initiateSpiceConnection(node)" class="connect-btn">
            <!-- Display additional details here -->

            <span v-if="node.iowbIdentityGrounded" class="grounded-badge">✅ IOWB Grounded</span>
            <span v-else class="ungrounded-badge">❌ IOWB Ungrounded</span>
            Connect via SPICE
          </button>
          <!-- Display messages left when busy -->
          <div v-if="node.messages && node.messages.length > 0" class="node-messages">
            <p>Messages left while busy:</p>
            <ul>
              <li v-for="(msg, msgIdx) in node.messages" :key="msgIdx" class="busy-message">{{ msg.link }} (from {{ msg.senderId }})</li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
    <div
      v-else-if="searchStatus && searchStatus !== 'Initiating commerce search...' && !selectedNode"
    >
      <p>No nodes sighted.</p>
    </div>

    <div v-if="selectedNode" class="spice-container">
      <h4>Connected to: {{ selectedNode.name }}</h4>
      <button @click="selectedNode = null" class="back-btn">Back to Search</button>
      <SPICE :targetNodeId="selectedNode.id" />
    </div>
  </div>
</template>

<style scoped>
.connector-component {
  border: 1px solid #4caf50;
  padding: 15px;
  margin: 10px 0;
  background-color: #e8f5e9;
  border-radius: 8px;
}
h3 {
  color: #2e7d32;
}
button,
.connect-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
}
button:hover,
.connect-btn:hover {
  background-color: #45a049;
}
.search-inputs {
  margin-bottom: 15px;
}
.search-inputs label {
  margin-right: 5px;
  font-weight: bold;
}
.search-inputs input {
  padding: 5px;
  margin-right: 10px;
}
.map-container {
  width: 100%;
  height: 400px; /* Adjust height as needed */
  margin-top: 20px;
  border-radius: 8px;
}
.back-btn {
  background-color: #f44336;
  margin-bottom: 15px;
}
.back-btn:hover {
  background-color: #d32f2f;
}
.spice-container {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #a5d6a7;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  background-color: #f0f4f8;
  margin-bottom: 5px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #d0d9e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.node-info {
  font-weight: bold;
}
.node-detail {
  font-size: 0.9em;
  color: #555;
  margin-left: 10px;
}
.grounded-badge {
  background-color: #d4edda;
  color: #155724;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  margin-left: 10px;
}
.ungrounded-badge {
  background-color: #f8d7da;
  color: #721c24;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  margin-left: 10px;
}
.saved-locations-section {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #a5d6a7;
  border-radius: 8px;
  background-color: #e0f2f7; /* Lighter background for this section */
}
.saved-locations-section h4 {
  color: #2e7d32;
  margin-bottom: 10px;
}
.saved-locations-section .save-input {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.saved-locations-section .save-input input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.saved-locations-section ul {
  list-style-type: none;
  padding: 0;
}
.saved-locations-section li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
}
.node-messages {
  margin-top: 10px;
  padding: 8px;
  background-color: #fff3e0; /* Light orange background for busy messages */
  border-left: 4px solid #ff9800;
  border-radius: 4px;
}
.node-messages p {
  font-weight: bold;
  margin-bottom: 5px;
}
.busy-message {
  font-size: 0.85em;
  color: #e65100; /* Darker orange text */
}
.clear-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}
.clear-all-btn {
  background-color: #ff9800;
}
.clear-all-btn:hover {
  background-color: #fb8c00;
}
.saved-locations-section li span {
  flex-grow: 1;
  margin-right: 10px;
  font-size: 0.9em;
  color: #333;
}
.saved-locations-section .location-actions button {
  padding: 5px 10px;
  font-size: 0.8em;
  margin-left: 5px;
  border-radius: 4px;
}
.saved-locations-section .location-actions button:first-of-type {
  background-color: #2196f3; /* Load button */
}
.saved-locations-section .location-actions button:first-of-type:hover {
  background-color: #1976d2;
}
.saved-locations-section .location-actions button:last-of-type {
  background-color: #f44336; /* Delete button */
}
.saved-locations-section .location-actions button:last-of-type:hover {
  background-color: #d32f2f;
}

.recent-searches-section {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #a5d6a7;
  border-radius: 8px;
  background-color: #e0f7fa; /* Different background for history */
}
.recent-searches-section h4 {
  color: #00796b;
  margin-bottom: 10px;
}
.recent-searches-section ul {
  list-style-type: none;
  padding: 0;
}
.recent-searches-section li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
}

.node-dashboard {
  margin: 20px 0;
  padding: 15px;
  background-color: #f1f8e9;
  border: 1px solid #c5e1a5;
  border-radius: 8px;
}
.node-dashboard h4 {
  color: #33691e;
  margin-top: 0;
}
.dashboard-message {
  font-family: monospace;
  background-color: #fff;
  padding: 8px;
  margin-bottom: 5px;
  border-radius: 4px;
  border: 1px solid #eee;
  font-size: 0.9em;
}
</style>
