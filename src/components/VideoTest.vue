<template>
  <div class="video-test-container">
    <h2>Video Test Suite</h2>
    <div v-if="videos.length === 0">No videos found.</div>
    <div v-for="video in videos" :key="video" class="video-block">
      <h3>{{ video }}</h3>
      <video
        :src="videoUrl(video)"
        controls
        width="480"
        style="margin-bottom: 2rem"
      ></video>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// List your video files here (relative to /public/audios/ for now)
const videos = ref(["/audios/i=vr^2.mp4"]);

const videoUrl = (filename) => filename;
</script>

<style scoped>
.video-test-container {
  background: #111;
  color: #00e5ff;
  padding: 2rem;
  border-radius: 8px;
  max-width: 700px;
  margin: 2rem auto;
  font-family: "Space Mono", monospace;
}
.video-block {
  margin-bottom: 2rem;
}
video {
  border: 2px solid #00e5ff;
  border-radius: 8px;
  background: #000;
}
</style>
