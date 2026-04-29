import type { CoinXType } from './coinxModel';

/**
 * Invite Model
 * 
 * Represents the initial request to connect in the Iopic World.
 * INVITE: Informed New Virtual Instance to Entity.
 * 
 * Enforces the core rule: No interaction without invitation.
 */

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export interface Invite {
  id: string;
  inviterId: string;
  inviterName: string;
  inviteeId?: string;    // Known member ID
  inviteeEmail?: string; // For inviting new members
  inviteeName?: string;
  type: CoinXType;       // '01' for P2P, '10' for Buyer-Seller
  status: InviteStatus;
  message?: string;
  createdAt: string;     // ISO date
  expiresAt?: string;    // ISO date
  /** Initiator's 4D location data (lat, lng, elevation) sent during the handshake */
  location?: {
    lat: number;
    lng: number;
    alt: number;
  };
  /** The 8 boundary points generated for Bluetooth validation (30ft radius) */
  boundaryPoints?: Array<{ lat: number; lng: number; alt: number }>;
}

export const exampleInvite: Invite = {
  id: 'inv-001',
  inviterId: 'person01',
  inviterName: 'Ime Iopic',
  inviteeEmail: 'new-member@example.com',
  type: '01',
  status: 'PENDING',
  message: 'I would like to welcome you to my logic-based digital reality.',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 7 days
};