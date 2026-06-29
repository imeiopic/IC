import { defineStore } from 'pinia';

interface SystemState {
  isSystemActive: boolean;
  activeThread: number; // Represents the current active thread in the 16-thread architecture
  networkStatus: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  iopicEquation: {
    I: number; // Intensity
    V: number; // Voltage/Velocity
    R: number; // Resistance/Radius
  };
  lastHeartbeat: number | null;
}

export const useSystemStore = defineStore('system', {
  state: (): SystemState => ({
    isSystemActive: false,
    activeThread: 1, // Defaulting to first thread
    networkStatus: 'OFFLINE',
    iopicEquation: { I: 0, V: 0, R: 0 },
    lastHeartbeat: null,
  }),

  actions: {
    // Toggles the system status for May 1st activation
    toggleSystem(status: boolean) {
      this.isSystemActive = status;
      this.lastHeartbeat = Date.now();
    },

    // Updates the I=VR² parameters
    updateEquation(v: number, r: number) {
      this.iopicEquation.V = v;
      this.iopicEquation.R = r;
      // Formula: I = V * R^2
      this.iopicEquation.I = v * Math.pow(r, 2);
    },

    // Manage thread shifting
    shiftThread(threadIndex: number) {
      if (threadIndex >= 1 && threadIndex <= 16) {
        this.activeThread = threadIndex;
      }
    },

    setNetworkStatus(status: 'ONLINE' | 'OFFLINE' | 'SYNCING') {
      this.networkStatus = status;
    }
  },

  getters: {
    // Utility to get current Intensity
    getIntensity: (state) => state.iopicEquation.I,
  }
});