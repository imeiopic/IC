<template>
  <div class="synapse-hud">
    <div class="bs-molecule" :class="{ locked: bond.locked }">
      <div class="core"></div>
      <div class="thread" v-for="n in 16" :key="n" :class="threadClass(n)"></div>
    </div>
    <div class="hud-status">
      <div>
        Status: <span>{{ statusText }}</span>
      </div>
      <div>
        Equity Reserved: <b>{{ bond.amount }} IO$</b>
      </div>
      <div>16-Thread Bus: <b>Active</b></div>
      <div class="hud-readout">
        Your reality is now symmetrical. The asset is verified, and the logic is locked. There is no
        middleman; there is only the synapse.
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { Bond } from './SynapseGate';

export default defineComponent({
  name: 'SynapseHUD',
  setup() {
    // Demo/mock state
    const bond = ref<Bond>({
      NodeA: 'A',
      NodeB: 'B',
      amount: 1600,
      locked: true,
      verifyDelivery: () => true
    });
    const statusText = ref('Locked (Awaiting Sync)');

    function threadClass(n: number) {
      if (n <= 4) return 'spatial';
      if (n <= 8) return 'identity';
      if (n <= 12) return 'value';
      return 'defense';
    }

    return { bond, statusText, threadClass };
  }
});
</script>

<style scoped>
.synapse-hud {
  background: rgba(0, 32, 0, 0.85);
  border-radius: 24px;
  padding: 32px;
  color: #baffc9;
  font-family: 'Orbitron', monospace;
  box-shadow: 0 0 32px #00ff99aa;
  max-width: 480px;
  margin: 40px auto;
}
.bs-molecule {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto 24px auto;
  border-radius: 50%;
  background: radial-gradient(circle, #00ff99 60%, transparent 100%);
  box-shadow: 0 0 32px #00ff99cc;
  transition: box-shadow 0.3s;
}
.bs-molecule.locked {
  box-shadow: 0 0 48px #00ff99, 0 0 80px #00ff99aa;
}
.core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 48px;
  height: 48px;
  background: #00ff99;
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(0deg);
  box-shadow: 0 0 32px #00ff99cc, 0 0 16px #baffc9;
  animation: spin 2s linear infinite;
}
@keyframes spin {
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
.thread {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  margin: -8px;
  background: #003300;
  opacity: 0.7;
  transition: background 0.3s, opacity 0.3s;
}
.thread.spatial {
  background: #00ff99;
  opacity: 1;
}
.thread.identity {
  background: #00e6e6;
  opacity: 1;
}
.thread.value {
  background: #baffc9;
  opacity: 1;
}
.thread.defense {
  background: #00ff99;
  opacity: 0.5;
  animation: pulse 1.2s infinite alternate;
}
@keyframes pulse {
  100% {
    opacity: 1;
  }
}
.thread:nth-child(n + 2) {
  transform: rotate(calc(360deg / 16 * (var(--n) - 1))) translate(80px);
}

.hud-status {
  text-align: center;
  margin-top: 16px;
}
.hud-status span {
  color: #00ff99;
  font-weight: bold;
}
.hud-readout {
  margin-top: 16px;
  font-size: 1.1em;
  color: #baffc9;
  background: rgba(0, 64, 32, 0.3);
  border-radius: 8px;
  padding: 12px;
}
</style>
