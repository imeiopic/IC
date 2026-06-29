import mitt from 'mitt';

// Global event bus for protocol broadcast
export const respectBus = mitt();

// Example: Broadcast RESPECT protocol to all nodes
export function broadcastRespectProtocol(
  payload = { protocol: 'RESPECT', status: 'ACTIVE', timestamp: Date.now() }
) {
  respectBus.emit('respect-broadcast', payload);
}
