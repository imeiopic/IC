<template>
  <Transition name="fade">
    <div v-if="show" class="thankyou-modal">
      <div class="thankyou-backdrop" @click="close"></div>
      <div class="thankyou-content">
        <header class="modal-header">
          <h2 class="text-glow">SYMMETRY_ACKNOWLEDGED</h2>
          <p>Your contribution has been grounded in the TPE Mass.</p>
        </header>
        <video ref="videoRef" width="480" autoplay playsinline @ended="close">
          <source src="/videos/thankyou.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <button class="close-btn" @click="close">RETURN_TO_MESH</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
const props = defineProps<{ show: boolean }>();
const emit = defineEmits(['close']);
const videoRef = ref<HTMLVideoElement | null>(null);

function close() {
  emit('close');
}

watch(
  () => props.show,
  async (val) => {
    if (val) {
      // Wait for the next tick to ensure the DOM is updated and videoRef is bound
      await nextTick();
      if (videoRef.value) {
        videoRef.value.currentTime = 0;
        // play() returns a promise; catching errors handles autoplay blocks
        videoRef.value.play().catch((error) => {
          console.warn('Autoplay was prevented by the browser:', error);
        });
      }
    }
  }
);
</script>

<style scoped>
.thankyou-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thankyou-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(5px);
}
.thankyou-content {
  position: relative;
  background: #050505;
  border: 1px solid #7fff00;
  padding: 2rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 0 30px rgba(127, 255, 0, 0.2);
}
.text-glow {
  color: #7fff00;
  text-shadow: 0 0 10px #7fff00;
  margin-bottom: 0.5rem;
}
.close-btn {
  margin-top: 1.5rem;
  padding: 0.8rem 2rem;
  font-family: 'Space Mono', monospace;
  border: 1px solid #7fff00;
  background: transparent;
  color: #7fff00;
  cursor: pointer;
  transition: all 0.3s;
}
.close-btn:hover {
  background: #7fff00;
  color: #000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-active .thankyou-content,
.fade-leave-active .thankyou-content {
  /* cubic-bezier adds a slight "pop" or overshoot effect for a more premium feel */
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .thankyou-content,
.fade-leave-to .thankyou-content {
  transform: scale(0.8);
}
</style>
