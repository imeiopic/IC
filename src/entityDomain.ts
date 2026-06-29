import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase'; // Standardized to firebase.ts

export interface EntityDomain {
  binary_id: string;
  type: string;
  name: string;
  members: string[];
  gatekeeper_rules: string;
  status: string;
}

export const entityDomain: EntityDomain = {
  binary_id: '0110',
  type: 'BUSINESS', // Or Country, Club, etc.
  name: 'Global Exchange Entity',
  members: ['Member_A_ID', 'Member_B_ID'], // The people inside the entity
  gatekeeper_rules: '1000_STANDARD',
  status: 'ACTIVE_DOMAIN'
};

export const saveEntityDomain = async (entityId: string, domain: EntityDomain) => {
  const ref = doc(db, '0110_entities', entityId);
  await setDoc(ref, domain);
  console.log('Entity domain saved to Firestore.');
};
