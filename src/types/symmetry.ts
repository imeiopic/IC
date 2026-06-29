export type SymmetryStatus = 'SYMMETRIC' | 'ASYMMETRIC' | 'FRACTURED' | 'LOCKED';

export interface SymmetryResult {
  status: SymmetryStatus;
  resonance: string;
  message?: string;
}
