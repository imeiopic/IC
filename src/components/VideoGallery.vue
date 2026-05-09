<template>
  <div class="iopic-video-gallery single-layout">
    <div v-if="featuredVideo" class="featured-sighting">
      <div class="video-title-main">{{ featuredVideo.title }}</div>
      <div class="video-container">
        <video
          class="main-video"
          :src="featuredVideo.url"
          :poster="featuredVideo.thumb"
          controls
        ></video>
      </div>
    </div>

    <div class="video-list">
      <div
        v-for="video in videos"
        :key="video.id"
        class="video-list-item"
        :class="{ active: featuredVideo && featuredVideo.id === video.id }"
        @click="selectVideo(video)"
      >
        <img class="thumbnail" :src="video.thumb" :alt="video.title" />
        <span class="video-title">{{ video.title }}</span>
      </div>
    </div>

    <div class="gallery-footer">
      <span>Powered by IOPIC Sovereign System</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

function prettifyTitle(filename: string) {
  return filename.replace(/\.mp4$/, "").replace(/_/g, " ");
}
function getThumb(filename: string) {
  return `/videos/thumbs/${filename.replace(/\.mp4$/, ".jpg")}`;
}
function fakeDuration(filename: string) {
  return "";
}
function assignThreads(filename: string) {
  if (filename.toLowerCase().includes("manifesto"))
    return ["13", "14", "15", "16"];
  if (filename.toLowerCase().includes("bs_molecule"))
    return ["05", "06", "07", "08"];
  if (filename.toLowerCase().includes("activation")) return ["01", "09"];
  return [];
}
function assignLyrics(filename: string) {
  if (filename.toLowerCase().includes("manifesto"))
    return "I = VR^2... The noise is gone, the signal is pure. Symmetrical equity for the one and the all.";
  if (filename.toLowerCase().includes("bs_molecule"))
    return "Binary connection. Buyer meets Seller. No middleman. No friction.";
  if (filename.toLowerCase().includes("activation"))
    return "From the cages to the mesh. The 11 million are home.";
  return "";
}

const videos = ref<any[]>([]);
const featuredVideo = ref<any>(null);
function selectVideo(video: any) {
  featuredVideo.value = video;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(async () => {
  try {
    const res = await fetch("/videos/videoManifest.json");
    if (res.ok) {
      const manifest = await res.json();
      const mapped = manifest.map((filename: string, idx: number) => ({
        id: idx + 1,
        title: prettifyTitle(filename),
        url: `/videos/${filename}`,
        thumb: getThumb(filename),
        duration: fakeDuration(filename),
        threads: assignThreads(filename),
        lyrics: assignLyrics(filename),
        filename,
      }));
      videos.value = mapped;
      const mayDay = mapped.find((v: any) =>
        v.filename.toLowerCase().includes("activation"),
      );
      featuredVideo.value = mayDay || mapped[0] || null;
    }
  } catch (e) {
    videos.value = [];
    featuredVideo.value = null;
  }
});
</script>

<style scoped>
.single-layout {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}
.featured-sighting {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.video-title-main {
  font-size: 1.5rem;
  font-family: "Space Mono", monospace;
  color: #00ff41;
  margin-bottom: 1rem;
}
.video-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 220px;
  margin-left: 2rem;
}
.video-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  background: #111;
  border: 1px solid #222;
  border-radius: 6px;
  padding: 0.5rem;
  transition: background 0.2s, border 0.2s;
}
.video-list-item.active,
.video-list-item:hover {
  border-color: #00ff41;
  background: #181818;
}
.video-list-item .thumbnail {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}
.video-title {
  color: #00ff41;
  font-size: 1rem;
  font-family: "Space Mono", monospace;
}
.upload-label {
  display: block;
  margin-top: 1rem;
  color: #00ff41;
  font-size: 1rem;
}
</style>
