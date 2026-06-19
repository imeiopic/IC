/**
 * server/sovereign-proxy.ts // Sovereign Proxy Protocol for Google Places
 * Role: Firewall for Google API requests, stripping telemetry and ensuring Anchor Integrity.
 */

// Define a basic request interface for clarity, assuming a Node.js-like environment
interface ProxyRequest {
  body: {
    query: string;
    suid?: string; // Sovereign User ID, to be scrubbed
  };
}

// Define the expected structure of a Google Places result for our purposes
interface GooglePlaceResult {
  geometry?: {
    location?: {
      lat: number;
      lng: number;
    };
  };
  name?: string;
  // ... other fields we will discard
}

/**
 * Scrubs all Personally Identifiable Information (PII) from the incoming query.
 * In a real-world scenario, this would involve more sophisticated NLP and data sanitization.
 * For now, it just returns the query, as the SUID is already handled by not being passed to Google.
 */
const scrubTelemetry = (query: string): string => {
  // Implement advanced scrubbing logic here.
  // For example, removing common PII patterns, anonymizing specific terms.
  // For this implementation, we assume the 'query' itself is already generic.
  return query;
};

/**
 * Filters the Google Places response to return ONLY coordinates and a generic name,
 * discarding all user-tracking metadata, marketing tags, etc.
 */
const filterOnlyCoordinates = (data: any): { name: string; lat: number; lng: number } | null => {
  if (data && data.candidates && data.candidates.length > 0) {
    const candidate = data.candidates[0] as GooglePlaceResult;
    if (candidate.geometry?.location) {
      return {
        name: candidate.name || 'Resolved Location',
        lat: candidate.geometry.location.lat,
        lng: candidate.geometry.location.lng
      };
    }
  }
  return null;
};

export const handlePlacesRequest = async (req: ProxyRequest) => {
  // 1. Strip all PII (Personally Identifiable Information) - SUID is not passed to Google
  const sanitizedQuery = scrubTelemetry(req.body.query);

  // 2. Inject anonymized API Key via environment variable
  // Using 'findplacefromtext' for simplicity, assuming text input.
  // 'fields' parameter ensures we only request necessary data, further reducing data leakage.
  const googleUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
    sanitizedQuery
  )}&inputtype=textquery&fields=geometry,name&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(googleUrl);
    if (!response.ok) {
      console.error(
        `SOVEREIGN_PROXY: Google Places API error: ${response.status} - ${response.statusText}`
      );
      throw new Error(`Google Places API error: ${response.statusText}`);
    }
    const data = await response.json();

    // 3. Filter data and return ONLY coordinates, discarding all user-tracking metadata
    const filteredData = filterOnlyCoordinates(data);
    if (filteredData) {
      return { status: 200, body: filteredData };
    } else {
      return {
        status: 404,
        body: { message: 'SOVEREIGN_PROXY: Location not found or insufficient data.' }
      };
    }
  } catch (error: any) {
    console.error('SOVEREIGN_PROXY: Error fetching from Google Places:', error);
    return {
      status: 500,
      body: { message: `SOVEREIGN_PROXY: Internal server error: ${error.message}` }
    };
  }
};
