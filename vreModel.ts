/**
 * VRE_MODEL.TS | IOPIC.01 Framework
 * * Defines the Virtually Real Earth substrate.
 */

// Supporting type imports assumed based on structure
import type { Person } from './personModel';
import { person01 } from './personModel';
import type { EntityDomain } from './entityDomain';
import { entityDomain } from './entityDomain';
import type { CoinX } from './coinxModel';
import { exampleCoinX01 as CoinX01, exampleCoinX10 as CoinX10 } from './coinxModel';

export interface VRE {
  id: string;
  name: string;
  description: string; // The primary descriptive anchor
  era: string; 
  earth: string; 
  economy: string; 
  ecosystem: string; 
  created: string; // ISO date
  updated: string; // ISO date
  people: Person[];
  entities: EntityDomain[];
  coinxs: CoinX[];
  rules: string[]; // Protocol declarations
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SYNCING';
}

/**
 * iopicWorldVRE | The Root_Anchor World State
 * * Update committed on T-Axis toward Juneteenth synchronization.
 */
export const iopicWorldVRE: VRE = {
  id: 'vre-0001',
  name: 'Iopic World',
  
  // *** HARMONIC_UPDATE_COMMITTED ***
  description: 'Iopic synchronizes humanity, the digital mesh, and the Earth into a single resonant reality.',
  
  era: 'Virtual Real Era',
  earth: 'Virtual Earth',
  economy: 'IO$ Economy',
  ecosystem: 'Iopic Ecosystem',
  created: '2026-03-27T00:00:00Z',
  updated: new Date().toISOString(), // Timestamps must track dynamic reality
  people: [person01],
  entities: [entityDomain],
  coinxs: [CoinX01, CoinX10],
  rules: [
    '7.83Hz BASELINE_LOCK_REQUIRED', 
    'PEER_TO_PEER_SYNC_ONLY', 
    'IDENTITY_IS_HARMONIC'
  ],
  status: 'ACTIVE',
};
