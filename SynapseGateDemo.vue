<template>
  <div class="synapse-gate-demo">
    <SynapseHUD :bond="bond" :status-text="statusText" />
    <div class="actions">
      <button @click="lockBond">Lock BS-Molecule</button>
      <button @click="completeBond" :disabled="!bond.locked">Complete Transaction</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import SynapseHUD from './SynapseHUD.vue';
import { System, Bond } from './SynapseGate';

export default defineComponent({
  name: 'SynapseGateDemo',
  components: { SynapseHUD },
  setup() {
    const bond = ref<Bond>({
      NodeA: 'A',
      NodeB: 'B',
      amount: 1600,
      locked: false,
      verifyDelivery: () => false
    });
    const statusText = ref('Unlocked');

    async function lockBond() {
      const result = await System.initializeBSMolecule({ NodeA: 'A', NodeB: 'B', amount: 1600 });
      if (typeof result === 'object') {
        bond.value = { ...result, verifyDelivery: () => true };
        statusText.value = 'Locked (Awaiting Sync)';
      } else {
        statusText.value = 'NAND Purged';
      }
    }

    async function completeBond() {
      if (bond.value.locked && bond.value.verifyDelivery()) {
        await System.completeTransaction(bond.value);
        statusText.value = 'Terminal 10: Complete';
      }
    }

    return { bond, statusText, lockBond, completeBond };
  }
});
</script>

<style scoped>
.synapse-gate-demo {
  max-width: 520px;
  margin: 0 auto;
  padding: 32px 0;
}
.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
}
button {
  background: #00ff99;
  color: #003300;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1.1em;
  font-family: 'Orbitron', monospace;
  cursor: pointer;
  box-shadow: 0 0 8px #00ff99aa;
  transition: background 0.2s;
}
button:disabled {
  background: #baffc9;
  color: #666;
  cursor: not-allowed;
}
</style>
