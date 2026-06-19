<template>
  <div class="ideal-viewport" @mousemove="trackSpatialPressure">
    <header class="ideal-header">
      <div class="logo-pulse">IOPIC: IDEAL</div>
      <div class="thread-status">
        <span v-for="t in 16" :key="t" :class="{ 'active': activeThreads[t-1] }"></span>
      </div>
    </header>

    <main class="ideal-canvas">
      <div class="spatial-layer">
        <RoomMap />
      </div>

      <aside class="interaction-sidebar">
        <EntityOrderTaker v-if="showCommerce" />
        <VideoChat v-if="peerHandshakeActive" />
      </aside>
    </main>

    <footer class="ideal-footer">
      <div class="coordinate-grounding">
        X: {{ spatialCoords.x }} | Y: {{ spatialCoords.y }} | Z: {{ spatialCoords.z }}
      </div>
      <div class="logic-signature">I = VR² | Grounded: {{ currentDateTime }}</div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import RoomMap from './RoomMap.vue';
import EntityOrderTaker from './EntityOrderTaker.vue';
import VideoChat from './VideoChat.vue';

const spatialCoords = reactive({ x: 0, y: 0, z: 0 });
const activeThreads = ref(new Array(16).fill(true));
const showCommerce = ref(true);
const peerHandshakeActive = ref(false);

const trackSpatialPressure = (event) => {
  // Mapping physical mouse movement to Virtual Logic
  spatialCoords.x = Math.floor(event.clientX / 16);
  spatialCoords.y = Math.floor(event.clientY / 16);
};

const currentDateTime = new Date().toLocaleString();
</script>

<style scoped>
.ideal-viewport {
  height: 100vh;
  background: radial-gradient(circle, #111 0%, #000 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}
.ideal-header {
  padding: 1rem;
  border-bottom: 1px solid #222;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.thread-status span {
  width: 4px;
  height: 12px;
  background: #333;
  margin: 0 2px;
  display: inline-block;
}
.thread-status span.active { background: #ffd700; box-shadow: 0 0 5px #ffd700; }
.ideal-canvas {
  flex: 1;
  display: flex;
  padding: 2rem;
  gap: 2rem;
}
.spatial-layer { flex: 2; position: relative; }
.interaction-sidebar { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
.ideal-footer {
  padding: 1rem;
  border-top: 1px solid #222;
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
}
</style>