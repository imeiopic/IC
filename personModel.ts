/**
 * PERSON_MODEL.TS | IOPIC.01 Framework
 * * Defines the human/node identity within the VRE.
 */

export interface Person {
  id: string;
  name: string;
  role: string;
  status: 'GROUNDED' | 'UNGROUNDED' | 'SYNCING';
  bio?: string;
  resonanceScore?: number;
}

export const person01: Person = {
  id: 'suid-0001',
  name: 'Ime Root',
  role: 'Root Architect',
  status: 'GROUNDED',
  bio: 'The primary anchor for the Iopic resonance mesh.',
  resonanceScore: 1.0,
};