<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2>Face ID Capture</h2>
      <div class="faceid-box">
        <p>
          Align your face with the camera and click capture.<br />
          <small
            >Face ID data is stored securely in your node's personal
            storage.</small
          >
        </p>
        <video ref="video" autoplay playsinline class="faceid-video"></video>
        <button @click="capture">Capture Face ID</button>
        <button @click="$emit('close')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
const emit = defineEmits(["success", "close"]);
const video = ref(null);
let stream = null;

onMounted(async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (video.value) {
      video.value.srcObject = stream;
      await video.value.play();
    }
  } catch (e) {
    alert("Could not access camera: " + (e?.message || e));
  }
});

onBeforeUnmount(() => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
});

async function capture() {
  try {
    if (!video.value) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.value.videoWidth;
    canvas.height = video.value.videoHeight;
    canvas.getContext("2d").drawImage(video.value, 0, 0);
    const imageData = canvas.toDataURL("image/png");
    // Stop camera after capture
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    emit("success", imageData);
  } catch (e) {
    alert("Face recognition failed: " + (e?.message || e));
  }
}
</script>

<style scoped>
.modal-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
}
.modal-content {
  background: #050505;
  border: 1px solid #00ff41;
  padding: 2rem;
  max-width: 400px;
  color: #00ff41;
  font-family: "Space Mono", monospace;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.faceid-box {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.faceid-video {
  width: 100%;
  max-width: 320px;
  border: 1px solid #00ff41;
  margin-bottom: 1rem;
  transform: scaleX(-1); /* Mirror the video */
  background: #111;
}
button {
  margin: 0.5rem 0;
  padding: 0.75rem 1.5rem;
  background: #00ff41;
  color: #000;
  border: none;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
}
</style>
