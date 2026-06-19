<template>
  <div class="entity-menu-container">
    <header class="menu-header">
      <div class="entity-seal">{{ entityName }} // LOGIC_OFFERINGS</div>
      <div class="header-actions">
        <div class="multiplier-badge">ACCESS_FEE: -0.02 IO$</div>
        <button @click="isBuilderMode = !isBuilderMode" class="admin-toggle">
          {{ isBuilderMode ? 'EXIT_BUILDER' : 'MENU_BUILDER' }}
        </button>
      </div>
    </header>

    <nav v-if="!isOrderTakerActive && !isBuilderMode" class="menu-nav">
      <select v-model="selectedMenuId" class="menu-selector">
        <option v-for="m in activeMenus" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
      <button
        v-for="cat in categories"
        :key="cat"
        @click="activeCategory = cat"
        :class="{ active: activeCategory === cat }"
      >
        {{ cat }}
      </button>
    </nav>

    <div v-if="isLoading" class="status-msg">SYNCING_CATALOGUE_FROM_SOURCE...</div>
    <div v-else-if="errorMsg" class="status-msg error">{{ errorMsg }}</div>

    <!-- Builder Mode: CRUD Interface -->
    <div v-else-if="isBuilderMode" class="builder-container">
      <div class="builder-sidebar">
        <h4 class="tiny text-zinc-500 uppercase">Manage_Menus</h4>
        <button @click="createNewMenu" class="add-btn">+ Create New Menu</button>
        <div
          v-for="m in menus"
          :key="m.id"
          class="menu-list-item"
          :class="{ active: selectedMenuId === m.id }"
        >
          <span @click="selectedMenuId = m.id">{{ m.name }}</span>
          <button @click="deleteMenu(m.id)" class="text-danger small">DEL</button>
        </div>
      </div>

      <div class="builder-main" v-if="currentMenu">
        <div class="menu-meta-fields p-3 border-b border-zinc-800 mb-4">
          <input
            v-model="currentMenu.name"
            placeholder="Menu Name (e.g. Morning Pulse)"
            class="builder-input"
          />
          <div class="flex gap-2 mt-2">
            <label class="tiny">Active From:</label>
            <input
              type="number"
              v-model="currentMenu.startTime"
              class="builder-input small"
              placeholder="00"
            />
            <label class="tiny">To:</label>
            <input
              type="number"
              v-model="currentMenu.endTime"
              class="builder-input small"
              placeholder="23"
            />
          </div>
        </div>

        <div class="product-builder">
          <h4 class="tiny text-zinc-500 uppercase">Product_Grounding</h4>
          <div class="new-product-form bg-zinc-950 p-3 rounded border border-zinc-800">
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              accept="image/*"
              @change="onFileSelected"
            />
            <div v-if="imagePreview" class="image-sighting-preview-box mb-3">
              <div class="tiny text-zinc-500 uppercase mb-1">Visual_Sighting_Preview</div>
              <img :src="imagePreview" class="preview-img" />
              <button @click="clearSighting" class="clear-sighting-btn">RESCIND_SIGHTING</button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <input v-model="newProduct.label" placeholder="Item Label" class="builder-input" />
              <input
                v-model="newProduct.amount"
                type="number"
                placeholder="Price (IO$)"
                class="builder-input"
              />
            </div>
            <textarea
              v-model="newProduct.description"
              placeholder="Logic Description"
              class="builder-input mt-2"
            ></textarea>

            <div class="flex justify-between mt-3">
              <div class="flex gap-2">
                <button
                  @click="fileInput?.click()"
                  class="capture-btn"
                  :class="{ 'text-success': selectedFile }"
                >
                  <span class="icon">📸</span>
                  {{ selectedFile ? 'Image Sighted' : 'Take Sighting' }}
                </button>
                <button @click="simulateCapture('QR')" class="capture-btn">
                  <span class="icon">🔗</span> Scan QRC
                </button>
              </div>
              <button @click="addProductToMenu" class="ground-btn">Ground Item</button>
            </div>
          </div>

          <div class="existing-products mt-4">
            <div v-for="p in currentMenu.items" :key="p.id" class="product-crud-card">
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-mono text-white">{{ p.label }}</span>
                  <span class="text-success ml-2">{{ p.amount }} IO$</span>
                </div>
                <button @click="removeItemFromMenu(p.id)" class="text-danger">RESCIND</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!isOrderTakerActive" class="menu-grid">
      <div v-for="item in filteredItems" :key="item.id" class="menu-card">
        <div class="item-visual" :style="{ backgroundImage: `url(${item.image})` }">
          <div class="price-tag">{{ item.amount }} IO$</div>
        </div>

        <div class="item-details">
          <h3>{{ item.label }}</h3>
          <p>{{ item.description }}</p>

          <div class="item-logic">
            <span class="multiplier">+{{ item.multiplier }} Pulse</span>
            <button @click="addToHandshake(item)" class="select-btn">Sighting Item</button>
          </div>
        </div>
      </div>
    </div>

    <EntityOrderTaker
      v-else
      :orderPacket="activeOrderPacket!"
      @status-update="(status) => (orderStatus = status)"
      @cancel="isOrderTakerActive = false"
      @handshake-confirmed="onHandshakeConfirmed"
    />

    <div
      v-if="orderStatus"
      class="order-status-monitor mb-4 p-3 border border-yellow-500/30 bg-yellow-500/5 rounded"
    >
      <div class="tiny text-yellow-500 uppercase mb-1">Live_Order_Status</div>
      <div class="flex items-center gap-2">
        <span class="pulse-dot"></span>
        <span class="small font-mono text-white">{{ orderStatus }}</span>
      </div>
    </div>

    <div
      v-if="handshakeItems.length > 0"
      class="mandate-audit p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded"
    >
      <div class="tiny text-zinc-500 uppercase mb-2">Mandate_Audit_Status</div>
      <div :class="isSymmetric ? 'text-success' : 'text-danger'" class="small italic">
        {{ symmetryStatus }}
      </div>
    </div>

    <footer v-if="handshakeItems.length > 0 && !isOrderTakerActive" class="menu-footer">
      <div class="handshake-summary">
        <span>Current Items: {{ handshakeItems.length }}</span>
        <span>Total Equity: {{ totalEquity }} IO$</span>
      </div>
      <button @click="proceedToOrderTaker" class="ground-order-btn">
        Initialize EntityOrderTaker
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useGlobalMandates } from 'c:/IO/IC/ReusableMandate.vue';
import { getMyLocation } from '../utils/location';
import EntityOrderTaker from './EntityOrderTaker.vue';

interface MenuItem {
  id: string;
  category?: string;
  image?: string;
  amount: number | string;
  label: string;
  description: string;
  multiplier: number | string;
  priceId?: string;
}

interface MenuContainer {
  id: string;
  name: string;
  startTime: number; // 0-23
  endTime: number;
  items: MenuItem[];
}

interface BuyerIdentity {
  publicKey: string;
  locality: string;
  handshakeHash: string;
}

interface OrderPacket {
  buyer: BuyerIdentity;
  items: MenuItem[];
  total: string;
  timestamp: number;
  entityId: string;
}

const props = defineProps({
  entityName: {
    type: String,
    default: 'DOMAIN_NODE',
  },
  entityId: {
    type: String,
    required: true,
  },
  menuData: {
    type: Array as () => MenuItem[],
    default: () => [], // Safety fallback if Stripe data is still syncing
  },
  accessSource: {
    type: String,
    default: 'IDEAL_NODE', // Can be 'QR_SCAN' or 'IDEAL_NODE'
  },
});

const emit = defineEmits(['proceed-to-order']);

const { checkSymmetryMandate, applyDebtSilenceMandate } = useGlobalMandates();

const activeCategory = ref('ALL');
const handshakeItems = ref<MenuItem[]>([]);
const localMenuData = ref<MenuItem[]>([]);
const isLoading = ref(true);
const errorMsg = ref('');
const isBuilderMode = ref(false);
const isOrderTakerActive = ref(false);
const activeOrderPacket = ref<OrderPacket | null>(null);
const orderStatus = ref('');

// Menu Management State
const menus = ref<MenuContainer[]>([]);
const selectedMenuId = ref('');
const newProduct = ref<Partial<MenuItem>>({
  label: '',
  amount: '',
  description: '',
  multiplier: 1.1,
});

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

// Mocked User Identity (Buyer Identifying Information)
const buyerIdentity = ref({
  publicKey: '0xNode...BEEF',
  locality: 'RESOLVING_NODE_PULSE...',
  handshakeHash: 'MFA_VERIFIED_777',
});

const syncNodePulse = async () => {
  try {
    const location = await getMyLocation();
    // Fulfilling LOCALITY_FIRST mandate by resolving physical locality to logical string
    buyerIdentity.value.locality = location.locality.toUpperCase();
    console.log(`[IDEAL_PULSE] Node Locality Grounded: ${buyerIdentity.value.locality}`);
  } catch (error) {
    console.error('MANDATE_FRACTURE: Node pulse isolation detected.', error);
    buyerIdentity.value.locality = 'VOID';
  }
};

const fetchMenus = async () => {
  try {
    const db = getFirestore();
    const q = query(collection(db, `entities/${props.entityId}/menus`));
    const querySnapshot = await getDocs(q);

    menus.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuContainer[];

    if (menus.value.length > 0) {
      selectedMenuId.value = menus.value[0].id;
    }
  } catch (error) {
    console.error('Failed to sync entity menus:', error);
    errorMsg.value = 'LOGIC_FRACTURE: Failed to sync local menus.';
  } finally {
    isLoading.value = false;
  }
};

const applyAccessFee = async () => {
  const fee = 0.02;
  try {
    // Fulfilling Mandate: Accessing IDEAL logic or QR scan triggers a 0.02 IO$ grounding event.
    const functions = getFunctions();
    const processFee = httpsCallable(functions, 'processIdealAccessFee');
    await processFee({
      entityId: props.entityId,
      amount: fee,
      source: props.accessSource,
    });
    console.log(`[IDEAL_ACCESS] ${fee} IO$ grounded to Treasury.`);
  } catch (error) {
    console.error('MANDATE_FRACTURE: Access fee grounding failed.', error);
  }
};

onMounted(async () => {
  await applyAccessFee();
  syncNodePulse();
  fetchMenus();
});

onUnmounted(() => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
});

const currentMenu = computed(() => menus.value.find((m) => m.id === selectedMenuId.value));

const activeMenus = computed(() => {
  const currentHour = new Date().getHours();
  // Filters menus based on the current hour of the node's local time
  return menus.value.filter((m) => currentHour >= m.startTime && currentHour <= m.endTime);
});

const createNewMenu = async () => {
  const db = getFirestore();
  const newId = `MENU_${Date.now()}`;
  const menuData: MenuContainer = {
    id: newId,
    name: 'NEW_LOGIC_STREAM',
    startTime: 0,
    endTime: 23,
    items: [],
  };
  await setDoc(doc(db, `entities/${props.entityId}/menus`, newId), menuData);
  menus.value.push(menuData);
  selectedMenuId.value = newId;
};

const deleteMenu = async (id: string) => {
  const db = getFirestore();
  await deleteDoc(doc(db, `entities/${props.entityId}/menus`, id));
  menus.value = menus.value.filter((m) => m.id !== id);
};

const addProductToMenu = async () => {
  if (!currentMenu.value || !newProduct.value.label) return;
  isLoading.value = true;

  try {
    let imageUrl = 'https://via.placeholder.com/150';

    if (selectedFile.value) {
      const storage = getStorage();
      const path = `entities/${props.entityId}/products/${Date.now()}_${selectedFile.value.name}`;
      const imgRef = storageRef(storage, path);
      const snapshot = await uploadBytes(imgRef, selectedFile.value);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const product: MenuItem = {
      id: `PROD_${Date.now()}`,
      label: newProduct.value.label!,
      amount: newProduct.value.amount || 0,
      description: newProduct.value.description || '',
      multiplier: newProduct.value.multiplier || 1.1,
      image: imageUrl,
    };

    currentMenu.value.items.push(product);
    const db = getFirestore();
    await setDoc(
      doc(db, `entities/${props.entityId}/menus`, currentMenu.value.id),
      currentMenu.value
    );

    // Reset form and file state
    newProduct.value = { label: '', amount: '', description: '', multiplier: 1.1 };
    clearSighting();
  } catch (error) {
    console.error('MANDATE_FRACTURE: Product grounding failed.', error);
    errorMsg.value = 'LOGIC_FRACTURE: Failed to ground product data.';
  } finally {
    isLoading.value = false;
  }
};

const removeItemFromMenu = async (prodId: string) => {
  if (!currentMenu.value) return;
  currentMenu.value.items = currentMenu.value.items.filter((i) => i.id !== prodId);
  const db = getFirestore();
  await setDoc(
    doc(db, `entities/${props.entityId}/menus`, currentMenu.value.id),
    currentMenu.value
  );
};

const simulateCapture = (type: string) => {
  console.log(`[BUILDER] Simulating ${type} capture for logic grounding.`);
};

const categories = computed(() => {
  if (!currentMenu.value) return ['ALL'];
  const cats = currentMenu.value.items.map((item) => item.category || 'GENERAL');
  return ['ALL', ...new Set(cats)];
});

const filteredItems = computed(() => {
  if (!currentMenu.value) return [];
  if (activeCategory.value === 'ALL') return currentMenu.value.items;
  return currentMenu.value.items.filter(
    (item) => (item.category || 'GENERAL') === activeCategory.value
  );
});

const symmetryStatus = computed(() => {
  const total = parseFloat(totalEquity.value);
  // Mocking domain baseline for symmetry check
  const baseline = 10;
  const excess = checkSymmetryMandate(total, baseline);

  return excess > 0
    ? `!!_SYMMETRY_FRACTURE_!!: ${excess.toFixed(2)} IO$ must be diverted to Treasury.`
    : 'RESONANCE_STABLE: Transaction within 1:16 symmetry bounds.';
});

const isSymmetric = computed(() => !symmetryStatus.value.includes('FRACTURE'));

const totalEquity = computed(() => {
  return handshakeItems.value
    .reduce((acc, item) => acc + parseFloat(item.amount.toString()), 0)
    .toFixed(2);
});

const addToHandshake = (item: MenuItem) => {
  handshakeItems.value.push(item);
  console.log(`Item Sighted: ${item.label}. Handshake Pending.`);
};

const proceedToOrderTaker = () => {
  console.log('Grounding Menu to OrderTaker...');
  orderStatus.value = 'INITIALIZING_HANDSHAKE...';

  activeOrderPacket.value = {
    buyer: buyerIdentity.value,
    items: handshakeItems.value,
    total: totalEquity.value,
    timestamp: Date.now(),
    entityId: props.entityId,
  };

  isOrderTakerActive.value = true;
  emit('proceed-to-order', activeOrderPacket.value);
};

const onHandshakeConfirmed = () => {
  isOrderTakerActive.value = false;
  handshakeItems.value = [];
  orderStatus.value = 'HANDSHAKE_COMPLETE_SUCCESS';
};
</script>

<style scoped>
.entity-menu-container {
  background: #000;
  color: #fff;
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid #333;
}
.menu-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #222;
  padding-bottom: 1rem;
}
.admin-toggle {
  background: #333;
  color: #ffd700;
  border: 1px solid #ffd700;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  font-family: monospace;
}

.builder-container {
  display: flex;
  gap: 2rem;
  min-height: 400px;
  margin-top: 1.5rem;
}
.builder-sidebar {
  width: 200px;
  border-right: 1px solid #222;
  padding-right: 1rem;
}
.menu-list-item {
  padding: 8px;
  border-bottom: 1px solid #111;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.menu-list-item.active {
  color: #ffd700;
  background: #111;
}
.builder-input {
  width: 100%;
  background: #000;
  border: 1px solid #333;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-family: monospace;
}
.builder-input.small {
  width: 60px;
}
.capture-btn {
  background: #111;
  color: #888;
  border: 1px solid #333;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}
.ground-btn {
  background: #ffd700;
  color: #000;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  border: none;
}
.product-crud-card {
  background: #050505;
  border: 1px solid #111;
  padding: 10px;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.menu-nav {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
}
.menu-nav button {
  background: transparent;
  border: 1px solid #444;
  color: #888;
  cursor: pointer;
  padding: 5px 15px;
  border-radius: 15px;
}
.menu-nav button.active {
  color: #ffd700;
  border-color: #ffd700;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.menu-card {
  background: #050505;
  border: 1px solid #111;
  border-radius: 12px;
  overflow: hidden;
  transition: border 0.3s;
}
.menu-card:hover {
  border-color: #00ff00;
}
.item-visual {
  height: 180px;
  background-color: #1a1a1a;
  background-size: cover;
  background-position: center;
  position: relative;
}
.price-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  padding: 5px 10px;
  border-radius: 5px;
  color: #00ff00;
  font-family: monospace;
}
.item-details {
  padding: 1.5rem;
}
.item-logic {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}
.multiplier {
  color: #ffd700;
  font-size: 0.8rem;
  font-family: monospace;
}
.select-btn {
  background: #fff;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
}

.menu-footer {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  background: #111;
  border: 1px solid #ffd700;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 50px;
  z-index: 100;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.1);
}
.ground-order-btn {
  background: #ffd700;
  color: #000;
  border: none;
  padding: 10px 25px;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
}

.status-msg {
  padding: 3rem;
  text-align: center;
  color: #ffd700;
  font-family: monospace;
  border: 1px dashed #333;
  margin: 2rem 0;
  border-radius: 12px;
}
.status-msg.error {
  color: #ff4444;
  border-color: #ff4444;
}
.mandate-audit {
  font-family: monospace;
}
.pulse-dot {
  width: 8px;
  height: 8px;
  background: #ffd700;
  border-radius: 50%;
  animation: blink 1.5s infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

.image-sighting-preview-box {
  position: relative;
  border: 1px solid #333;
  padding: 10px;
  background: #000;
  border-radius: 8px;
}
.preview-img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
}
.clear-sighting-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 68, 68, 0.8);
  color: #fff;
  border: 1px solid #ff4444;
  padding: 4px 8px;
  font-size: 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: monospace;
  transition: background 0.2s;
}
.clear-sighting-btn:hover {
  background: #ff4444;
}
</style>
