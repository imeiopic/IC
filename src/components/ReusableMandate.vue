<template>
  <div class="mandate-wrapper" :class="{ 'mandate-violated': violationDetected }">
    <div class="mandate-badge">
      <span class="law-icon">⚖️</span>
      MANDATE: {{ mandateName }}
    </div>

    <div class="mandate-content">
      <slot></slot>
    </div>

    <div v-if="violationDetected" class="violation-shield">
      <p>LOGIC FRACTURE DETECTED</p>
      <span>Reason: {{ violationReason }}</span>
      <button @click="realignNode" class="realign-btn">Realign to Symmetry</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  mandateName: String,
  validationLogic: Function
});

const violationDetected = ref(false);
const violationReason = ref("");

const realignNode = () => {
  violationDetected.value = false;
  console.log("Shield Pulse Active: Symmetry Restored.");
};
</script>

<style scoped>
.mandate-wrapper {
  position: relative;
  border: 1px solid #333;
  padding: 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
}
.mandate-badge {
  font-size: 0.65rem;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 5px;
  text-transform: uppercase;
}
.mandate-violated { border-color: #ff0000; box-shadow: inset 0 0 10px #ff0000; }
.violation-shield {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(255, 0, 0, 0.9); color: white;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  z-index: 100; text-align: center;
}
.realign-btn { background: white; color: red; border: none; padding: 5px 10px; font-weight: bold; margin-top: 10px; }
</style>