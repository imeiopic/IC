/**
 * IopicTalentMesh.js
 *
 * Maps the unique logic-contributions of all nodes (individuals) to their local Coordinate Clusters.
 * This is the initialization scaffold for the IOPIC 16-Thread Architecture Talent Mesh.
 *
 * Key Concepts:
 * - Each node represents a sovereign contributor (Man as Architect/Observer/Steward)
 * - Each node is mapped to a Coordinate Cluster (geo or logical grouping)
 * - Each node has a unique logic-contribution profile
 * - The mesh enables querying, aggregation, and visualization of contributions
 */

// Example Node structure
class IopicNode {
  constructor({ id, name, coordinates, logicProfile }) {
    this.id = id; // Unique identifier
    this.name = name; // Human-readable name
    this.coordinates = coordinates; // { lat, lng } or logical cluster
    this.logicProfile = logicProfile; // Contribution metadata
  }
}

// The Talent Mesh
class IopicTalentMesh {
  constructor() {
    this.nodes = new Map(); // id -> IopicNode
    this.clusters = new Map(); // clusterId -> Set of node ids
  }

  addNode(node) {
    this.nodes.set(node.id, node);
    const clusterId = this.getClusterId(node.coordinates);
    if (!this.clusters.has(clusterId)) {
      this.clusters.set(clusterId, new Set());
    }
    this.clusters.get(clusterId).add(node.id);
  }

  getClusterId(coordinates) {
    // Simple example: round lat/lng to nearest integer for cluster
    if (typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
      return `${Math.round(coordinates.lat)}_${Math.round(coordinates.lng)}`;
    }
    // Fallback for logical clusters
    return coordinates.cluster || 'unknown';
  }

  getNodesByCluster(clusterId) {
    const ids = this.clusters.get(clusterId) || new Set();
    return Array.from(ids).map((id) => this.nodes.get(id));
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  // Example: aggregate logic profiles for a cluster
  aggregateClusterLogic(clusterId) {
    const nodes = this.getNodesByCluster(clusterId);
    // Aggregate logicProfile fields as needed
    return nodes.map((n) => n.logicProfile);
  }
}

// Export for use in the IOPIC mesh system
module.exports = { IopicNode, IopicTalentMesh };
