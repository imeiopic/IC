// src/store/index.ts
import { createStore, ActionContext } from 'vuex';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Firebase Functions


interface Peer {
  id: string;
  name: string;
  hasIopic: boolean; // Indicates if the peer is already grounded in IOWB
  invited?: boolean; // Optional property to indicate if they've been invited
}
interface RoomState {
  id: string;
  name: string;
  hostId: string;
  peers: Peer[];
}

interface UserState {
  id: string | null;
  // Add other user properties as needed
}

interface RootState {
  user: UserState;
  room: RoomState;
}

const functionsInstance = getFunctions(); // Initialize Firebase Functions

const store = createStore<RootState>({
  state: {
    user: {
      id: 'hostUserId123' // Mock current user ID (make this dynamic in a real app)
    },
    room: {
      id: 'idealRoom123',
      name: 'The Nexus Chamber',
      hostId: 'hostUserId123', // Mock host ID (current user is host for this example)
      peers: [
        { id: 'peer1', name: 'Alice', hasIopic: false },
        { id: 'peer2', name: 'Bob', hasIopic: true },
        { id: 'guest1', name: 'Charlie', hasIopic: false },
        { id: 'hostUserId123', name: 'Host (You)', hasIopic: true } // Host is also a peer
      ]
    }
  },
  mutations: {
    setRoomPeers(state: RootState, peers: Peer[]) {
      state.room.peers = peers;
    }
  },
  actions: {
    async triggerGlobalInvitation(
      { state, commit }: ActionContext<RootState, RootState>,
      { roomId, multiplierAlpha }: { roomId: string; multiplierAlpha: number }
    ) {
      if (!state.user.id) {
        throw new Error('No authenticated user to send invitation.');
      }
      if (state.user.id !== state.room.hostId) {
        throw new Error('Only the host can send invitations.');
      }

      console.log(
        `Host ${state.user.id} triggering global invitation for room ${roomId} with multiplier ${multiplierAlpha}`
      );

      try {
        const sendInvitationCallable = httpsCallable(functionsInstance, 'sendInvitation');

        // 1. Peer Detection: Iterate through room_presence collection in Firestore
        // In a real app, 'room_presence' would be a collection where each doc is a user in the room.
        // For this example, we'll use the mock peers from the store.
        // If using Firestore: const roomPresenceRef = collection(db, `room_presence/${roomId}/members`);
        // const querySnapshot = await getDocs(roomPresenceRef);

        const invitationPromises: Promise<any>[] = []; // Changed to Promise<any> as callable returns data
        const updatedPeers: Peer[] = [];
        for (const peer of state.room.peers) {
          const memberId = peer.id;

          // Exclude the host from receiving an invitation to themselves
          if (memberId === state.user.id) {
            continue;
          }

          // Check if the peer is already grounded in IOWB (hasIopic)
          if (!peer.hasIopic) {
            console.log(`Sending invitation to ${memberId}`);

            // 2. The Auto-Invite: Call Firebase Cloud Function to send invitation
            // The Cloud Function will handle generating the invitationId and setting the timestamp.
            const invitationPayload = {
              targetUserId: memberId, // The user to whom the invitation is sent
              hostId: state.user.id,
              hostEntityId: state.room.hostId, // Assuming hostId is also the entityId for simplicity
              multiplier: multiplierAlpha,
              redirectPath: '/select-bank', // Path for accepting the handshake
              message: `You've been invited by ${state.room.name} host to join Iopic!`,
              roomName: state.room.name // Pass room name for message context
            };
            
            invitationPromises.push(sendInvitationCallable(invitationPayload));
            updatedPeers.push({ ...peer, invited: true }); // Mark as invited
          } else {
            console.log(`Peer ${memberId} is already grounded, skipping invitation.`);
            updatedPeers.push({ ...peer });
          }
        }

        await Promise.all(invitationPromises);
        commit('setRoomPeers', updatedPeers); // Update local peer status in the store
        console.log('Global Handshake Pulse Sent. Silencing room noise...');
      } catch (error) {
        console.error('Error triggering global invitation:', error);
        throw error; // Re-throw to be caught by the component
      }
    }
    // Add other actions as needed
  }
});

export default store;
