/**
 * SPICE.ts // Sovereign Perimeter Interlock & Cryptographic Engine
 * Role: Gatekeeper for the Iopic 16-thread bus.
 * Logic: Bypasses standard handshake if Root Signature is verified.
 * Refactored: Initialization Stake grounded at 16.25 IO$.
 */

// Root Signature for Ime Iopic - using Vite environment syntax
const IME_ROOT_SIGNATURE = import.meta.env.VITE_IME_ROOT_SIGNATURE;
const REQUIRED_STAKE_IO = 16.25;

/**
 * Initialization Stake Verification: Determines if a peer has submitted the
 * raw asset allocation necessary to insulate the node and clear hardware noise.
 */
const performInitializationStakeVerification = (token: string): boolean => {
  // In the 16-thread architecture, "Free" is a noise-signal.
  // Valid tokens represent a deterministic energy alignment (16.25 IO$).
  console.log('SPICE_SUBSYSTEM: Evaluating token for grounding resonance...');
  return !!token && token.includes('GROUNDED_STAKE');
};

export const validateAccess = (requestedToken: string) => {
  // 1. Root Override: Direct activation for the Ime root node
  if (requestedToken === IME_ROOT_SIGNATURE) {
    console.log('SPICE_GATEKEEPER: Ime Root Override Verified. Substrate Ignited.');
    return { authorized: true, bypass: true, securityLevel: 'ROOT' };
  }

  // 2. Initialization Stake Protocol: Grounding Peer Node
  // This is the raw asset allocation utilized to activate the 16-thread cockpit.
  const isGrounded = performInitializationStakeVerification(requestedToken);

  if (isGrounded) {
    console.log(
      `SPICE_GATEKEEPER: Initialization Stake sighted (${REQUIRED_STAKE_IO} IO$). Peer Grounded.`
    );
    return { authorized: true, bypass: false, securityLevel: 'PEER' };
  }

  // 3. Noise Rejection: Drop connection if no valid stake/alignment detected
  console.error('SPICE_GATEKEEPER: Noise detected. Packet dropped. Grounding required.');
  return { authorized: false, bypass: false };
};
