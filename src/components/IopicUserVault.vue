<template>
  <div class="iopic-user-vault">
    <header class="vault-header">
      <h1 class="text-glow">IOPIC USER VAULT</h1>
      <div class="vault-balance">
        <span class="label">Current Balance</span>
        <span class="value">{{ formattedBalance }} IO$</span>
      </div>
      <div class="dividend-pulse" :class="{ active: dividendActive }">
        <span>1,600 IO$ Dividend Pulse</span>
        <span v-if="dividendActive" class="pulse-indicator">●</span>
      </div>
    </header>

    <section class="vault-metrics">
      <div class="metric-card">
        <label>Velocity</label>
        <div class="value">8.09V</div>
        <div class="sub-label">Terminal 10</div>
      </div>
      <div class="metric-card">
        <label>Symmetry State</label>
        <div class="value">ACKNOWLEDGECLEAR</div>
        <div class="sub-label">Absolute</div>
      </div>
      <div class="metric-card">
        <label>Time Multiplier</label>
        <div class="value">1.25x</div>
        <div class="sub-label">Architect Bonus</div>
      </div>
    </section>

    <footer class="vault-log">
      <div class="log-entry" v-for="(log, index) in logs" :key="index">
        <span class="timestamp">[{{ log.time }}]</span>
        <span class="message">{{ log.msg }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase (guard against double init)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  // Already initialized
}
const db = getFirestore();
const auth = getAuth();

const balance = ref(0);
const dividendActive = ref(false);
const logs = ref([]);

const formattedBalance = computed(() => {
  return new Intl.NumberFormat("en-US").format(balance.value);
});

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Listen to the user's vault document in Firestore
      const vaultRef = doc(db, "users", user.uid, "vault", "current");
      onSnapshot(vaultRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          balance.value = data.balance || 0;
          dividendActive.value = data.status === "SYMMETRICAL";
          logs.value = (data.logs || []).map((log) => ({
            time: new Date(log.timestamp).toLocaleTimeString(),
            msg: `${log.type}: ${log.amount} IO$`,
          }));
        }
      });
    }
  });
});
</script>

<style scoped>
.iopic-user-vault {
  background: #111;
  color: #00ff41;
  font-family: "Courier New", Courier, monospace;
  padding: 2rem;
  border: 2px solid #00ff41;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
}
.text-glow {
  text-shadow: 0 0 10px #00ff41;
}
.vault-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2rem;
}
.vault-balance {
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0;
}
.label {
  font-size: 1rem;
  color: #888;
  margin-right: 1rem;
}
.dividend-pulse {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #00ff41;
  display: flex;
  align-items: center;
}
.dividend-pulse.active .pulse-indicator {
  color: #00ff41;
  margin-left: 0.5rem;
  animation: pulse 1s infinite alternate;
}
@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
.vault-metrics {
  display: flex;
  gap: 20px;
  margin-bottom: 2rem;
}
.metric-card {
  flex: 1;
  background: #222;
  padding: 1rem;
  border-radius: 4px;
}
.value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}
.vault-log {
  background: #050505;
  padding: 1rem;
  height: 100px;
  overflow-y: auto;
  font-size: 0.8rem;
  border-top: 1px solid #333;
}
.timestamp {
  color: #888;
  margin-right: 10px;
}
</style>
