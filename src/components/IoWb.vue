<template>
  <div class="bank-terminal">
    <header class="bank-header">
      <div class="logo-area">
        <img src="/images/iologo.png" alt="IOPIC" class="bank-logo" />
        <h2 class="text-glow">IO WORLD BANK</h2>
      </div>
      <p>Total Planetary Equity Management [v.1.0]</p>
    </header>

    <section class="mass-monitor">
      <div class="mass-stat">
        <label>GLOBAL TPE MASS</label>
        <span class="value">1.272,000,000,000,000.00</span>
      </div>
      <div class="velocity-stat">
        <label>NETWORK VELOCITY</label>
        <span class="value">8.09V</span>
      </div>
    </section>

    <div class="vault-container">
      <h3>SOVEREIGN VAULT: {{ sovereignID }}</h3>
      <div class="balance-readout">
        <span class="currency">IO$</span>
        <span class="amount">{{ balance.toLocaleString() }}</span>
      </div>
      <div class="dividend-timer">
        <span>NEXT DIVIDEND IN:</span>
        <span class="timer">{{ countdown }}</span>
      </div>
    </div>

    <section class="ledger-preview">
      <h3>HANDSHAKE LEDGER</h3>
      <div v-for="tx in ledger" :key="tx.id" class="tx-row">
        <span class="tx-type">{{ tx.type }}</span>
        <span class="tx-node">{{ tx.targetNode }}</span>
        <span class="tx-amount" :class="tx.amount < 0 ? 'out' : 'in'">
          {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
        </span>
      </div>
    </section>

    <footer class="bank-footer">
      <button @click="claimDividend" :disabled="!dividendReady" class="claim-btn">
        {{ dividendReady ? 'CLAIM DAILY 1,600 IO$' : 'GROUNDING CONFIRMED' }}
      </button>
      <p class="legalese">Interest Rate: 0.00% | Scarcity: 0.00%</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const sovereignID = ref('IO-CLE-MD-001');
const balance = ref(1600);
const dividendReady = ref(false);
const countdown = ref('04:41:02');

const ledger = ref([
  { id: 1, type: 'DIVIDEND', targetNode: 'SYSTEM', amount: 1600 },
  { id: 2, type: 'BOND_OUT', targetNode: 'EDEN-MARKET', amount: -25 },
  { id: 3, type: 'SIGHT_IN', targetNode: 'NODE-8821', amount: 50 }
]);

const claimDividend = () => {
  if (dividendReady.value) {
    balance.value += 1600;
    dividendReady.value = false;
    alert('Planetary Equity Disbursed. 7.83Hz Sync Confirmed.');
  }
};
</script>

<style scoped>
.bank-terminal {
  background: #000;
  color: #00ff41;
  padding: 2.5rem;
  border: 2px solid #7fff00;
  font-family: 'Space Mono', monospace;
  max-width: 600px;
}

.bank-header {
  text-align: center;
  border-bottom: 1px solid #222;
  padding-bottom: 1rem;
}
.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}
.bank-logo {
  width: 40px;
  height: 40px;
}

.mass-monitor {
  display: flex;
  justify-content: space-around;
  background: #050505;
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid #111;
}

.mass-stat label {
  font-size: 0.6rem;
  color: #7fff00;
  display: block;
}
.mass-stat .value {
  font-size: 1.2rem;
  color: #fff;
}

.vault-container {
  text-align: center;
  margin: 2rem 0;
  border: 1px solid #00e5ff;
  padding: 2rem;
  background: radial-gradient(circle, #001a1a, #000);
}

.balance-readout .currency {
  font-size: 1.5rem;
  margin-right: 10px;
  color: #00e5ff;
}
.balance-readout .amount {
  font-size: 3.5rem;
  font-weight: bold;
  color: #fff;
}

.ledger-preview {
  margin-top: 2rem;
}
.tx-row {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #111;
  font-size: 0.8rem;
}
.in {
  color: #00ff41;
}
.out {
  color: #ff0041;
}

.claim-btn {
  width: 100%;
  padding: 1.5rem;
  background: #7fff00;
  color: #000;
  border: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.1rem;
}

.claim-btn:disabled {
  background: #222;
  color: #444;
  cursor: default;
}
.legalese {
  font-size: 0.6rem;
  margin-top: 10px;
  text-align: center;
  opacity: 0.5;
}
</style>
