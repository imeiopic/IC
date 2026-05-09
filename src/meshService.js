import { useIopicStore } from "./stores/iopicStore";

export const meshService = {
  socket: null,

  connect(sovereignId, bioHash) {
    this.socket = new WebSocket("wss://mesh.iopic-vre.web.app/v1/socket");
    this.socket.onopen = () => {
      this.socket.send(
        JSON.stringify({
          type: "GROUNDING_PULSE",
          id: sovereignId,
          bioHash,
        }),
      );
    };
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const store = useIopicStore();
      if (data.event === "PEER_SIGHT") {
        store.handleIncomingSight(data.payload);
      }
    };
  },

  broadcastConsensus(entityData) {
    if (this.socket && this.socket.readyState === 1) {
      this.socket.send(
        JSON.stringify({
          type: "CONSENSUS_REQUEST",
          payload: entityData,
        }),
      );
    }
  },
};
