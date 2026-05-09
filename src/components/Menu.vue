<template>
  <div class="menu-terminal" :class="userRole">
    <header class="menu-header">
      <h2 class="text-glow">
        {{ userRole === 'seller' ? 'RESOURCE MANAGEMENT' : 'EDEN MARKETPLACE' }}
      </h2>
      <p>Thread 09: Symmetrical Resource Exchange</p>
    </header>

    <section v-if="userRole === 'seller'" class="seller-controls">
      <div class="add-item-box">
        <input v-model="newItem.name" placeholder="Resource Name (e.g., Organic Kale)" />
        <input v-model.number="newItem.price" type="number" placeholder="IO$ Value" />
        <button @click="addResource" class="action-btn">MINT RESOURCE</button>
      </div>
    </section>

    <div class="resource-grid">
      <div v-for="item in menuItems" :key="item.id" class="resource-card">
        <div class="card-header">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-price">{{ item.price }} IO$</span>
        </div>
        <div class="card-actions">
          <template v-if="userRole === 'seller'">
            <button @click="editItem(item)" class="edit-btn">MODIFY</button>
            <button @click="deleteItem(item.id)" class="delete-btn">NAND-FLUSH</button>
          </template>
          <template v-else>
            <button @click="initiateBond(item)" class="bond-btn">EXECUTE BOND</button>
          </template>
        </div>
        <div v-if="item.freshnessLost" class="freshness-warning">
          DELISTED: COORDINATE SYNC LOST
        </div>
      </div>
    </div>

    <footer class="menu-footer">
      <span>LOCAL CLUSTER: {{ clusterID }}</span>
      <span class="velocity-tag">VELOCITY: 8.09V</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useIopicStore } from '@/stores/iopicStore';
import { useGeolocation } from './useGeolocation';

const store = useIopicStore();
const userRole = computed(() => store.nodeStatus.role); // 'seller' or 'buyer'
const clusterID = ref('CLE-CENTRAL-01');

const menuItems = ref([
  { id: 1, name: 'Filtered Spring Water', price: 5, freshnessLost: false },
  { id: 2, name: 'Renewable KWh Bundle', price: 12, freshnessLost: false }
]);

const newItem = ref({ name: '', price: null });

// --- Freshness Pulse Logic ---
const freshnessThreads = ref({}); // { [itemId]: threadCount }
let freshnessInterval = null;

const { currentCoords, geolocationError } = useGeolocation();

function checkCoordinateSync() {
  // True if coordinates are available and no geolocation error
  return !!currentCoords.value && !geolocationError.value;
}

function startFreshnessPulse() {
  freshnessInterval = setInterval(() => {
    menuItems.value.forEach((item) => {
      if (!checkCoordinateSync()) {
        freshnessThreads.value[item.id] = (freshnessThreads.value[item.id] || 0) + 1;
        if (freshnessThreads.value[item.id] > 4) {
          item.freshnessLost = true;
        }
      } else {
        freshnessThreads.value[item.id] = 0;
        item.freshnessLost = false;
      }
    });
  }, 2000); // Each "thread" = 2 seconds for demo
}

onMounted(() => {
  if (userRole.value === 'seller') {
    startFreshnessPulse();
  }
});

onBeforeUnmount(() => {
  if (freshnessInterval) clearInterval(freshnessInterval);
});

const addResource = () => {
  if (newItem.value.name && newItem.value.price) {
    menuItems.value.push({ ...newItem.value, id: Date.now(), freshnessLost: false });
    newItem.value = { name: '', price: null };
  }
};

const initiateBond = (item) => {
  // Logic to trigger BSMolecule.vue handshake
  alert(`Initiating Molecular Bond for ${item.name}. Checking Symmetry...`);
};

// Seller modification logic
const editItem = (item) => {
  /* Logic to modify resource metadata */
};
const deleteItem = (id) => {
  menuItems.value = menuItems.value.filter((i) => i.id !== id);
};
</script>

<style scoped>
.menu-terminal {
  background: #000;
  color: #00ff41;
  padding: 2rem;
  border: 1px solid #00ff41;
  font-family: 'Space Mono', monospace;
}
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 2rem;
}
.resource-card {
  background: #080808;
  border: 1px solid #111;
  padding: 1rem;
  transition: all 0.3s;
}
.resource-card:hover {
  border-color: #00e5ff;
}
.item-name {
  display: block;
  font-weight: bold;
  color: #fff;
}
.item-price {
  color: #00e5ff;
  font-size: 1.2rem;
}
.action-btn,
.bond-btn {
  width: 100%;
  padding: 10px;
  background: #00ff41;
  color: #000;
  border: none;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}
.edit-btn {
  background: transparent;
  border: 1px solid #00e5ff;
  color: #00e5ff;
  width: 48%;
  margin-right: 4%;
  cursor: pointer;
}
.delete-btn {
  background: transparent;
  border: 1px solid #ff0041;
  color: #ff0041;
  width: 48%;
  cursor: pointer;
}
.bond-btn {
  background: #00e5ff;
}
.menu-header {
  text-align: center;
  margin-bottom: 2rem;
}
.add-item-box {
  display: flex;
  gap: 10px;
  margin-bottom: 2rem;
}
.add-item-box input {
  background: #111;
  border: 1px solid #333;
  color: #fff;
  padding: 10px;
  flex: 1;
}
.freshness-warning {
  color: #ff0041;
  font-size: 0.9rem;
  margin-top: 10px;
  font-weight: bold;
}
</style>
