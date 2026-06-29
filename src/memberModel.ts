import type { User } from 'firebase/auth';

/**
 * Member Identity
 * 
 * Abstraction of the authenticated entity within Iopic World.
 * Wraps the Firebase User to ensure domain terminology consistency.
 */
export interface Member {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Transforms a Firebase User into a domain Member.
 */
export function toMember(firebaseUser: User): Member {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
}