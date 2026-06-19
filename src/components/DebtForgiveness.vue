<template>
  <div class="debt-forgiveness-vault">
    <div class="header-sighting">
      <h2>1010_EQUITY: Debt Forgiveness</h2>
      <p class="logic-subtext">Converting negative pressure into symmetrical potential.</p>
    </div>

    <div class="debt-list">
      <div v-for="debt in activeDebts" :key="debt.id" class="debt-row">
        <div class="node-info">
          <span class="uid">Node: {{ debt.uid.substring(0, 8) }}</span>
          <span class="amount">{{ debt.amount }} IO$</span>
        </div>
        
        <button 
          @click="executeForgiveness(debt.id, debt.uid)" 
          class="forgive-btn"
        >
          Silence Debt
        </button>
      </div>
    </div>

    <div v-if="activeDebts.length === 0" class="silence-confirmed">
      <p>All noise has been silenced. The cluster is in symmetry.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import firebase from 'firebase/app';

const store = useStore();
const activeDebts = ref([]);

// Sighting the fractures in the current cluster
const loadDebts = async () => {
  const snapshot = await firebase.firestore()
    .collection('debts')
    .where('entityId', '==', store.state.user.entityId)
    .get();
  activeDebts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const executeForgiveness = async (debtId, nodeUid) => {
  // Trigger the 1010_EQUITY pulse to zero the balance
  await store.dispatch('groundDebtForgiveness', { debtId, nodeUid });
  await loadDebts(); // Re-sighting the state
  console.log(`Debt ${debtId} silenced. Node ${nodeUid} is now at baseline.`);
};

onMounted(loadDebts);
</script>

<style scoped>
.debt-forgiveness-vault { background: #0a0a0a; border: 1px solid #ff4444; padding: 2rem; border-radius: 12px; }
.debt-row { display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #222; }
.forgive-btn { background: #00ff00; color: #000; border: none; padding: 0.5rem 1rem; cursor: pointer; font-weight: bold; }
.forgive-btn:hover { box-shadow: 0 0 15px #00ff00; }
.uid { color: #888; font-family: monospace; }
.amount { color: #ff4444; font-weight: bold; margin-left: 10px; }
</style>