import { defineStore } from 'pinia';

export interface IPeer {
  id: string;
  name: string;
  hasIopic: boolean;
  invited: boolean;
}

interface RoomState {
  id: string;
  roomName: string;
  hostId: string;
  peers: IPeer[];
  isInviting: boolean;
  invitationError: string | null;
}

export const useRoomStore = defineStore('room', {
  state: (): RoomState => ({
    id: 'ROOM_NEXUS_01',
    roomName: 'The Nexus Chamber',
    hostId: 'USER_CURRENT',
    peers: [],
    isInviting: false,
    invitationError: null,
  }),

  getters: {
    isHost: (state) => state.hostId === 'USER_CURRENT', // Logic: Match against local session
  },

  actions: {
    async triggerGlobalInvitation() {
      this.isInviting = true;
      this.invitationError = null;
      try {
        // Logic: Push handshake pulse to the 16-thread bus
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`[ROOM_BUS] Invitation broadcast for room: ${this.id}`);
      } catch (err: any) {
        this.invitationError = err.message || 'Handshake failed.';
      } finally {
        this.isInviting = false;
      }
    },
    
    // Placeholder for real-time listener binding
    subscribeToPresence() {
      console.log(`[ROOM_BUS] Subscribing to room ${this.id} presence...`);
    }
  }
});