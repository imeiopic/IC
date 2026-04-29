<template>
  <div class="iot-policy-manager">
    <h2>IoT Policy Manager</h2>
    <form @submit.prevent="addPolicy">
      <label
        >Policy Name:
        <input v-model="policyName" required />
      </label>
      <label
        >Rule (JSON Logic):
        <textarea v-model="policyRule" required rows="4" />
      </label>
      <button type="submit">Add Policy</button>
    </form>
    <h3>Existing Policies</h3>
    <ul>
      <li v-for="policy in policies" :key="policy.id">
        <strong>{{ policy.name }}</strong>
        <pre>{{ policy.rule }}</pre>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const policyName = ref('');
const policyRule = ref('');
const policies = ref([]);

const addPolicy = async () => {
  await addDoc(collection(db, 'policies'), {
    name: policyName.value,
    rule: policyRule.value,
    created: new Date().toISOString()
  });
  policyName.value = '';
  policyRule.value = '';
  await fetchPolicies();
};

const fetchPolicies = async () => {
  const querySnapshot = await getDocs(collection(db, 'policies'));
  policies.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

onMounted(fetchPolicies);
</script>

<style scoped>
.iot-policy-manager {
  max-width: 600px;
  margin: 2rem auto;
  background: #181818;
  color: #eee;
  border-radius: 16px;
  box-shadow: 0 4px 32px #000a;
  padding: 2rem;
}
form {
  margin-bottom: 2rem;
}
input,
textarea {
  width: 100%;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #444;
  background: #222;
  color: #eee;
  padding: 0.5rem;
}
button {
  background: #0ff;
  color: #222;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  font-weight: bold;
}
ul {
  margin: 0;
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
