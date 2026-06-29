<template>
  <div class="thankyou-modal" v-if="show">
    <div class="thankyou-backdrop" @click="close"></div>
    <div class="thankyou-content">
      <header class="modal-header">
        <h2 class="text-glow">SYMMETRY_ACKNOWLEDGED</h2>
        <p>Your contribution has been grounded in the TPE Mass.</p>
      </header>
      <video ref="videoRef" width="480" autoplay @ended="close">
        <source src="https://gemini.google.com/gem/1E3SeFRgUwmpxfNcWbCuYnsVfRpdtuoEj?usp=sharing" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <button class="close-btn" @click="close">RETURN_TO_MESH</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{ show: boolean }>();
const emit = defineEmits(['close']);
const videoRef = ref<HTMLVideoElement | null>(null);

function close() {
  emit('close');
}

watch(
  () => props.show,
  (val) => {
    if (val) {
      // Ensure the video plays once the DOM element is sighted
      setTimeout(() => {
        if (videoRef.value) {
          videoRef.value.currentTime = 0;
          videoRef.value.play();
        }
      }, 100);
    }
  }
);
</script>

<style scoped>.thankyou-content {
  position: relative;
  background: #050505;
  border: 1px solid #c5a059; /* Shift to Gold */
  padding: 2rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 0 50px rgba(197, 160, 89, 0.15); /* Soft Gold Glow */
}

.text-glow {
  color: #c5a059;
  font-family: 'Space Mono', monospace;
  text-shadow: 0 0 15px rgba(197, 160, 89, 0.5);
  margin-bottom: 0.5rem;
  font-weight: 900;
  letter-spacing: 2px;
}

.close-btn {
  margin-top: 1.5rem;
  padding: 0.8rem 2rem;
  font-family: 'Space Mono', monospace;
  border: 1px solid #c5a059;
  background: transparent;
  color: #c5a059;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.close-btn:hover {
  background: #c5a059;
  color: #000;
  box-shadow: 0 0 20px #c5a059;
}
</style>