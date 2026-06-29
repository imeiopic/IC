<template>
  <div class="global-gate-container">
    <header class="gate-header">
      <h2 class="text-glow">GLOBAL ACCESS GATEWAY</h2>
      <p>Bridging local IDEAL instance to the Global Bus.</p>
    </header>

    <div class="access-mode-selector">
      <button
        :class="{ active: mode === 'GENERATE' }"
        @click="mode = 'GENERATE'"
      >
        GENERATE KEY
      </button>
      <button :class="{ active: mode === 'ENTER' }" @click="mode = 'ENTER'">
        ENTER REMOTE KEY
      </button>
    </div>

    <section v-if="mode === 'GENERATE'" class="logic-display">
      <div class="key-card">
        <label>YOUR UNIQUE ACCESS CODE</label>
        <div class="code-output">{{ generatedCode }}</div>
        <p class="expiry">Expires at: {{ expiry }}</p>
      </div>
      <button @click="pulseCodeToPeers" class="action-btn">
        PULSE TO GLOBAL MESH
      </button>
    </section>

    <section v-else class="logic-input">
      <div class="input-card">
        <label>ENTER REMOTE NODE KEY</label>
        <input
          v-model="remoteCode"
          placeholder="XXXX-XXXX-XXXX-XXXX"
          maxlength="19"
          class="gate-input"
        />
      </div>
      <button @click="validateGlobalHandshake" class="action-btn connect">
        ESTABLISH GLOBAL SYMMETRY
      </button>
    </section>

    <footer class="gate-footer">
      <span class="thread-id">THREAD_16_AUTHORITY_ACTIVE</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

const mode = ref("GENERATE");
const generatedCode = ref("");
const remoteCode = ref("");
const expiry = ref("");

function generateLogicKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let key = "";
  for (let i = 0; i < 16; i++)
    key += chars[Math.floor(Math.random() * chars.length)];
  return key.match(/.{1,4}/g).join("-");
}

function getExpiryUTC() {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  now.setUTCDate(now.getUTCDate() + 1);
  return now.toISOString().split("T")[1].replace("Z", " UTC");
}

onMounted(async () => {
  generatedCode.value = await createAndStoreGlobalKey();
  expiry.value = getExpiryUTC();
});

async function createAndStoreGlobalKey() {
  const key = generateLogicKey();
  await addDoc(collection(db, "global_keys"), {
    key,
    createdAt: Timestamp.now(),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    schumann: 7.83,
    active: true,
  });
  return key;
}

async function validateGlobalHandshake() {
  if (remoteCode.value.length < 10) {
    alert("Friction Detected: Incomplete Logic Key.");
    return;
  }
  const q = query(
    collection(db, "global_keys"),
    where("key", "==", remoteCode.value),
    where("active", "==", true),
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    alert("Symmetry Confirmed. Remote Node Sighted.");
  } else {
    alert("No active global key found.");
  }
}

async function pulseCodeToPeers() {
  alert("Your Access Code has been pulsed to the 16-thread bus.");
  await addDoc(collection(db, "global_broadcasts"), {
    key: generatedCode.value,
    broadcastedAt: Timestamp.now(),
    authority: "Root Steward",
  });
}
</script>

<style scoped>
.global-gate-container {
  background: #050505;
  color: #00ff41;
  padding: 2.5rem;
  border: 1px double #00ff41;
  font-family: "Space Mono", monospace;
  max-width: 500px;
}

.access-mode-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 2rem;
}

.access-mode-selector button {
  flex: 1;
  background: #111;
  color: #00ff41;
  border: 1px solid #333;
  padding: 10px;
  cursor: pointer;
}

.access-mode-selector button.active {
  background: #00ff41;
  color: #000;
  font-weight: bold;
}

.key-card,
.input-card {
  background: #000;
  border: 1px solid #222;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.code-output {
  font-size: 1.2rem;
  letter-spacing: 2px;
  color: #00e5ff;
  margin: 1rem 0;
  text-shadow: 0 0 10px #00e5ff;
}

.gate-input {
  width: 100%;
  background: #080808;
  border: 1px solid #00ff41;
  color: #00ff41;
  padding: 15px;
  text-align: center;
  font-size: 1rem;
  margin-top: 1rem;
}

.action-btn {
  width: 100%;
  padding: 1rem;
  background: transparent;
  color: #00ff41;
  border: 1px solid #00ff41;
  font-weight: bold;
  cursor: pointer;
}

.action-btn.connect {
  background: #00ff41;
  color: #000;
}
</style>
