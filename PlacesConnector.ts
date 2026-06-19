// c:\IO\IC\PlacesConnector.ts
import { apiFetch } from './api';

// Define a type for a commerce node, consistent with Connector.vue
export interface CommerceNode {
  id: string;
  name: string;
  localityCoordinate: string;
  lat: number; // Added for map integration
  lng: number; // Added for map integration
  // Add other relevant properties if needed, e.g., address, type, etc.
  address?: string;
  type?: string;
  iowbIdentityGrounded?: boolean; // To indicate if it has a grounded IOWB Identity
}

// Define a simplified type for Google Place results
interface GooglePlaceResult {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity?: string; // A human-readable address
  types?: string[]; // e.g., "restaurant", "store", "cafe"
}

/**
 * Simulates fetching nearby Google Places.
 * In a real application, this would interact with the Google Places API.
 * @param lat Latitude of the search origin.
 * @param lng Longitude of the search origin.
 * @param radius Search radius in meters.
 * @returns A promise resolving to an array of simplified GooglePlaceResult objects.
 */
export const fetchNearbyGooglePlaces = async (
  lat: number,
  lng: number,
  radius: number
): Promise<GooglePlaceResult[]> => {
  console.log(
    `[PlacesConnector] Fetching nearby Google Places for lat: ${lat}, lng: ${lng}, radius: ${radius}m`
  );

  try {
    const response = await apiFetch('/places/nearby', {
      method: 'POST',
      body: JSON.stringify({ lat, lng, radius })
    });

    if (!response.ok) throw new Error('Failed to reach distributed Places API');
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('[PlacesConnector] Discovery Error:', error);
    return [];
  }
};

/**
 * Grounds a Google Place result into a CommerceNode.
 * @param place The GooglePlaceResult object.
 * @returns A CommerceNode object.
 */
export const groundPhysicalPlace = async (place: GooglePlaceResult): Promise<CommerceNode> => {
  // In a real scenario, this might involve more complex logic,
  // such as calling a backend service to assign a canonical ID,
  // or checking for existing IOWB identities.
  console.log(`[PlacesConnector] Grounding Google Place: ${place.name}`);
  return {
    id: `google-place-${place.place_id}`,
    name: place.name,
    localityCoordinate: `${place.geometry.location.lat.toFixed(
      4
    )},${place.geometry.location.lng.toFixed(4)}`, // Simplified locality
    lat: place.geometry.location.lat, // Assign actual lat
    lng: place.geometry.location.lng, // Assign actual lng
    address: place.vicinity,
    type: place.types && place.types.length > 0 ? place.types[0] : 'unknown',
    iowbIdentityGrounded: false // Default to false, can be updated later by checkIOWBIdentityMandate
  };
};
