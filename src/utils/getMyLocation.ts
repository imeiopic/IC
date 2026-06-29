export interface NodeLocation {
  city: string;
  region: string;
  lat: number;
  lng: number;
  locality: string;
}

let cachedLocation: NodeLocation | null = null;

/**
 * Resolves node positioning using Google Maps Geocoding API.
 */
export const getMyLocation = async (apiKey: string): Promise<NodeLocation> => {
  if (cachedLocation) return cachedLocation;

  try {
    // 1. Get browser coordinates
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000
      });
    });

    const { latitude, longitude } = pos.coords;

    // 2. Call Google Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status !== 'OK') throw new Error('GOOGLE_GEOCODE_ERROR');

    // 3. Extract address components from Google's response
    const components = data.results[0].address_components;
    const findType = (type: string) => components.find((c: any) => c.types.includes(type))?.long_name;

    cachedLocation = {
      city: findType('locality') || findType('postal_town') || 'UNKNOWN',
      region: findType('administrative_area_level_1') || 'UNKNOWN',
      lat: latitude,
      lng: longitude,
      locality: `${findType('country') || 'GLB'}:${(findType('locality') || 'NODE').toUpperCase()}`
    };

    return cachedLocation;
  } catch (err) {
    console.error('Google Maps integration failed:', err);
    throw err; // Handle fallback UI in your component
  }
};