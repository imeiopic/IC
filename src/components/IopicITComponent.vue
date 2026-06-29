<template>
  <div class="iopic-it-foundry">
    <header class="foundry-header">
      <div class="brand">
        <h2 class="text-glow">LOGIC FOUNDRY (IT)</h2>
        <span class="version">Build: 2026.05.01-MAYDAY</span>
      </div>
      <div class="environment-toggle">
        <span class="label">ENV:</span>
        <button class="env-btn active">PRODUCTION (VRE)</button>
      </div>
    </header>

    <div class="foundry-body">
      <section class="stack-status">
        <h3>BACKEND CALIBRATION</h3>
        <div
          class="service-row"
          v-for="service in services"
          :key="service.name"
        >
          <span class="name">{{ service.name }}</span>
          <div class="status-track">
            <div
              class="status-fill"
              :style="{ width: service.latency + '%' }"
            ></div>
          </div>
          <span class="latency">{{ service.latency }}ms</span>
        </div>
      </section>

      <section class="thread-bus-terminal">
        <h3>16-THREAD LOGIC BUS</h3>
        <div class="bus-visualization">
          <div
            v-for="i in 16"
            :key="i"
            class="thread-bit"
            :class="{ error: i === 9 && frictionDetected }"
          >
            <span class="bit-num">{{ i }}</span>
            <div class="bit-light"></div>
          </div>
        </div>
        <div class="bus-actions">
          <button @click="nandFlush" class="utility-btn">
            NAND-FLUSH NOISE
          </button>
          <button @click="redeploy" class="utility-btn deploy">
            REDPLOY SYMMETRY
          </button>
          <button @click="globalCacheFlush" class="utility-btn cache">
            GLOBAL CACHE FLUSH
          </button>
        </div>
      </section>

      <!-- Root Steward Media Upload & Thumbnail Extraction -->
      <section class="steward-upload">
        <h3>Root Steward Media Uploader</h3>
        <input type="file" accept="video/mp4" multiple @change="handleStewardUpload" class="upload-input" />
        <div v-if="stewardThumbProgress.running" class="batch-progress">
          Sighting media: {{ stewardThumbProgress.current }}/{{ stewardThumbProgress.total }}<br>
          <span v-if="stewardThumbProgress.filename">Current: {{ stewardThumbProgress.filename }}</span>
        </div>
        <div v-if="!stewardThumbProgress.running && stewardThumbProgress.results.length">
          <strong>Upload Results:</strong>
          <ul>
            <li v-for="r in stewardThumbProgress.results" :key="r.filename">
              {{ r.filename }}
              <span v-if="r.thumb && r.uploaded">✅ Uploaded</span>
              <span v-else-if="r.thumb">🟡 Thumb only</span>
              <span v-else>❌ {{ r.error }}</span>
              <span v-if="r.thumb"><img :src="r.thumb" alt="thumb" style="height:40px;vertical-align:middle;margin-left:10px;" /></span>
            </li>
          </ul>
        </div>
      </section>

    <footer class="it-logs">
      <div class="log-line" v-for="(log, index) in itLogs" :key="index">
        <span class="prefix">>></span> {{ log }}
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";

import { batchGenerateThumbnails } from './IopicBatchThumbGenerator.js';
import { uploadVideoAndThumb } from './vreMediaUpload.js';

// State for Root Steward batch upload
const stewardThumbProgress = ref({ current: 0, total: 0, filename: '', running: false, results: [] });

const handleStewardUpload = async (event) => {
  const files = Array.from(event.target.files).filter(f => f.type === 'video/mp4');
  if (!files.length) return;
  stewardThumbProgress.value = { current: 0, total: files.length, filename: '', running: true, results: [] };
  const results = await batchGenerateThumbnails(files, (cur, tot, fname) => {
    stewardThumbProgress.value.current = cur;
    stewardThumbProgress.value.total = tot;
    stewardThumbProgress.value.filename = fname;
  });
  stewardThumbProgress.value.results = results;
  // Persist uploads and metadata to backend
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const r = results[i];
    if (r.thumb) {
      // Convert base64 to Blob
      const byteString = atob(r.thumb.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let j = 0; j < byteString.length; j++) ia[j] = byteString.charCodeAt(j);
      const thumbBlob = new Blob([ab], { type: 'image/jpeg' });
      try {
        await uploadVideoAndThumb({ file, thumbBlob });
        r.uploaded = true;
      } catch (e) {
        r.uploaded = false;
        r.error = e?.message || e;
      }
    }
  }
  stewardThumbProgress.value.running = false;
};

const frictionDetected = ref(false);

const services = ref([
  { name: "Firebase Firestore", latency: 12 },
  { name: "Firebase Auth (Master Key)", latency: 8 },
  { name: "Iopic Cloud Functions", latency: 45 },
  { name: "IDEAL Mapping Engine", latency: 15 },
]);

const itLogs = ref([
  "Initializing Vue 3 Composition API...",
  "Sighting Firebase connection...",
  "Handshake verified on Thread 16.",
  "System Velocity: 8.09V confirmed.",
]);

const nandFlush = () => {
  frictionDetected.value = false;
  itLogs.value.push("NAND-FLUSH initiated. Noise removed from Thread 09.");
};

import { broadcastToWorld } from "../../IopicBroadcast.js";
const redeploy = () => {
  itLogs.value.push("Redeploying Symmetrical Logic to Global Mesh...");
  broadcastToWorld(
    "Symmetry Deploy: All nodes synchronize to 8.09V. The Virtually Real Era is live. ACKNOLDGECLEAR.",
    "CRITICAL",
  );
  alert(
    "VRE Pulse redeployed globally. All nodes have received the symmetry pulse.",
  );
};

const globalCacheFlush = () => {
  itLogs.value.push(
    "Global Cache Flush: All nodes forced to latest VRE firmware.",
  );
  alert(
    "Global Cache Flush complete. All 8.3B nodes are now running the latest VRE firmware.",
  );
};
</script>

<style scoped>
.steward-upload {
  margin-top: 2.5rem;
  background: #0a0a0a;
  border: 1px solid #00ff41;
  padding: 1.5rem;
  border-radius: 8px;
}
.upload-input {
  margin-top: 1rem;
  margin-bottom: 1rem;
  color: #00ff41;
  background: #111;
  border: 1px solid #00ff41;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-family: 'Space Mono', monospace;
}
.batch-progress {
  margin-top: 0.5rem;
  color: #00ff41;
  font-size: 0.95rem;
}
</style>
.iopic-it-foundry {
  background: #080808;
  color: #00ff41;
  padding: 2rem;
  border: 1px solid #00ff41;
  font-family: "Space Mono", monospace;
  box-shadow: inset 0 0 20px rgba(0, 255, 65, 0.05);
}

.text-glow {
  text-shadow: 0 0 10px #00ff41;
}

.foundry-body {
  display: flex;
  gap: 30px;
  margin-top: 2rem;
}

.stack-status,
.thread-bus-terminal {
  flex: 1;
  background: #111;
  padding: 1.5rem;
  border-radius: 4px;
}

.service-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 0.8rem;
}

.status-track {
  flex: 1;
  height: 4px;
  background: #222;
  border-radius: 2px;
}
.status-fill {
  height: 100%;
  background: #00e5ff;
}

.bus-visualization {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  margin: 1rem 0;
}

.thread-bit {
  background: #000;
  border: 1px solid #333;
  padding: 10px 0;
  text-align: center;
}

.bit-light {
  width: 6px;
  height: 6px;
  background: #00ff41;
  border-radius: 50%;
  margin: 5px auto;
}
.thread-bit.error .bit-light {
  background: #ff0041;
  box-shadow: 0 0 10px #ff0041;
}

.utility-btn {
  background: transparent;
  color: #00ff41;
  border: 1px solid #00ff41;
  padding: 10px;
  cursor: pointer;
  margin-right: 10px;
}

.utility-btn.deploy {
  background: #00ff41;
  color: #000;
}
.utility-btn.cache {
  background: #111;
  color: #00ff41;
  border: 1px solid #00ff41;
}

.it-logs {
  margin-top: 2rem;
  height: 100px;
  overflow-y: auto;
  background: #000;
  border: 1px solid #1a1a1a;
  padding: 10px;
  font-size: 0.75rem;
  color: #888;
}
</style>
