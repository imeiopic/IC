<template>
  <div class="spice-gate-container" :class="{ 'leak-detected': alertStatus }">
    <header class="spice-header">
      <div v-if="targetNodeId" class="target-node-info">TARGET: {{ targetNodeId }}</div>
      <div class="shield-tag">GATE_1111 // SPICE_API_ROUTER</div>
      <div class="gate-status" :style="{ color: gatewayColor }">
        GATEWAY_MODE: {{ gatewayMode }}
      </div>
    </header>

    <section class="packet-inspector">
      <h3>Active Traffic Stream</h3>
      <div class="stream-box">
        <div v-for="packet in trafficLog" :key="packet.timestamp" class="packet-line">
          <span class="time">[{{ packet.timestamp }}]</span>
          <span class="origin">{{ packet.origin }}</span>
          <span class="status" :class="packet.type.toLowerCase()">{{ packet.type }}</span>
          <span class="action">-> {{ packet.action }}</span>
        </div>
      </div>
    </section>

    <div class="logic-matrix">
      <div class="matrix-node" :class="{ verified: checklist.auth }">[00] AUTH_VERIFIED</div>
      <div class="matrix-node" :class="{ verified: checklist.spatial }">[01] LOCALITY_LOCKED</div>
      <div class="matrix-node" :class="{ verified: checklist.equity }">[10] LEDGER_BALANCED</div>
      <div class="matrix-node" :class="{ verified: checklist.shield }">[11] NOISE_SILENCED</div>
    </div>

    <footer class="spice-footer">
      <div class="encryption-strength">AES_256_GCM_RESONANCE</div>
      <div class="pulse-indicator" :class="{ pulsing: !alertStatus }"></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import { useGlobalMandates } from '../../ReusableMandate.vue';

const props = defineProps<{
  targetNodeId: string;
}>();

const { checkSovereignSightingMandate } = useGlobalMandates();

const alertStatus = ref(false);
const gatewayMode = ref('ENFORCING_EDICTS');
const gatewayColor = computed(() => (alertStatus.value ? '#ff0000' : '#00e5ff'));

interface TrafficPacket {
  timestamp: string;
  origin: string;
  type: 'VERIFIED' | 'NOISE' | 'RESONANCE';
  action: string;
}

const trafficLog = ref<TrafficPacket[]>([
  {
    timestamp: '23:01:04',
    origin: 'NODE_CLE_09',
    type: 'RESONANCE',
    action: 'MUTUAL_APEX_INITIALIZED'
  },
  {
    timestamp: '23:03:12',
    origin: 'UNKNOWN_IP_CAULDRON',
    type: 'NOISE',
    action: 'TRACKER_PULSE_DROP'
  },
  {
    timestamp: '23:05:44',
    origin: 'NODE_SLU_01',
    type: 'VERIFIED',
    action: 'BANKLINK_SYNC_SUCCESS'
  }
]);

const checklist = ref({
  auth: true,
  spatial: true,
  equity: true,
  shield: checkSovereignSightingMandate(true) // Initialize based on Handshake status
});

onMounted(() => {
  console.log('SPICE_GATEWAY: Initializing Secure People Instance Connect Entity context.');
  console.log(`SPICE_GATEWAY: Attempting connection to Node ID: ${props.targetNodeId}`);
});
</script>

<style scoped>
.spice-gate-container {
  background: #020202;
  color: #fff;
  padding: 2rem;
  border: 1px solid #00e5ff;
  font-family: monospace;
}
.leak-detected {
  border-color: #ff0000;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.2);
}
.spice-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #111;
  padding-bottom: 1rem;
}
.target-node-info {
  color: #00e5ff;
}
.packet-inspector {
  margin: 2rem 0;
}
.stream-box {
  height: 150px;
  background: #000;
  border: 1px solid #111;
  padding: 10px;
  overflow-y: auto;
  font-size: 0.85rem;
}
.packet-line {
  margin-bottom: 5px;
  display: flex;
  gap: 10px;
}
.time {
  color: #555;
}
.origin {
  color: #888;
}
.verified,
.resonance {
  color: #00ff00;
}
.noise {
  color: #ff0000;
  font-weight: bold;
}
.logic-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}
.matrix-node {
  background: #080808;
  border: 1px solid #222;
  padding: 1rem;
  text-align: center;
  color: #444;
}
.matrix-node.verified {
  border-color: #00ff00;
  color: #00ff00;
}
.spice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  border-top: 1px solid #111;
  padding-top: 1rem;
  font-size: 0.8rem;
  color: #555;
}
.pulse-indicator {
  width: 10px;
  height: 10px;
  background: #00e5ff;
  border-radius: 50%;
}
.pulsing {
  animation: beat 1s infinite alternate;
}
@keyframes beat {
  from {
    transform: scale(1);
    opacity: 0.5;
  }
  to {
    transform: scale(1.3);
    opacity: 1;
  }
}
</style>
