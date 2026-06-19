import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { isPrime } from './prime-helpers.cjs';
import { validateProtocolId } from './protocol-id-validator.cjs';
import { calculateMobius, getThreadParity } from './mobius-helpers.cjs';

// Parse CLI arguments for configuration
const args = process.argv.slice(2);
const enforceFibonacciFlag = args.includes('--enforceFibonacci');

/**
 * Initialization script for Noland S Newton
 * Uses the existing Project ID from the Iopic substrate.
 */
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'calcium-channel-489906-m2'
});

const db = admin.firestore();

/**
 * Locates the .protocol file and its current ID.
 */
function getProtocolMetadata() {
  try {
    const files = fs.readdirSync(__dirname);
    const protocolFile = files.find(f => f.endsWith('.protocol'));
    if (!protocolFile) return null;

    const filePath = path.join(__dirname, protocolFile);
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/protocol-id:\s*(0x[0-9a-fA-F]+|[0-9]+)/i);
    
    return match ? { filePath, protocolId: match[1] } : null;
  } catch (error) {
    return null;
  }
}
/**
 * Finds the next prime number for the protocol ID, preserving Hex or Decimal formatting.
 * It also validates the found prime against a set of constraints.
 * @param {string} idStr The current protocol ID string.
 * @param {object} validationConstraints Constraints to apply to the new prime ID.
 * @returns {string} The next valid prime protocol ID.
 * @throws {Error} If a valid ID cannot be found within the search window.
 */
function findNextPrimeProtocolId(idStr, validationConstraints) {
  const isHex = idStr.toLowerCase().startsWith('0x');
  const val = BigInt(idStr);
  let candidate = val + 1n;

  // Fibonacci primes are significantly sparser than standard primes.
  // We expand the search window if Fibonacci enforcement is active.
  const MAX_ATTEMPTS = validationConstraints.enforceFibonacci ? 100000 : 1000;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    // ENFORCING MÖBIUS PURITY: Check if prime AND square-free (μ(n) != 0)
    // By definition, all primes are square-free, but μ(n) allows us to identify 
    // the parity of the digital signature (-1).
    if (isPrime(candidate) && calculateMobius(candidate) !== 0) {
      const newIdStr = isHex ? `0x${candidate.toString(16)}` : candidate.toString(10);
      // Validate the found prime against other constraints
      if (validateProtocolId(newIdStr, validationConstraints)) {
        return newIdStr;
      }
    }
    candidate++;
  }
  throw new Error(`Could not find next prime within ${MAX_ATTEMPTS} attempts starting from ${val}`);
}

/**
 * Updates the local .protocol file with the new incremented ID.
 */
function updateLocalProtocolFile(filePath, nextId) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updatedContent = content.replace(/(protocol-id:\s*)(0x[0-9a-fA-F]+|[0-9]+)/i, `$1${nextId}`);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
}

async function initializeEntity() {
  const metadata = getProtocolMetadata();
  if (!metadata) {
    console.error('❌ FAILURE: Protocol metadata not found. Aborting initialization.');
    return;
  }

  // Define the constraints for the new protocol ID.
  // These should align with your project's requirements.
  const validationConstraints = {
    enforceSafeInteger: true, // Always enforce safe integer for general compatibility
    enforcePrime: true,       // Enforced by findNextPrimeProtocolId
    enforceEvenDecimal: false, // Primes are rarely even (except 2), so don't enforce
    enforcePerfectSquare: false, // Primes are not perfect squares
    enforceFibonacci: enforceFibonacciFlag,
    minLength: 1,             // Minimum length for any ID
    maxLength: null           // No max length by default, adjust as needed
  };

  const newProtocolId = findNextPrimeProtocolId(metadata.protocolId, validationConstraints);
  console.log(`🔄 Updating local protocol to next prime: ${metadata.protocolId} -> ${newProtocolId}`);
  updateLocalProtocolFile(metadata.filePath, newProtocolId);

  // Determine Thread Parity for the new Entity orientation
  const parity = getThreadParity(BigInt(newProtocolId));
  console.log(`✨ Symmetry Mirror Protocol: Initial orientation set to ${parity.orientation}`);

  const entityData = {
    fullName: "Noland S Newton",
    email: "noland.newton@gmail.com",
    connectedTo: "Ime Iopic",
    protocolId: newProtocolId,
    parityOrientation: parity.orientation,
    activeThreads: parity.threads,
    status: "Pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastModified: admin.firestore.FieldValue.serverTimestamp(),
    version: 1
  };

  try {
    console.log('Attempting to initialize entity in the "identities" collection...');
    await db.collection('identities').doc('noland-newton').set(entityData);
    console.log(`✅ SUCCESS: "Noland S Newton" synchronized with Remote Protocol ID: ${newProtocolId}`);
  } catch (error) {
    console.error('❌ FAILURE: Initialization failed:', error.message);
  }
}

initializeEntity();