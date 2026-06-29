import { defineStore } from 'pinia';

export interface IEvent {
  id: string;
  title: string;
  description: string;
  image: string;
  primaryThread: string;
  committedNodes: number;
  atmosphericPressure: number;
  isUserCommitted: boolean;
}

export const useEventStore = defineStore('event', {
  state: () => ({
    events: [] as IEvent[],
    loading: false,
  }),

  actions: {
    async fetchSymmetricalEvents() {
      this.loading = true;
      // In production, replace with your secure API/Firestore call
      await new Promise(resolve => setTimeout(resolve, 600));
      this.events = [
        {
          id: 'PULSE_001',
          title: 'Harmonic Convergence',
          description: 'Synchronizing local mesh nodes for global equity transfer.',
          image: '/api/placeholder/400/200',
          primaryThread: 'T-04',
          committedNodes: 142,
          atmosphericPressure: 88,
          isUserCommitted: false
        }
      ];
      this.loading = false;
    },

    async groundEventCommitment(eventId: string) {
      const event = this.events.find(e => e.id === eventId);
      if (event && !event.isUserCommitted) {
        // Optimistic UI update
        event.isUserCommitted = true;
        event.committedNodes += 1;
        console.log(`[EVENT_BUS] Node grounded to: ${eventId}`);
      }
    }
  }
});