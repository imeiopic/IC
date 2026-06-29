/**
 * IopicSecretManager: Cryptographic Substrate for AES-GCM Vault operations.
 * Implements PBKDF2 for key derivation and AES-GCM for authenticated encryption.
 */
export class IopicSecretManager {
    private static readonly ALGO = 'AES-GCM';
    private static readonly KEY_ALGO = 'PBKDF2';
    private static readonly HASH = 'SHA-256';
    private static readonly ITERATIONS = 600000; // Elevated iterations to mitigate rapid brute-force attempts

    /**
     * Encrypts a raw seed string using a user-provided password.
     * Returns a serialized vault string containing salt, IV, and ciphertext.
     */
    static async encryptSeed(seed: string, password: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(seed);
        
        // Generate unique cryptographic noise for this operation
        const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
        const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));

        // Derive a high-entropy symmetry key from the password
        const baseKey = await this.deriveBaseKey(password);
        const aesKey = await this.deriveEncryptionKey(baseKey, salt);

        // Encrypt using AES-GCM (Authenticated Encryption)
        const ciphertext = await globalThis.crypto.subtle.encrypt(
            { name: this.ALGO, iv: iv as Uint8Array },
            aesKey,
            data
        );

        // Package for substrate storage (localStorage)
        const vault = {
            s: this.bufToHex(salt),
            i: this.bufToHex(iv),
            c: this.bufToHex(new Uint8Array(ciphertext))
        };

        return JSON.stringify(vault);
    }

    /**
     * Decrypts a vault string using a user-provided password.
     * Throws an error if the password is incorrect or the data was tampered with.
     */
    static async decryptSeed(vaultJson: string, password: string): Promise<string> {
        let salt: Uint8Array;
        let iv: Uint8Array;
        let ciphertext: Uint8Array;

        try {
            const { s, i, c } = JSON.parse(vaultJson);
            if (!s || !i || !c) throw new Error("Malformed vault data");
            
            salt = this.hexToBuf(s);
            iv = this.hexToBuf(i);
            ciphertext = this.hexToBuf(c);
        } catch (e) {
            console.error("IopicSecretManager: Vault parsing failed.", e);
            throw new Error("Vault corruption detected or invalid format.");
        }

        // Re-derive the symmetry key using stored salt
        const baseKey = await this.deriveBaseKey(password);
        const aesKey = await this.deriveEncryptionKey(baseKey, salt);

        // Decrypt and verify GCM authentication tag
        const decrypted = await globalThis.crypto.subtle.decrypt(
            { name: this.ALGO, iv: iv as Uint8Array },
            aesKey,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    }

    private static async deriveBaseKey(password: string): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        return globalThis.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            this.KEY_ALGO,
            false,
            ['deriveKey']
        );
    }

    private static async deriveEncryptionKey(baseKey: CryptoKey, salt: Uint8Array): Promise<CryptoKey> {
        return globalThis.crypto.subtle.deriveKey(
            {
                name: this.KEY_ALGO,
                salt,
                iterations: this.ITERATIONS,
                hash: this.HASH
            },
            baseKey,
            { name: this.ALGO, length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    private static bufToHex(buf: Uint8Array): string {
        return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    private static hexToBuf(hex: string): Uint8Array {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
        }
        return bytes;
    }
}