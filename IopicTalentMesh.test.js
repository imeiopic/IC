// IopicTalentMesh.test.js
// Basic test suite for IopicTalentMesh.js

const { IopicNode, IopicTalentMesh } = require('./IopicTalentMesh');

describe('IopicTalentMesh', () => {
  it('adds nodes and clusters them by coordinates', () => {
    const mesh = new IopicTalentMesh();
    const node1 = new IopicNode({
      id: '1',
      name: 'Alice',
      coordinates: { lat: 40.7, lng: -74.0 },
      logicProfile: { skill: 'coding', hours: 8 }
    });
    const node2 = new IopicNode({
      id: '2',
      name: 'Bob',
      coordinates: { lat: 40.6, lng: -74.1 },
      logicProfile: { skill: 'art', hours: 6 }
    });
    mesh.addNode(node1);
    mesh.addNode(node2);
    const clusterId1 = mesh.getClusterId(node1.coordinates);
    const clusterId2 = mesh.getClusterId(node2.coordinates);
    expect(mesh.getNodesByCluster(clusterId1)).toContain(node1);
    expect(mesh.getNodesByCluster(clusterId2)).toContain(node2);
  });

  it('aggregates logic profiles by cluster', () => {
    const mesh = new IopicTalentMesh();
    const node1 = new IopicNode({
      id: '1',
      name: 'Alice',
      coordinates: { lat: 10, lng: 10 },
      logicProfile: { skill: 'gardening', hours: 4 }
    });
    const node2 = new IopicNode({
      id: '2',
      name: 'Bob',
      coordinates: { lat: 10.2, lng: 9.8 },
      logicProfile: { skill: 'music', hours: 5 }
    });
    mesh.addNode(node1);
    mesh.addNode(node2);
    const clusterId = mesh.getClusterId(node1.coordinates);
    const logicProfiles = mesh.aggregateClusterLogic(clusterId);
    expect(logicProfiles.length).toBeGreaterThan(0);
    expect(logicProfiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ skill: 'gardening' }),
        expect.objectContaining({ skill: 'music' })
      ])
    );
  });
});
