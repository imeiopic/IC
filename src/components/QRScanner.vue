<template>
  <div class="qr-page">
    <h2>QR Code Scanner</h2>
    <video id="video" autoplay></video>
    <div id="result">Scan a QR code...</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
let stream: MediaStream | null = null;
let scanning = false;
let animationId: number;
let video: HTMLVideoElement;
let resultDiv: HTMLElement;
let canvas: HTMLCanvasElement;

onMounted(() => {
  video = document.getElementById('video') as HTMLVideoElement;
  resultDiv = document.getElementById('result')!;
  canvas = document.createElement('canvas');
  // @ts-ignore
  import('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js').then(jsQRModule => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        stream = s;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.play();
        scanning = true;
        tick(jsQRModule.default);
      });
  });
});

function tick(jsQR: any) {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      resultDiv.textContent = 'QR Code: ' + code.data;
      scanning = false;
      if (stream) stream.getTracks().forEach(track => track.stop());
      return;
    }
  }
  if (scanning) animationId = requestAnimationFrame(() => tick(jsQR));
}

onBeforeUnmount(() => {
  if (stream) stream.getTracks().forEach(track => track.stop());
  if (animationId) cancelAnimationFrame(animationId);
});
</script>

<style scoped>
.qr-page {
  text-align: center;
  margin-top: 2rem;
}
#video {
  width: 320px;
  height: 240px;
  border: 1px solid #ccc;
  margin: 1rem auto;
  display: block;
}
#result {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: #333;
}
</style>
