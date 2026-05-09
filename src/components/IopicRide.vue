<template>
  <div class="iopic-ride-ui">
    <h2 class="glow-text">SYMMETRICAL RIDE BOND</h2>
    <p>
      Request a ride to your destination. The nearest Sovereign Driver will be
      sighted and bonded.
    </p>
    <input
      v-model="destination"
      placeholder="Enter destination (e.g., 123 Main St)"
      class="destination-input"
    />
    <button
      @click="requestRide"
      :disabled="rideStatus === 'BONDED'"
      class="ride-btn"
    >
      {{ rideStatus === "BONDED" ? "BONDED" : "INITIATE RIDE" }}
    </button>
    <div v-if="rideStatus" class="ride-status">
      <strong>Status:</strong> {{ rideStatus }}<br />
      <span v-if="bondInfo">
        <strong>Passenger:</strong> {{ bondInfo.buyer }}<br />
        <strong>Driver:</strong> {{ bondInfo.seller }}<br />
        <strong>Cost:</strong> {{ bondInfo.cost }} IO$<br />
        <strong>Velocity:</strong> {{ bondInfo.velocity }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { initiateRide } from "../IopicTransport";

const destination = ref("");
const rideStatus = ref("");
const bondInfo = ref<any>(null);

function requestRide() {
  if (!destination.value) {
    alert("Please enter a destination.");
    return;
  }
  const result = initiateRide(destination.value);
  rideStatus.value = result.status;
  bondInfo.value = result;
}
</script>

<style scoped>
.iopic-ride-ui {
  background: #0d0d0d;
  color: #e0e0e0;
  padding: 2.5rem;
  border-radius: 16px;
  border: 1px solid #444;
  font-family: "Space Mono", monospace;
  max-width: 420px;
  margin: 2rem auto;
}
.glow-text {
  color: #00ff41;
  text-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}
.destination-input {
  width: 100%;
  padding: 0.8rem;
  margin: 1rem 0;
  border-radius: 8px;
  border: 1px solid #00ff41;
  background: #222;
  color: #fff;
}
.ride-btn {
  width: 100%;
  padding: 1.2rem;
  background: #00ff41;
  color: #000;
  border: none;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}
.ride-btn:disabled {
  background: #444;
  color: #888;
  cursor: not-allowed;
}
.ride-btn:hover:not(:disabled) {
  transform: scale(1.02);
  background: #00cc33;
}
.ride-status {
  margin-top: 1.5rem;
  background: #111;
  border: 1px solid #00e5ff;
  border-radius: 8px;
  padding: 1rem;
  color: #00e5ff;
}
</style>
