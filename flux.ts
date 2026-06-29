/**
 * [FLUX_DATA_STRUCTURE]
 * The bridge between human intent and the Atomic Transaction Layer.
 */
export interface FluxManifest {
  itemId: string;
  name: string;
  ioCost: number;
  targetDensity: number; // The 'R' in I=VR^2
  description?: string;
  category: 'TEMPORAL' | 'RESONANCE' | 'SPATIAL' | 'EQUITY';
  tags: string[];
}

export type OrderStatus = 'PENDING' | 'PAIRING' | 'STREAMING' | 'STABILIZED' | 'FRACTURED';