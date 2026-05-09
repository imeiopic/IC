/**
 * IDEAL PROTOCOL: GEOGRAPHIC_RESOLVER
 * Resolves binary coordinates into City and County strings.
 */

export interface IopicLocationData {
  lat: number;
  lng: number;
  city: string;
  county: string;
  state: string;
  country: string;
}

export const getMyLocation = async (): Promise<IopicLocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GEOLOCATION_NOT_SUPPORTED"));
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        // Reverse Geocoding via Nominatim (No API Key required for low-volume usage)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();

        const address = data.address;
        
        // Logical Sighting of the Hierarchy
        const locationData: IopicLocationData = {
          lat: latitude,
          lng: longitude,
          city: address.city || address.town || address.village || "UNKNOWN_NODE_HUB",
          county: address.county || "UNKNOWN_SUBSTRATE",
          state: address.state || "",
          country: address.country || ""
        };

        console.log(`IDEAL_RESOLVED: ${locationData.city}, ${locationData.county}`);
        resolve(locationData);
      } catch (err) {
        reject(new Error("REVERSE_GEO_FAILURE: Failed to resolve place name."));
      }
    }, (error) => reject(error), { enableHighAccuracy: true });
  });
};