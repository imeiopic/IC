import { defineStore } from 'pinia';

// Explicitly type the structure of our choreo-beats
export type ChoreoStep = {
  id: number;
  label: string; // The Vue file name (e.g., 'SELF.VUE')
  color: 'indigo' | 'cyan' | 'emerald' | 'amber'; // Production strict colors
  beats: number[]; // e.g., [1, 2]
  description: string; // Text for the log output
};

interface ChoreographState {
  currentBeat: number;
  totalBeats: number;
  isRunning: boolean;
  baseDescription: string;
  sequence: ChoreoStep[];
}

export const useChoreographStore = defineStore('choreograph', {
  state: (): ChoreographState => ({
    currentBeat: 0,
    totalBeats: 8,
    isRunning: false,
    baseDescription: 'Sequencer anchored. Awaiting trigger to march the 16 threads in unified order.',
    // Unified sequence definition - single point of truth
    sequence: [
      { id: 1, label: 'SELF.VUE', color: 'indigo', beats: [1, 2], 
        description: 'Isolating core identity in Self.vue. Grounding biometric heart rate parameters.' },
      { id: 2, label: 'SPICE.VUE', color: 'cyan', beats: [3, 4], 
        description: 'Initializing SPICE.vue gateway. Routing secure cryptographic handshakes through the zero-knowledge matrix.' },
      { id: 3, label: 'OT.VUE', color: 'emerald', beats: [5, 6], 
        description: 'Engaging OT.vue. Processing economic equity transaction with hard-coded 1.1x / 2.2x multiplier tracking.' },
      { id: 4, label: 'EARTH.VUE', color: 'amber', beats: [7, 8], 
        description: 'Transitioning view to EarthToMe.vue. Executing smooth spatial zoom to lock local Cleveland cluster coordinates.' },
    ],
  }),

  actions: {
    // Advanced execution loop: marches the beat in real-time
    async runChoreographyPulse() {
      if (this.isRunning) return;
      
      this.isRunning = true;
      this.currentBeat = 0; // Reset just in case

      // Use an async loop rather than hard-coded setTimeouts.
      // This is production-ready for binding to external clock sources later.
      for (let beat = 1; beat <= this.totalBeats; beat++) {
        // Break loop if externally reset
        if (!this.isRunning) break; 

        // Update the reactive beat
        this.currentBeat = beat;
        
        // Wait for 1 second (Production: Can easily bind this to external MIDI clock or BPM)
        await this.waitForBeat();
      }

      // Final stability check
      if (this.isRunning) {
        this.isRunning = false;
        console.log("CHOREOGRAPH: Lifecycle routine fully completed and stabilized across the Global Mesh.");
      }
    },

    resetRoutine() {
      this.isRunning = false;
      this.currentBeat = 0;
    },

    // Utility helper for cleaner loop timing
    waitForBeat() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
  },

  getters: {
    // Dynamic text binding based on the active beat
    currentBeatDescription: (state): string => {
      if (state.currentBeat === 0) return state.baseDescription;

      const activeStep = state.sequence.find(step => 
        step.beats.includes(state.currentBeat)
      );

      if (!activeStep) return 'Executing interstitial bus clock...';

      return `[Beats ${activeStep.beats[0]}-${activeStep.beats[1]}]: ${activeStep.description}`;
    }
  },
});