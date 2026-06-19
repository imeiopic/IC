<script setup lang="ts">
/**
 * MENU.vue
 * UI Substrate for CoinX Contracts.
 * Handles visualization of scheduling, menu offerings, and connection metadata.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { CoinXContract } from '@/coinxModel';

const props = defineProps<{
  contract: CoinXContract;
  /**
   * Defines the perspective of the node interacting with the menu.
   * 'seller' = The entity providing the menu.
   * 'buyer' = The entity consuming/purchasing.
   */
  viewerRole: 'seller' | 'buyer';
}>();

const emit = defineEmits<{
  /** Emitted when a node selects a menu item for purchase/exchange */
  (e: 'update-order', items: string[]): void;
  /** Emitted when a node requests a shift in the scheduling window */
  (e: 'request-reschedule'): void;
  /** Emitted when the contract's temporal window has expired */
  (e: 'contract-expired'): void;
  /** Emitted when the buyer is ready to ground their selection (move to Order Taker) */
  (e: 'commit-order'): void;
  /** Emitted to void the contract agreement */
  (e: 'terminate-contract'): void;
}>();

const isBuyerSeller = computed(() => props.contract.type === '10');

/** Computed helpers for role-based conditional rendering */
const isSeller = computed(() => props.viewerRole === 'seller');
const isBuyer = computed(() => props.viewerRole === 'buyer');

// Formatting the 4D Temporal Coordinates (Start/End)
const formattedStart = computed(() => new Date(props.contract.startDate).toLocaleString());
const formattedEnd = computed(() => new Date(props.contract.endDate).toLocaleString());

/**
 * Computed property to determine if the contract is in an expired state.
 */
const isContractExpired = computed(
  () => props.contract.status === 'EXPIRED' || timeLeft.value === 'CONTRACT_EXPIRED'
);

// Search Filter Logic
const searchQuery = ref('');
const filteredMenu = computed(() => {
  if (!props.contract.menu) return [];
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return props.contract.menu;
  return props.contract.menu.filter((item) => item.toLowerCase().includes(query));
});

// Real-time Temporal Countdown logic
const timeLeft = ref('Initializing...');
let timer: number | undefined;

const updateCountdown = () => {
  const now = Date.now();
  const start = new Date(props.contract.startDate).getTime();
  const end = new Date(props.contract.endDate).getTime();

  if (now < start) {
    timeLeft.value = 'AWAITING_INITIATION';
    return;
  }

  const diff = end - now;
  if (diff <= 0) {
    timeLeft.value = 'CONTRACT_EXPIRED';
    if (timer) clearInterval(timer);
    emit('contract-expired'); // Emit the new event
    return;
  }

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  timeLeft.value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
};

onMounted(() => {
  updateCountdown();
  timer = window.setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

/**
 * Logic for handling item selection.
 * This updates the 'order' array in the contract substrate.
 */
const handleSelectItem = (item: string) => {
  const currentOrder = props.contract.order || [];
  // Symmetry Check: Prevent duplicate logic if necessary, or allow stacking
  emit('update-order', [...currentOrder, item]);
};

/**
 * Logic for removing an item from the current selection bond.
 */
const handleRemoveItem = (index: number) => {
  const newOrder = [...(props.contract.order || [])];
  newOrder.splice(index, 1);
  emit('update-order', newOrder);
};
</script>

<template>
  <div class="coinx-menu-substrate">
    <header class="menu-header">
      <h3>{{ isSeller ? 'Merchant Dashboard' : 'Sovereign Menu' }}</h3>
      <span class="status-badge" :class="contract.status.toLowerCase()">
        {{ contract.status }}
      </span>
      <button
        @click="$emit('terminate-contract')"
        class="btn-terminate"
        :disabled="isContractExpired"
      >
        Terminate
      </button>
    </header>

    <!-- SCHEDULING & TEMPORAL LOGIC -->
    <section class="scheduling-info">
      <h4>Temporal Alignment</h4>
      <div class="info-block">
        <label>Initiation:</label>
        <span>{{ formattedStart }}</span>
      </div>
      <div class="info-block">
        <label>Expiration:</label>
        <span>{{ formattedEnd }}</span>
      </div>
      <div class="info-block">
        <label>Symmetry Window:</label>
        <span>{{ contract.durationMinutes }} Minutes</span>
      </div>
      <div class="info-block countdown">
        <label>Temporal Pulse:</label>
        <span class="timer-display">{{ timeLeft }}</span>
      </div>
      <!-- Only Sellers can initiate a rescheduling request -->
      <button
        v-if="isSeller"
        @click="$emit('request-reschedule')"
        class="btn-action secondary"
        :disabled="isContractExpired"
      >
        Adjust Schedule
      </button>
    </section>

    <hr class="divider" />

    <!-- COMMERCE SUBSTRATE (Type 10: Buyer-to-Seller) -->
    <section v-if="isBuyerSeller" class="commerce-menu">
      <h4>Offerings</h4>

      <div class="search-filter">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter offerings..."
          class="search-input"
          :disabled="isContractExpired"
        />
      </div>

      <div v-if="filteredMenu.length > 0" class="items-list">
        <div v-for="item in filteredMenu" :key="item" class="menu-item">
          <span class="item-name">{{ item }}</span>
          <button v-if="isBuyer" @click="handleSelectItem(item)" class="btn-action primary">
            Select
          </button>
        </div>
      </div>
      <p v-else class="empty-state">
        {{
          searchQuery
            ? `No matches found for "${searchQuery}"`
            : 'No active offerings in this contract.'
        }}
      </p>

      <!-- ORDER VISUALIZATION -->
      <div v-if="contract.order && contract.order.length > 0" class="current-order">
        <h5>Current Order Bond</h5>
        <ul>
          <li v-for="(orderedItem, index) in contract.order" :key="index" class="order-bond-item">
            <span>{{ orderedItem }}</span>
            <button
              v-if="isBuyer"
              @click="handleRemoveItem(index)"
              class="btn-remove"
              title="Remove from bond"
              :disabled="isContractExpired"
            >
              ×
            </button>
          </li>
        </ul>
        <button
          v-if="isBuyer"
          @click="$emit('commit-order')"
          class="btn-action pulse-confirm"
          :disabled="isContractExpired"
        >
          GROUND SELECTION (COMMIT)
        </button>
      </div>
    </section>

    <!-- PEER-TO-PEER DETAILS (Type 01) -->
    <section v-else class="connection-details">
      <p>Peer-to-peer data exchange protocol active.</p>
      <div class="info-block">
        <label>Location:</label>
        <span>{{ contract.location }}</span>
      </div>
      <div class="info-block">
        <label>Network:</label>
        <span>{{ contract.network }}</span>
      </div>
    </section>

    <footer class="menu-footer">
      <p>Currency: {{ contract.currency }} | Language: {{ contract.language }}</p>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.coinx-menu-substrate {
  @use '@/global.scss' as *;
  padding: 1.5rem;
  border: 1px solid var(--border-color, #333);
  border-radius: 12px;
  background: var(--bg-surface, #121212);
  color: var(--text-main, #f0f0f0);
  font-family: 'Inter', sans-serif;

  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #222;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }

  // Styling for badges, inputs, and action buttons follows Iopic UI design
  // ... (additional SCSS for spacing and buttons)

  .info-block.countdown {
    margin-top: 1rem;
    padding: 0.8rem;
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 8px;

    .timer-display {
      color: #00e5ff;
      font-weight: bold;
      font-variant-numeric: tabular-nums;
      letter-spacing: 1px;
    }
  }

  .btn-terminate {
    background: transparent;
    border: 1px solid #ff4444;
    color: #ff4444;
    border-radius: 4px;
    padding: 0.2rem 0.6rem;
    font-size: 0.75rem;
    cursor: pointer;
    &:hover {
      background: #ff4444;
      color: #000;
    }
  }

  .order-bond-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #222;

    .btn-remove {
      background: none;
      border: none;
      color: #888;
      font-size: 1.2rem;
      cursor: pointer;
      &:hover {
        color: #ff4444;
      }
    }
  }

  .pulse-confirm {
    width: 100%;
    margin-top: 1.5rem;
    padding: 1rem;
    background: #ffd700;
    color: #000;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    animation: subtle-pulse 2s infinite;

    @keyframes subtle-pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(255, 215, 0, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
      }
    }
  }

  .search-filter {
    margin-bottom: 1rem;

    .search-input {
      width: 100%;
      padding: 0.6rem;
      background: #000;
      border: 1px solid #333;
      border-radius: 6px;
      color: #fff;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: #ffd700;
      }
    }
  }
}
</style>
