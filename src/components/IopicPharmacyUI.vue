import { useErrorSubstrate } from '../errorHandler'; const { notifySuccess } = useErrorSubstrate();
notifySuccess('Mesh node list updated.');
<template>
  <div class="iopic-pharmacy">
    <h2>Iopic Pharmacy: Sighting-Grade Entheogen Distribution</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <div v-for="e in entheogens" :key="e.name" class="entheogen-block">
        <h3>{{ e.name }}</h3>
        <ul>
          <li><strong>Type:</strong> {{ e.type }}</li>
          <li><strong>Use:</strong> {{ e.use }}</li>
          <li><strong>Purity:</strong> {{ e.purity }}</li>
          <li><strong>Safety:</strong> {{ e.safety }}</li>
        </ul>
      </div>
      <div class="distribution-status">
        <strong>Distributed to:</strong> {{ nodes.toLocaleString() }} nodes<br />
        <strong>Status:</strong> 0% Friction, 100% Purity, Peer Sighting enforced.<br />
        <strong>Transition support active.</strong>
      </div>
      <div class="mesh-nodes">
        <h3>Live Mesh Nodes</h3>
        <ul>
          <li v-for="n in meshNodes" :key="n.id">
            <strong>{{ n.name }}</strong> <span class="device">({{ n.device }})</span>
          </li>
        </ul>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const entheogens = ref<any[]>([]);
const nodes = ref(0);
const meshNodes = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const success = ref('');
let ws: WebSocket | null = null;

async function fetchEntheogens() {
  try {
    const res = await fetch('/api/pharmacy/entheogens');
    const data = await res.json();
    entheogens.value = data.entheogens;
    nodes.value = data.nodes;
  } catch (e) {
    error.value = 'Failed to load entheogens.';
  }
}

async function fetchMeshNodes() {
  try {
    const res = await fetch('/api/mesh/nodes');
    const data = await res.json();
    meshNodes.value = data.nodes;
  } catch (e) {
    error.value = 'Failed to load mesh nodes.';
  }
}

function setupWebSocket() {
  ws = new WebSocket('ws://localhost:5001');
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'node-joined') {
        fetchMeshNodes();
      }
    } catch {}
  };
  ws.onerror = () => {
    error.value = 'Mesh sync error.';
  };
}

onMounted(async () => {
  loading.value = true;
  await fetchEntheogens();
  await fetchMeshNodes();
  setupWebSocket();
  loading.value = false;
});
</script>

<style scoped>
.iopic-pharmacy {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fafbfc;
}
.entheogen-block {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #fff;
}
.distribution-status {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #f6fff6;
  color: #2a7;
  font-size: 1.1em;
}
</style>
