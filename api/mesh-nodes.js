// Simple in-memory mesh node registry and balances
const nodes = [];
const balances = {}; // { [nodeId]: balance }

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
  // Initialize balance if not present
  if (!balances[node.id]) {
    balances[node.id] = 0;
  }
}

function getNodes() {
  return nodes;
}

function getBalance(nodeId) {
  return balances[nodeId] || 0;
}

function creditBalance(nodeId, amount) {
  if (!balances[nodeId]) {
    balances[nodeId] = 0;
  }
  balances[nodeId] += amount;
  return balances[nodeId];
}

module.exports = { registerNode, getNodes, getBalance, creditBalance };
