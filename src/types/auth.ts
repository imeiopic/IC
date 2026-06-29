import { User } from 'firebase/auth';

export interface UserIdeals {
  city: string;
  county: string;
}

export interface AppUser extends User {
  ideals?: UserIdeals;
  role?: 'admin' | 'buyer' | 'seller' | string;
  status?: string;
  equityTier?: string;
  lastTransit?: any; // Firestore Timestamp
  validatedBy?: string;
}

export type AuthUser = AppUser;
