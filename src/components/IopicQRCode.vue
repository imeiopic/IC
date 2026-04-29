<template>
  <div class="iopic-qr">
    <h2>Connect to IOPIC Mesh</h2>
    <div>
      <canvas ref="qrCanvas"></canvas>
    </div>
    <div class="qr-info">
      <p><strong>SSID:</strong> IOPIC</p>
      <p><strong>Password:</strong> IOPIC2026</p>
      <p><strong>Onboarding URL:</strong> {{ onboardingUrl }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import QRCode from 'qrcode';

const onboardingUrl = window.location.origin + '/citizen-audit';
const qrCanvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (qrCanvas.value) {
    QRCode.toCanvas(qrCanvas.value, `WIFI:T:WPA;S:IOPIC;P:IOPIC2026;;\n${onboardingUrl}`);
  }
});
</script>

<style scoped>
.iopic-qr {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fafbfc;
  text-align: center;
}
canvas {
  margin-bottom: 1rem;
}
.qr-info {
  margin-top: 1rem;
  font-size: 1.1em;
}
</style>
