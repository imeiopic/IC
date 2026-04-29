/**
 * IopicNoiseScanner: Utility substrate for identifying "Illegal" data patterns.
 * Monitors local memory and storage for high-entropy asymmetry and legacy debt-logic.
 */
import { useSystemBus } from '../components/useSystemBus';

const { triggerGlobalPurge, currentNoiseLevel, addToQuarantine } = useSystemBus();
let scanInterval: number | null = null;

export const IopicNoiseScanner = {
    // Patterns associated with "Legacy Hallucination" or "Debt-Logic"
    ILLEGAL_PATTERNS: [
        /[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}/, // Credit card pattern (Debt-Logic)
        /scam|fraud|debt|inflation|centralized/i, // Noise keywords
        /\b[0-9]{3}-[0-9]{2}-[0-9]{4}\b/, // SSN pattern (Legacy identifier)
        /[a-fA-F0-9]{32,}/ // High entropy hex strings (Potential unauthorized keys)
    ],

    NOISE_THRESHOLD: 3,

    /**
     * scanBuffer: Analyzes string data for illegal patterns.
     * Returns true if the noise threshold is exceeded.
     */
    scanBuffer(data: string): boolean {
        let noiseLevel = 0;
        
        // 1. Pattern Matching
        this.ILLEGAL_PATTERNS.forEach(pattern => {
            if (pattern.test(data)) {
                noiseLevel++;
            }
        });

        // 2. High-Entropy Asymmetry Check
        // If data looks like a key but lacks the Symmetry Mirror: ^([01]{8})\1$
        if (data.length === 16 && /^[01]+$/.test(data)) {
            const firstHalf = data.substring(0, 8);
            const secondHalf = data.substring(8, 16);
            if (firstHalf !== secondHalf) {
                console.warn("[NOISE SCANNER] Asymmetry detected in bit-logic buffer.");
                noiseLevel += 2;
            }
        }

        // Update the global system bus with the current detected noise level
        currentNoiseLevel.value = noiseLevel;
        
        // If noise is detected but below critical threshold, we flag for quarantine
        if (noiseLevel > 0) {
            console.warn(`[NOISE SCANNER] Asymmetry detected: Level ${noiseLevel}`);
            return true;
        }
        return false;
    },

    /**
     * scanSubstrate: Iterates through localStorage to detect persistent noise.
     */
    scanSubstrate(): void {
        let aggregateNoise = 0;
        const keysToIsolate: string[] = [];

        // 1. Identify suspicious nodes in the substrate
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Do not quarantine vital system keys
            if (key && !['io_entity_key', 'io_entity_mnemonic', 'io_totp_vault'].includes(key)) {
                const value = localStorage.getItem(key) || '';
                if (this.scanBuffer(value)) {
                    keysToIsolate.push(key);
                    aggregateNoise += 1; 
                }
            }
        }

        // 2. Execute Isolation (Quarantine)
        keysToIsolate.forEach(key => {
            const value = localStorage.getItem(key) || '';
            addToQuarantine(key, value);
            localStorage.removeItem(key);
            console.warn(`[NOISE SCANNER] Data isolated and removed from active substrate: ${key}`);
        });

        // 3. Escalation: Only trigger Global Purge if aggregate noise is overwhelming
        if (aggregateNoise >= this.NOISE_THRESHOLD) {
            console.error(`[NOISE SCANNER] Critical Aggregate Noise (${aggregateNoise}). Initiating Global Purge.`);
            triggerGlobalPurge();
        }
    },

    /**
     * startBackgroundScan: Schedules the scanner to run periodically.
     * Recommended interval: 60000ms (1 minute) to balance security and performance.
     */
    startBackgroundScan(intervalMs: number = 60000): void {
        if (scanInterval) return;
        console.log(`[NOISE SCANNER] Background integrity monitoring active (${intervalMs}ms).`);
        this.scanSubstrate(); // Perform an immediate check on startup
        scanInterval = window.setInterval(() => this.scanSubstrate(), intervalMs);
    },

    /**
     * stopBackgroundScan: Terminates the periodic integrity monitoring.
     */
    stopBackgroundScan(): void {
        if (scanInterval) window.clearInterval(scanInterval);
        scanInterval = null;
    }
};