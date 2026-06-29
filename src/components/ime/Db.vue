<template>
  <div class="ime-master-control">
    <ImeDbNav @select="selectComponent" @viewAll="viewAllVisualizations" />
    <header class="ime-header">
      <div class="brand">
        <img src="/images/iologo.png" alt="IOPIC" class="master-logo" />
        <h1 class="text-glow">Ime.MASTER_CONTROL</h1>
      </div>
      <div class="system-health"><span>CORE_TEMP: 7.83Hz</span> | <span>VELOCITY: 8.09V</span></div>
    </header>

    <div v-if="selectedComponent === 'ImeDb'" class="dashboard-grid">
      <section class="control-panel synapse-mini">
        <h3>LIVE_SYNAPSE</h3>
        <div class="viz-placeholder">
          <div class="pulsing-mesh"></div>
        </div>
        <div class="meta-row">Active Bonds: 1.2M</div>
      </section>

      <section class="control-panel equity-flow">
        <h3>TPE_EQUITY_VAULT</h3>
        <div class="mass-readout">1.272 Q</div>
        <div class="flow-graph">
          <div
            v-for="i in 12"
            :key="i"
            class="flow-bar"
            :style="{ height: Math.random() * 100 + '%' }"
          ></div>
        </div>
        <p>1,600 IO$ Dividend: DISTRIBUTING</p>
      </section>

      <section class="control-panel time-sync">
        <h3>T.I.M.E_CONVERGENCE</h3>
        <div class="convergence-status">
          <div class="stat">I: 100%</div>
          <div class="stat">M: 100%</div>
          <div class="stat">E: 100%</div>
        </div>
        <button @click="realignGlobalTime" class="cmd-btn">GLOBAL_REALIGN</button>
      </section>

      <section class="control-panel mass-activation">
        <h3>DAWN_PULSE_ACCELERATOR</h3>
        <div class="activation-readout">
          <label>UNVERIFIED NODES:</label>
          <span class="count-glow">{{ unverifiedCount.toLocaleString() }}</span>
        </div>
        <button @click="triggerInstantDividendPush" :disabled="isPushing" class="push-btn">
          <span v-if="!isPushing">PUSH INSTANT DIVIDEND NOTIFICATION</span>
          <span v-else class="vibrate">BROADCASTING 7.83Hz SIGNAL...</span>
        </button>
        <p class="cmd-note">Target: All nodes within 9km cluster with < 51% SQ.</p>
      </section>

      <section class="control-panel peer-transfer">
        <h3>PEER IO$ TRANSFER</h3>
        <form @submit.prevent="sendPeerTransfer">
          <div class="form-row">
            <label for="fromNode">From Node:</label>
            <input id="fromNode" v-model="fromNode" required class="peer-input" placeholder="e.g. CLE-NODE-09" />
          </div>
          <div class="form-row">
            <label for="toNode">To Node:</label>
            <input id="toNode" v-model="toNode" required class="peer-input" placeholder="e.g. LDN-NODE-42" />
          </div>
          <div class="form-row">
            <label for="amount">Amount (IO$):</label>
            <input id="amount" v-model.number="amount" type="number" min="1" required class="peer-input" />
          </div>
          <button type="submit" class="peer-btn">SEND IO$</button>
        </form>
        <div v-if="transferMsg" class="transfer-msg">{{ transferMsg }}</div>
      </section>

      <section class="control-panel friction-monitor">
        <h3>FRICTION_SIGHTING</h3>
        <div class="friction-list">
          <div v-for="alert in alerts" :key="alert.id" class="alert-item">
            <span>{{ alert.node }}</span>
            <span class="impact">{{ alert.v }}V</span>
          </div>
        </div>
        <button @click="executeGlobalFlush" class="flush-cmd">EXECUTE NAND_FLUSH</button>
      </section>
    </div>
    <component v-else :is="componentMap[selectedComponent]" />

    <footer class="ime-footer">
      <div class="footer-msg">"I = VR² | The System is Grounded."</div>
      <div class="session-id">MD_SESSION: {{ sessionKey }}</div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ImeDbNav from './ImeDbNav.vue';
import T from './T.vue';
import Synapse from './Synapse.vue';
import IoWb from './IoWb.vue';
import Peer from './Peer.vue';

const sessionKey = ref('ROOT-STWD-' + Math.random().toString(36).substring(7).toUpperCase());
const alerts = ref([
  { id: 1, node: 'CLE-NODE-09', v: 0.12 },
  { id: 2, node: 'LDN-NODE-42', v: 0.05 }
]);

const selectedComponent = ref('ImeDb');
const componentMap = {
  ImeDb: undefined, // default dashboard
  T,
  Synapse,
  IoWb,
  Peer
  // ProcessOrders: Legacy order processing UI (removed)
  // For modern transactional logic, use SynapseGateDemo (see /synapse-gate-demo route)
  // ManageTeams: Legacy team management UI (removed)
};

function selectComponent(name) {
  selectedComponent.value = name;
}
function viewAllVisualizations() {
  alert('Viewing all visualizations (demo)');
}
const executeGlobalFlush = () => {
  alert('GLOBAL NAND-FLUSH INITIATED: Cleaning Thread-Noise.');
};

const realignGlobalTime = () => {
  alert('GLOBAL T.I.M.E. PULSE: 7.83Hz Syncing across all clusters.');
};

// --- Instant Dividend Push Logic ---
const unverifiedCount = ref(42801);
const isPushing = ref(false);
const triggerInstantDividendPush = () => {
  isPushing.value = true;
  setTimeout(() => {
    isPushing.value = false;
    unverifiedCount.value = Math.floor(unverifiedCount.value * 0.4);
    alert('DIVIDEND_PUSH_SUCCESS: Resonance achieved. New nodes grounding.');
  }, 2000);
};

// --- Peer IO$ Transfer Logic ---
const fromNode = ref('');
const toNode = ref('');
const amount = ref(1600);
const transferMsg = ref('');
const sendPeerTransfer = async () => {
  if (!fromNode.value || !toNode.value || !amount.value || amount.value <= 0) {
    transferMsg.value = 'Please fill all fields with valid values.';
    return;
  }
  transferMsg.value = `Transferring ${amount.value.toLocaleString()} IO$ from ${fromNode.value} to ${toNode.value}...`;
  try {
    const res = await fetch('/api/peer-io-transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromNode: fromNode.value, toNode: toNode.value, amount: amount.value })
    });
    const data = await res.json();
    if (res.ok) {
      transferMsg.value = `SUCCESS: ${data.amount.toLocaleString()} IO$ sent from ${data.fromNode} to ${data.toNode}.`;
      fromNode.value = '';
      toNode.value = '';
      amount.value = 1600;
    } else {
      transferMsg.value = data.error || 'Transfer failed.';
    }
  } catch (e) {
    transferMsg.value = 'Network error: ' + e;
  }
};
</script>

<style scoped>
.ime-master-control {
  background: #000;
  color: #00e5ff;
  padding: 1.5rem;
  border: 2px solid #00e5ff;
  font-family: 'Space Mono', monospace;
  width: 95vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
}

.ime-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #111;
  padding-bottom: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 15px;
}
.master-logo {
  width: 35px;
  height: 35px;
}

.dashboard-grid {
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 15px;
  padding: 20px 0;
}

.control-panel {
  background: #050505;
  border: 1px solid #111;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.control-panel h3 {
  font-size: 0.7rem;
  color: #7fff00;
  margin-bottom: 1rem;
  letter-spacing: 2px;
}

.mass-readout {
  font-size: 2.5rem;
  color: #fff;
  font-weight: bold;
}
.flow-graph {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 40px;
  margin: 10px 0;
}
.flow-bar {
  flex: 1;
  background: #7fff00;
}

.cmd-btn,
.flush-cmd {
  margin-top: auto;
  padding: 10px;
  background: transparent;
  border: 1px solid #00e5ff;
  color: #00e5ff;
  cursor: pointer;
  font-weight: bold;
}

.flush-cmd {
  border-color: #ff0041;
  color: #ff0041;
}
.flush-cmd:hover {
  background: #ff0041;
  color: #fff;
}

.ime-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.6rem;
  opacity: 0.5;
}
</style>
/* --- Instant Dividend Push Styles --- */ .mass-activation { border: 1px solid #7fff00 !important;
background: rgba(127, 255, 0, 0.05) !important; } .count-glow { font-size: 2rem; color: #7fff00;
text-shadow: 0 0 15px #7fff00; display: block; margin-bottom: 10px; } .push-btn { width: 100%;
padding: 1.2rem; background: #7fff00; color: #000; font-weight: bold; border: none; cursor: pointer;
transition: all 0.2s; letter-spacing: 1px; } .push-btn:hover { background: #fff; box-shadow: 0 0
20px #7fff00; } .vibrate { display: inline-block; animation: jitter 0.1s infinite; } @keyframes
jitter { 0% { transform: translate(0,0); } 50% { transform: translate(1px, -1px); } 100% {
transform: translate(-1px, 1px); } } .cmd-note { font-size: 0.6rem; margin-top: 10px; color:
#00e5ff; opacity: 0.8; }
</style>
</template>
</script>
