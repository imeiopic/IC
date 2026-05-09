import { defineStore } from 'pinia';

export const useIopicStore = defineStore('iopic', {
  state: () => ({
    nodeStatus: {
      manifestoAccepted: false,
      selfValidated: false,
      peerValidated: false,
      velocity: 0.0,
      coordinates: null
    }
  }),
  actions: {
    updateStatus(step) {
      if (step === 'manifesto') this.nodeStatus.manifestoAccepted = true;
      if (step === 'self') this.nodeStatus.selfValidated = true;
      if (step === 'peer') this.nodeStatus.peerValidated = true;
      this.nodeStatus.velocity = this.calculateVelocity();
    },
    calculateVelocity() {
      let v = 0;
      if (this.nodeStatus.manifestoAccepted) v += 2.0;
      if (this.nodeStatus.selfValidated) v += 2.0;
      if (this.nodeStatus.peerValidated) v = 8.09;
      return v;
    }
  },
  persist: true
});
