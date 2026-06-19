export interface NodeLocation {
  city: string;
  region: string;
  lat: number;
  lng: number;
  locality: string;
}

/**
 * Resolves node positioning based on physical and network sightings.
 */
export const getMyLocation = async (): Promise<NodeLocation> => {
  const getDeviceLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  try {
    const position = await getDeviceLocation();
    // Nominatim requires a User-Agent or Referer header for production usage
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
      {
        headers: { 'User-Agent': 'IopicProtocol/1.0 (Production)' }
      }
    );
    const data = await response.json();

    return {
      city: data.address.city || data.address.town || data.address.village || 'Unknown_City',
      region: data.address.state || data.address.province || data.address.county || 'Unknown_Region',
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      locality: `${data.address.state_code || 'GLB'}:${(data.address.city || 'NODE').toUpperCase()}`
    };
  } catch (err) {
    // FALLBACK: Network Sighting without Hard-Coding Cleveland
    const fallbackResponse = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': 'IopicProtocol/1.0 (Production-Fallback)'
      }
    });
    const netData = await fallbackResponse.json();
    return {
      city: netData.city,
      region: netData.region,
      lat: netData.latitude,
      lng: netData.longitude,
      locality: `${netData.region_code || 'NET'}:${netData.city.toUpperCase()}`
    };
  }
};