<template>
  <div class="iot-audit-dashboard">
    <h2>IoT Audit & Analytics Dashboard</h2>
    <h3>Recent Actions</h3>
    <ul>
      <li v-for="action in actions" :key="action.id">
        <strong>{{ action.type }}</strong> - {{ action.deviceId || action.userId }}
        <span>({{ action.timestamp }})</span>
        <pre>{{ action.details }}</pre>
      </li>
    </ul>
    <h3>Recent Alerts</h3>
    <ul>
      <li v-for="alert in alerts" :key="alert.id">
        <strong>{{ alert.type }}</strong> - {{ alert.actionId }}
        <span>({{ alert.timestamp }})</span>
        <pre>{{ alert.details }}</pre>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const actions = ref([]);
const alerts = ref([]);

const fetchActions = async () => {
  const querySnapshot = await getDocs(collection(db, 'audit'));
  actions.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
const fetchAlerts = async () => {
  const querySnapshot = await getDocs(collection(db, 'alerts'));
  alerts.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

onMounted(() => {
  fetchActions();
  fetchAlerts();
});
</script>

<style scoped>
.iot-audit-dashboard {
  max-width: 800px;
  margin: 2rem auto;
  background: #181818;
  color: #eee;
  border-radius: 16px;
  box-shadow: 0 4px 32px #000a;
  padding: 2rem;
}
h3 {
  color: #0ff;
  margin-bottom: 0.5rem;
}
ul {
  margin: 0 0 2rem 0;
  padding-left: 1.5rem;
}
li {
  margin-bottom: 1rem;
}
pre {
  background: #232323;
  color: #0ff;
  padding: 0.5rem;
  border-radius: 8px;
}
</style>
