<template>
  <button 
    class="etw-portal-btn" 
    @click="$emit('enter')"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div class="portal-frame" :class="{ 'frame-pulse': isHovering }">
      <img src="@/assets/images/etwb.png" alt="ENTER THE WORLD" class="etw-asset" />
      
      <div class="scan-bar" v-if="isHovering"></div>
      <div class="label-overlay">INITIALIZE_PORTAL</div>
    </div>
  </button>
</template>

<script setup>
import { ref } from 'vue';
const isHovering = ref(false);
defineEmits(['enter']);
</script>

<style scoped>
.etw-portal-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  outline: none;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.etw-portal-btn:hover {
  transform: scale(1.05);
}

.portal-frame {
  position: relative;
  border: 1px solid #7fff00;
  padding: 8px;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 15px rgba(127, 255, 0, 0.1);
  overflow: hidden;
}

.frame-pulse {
  box-shadow: 0 0 30px rgba(127, 255, 0, 0.4);
  border-color: #00e5ff;
}

.etw-asset {
  display: block;
  max-width: 320px;
  width: 100%;
  filter: grayscale(0.2) brightness(0.8);
  transition: filter 0.3s ease;
}

.etw-portal-btn:hover .etw-asset {
  filter: grayscale(0) brightness(1.1);
}

.label-overlay {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: #000;
  color: #7fff00;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 3px;
  padding: 2px 8px;
  border: 1px solid #7fff00;
}

.scan-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #00e5ff;
  box-shadow: 0 0 10px #00e5ff;
  animation: scan-move 2s linear infinite;
}

@keyframes scan-move {
  0% { top: 0%; }
  100% { top: 100%; }
}
</style>