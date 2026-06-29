import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { SymmetryResult } from '../types/symmetry';

/**
 * validateSymmetry
 *
 * Role: Validates a Sovereign Node's health against the Global Iopic Pulse.
 * Requirements for SYMMETRIC status:
 * 1. Node must exist in the users collection.
 * 2. status must be 'SPATIOTEMPORAL_BOUND' or 'EQUITY_GROUNDED'.
 * 3. iowb.isGrounded must be true (Initialization Stake cleared).
 * 4. Genesis binding must be present.
 *
 * @param uid The Sovereign User ID (SUID) to validate.
 * @returns A promise resolving to the symmetry status and current resonance.
 */
export const validateSymmetry = async (uid: string): Promise<SymmetryResult> => {
  const db = getFirestore(app);
  const nodeRef = doc(db, 'users', uid);

  try {
    const nodeSnap = await getDoc(nodeRef);

    if (!nodeSnap.exists()) {
      return { status: 'FRACTURED', resonance: '0.0x', message: 'Node not found in registry.' };
    }

    const data = nodeSnap.data();

    // Logic: A node is symmetric only if it has successfully bound to the mesh (Genesis)
    // and grounded its initialization stake (Equity).
    const isBound = data.status === 'SPATIOTEMPORAL_BOUND' || data.status === 'EQUITY_GROUNDED';
    const hasGroundedEquity = data.iowb?.isGrounded === true;
    const hasGenesis = !!data.genesis?.bindingID;

    if (isBound && hasGroundedEquity && hasGenesis) {
      return {
        status: 'SYMMETRIC',
        resonance: '2.2x',
        message: 'Resonance alignment confirmed. 16-thread bus active.'
      };
    }

    return {
      status: 'ASYMMETRIC',
      resonance: '1.1x',
      message: 'Node alignment drift detected. Grounding incomplete.'
    };
  } catch (error) {
    console.error(`SYMMETRY_CHECK_FAILED for ${uid}:`, error);
    return {
      status: 'FRACTURED',
      resonance: '0.0x',
      message: 'Logical block in symmetry validation.'
    };
  }
};
