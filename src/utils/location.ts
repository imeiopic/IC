import { getMyLocation as getDetailedLocation } from './getMyLocation';

/**
 * Iopic Protocol: Node Pulse Resolver
 * Fetches the physical geolocation of the node and resolves it to a logical locality string.
 * Fulfills the LOCALITY_FIRST mandate.
 */
export async function getMyLocation(): Promise<{ locality: string }> {
  if (!navigator.geolocation) {
    throw new Error('MANDATE_FRACTURE: Geolocation API unavailable on this node.');
  }

  try {
    const loc = await getDetailedLocation();
    return { locality: loc.locality };
  } catch (err) {
    throw new Error('PULSE_RESOLVE_FAILURE: Could not determine node locality.');
  }
}
