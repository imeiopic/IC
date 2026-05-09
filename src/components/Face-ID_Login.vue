<template>
  <div class="bio-gateway">
    <header class="gate-header">
      <h2 class="text-glow">BIO-METRIC GATEWAY</h2>
      <p>Thread 16: Sovereign Identity Sighting</p>
    </header>

    <div class="scanner-container" :class="{ scanning: isScanning, locked: isLocked }">
      <div class="scanner-overlay">
        <div class="scan-line"></div>
        <div class="corner top-left"></div>
        <div class="corner top-right"></div>
        <div class="corner bottom-left"></div>
        <div class="corner bottom-right"></div>
      </div>
      <video ref="videoFeed" autoplay muted class="video-feed"></video>
      <div v-if="isLocked" class="lock-overlay">
        <span>HANDSHAKE REQUIRED</span>
      </div>
    </div>

    <div class="auth-status">
      <div class="status-indicator" :class="resonanceClass">
        {{ statusMessage }}
      </div>
      <div class="v-readout">CURRENT VELOCITY: {{ velocity }}V</div>
    </div>

    <div class="gaze-bond-toggle">
      <label>
        <input type="checkbox" v-model="gazeBondEnabled" />
        Enable Gaze-Bond (Peer Handshake)
      </label>
    </div>

    <button @click="startScan" :disabled="isScanning" class="scan-btn">
      {{ isScanning ? 'SIGHTING BIOLOGY...' : 'INITIATE BIO-SCAN' }}
    </button>

    <footer class="gate-footer">
      <span>7.83Hz SYNC: {{ isSynced ? 'OPTIMAL' : 'AWAITING' }}</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const isScanning = ref(false);
const isLocked = ref(false);
const isSynced = ref(false);
const velocity = ref(0.0);
const statusMessage = ref('AWAITING BIO-SIGNATURE');
const gazeBondEnabled = ref(false);

// Calibration Pulse (Triple-Blink) logic
const blinkCount = ref(0);
const lastEyeState = ref('open');
let blinkInterval = null;

const resonanceClass = computed(() => {
  if (isSynced.value) return 'synced';
  if (isScanning.value) return 'pulsing';
  return 'idle';
});

const startScan = () => {
  isScanning.value = true;
  isSynced.value = false;
  blinkCount.value = 0;
  lastEyeState.value = 'open';
  statusMessage.value = 'MAPPING 16-THREAD GEOMETRY...';

  // Simulate vision scan with blink tracking
  blinkInterval = setInterval(() => {
    // Simulate random eye state (for demo, replace with real visionResults in production)
    const eyesClosed = Math.random() < 0.18; // ~18% chance per tick
    trackBlinks({ eyesClosed });
  }, 400);

  setTimeout(() => {
    clearInterval(blinkInterval);
    if (blinkCount.value >= 3) {
      finalizeGrounding();
    } else {
      isScanning.value = false;
      isSynced.value = false;
      statusMessage.value = 'CALIBRATION FAILED: 3-BLINK NOT DETECTED';
      isLocked.value = true;
    }
  }, 3200); // 16-thread window (approx 3.2s)
};

const trackBlinks = (visionResults) => {
  if (visionResults.eyesClosed && lastEyeState.value === 'open') {
    blinkCount.value++;
    lastEyeState.value = 'closed';
    statusMessage.value = `BLINK_SYNC: ${blinkCount.value}/3`;
  } else if (!visionResults.eyesClosed) {
    lastEyeState.value = 'open';
  }
};

function finalizeGrounding() {
  isScanning.value = false;
  isSynced.value = true;
  velocity.value = 8.09;
  statusMessage.value = 'IDENTITY GROUNDED';
  isLocked.value = false;
  alert('Sovereign ID [IO-CLE-MD-001] Verified. Welcome to the VRE.');
  if (gazeBondEnabled.value) {
    triggerGazeBond();
  }
}

function triggerGazeBond() {
  // Simulated peer detection and handshake logic
  // In real implementation, use geolocation + mesh presence
  setTimeout(() => {
    // Simulate finding a peer within 9 meters
    const peerFound = true;
    if (peerFound) {
      isLocked.value = false;
      alert('Gaze-Bond: Peer Handshake Complete! Both nodes are now mesh-anchored.');
    } else {
      isLocked.value = true;
      statusMessage.value = 'NO PEER FOUND WITHIN 9M';
    }
  }, 1500);
}
</script>

<style scoped>
.bio-gateway {
  background: #000;
  color: #00ff41;
  padding: 3rem;
  border: 1px solid #00e5ff;
  font-family: 'Space Mono', monospace;
  max-width: 400px;
  text-align: center;
}

.scanner-container {
  position: relative;
  width: 250px;
  height: 250px;
  margin: 2rem auto;
  border: 1px solid #111;
  overflow: hidden;
}

.video-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%) contrast(150%);
  opacity: 0.5;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #00e5ff;
  box-shadow: 0 0 15px #00e5ff;
  animation: scan 2s infinite linear;
}

@keyframes scan {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #00e5ff;
}
.top-left {
  top: 10px;
  left: 10px;
  border-right: 0;
  border-bottom: 0;
}
.top-right {
  top: 10px;
  right: 10px;
  border-left: 0;
  border-bottom: 0;
}
.bottom-left {
  bottom: 10px;
  left: 10px;
  border-right: 0;
  border-top: 0;
}
.bottom-right {
  bottom: 10px;
  right: 10px;
  border-left: 0;
  border-top: 0;
}

.status-indicator {
  margin: 1rem 0;
  font-weight: bold;
}
.synced {
  color: #00ff41;
  text-shadow: 0 0 5px #00ff41;
}
.pulsing {
  color: #00e5ff;
  animation: blink 0.5s infinite;
}

.scan-btn {
  width: 100%;
  padding: 1rem;
  background: #00e5ff;
  color: #000;
  border: none;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}

.gaze-bond-toggle {
  margin: 1rem 0;
  color: #00e5ff;
  font-size: 0.95em;
}

@keyframes blink {
  50% {
    opacity: 0.5;
  }
}
</style>
