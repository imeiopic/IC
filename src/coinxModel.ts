// CoinX model for Iopic World

/**
 * COINX [1011]: Connect One Invite Network Exchange Systems
 * CoinXs are cryptographically-secured, tokenized frameworks for:
 * - Identity validation
 * - Private peer-to-peer communication
 * - Commerce (value exchange)
 * - Trusted data sharing (messages, voice, video, location)
 *
 * CoinX acts as a digital handshake — verifying, encrypting, and enabling secure exchanges between two parties.
 * The Inviting Entity purchases the CoinX from IO.
 *
 * Connection Contracts specify: Dates, Times, Durations, Locations, Networks, Currencies, and Languages.
 */

export type CoinXType = '01' | '10'; // 01: Person-to-Person, 10: Buyer-to-Seller

export interface CoinXContract {
  contractId: string;
  type: CoinXType;
  invitingEntityId: string;
  invitedEntityId: string;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  durationMinutes: number;
  location: string;  // Could be a geo string or place name
  network: string;
  currency: string;
  language: string;
  menu?: string[];   // For Buyer-Seller contracts: list of offerings
  order?: string[];  // For Buyer-Seller contracts: selected items
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
}

export interface CoinX {
  id: string;
  contract: CoinXContract;
  identityValidated: boolean;
  encrypted: boolean;
  peerToPeer: boolean;
  commerceEnabled: boolean;
  trustedDataTypes: Array<'identity' | 'message' | 'voice' | 'video' | 'location'>;
}

// Example CoinX for Person-to-Person (Communication)
export const exampleCoinX01: CoinX = {
  id: 'coinx-0001',
  contract: {
    contractId: 'contract-pp-0001',
    type: '01',
    invitingEntityId: 'person01',
    invitedEntityId: 'person02',
    startDate: '2026-03-27T12:00:00Z',
    endDate: '2026-03-27T13:00:00Z',
    durationMinutes: 60,
    location: 'Virtual',
    network: 'IO-NET',
    currency: 'USD',
    language: 'English',
    status: 'ACTIVE',
  },
  identityValidated: true,
  encrypted: true,
  peerToPeer: true,
  commerceEnabled: false,
  trustedDataTypes: ['identity', 'message', 'voice', 'video', 'location'],
};

// Example CoinX for Buyer-to-Seller (Commerce)
export const exampleCoinX10: CoinX = {
  id: 'coinx-1001',
  contract: {
    contractId: 'contract-bs-1001',
    type: '10',
    invitingEntityId: 'buyer01',
    invitedEntityId: 'seller01',
    startDate: '2026-03-27T15:00:00Z',
    endDate: '2026-03-27T16:00:00Z',
    durationMinutes: 60,
    location: 'IO-Commerce-Hub',
    network: 'IO-NET',
    currency: 'USD',
    language: 'English',
    menu: ['Product A', 'Product B'],
    order: ['Product A'],
    status: 'ACTIVE',
  },
  identityValidated: true,
  encrypted: true,
  peerToPeer: true,
  commerceEnabled: true,
  trustedDataTypes: ['identity', 'message', 'voice', 'video', 'location'],
};
