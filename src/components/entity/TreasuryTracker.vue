<template>
  <div class="treasury-tracker" :class="{ 'fracture-pulse': isPulsing }">
    <div class="treasury-header">
      <span class="thread-id">[1010_EQUITY]</span>
      <span class="title">ENTITY TREASURY</span>
    </div>
    <div class="treasury-body">
      <div class="treasury-value">{{ formattedValue }} <span class="currency">IO$</span></div>
      <div class="treasury-status">
        <span v-if="isPulsing" class="status-text alert">FRACTURE DIVERTED!</span>
        <span v-else class="status-text normal">SYMMETRY MAINTAINED</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';

interface GlobalMandates {
  entityTreasury: { value: number };
}

// Inject the global mandates to access the reactive entityTreasury computed ref
const globalMandates = inject<GlobalMandates>('globalMandates');

const treasuryValue = computed(() => {
  return globalMandates ? globalMandates.entityTreasury.value : 0;
});

const formattedValue = computed(() => {
  return treasuryValue.value.toFixed(2);
});

const isPulsing = ref(false);

// Watch for increases in the treasury value to trigger the fracture animation
if (globalMandates) {
  watch(treasuryValue, (newVal, oldVal) => {
    if (newVal > oldVal) {
      isPulsing.value = true;
      setTimeout(() => {
        isPulsing.value = false;
      }, 2000); // 2 second warning pulse
    }
  });
}
</script>

<style scoped>
.treasury-tracker {
  background: #111;
  border: 1px solid #ffd700;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  font-family: monospace;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.1);
}
.treasury-tracker.fracture-pulse {
  border-color: #ff3333;
  background: #2a0808;
  box-shadow: inset 0 0 20px rgba(255, 51, 51, 0.4), 0 0 15px rgba(255, 51, 51, 0.6);
  transform: scale(1.02);
}
.treasury-header {
  display: flex;
  justify-content: space-between;
  color: #ffd700;
  border-bottom: 1px solid #333;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.thread-id {
  font-weight: bold;
}
.title {
  letter-spacing: 2px;
}
.treasury-value {
  font-size: 2.5rem;
  color: #fff;
  text-align: center;
  font-weight: bold;
}
.currency {
  font-size: 1.2rem;
  color: #00d4ff;
}
.treasury-status {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.85rem;
  font-weight: bold;
}
.status-text.normal {
  color: #00ff00;
}
.status-text.alert {
  color: #ff3333;
  animation: blink 0.5s infinite alternate;
}
@keyframes blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.5;
  }
}
</style>
