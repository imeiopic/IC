// src/types/mesh.ts
export interface GeoCoord {
  lat: number;
  lng: number;
  nodeId: string;
}

// Event definition for standardized event naming
export type MapEvents = {
  'zoom-complete': [clusterId: string];
};