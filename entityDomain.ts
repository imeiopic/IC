/**
 * ENTITY_DOMAIN.TS | IOPIC.01 Framework
 * * Defines the structural domains/collectives within the VRE.
 */

export interface EntityDomain {
  id: string;
  name: string;
  type: string;
  description: string;
  multiplier: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  metadata?: Record<string, any>;
}

export const entityDomain: EntityDomain = {
  id: 'domain-0001',
  name: 'Global Mesh Root',
  type: 'CORE_DOMAIN',
  description: 'The primary structural layer for all sighted node collectives.',
  multiplier: 1.0,
  status: 'ACTIVE',
  metadata: { protocol: 'IOPIC_v1', resonance: 7.83 },
};
