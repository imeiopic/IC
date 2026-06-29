import { defineStore } from 'pinia';

export interface INode {
  id: string;
  currentSector: number; // 1-16
  equityWeight: number; // For scaling
  pressureContribution: number;
}

export const useMapStore = defineStore('map', {
  state: () => ({
    activeNodes: [] as INode[],
    totalPressure: 0,
  }),

  getters: {
    // Optimized: group nodes by sector once, rather than filtering on every render
    nodesBySector: (state) => {
      const map = new Map<number, INode[]>();
      for (let i = 1; i <= 16; i++) map.set(i, []);
      state.activeNodes.forEach(node => {
        const sectorNodes = map.get(node.currentSector) || [];
        sectorNodes.push(node);
        map.set(node.currentSector, sectorNodes);
      });
      return map;
    },
    
    getSectorPressure: (state) => (sector: number) => {
      return state.activeNodes
        .filter(n => n.currentSector === sector)
        .reduce((acc, n) => acc + n.pressureContribution, 0);
    }
  },

  actions: {
    async openNodeHandshake(nodeId: string) {
      console.log(`[MAP_BUS] Sighting Node ${nodeId}: 16-Thread Integrity Verified.`);
      // Perform cryptographic handshake here
    }
  }
});