// src/composables/useGoogleMaps.ts
import { Loader } from "@googlemaps/js-api-loader";

export const useGoogleMaps = (apiKey: string) => {
  const loader = new Loader({
    apiKey: apiKey,
    version: "weekly",
    libraries: ["places", "geometry"] // Add needed libraries
  });

  return { loader };
};