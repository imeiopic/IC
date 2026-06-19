const ALGORITHM: RsaHashedKeyGenParams = {
  name: 'RSASSA-PSS',
  modulusLength: 2048,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: 'SHA-256',
};

const SIGN_ALGORITHM: RsaPssParams = {
  name: 'RSASSA-PSS',
  saltLength: 32, // Recommended salt length for SHA-256
};

/**
 * Generates an RSA-PSS key pair for signing and verification.
 * @returns A Promise that resolves to a CryptoKeyPair.
 */
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    ALGORITHM,
    true, // extractable
    ['sign', 'verify']
  );
}

/**
 * Exports a CryptoKey to JWK format.
 * @param key The CryptoKey to export.
 * @returns A Promise that resolves to a JsonWebKey.
 */
export async function exportKey(key: CryptoKey): Promise<JsonWebKey> {
  return await crypto.subtle.exportKey('jwk', key);
}

/**
 * Imports a JWK into a CryptoKey.
 * @param jwk The JsonWebKey to import.
 * @param usages The key usages (e.g., ["sign"], ["verify"]).
 * @returns A Promise that resolves to a CryptoKey.
 */
export async function importKey(jwk: JsonWebKey, usages: KeyUsage[]): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    ALGORITHM,
    true, // extractable
    usages
  );
}

/**
 * Signs a message string using the provided private key.
 * @param privateKey The CryptoKey (private key) to use for signing.
 * @param message The string message to sign.
 * @returns A Promise that resolves to the signature as a Base64 URL encoded string.
 */
export async function sign(privateKey: CryptoKey, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const signatureBuffer = await crypto.subtle.sign(SIGN_ALGORITHM, privateKey, data);
  // Convert ArrayBuffer to Base64 URL string for easier storage/transmission
  return btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Verifies a message signature using the provided public key.
 * @param publicKey The CryptoKey (public key) to use for verification.
 * @param signature The Base64 URL encoded signature.
 * @param message The string message that was signed.
 * @returns A Promise that resolves to a boolean indicating if the signature is valid.
 */
export async function verify(
  publicKey: CryptoKey,
  signature: string,
  message: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const signatureBuffer = Uint8Array.from(
    atob(signature.replace(/-/g, '+').replace(/_/g, '/')),
    (c) => c.charCodeAt(0)
  );

  return await crypto.subtle.verify(SIGN_ALGORITHM, publicKey, signatureBuffer, data);
}
