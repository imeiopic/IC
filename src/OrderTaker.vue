<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuth } from './useAuth';
import { useError } from './useError';
import OrderTakerModel, { type OrderBond } from './orderTakerModel';

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface Menu {
  items: MenuItem[];
}

const { user } = useAuth();
const { reportError } = useError();

const bonds = ref<OrderBond[]>([]);
const loading = ref(true);
const isInitializing = ref(false);
const searchQuery = ref('');
const sortBy = ref<'date' | 'value'>('date');

const menu = ref<Menu | null>(null);
const selectedItems = ref<MenuItem[]>([]);
const totalAmount = computed(() => selectedItems.value.reduce((sum, item) => sum + item.price, 0));

// Form State for new BS-Molecule
const description = ref('');
const amount = ref(0);

const filteredBonds = computed(() => {
  let result = bonds.value;

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((bond) => bond.payload.description.toLowerCase().includes(query));
  }

  return [...result].sort((a, b) => {
    if (sortBy.value === 'value') {
      return b.payload.totalValue - a.payload.totalValue; // Descending value
    }
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA; // Descending date (newest first)
  });
});

let unsubscribe: (() => void) | null = null;

onMounted(async () => {
  if (user.value) {
    // Subscribe to the real-time IDEAL ledger for this entity
    unsubscribe = OrderTakerModel.subscribeToBonds(user.value.uid, (updatedBonds) => {
      bonds.value = updatedBonds;
      loading.value = false;
    });

    // Present Menu for the concerned Entity (using mock VRE entity ID)
    try {
      const entityId = 'global-exchange-0110';
      menu.value = await OrderTakerModel.getEntityMenu(entityId);
    } catch (err) {
      reportError(err);
    }
  }
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const toggleItem = (item: MenuItem) => {
  const index = selectedItems.value.findIndex((i) => i.id === item.id);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(item);
  }
};

const handleCreateBond = async () => {
  if (!user.value || !description.value || selectedItems.value.length === 0) return;

  isInitializing.value = true;
  try {
    const targetUid = 'target_entity_uid';
    const vreId = 'vre-0001';
    const assignedMemberUid = 'Member_A_ID'; // The "concerned member"

    await OrderTakerModel.initializeBond(
      user.value.uid,
      targetUid,
      {
        description: description.value,
        items: [...selectedItems.value],
        totalValue: totalAmount.value,
        currency: 'IO$'
      },
      vreId,
      assignedMemberUid
    );

    description.value = '';
    selectedItems.value = [];
  } catch (err) {
    reportError(err);
  } finally {
    isInitializing.value = false;
  }
};

const simulateVerification = async (bondId: string, currentThreads: number) => {
  try {
    // Progress the 16-thread bridge protocol
    await OrderTakerModel.updateVerificationThreads(bondId, currentThreads + 1);
  } catch (err) {
    reportError(err);
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'LOCKED':
      return 'bg-success';
    case 'SYNCING':
      return 'bg-warning text-dark';
    case 'DISRUPTED':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};
</script>

<template>
  <div class="container py-5">
    <div class="row">
      <!-- Order Creation Form -->
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm border-0 bg-dark text-white h-100">
          <div class="card-header border-secondary">
            <h5 class="mb-0 font-monospace text-primary">// INITIALIZE BS-MOLECULE</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleCreateBond">
              <div class="mb-3">
                <label class="form-label small text-secondary text-uppercase">Order Notes</label>
                <input
                  v-model="description"
                  type="text"
                  class="form-control bg-black text-white border-secondary"
                  placeholder="Order specifics..."
                  required
                />
              </div>
              <div class="mb-3" v-if="menu">
                <label class="form-label small text-secondary text-uppercase d-block"
                  >Presenting Menu</label
                >
                <div class="list-group list-group-flush border border-secondary rounded">
                  <button
                    v-for="item in menu.items"
                    :key="item.id"
                    type="button"
                    @click="toggleItem(item)"
                    class="list-group-item list-group-item-action bg-black text-white border-secondary d-flex justify-content-between align-items-center"
                    :class="{ 'bg-primary': selectedItems.find((i) => i.id === item.id) }"
                  >
                    <span>{{ item.name }}</span>
                    <span class="badge bg-dark border border-secondary">{{ item.price }} IO$</span>
                  </button>
                </div>
              </div>
              <div class="mb-3 d-flex justify-content-between">
                <span class="text-secondary small uppercase">Total Payload Value:</span>
                <span class="fw-bold text-primary">{{ totalAmount }} IO$</span>
              </div>
              <button
                type="submit"
                class="btn btn-primary w-100 fw-bold mt-2"
                :disabled="isInitializing"
              >
                <span v-if="isInitializing" class="spinner-border spinner-border-sm me-2"></span>
                TRANSMIT BOND
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Bonds Ledger -->
      <div class="col-md-8">
        <div class="card shadow-sm border-0">
          <div
            class="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
          >
            <h5 class="mb-0">Active Bonds (IDEAL Ledger)</h5>
            <div class="btn-group btn-group-sm ms-auto ms-md-0 shadow-none">
              <button
                class="btn"
                :class="sortBy === 'date' ? 'btn-primary' : 'btn-outline-primary'"
                @click="sortBy = 'date'"
              >
                Date
              </button>
              <button
                class="btn"
                :class="sortBy === 'value' ? 'btn-primary' : 'btn-outline-primary'"
                @click="sortBy = 'value'"
              >
                Value
              </button>
            </div>
            <div class="input-group input-group-sm w-auto">
              <span class="input-group-text bg-light border-end-0"
                ><i class="bi bi-search"></i
              ></span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control border-start-0 ps-0 shadow-none"
                placeholder="Filter descriptions..."
              />
            </div>
            <span class="badge bg-light text-dark border font-monospace">16-Thread Protocol</span>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            <div v-else-if="filteredBonds.length === 0" class="text-center py-4 text-muted italic">
              {{
                searchQuery
                  ? 'No matches found for "' + searchQuery + '" in this thread.'
                  : 'No logical bonds detected in the current thread.'
              }}
            </div>
            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Verification</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bond in filteredBonds" :key="bond.id">
                    <td>
                      <div class="fw-bold">{{ bond.payload.description }}</div>
                      <div class="small text-muted" v-if="bond.assignedMemberUid">
                        Concerned Member: {{ bond.assignedMemberUid }}
                      </div>
                      <div class="mt-1">
                        <span
                          v-for="item in bond.payload.items"
                          :key="item.id"
                          class="badge bg-secondary me-1"
                          style="font-size: 0.6rem"
                          >{{ item.name }}</span
                        >
                      </div>
                      <small class="text-primary d-block mt-1"
                        >{{ bond.payload.totalValue }} {{ bond.payload.currency }}</small
                      >
                    </td>
                    <td style="min-width: 150px">
                      <div class="progress" style="height: 6px">
                        <div
                          class="progress-bar progress-bar-striped progress-bar-animated"
                          :class="bond.status === 'LOCKED' ? 'bg-success' : 'bg-primary'"
                          :style="{ width: (bond.verificationThreads / 16) * 100 + '%' }"
                        ></div>
                      </div>
                      <small class="font-monospace text-secondary"
                        >{{ bond.verificationThreads }}/16 Threads</small
                      >
                    </td>
                    <td>
                      <span class="badge" :class="getStatusClass(bond.status)">{{
                        bond.status
                      }}</span>
                    </td>
                    <td>
                      <button
                        v-if="bond.status !== 'LOCKED' && bond.status !== 'DISRUPTED'"
                        class="btn btn-sm btn-outline-primary"
                        @click="simulateVerification(bond.id!, bond.verificationThreads)"
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-black {
  background-color: #000;
}

.italic {
  font-style: italic;
}
</style>
