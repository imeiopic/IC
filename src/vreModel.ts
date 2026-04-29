// Iopic World VRE (Virtual Real Era/Earth/Economy/Ecosystem) 4D Model
// This model represents the logical digital world context for Iopic World.

import type { Person } from './personModel';
import { person01 } from './personModel';
import type { EntityDomain } from './entityDomain';
import { entityDomain } from './entityDomain';
import type { CoinX } from './coinxModel';
import { exampleCoinX01, exampleCoinX10 } from './coinxModel';

export interface VRE {
  id: string; // Unique identifier for the VRE instance
  name: string; // e.g. "Iopic World"
  description: string;
  era: string; // e.g. "Virtual Real Era"
  earth: string; // e.g. "Virtual Earth" or geo context
  economy: string; // e.g. "IO$ Economy"
  ecosystem: string; // e.g. "Iopic Ecosystem"
  created: string; // ISO date
  updated: string; // ISO date
  people: Person[];
  entities: EntityDomain[];
  coinxs: CoinX[];
  rules: string[]; // List of global rules or protocols
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}

// Example VRE instance
export const iopicWorldVRE: VRE = {
  id: 'vre-0001',
  name: 'Iopic World',
  description: 'The 4D Virtual Real Era/Earth/Economy/Ecosystem for logical digital reality.',
  era: 'Virtual Real Era',
  earth: 'Virtual Earth',
  economy: 'IO$ Economy',
  ecosystem: 'Iopic Ecosystem',
  created: '2026-03-27T00:00:00Z',
  updated: '2026-03-27T00:00:00Z',
  people: [person01],
  entities: [entityDomain],
  coinxs: [exampleCoinX01, exampleCoinX10],
  rules: ['No violence', 'Peer-to-peer only', 'Identity validation required'],
  status: 'ACTIVE',
};
