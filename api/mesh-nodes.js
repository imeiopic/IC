// Simple in-memory mesh node registry
const nodes = [];

function registerNode(node) {
  node.timestamp = Date.now();
  // Store all relevant fields for node registration
  nodes.push({
    id: node.id,
    name: node.name,
    device: node.device,
    inviteAddress: node.inviteAddress || null,
    connectCode: node.connectCode || null,
    paymentStatus: node.paymentStatus || 'pending',
    inviterPays: node.inviterPays || false,
    timestamp: node.timestamp
  });
}

function getNodes() {
  return nodes;
}

module.exports = { registerNode, getNodes };
