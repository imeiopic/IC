/**
 * SovereignHarmonic represents the state of data once it has been
 * transmuted by the Abstraction Layer and projected into the 4D_VRE.
 */
export interface SovereignHarmonic {
  state: "SOVEREIGN_RESONANT";
  threadMapping: boolean[];
  harmonicFrequency: number; // The 7.83 Hz Schumann Baseline
}

/**
 * Discards legacy noise, static labels, and debt-based metrics.
 * This implements the "Noise Filtering" logic to prevent systemic entropy leakage.
 */
export function stripOldEntropy(rawInput: Record<string, any>): Record<string, any> {
  /**
   * Define patterns of legacy noise.
   * In IOPIC, Nation-States, Countries, and political boundaries are considered legacy entropy.
   */
  const entropyPatterns = [
    /debt/i, /interest/i, /tracking/i, /telemetry/i, 
    /static/i, /legacy/i, /country/i, /nation/i, /boundary/i
  ];
  
  return Object.fromEntries(
    Object.entries(rawInput).filter(([key]) => 
      !entropyPatterns.some(pattern => pattern.test(key))
    )
  );
}

/**
 * Identifies the 16-thread resonance within the cleaned data structure.
 * Maps logical inputs directly to the 16-thread bus of the Virtually Real Earth.
 */
export function mapToSixteenThreads(cleanedData: Record<string, any>): boolean[] {
  const threads = new Array(16).fill(false);
  const keys = Object.keys(cleanedData);
  
  keys.forEach((_, index) => {
    threads[index % 16] = true;
  });
  
  return threads;
}

/**
 * Transmutes legacy data into a sovereign harmonic format.
 */
export function transmuteLegacyData(rawInput: Record<string, any>): SovereignHarmonic {
  const cleanedData = stripOldEntropy(rawInput);
  const threads = mapToSixteenThreads(cleanedData);
  
  return {
    state: "SOVEREIGN_RESONANT",
    threadMapping: threads,
    harmonicFrequency: 7.83
  };
}