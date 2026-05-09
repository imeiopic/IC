<template>
  <div class="iopic-marketplace">
    <header class="market-header">
      <h2 class="text-glow">SYMMETRICAL MARKETPLACE</h2>
      <div class="user-liquid-equity">
        VAULT BALANCE:
        <span class="io-highlight">{{ formattedBalance }} IO$</span>
      </div>
      <button @click="showListingForm = !showListingForm" class="list-item-btn">
        {{ showListingForm ? "Cancel" : "List New Item" }}
      </button>
    </header>

    <nav class="category-nav">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="activeCat = cat"
        :class="{ active: activeCat === cat }"
      >
        {{ cat }}
      </button>
    </nav>

    <div class="asset-grid">
      <div v-for="item in filteredItems" :key="item.id" class="asset-card">
        <div
          class="asset-image"
          :style="{ backgroundImage: `url(${item.img})` }"
        >
          <div class="molecular-tag">REUSABLE: {{ item.reusability }}%</div>
        </div>
        <div class="asset-info">
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
          <div class="seller-row">
            <span class="seller-label">Seller:</span>
            <span class="seller-name">{{
              item.seller?.name || item.seller
            }}</span>
          </div>
          <div class="price-row">
            <span class="price">{{ item.price }} IO$</span>
            <button @click="initiateBSMolecule(item)" class="bond-btn">
              FORM BOND
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeBond" class="bond-overlay">
      <div class="bond-modal">
        <h3>INITIATING BS-MOLECULE</h3>
        <div class="molecular-visualizer">
          <div class="atom buyer">B</div>
          <div class="connection-line"></div>
          <div class="atom seller">S</div>
        </div>
        <p>Transferring {{ activeBond.price }} IO$ to Seller Node...</p>
        <button @click="finalizeBond" class="confirm-btn">HANDSHAKE</button>
      </div>
    </div>

    <!-- Listing form -->
    <div
      v-if="showListingForm"
      class="listing-form"
      @submit.prevent="submitListing"
    >
      <h3>List a New Item</h3>
      <label>
        Name:
        <input v-model="newItem.name" required />
      </label>
      <label>
        Description:
        <input v-model="newItem.description" required />
      </label>
      <label>
        Price (IO$):
        <input v-model.number="newItem.price" type="number" min="1" required />
      </label>
      <label>
        Category:
        <select v-model="newItem.cat">
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </label>
      <label>
        Reusability (%):
        <input
          v-model.number="newItem.reusability"
          type="number"
          min="1"
          max="100"
          required
        />
      </label>
      <button type="submit" class="bond-btn">Submit Listing</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { collection, onSnapshot as onColSnapshot } from "firebase/firestore";

const userBalance = ref(0);
const formattedBalance = computed(() =>
  new Intl.NumberFormat("en-US").format(userBalance.value),
);
const activeCat = ref("Sighting Gear");
const activeBond = ref(null);

const categories = ["Sighting Gear", "Coordinate Units", "Resource Buffers"];

// Static items with seller
const items = ref([
  {
    id: 1,
    name: "Sovereign Sighting Lens",
    price: 450,
    reusability: 100,
    cat: "Sighting Gear",
    description: "Real-time 16-thread visualization hardware.",
    seller: { id: "static_seller_1", name: "IOPIC Foundation" },
  },
  {
    id: 2,
    name: "Mobile Grounding Unit",
    price: 1200,
    reusability: 98,
    cat: "Coordinate Units",
    description: "Portable 7.83Hz Schumann sync for off-grid travel.",
    seller: { id: "static_seller_2", name: "IOPIC Foundation" },
  },
  {
    id: 3,
    name: "TPE Buffer Module",
    price: 800,
    reusability: 100,
    cat: "Resource Buffers",
    description: "Localized storage for physical mass recovery.",
    seller: { id: "static_seller_3", name: "IOPIC Foundation" },
  },
]);

// Dynamic items from Firestore
const dynamicItems = ref([]);

let userId = null;

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId = user.uid;
      const vaultRef = doc(db, "users", userId, "vault", "current");
      onSnapshot(vaultRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          userBalance.value = data.balance || 0;
        }
      });
    }
  });
  // Listen for dynamic marketplace items
  const marketCol = collection(db, "marketplace");
  onColSnapshot(marketCol, (querySnap) => {
    dynamicItems.value = querySnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });
});

// Merge static and dynamic items, filter by category
const filteredItems = computed(() => {
  const statics = items.value.filter((i) => i.cat === activeCat.value);
  const dynamics = dynamicItems.value.filter((i) => i.cat === activeCat.value);
  return [...statics, ...dynamics];
});

const initiateBSMolecule = (item) => {
  activeBond.value = item;
};

const finalizeBond = async () => {
  if (!userId || !activeBond.value) return;
  const buyerVaultRef = doc(db, "users", userId, "vault", "current");
  const seller = activeBond.value.seller;
  // Deduct from buyer
  await updateDoc(buyerVaultRef, {
    balance: userBalance.value - activeBond.value.price,
    logs: arrayUnion({
      type: "MARKET_BOND",
      amount: -activeBond.value.price,
      item: activeBond.value.name,
      seller: seller?.name || seller,
      timestamp: new Date().toISOString(),
    }),
  });
  // Credit to seller if not static system
  if (seller && seller.id && !seller.id.startsWith("static_seller")) {
    const sellerVaultRef = doc(db, "users", seller.id, "vault", "current");
    await updateDoc(sellerVaultRef, {
      logs: arrayUnion({
        type: "MARKET_SALE",
        amount: activeBond.value.price,
        item: activeBond.value.name,
        buyer: userId,
        timestamp: new Date().toISOString(),
      }),
    });
  }
  activeBond.value = null;
};

// Listing form state
const showListingForm = ref(false);
const newItem = ref({
  name: "",
  description: "",
  price: 0,
  cat: categories[0],
  reusability: 100,
});

const submitListing = async () => {
  if (!userId) return;
  const marketCol = collection(db, "marketplace");
  await addDoc(marketCol, {
    ...newItem.value,
    price: Number(newItem.value.price),
    seller: { id: userId, name: auth.currentUser?.displayName || "User" },
    created: new Date().toISOString(),
  });
  showListingForm.value = false;
  newItem.value = {
    name: "",
    description: "",
    price: 0,
    cat: categories[0],
    reusability: 100,
  };
};
</script>

<style scoped>
/* ...existing styles from your previous code... */
.iopic-marketplace {
  background: #050505;
  color: #fff;
  padding: 2rem;
  font-family: "Inter", sans-serif;
}
.io-highlight {
  color: #00e5ff;
  font-weight: bold;
}
.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 2rem;
}
.asset-card {
  background: #111;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
}
.asset-card:hover {
  transform: translateY(-5px);
  border-color: #00e5ff;
}
.asset-image {
  height: 150px;
  background-size: cover;
  position: relative;
}
.molecular-tag {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 229, 255, 0.8);
  color: #000;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
}
.bond-btn {
  background: #00e5ff;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
.bond-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}
.molecular-visualizer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin: 2rem 0;
}
.atom {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid #00e5ff;
}
.list-item-btn {
  background: #00e5ff;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 1rem;
}
.listing-form {
  background: #111;
  border: 1px solid #00e5ff;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}
.listing-form label {
  display: flex;
  flex-direction: column;
  color: #00e5ff;
  font-size: 1rem;
}
.listing-form input,
.listing-form select {
  margin-top: 0.3rem;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #333;
  background: #222;
  color: #fff;
}
.listing-form button[type="submit"] {
  margin-top: 1rem;
}
</style>
