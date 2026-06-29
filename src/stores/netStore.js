import { defineStore } from 'pinia';

// Simulated real-time global network state for the Joint Logic Net
export const useNetStore = defineStore('net', {
  state: () => ({
    collectiveVelocity: 8.09,
    totalEquity: '1.2Q TPE',
    systemHeartbeat: 'STABLE',
    asymmetricalNoise: '0.00%',
    activeBonds: '12.4M',
    projects: [
      {
        name: 'Atmospheric Re-Symmetry',
        status: '84% SYNC',
        description: 'Re-aligning carbon threads in Quadrant 7 via collective energy offset.',
        progress: 84,
        color: 'white',
        badge: 'emerald'
      },
      {
        name: 'Deep-Space Logic Node',
        status: 'INITIATING',
        description: 'Scaling the 16-thread bus beyond the Ionosphere. Requires 1M Node Bonds.',
        progress: 12,
        color: 'indigo',
        badge: 'indigo'
      }
    ]
  }),
  actions: {
    // Simulate real-time updates
    updateStats(newStats) {
      Object.assign(this.$state, newStats);
    }
  }
});
