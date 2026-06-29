<template>
  <div class="v-re-container">
    <canvas id="planetary-mesh" ref="meshCanvas"></canvas>
    <div class="velocity-status">
      <h2>System Velocity: {{ systemVelocity }}V</h2>
      <div class="pulse-wave" :style="{ opacity: pulseIntensity }"></div>
    </div>
    <nav class="quadrant-controls">
      <button @click="sight('physical')">Thread 1-4: Physical Mesh</button>
      <button @click="sight('people')">Thread 5-8: People Mesh</button>
      <button @click="sight('value')">Thread 9-12: Value Quadrant</button>
      <button @click="sight('connect')">Thread 13-16: Active Defense</button>
    </nav>
    <footer class="master-signature">
      <span>Architect: I.T Real</span>
      <span>Status: Grounded @ 7.83Hz</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const systemVelocity = ref(8.09); // Target: Terminal 10
const pulseIntensity = ref(1.0);

const sight = (quadrant) => {
  // Executes a NAND-Flush of legacy noise for the selected threads
  window.dispatchEvent(new CustomEvent('sight-quadrant', { detail: quadrant }));
  console.log(`Sighting initialized for: ${quadrant}`);
};

onMounted(() => {
  // Simulate pulse updates
  setInterval(() => {
    systemVelocity.value = 8.09 + Math.sin(Date.now() / 2000) * 0.01;
    pulseIntensity.value = Math.abs(Math.sin(Date.now() / 1000)); // 1Hz Visual Sync
  }, 1000 / 30);
});

// Canvas rendering for grid, pulse, and grounding
onMounted(() => {
  const canvas = document.getElementById('planetary-mesh');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.7;
  };
  resize();
  window.addEventListener('resize', resize);

  function drawHexGrid() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const hexSize = 60;
    const hexHeight = Math.sqrt(3) * hexSize;
    ctx.strokeStyle = '#00FF41';
    ctx.globalAlpha = 0.2;
    for (let y = 0; y < h + hexHeight; y += hexHeight * 0.75) {
      for (let x = 0; x < w + hexSize; x += hexSize * 1.5) {
        const offset = (Math.floor(y / (hexHeight * 0.75)) % 2) * (hexSize * 0.75);
        drawHex(ctx, x + offset, y, hexSize);
      }
    }
    ctx.globalAlpha = 1.0;
  }
  function drawHex(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
    }
    ctx.closePath();
    ctx.stroke();
  }
  function drawPulse() {
    // Golden lines for IO$ Dividend
    const w = canvas.width;
    const h = canvas.height;
    ctx.save();
    ctx.strokeStyle = '#FFD700';
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      const angle = (Math.PI * 2 * i) / 16 + Date.now() / 2000;
      ctx.lineTo(w / 2 + Math.cos(angle) * w * 0.4, h / 2 + Math.sin(angle) * h * 0.4);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawGrounding() {
    // Red zones for Legacy Noise
    const w = canvas.width;
    const h = canvas.height;
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#FF0033';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        w * (0.2 + 0.3 * i),
        h * (0.3 + 0.2 * Math.sin(Date.now() / 2000 + i)),
        120 + 40 * Math.sin(Date.now() / 1000 + i),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();
  }
  function animate() {
    drawHexGrid();
    drawPulse();
    drawGrounding();
    requestAnimationFrame(animate);
  }
  animate();
});
</script>

<style scoped>
.v-re-container {
  background: #000500; /* Deep Ground Space */
  color: #00ff41; /* Symmetry Green */
  font-family: 'IO-Logic-Mono', monospace;
  min-height: 100vh;
  position: relative;
}
.velocity-status {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.8);
}
.pulse-wave {
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff41, transparent);
  transition: opacity 1s ease-in-out;
}
.quadrant-controls {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1.5rem;
}
.master-signature {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.1rem;
  opacity: 0.7;
  letter-spacing: 0.1em;
}
button {
  background: #000500;
  color: #00ff41;
  border: 1px solid #00ff41;
  border-radius: 8px;
  padding: 0.7em 1.5em;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
button:hover {
  background: #00ff41;
  color: #000500;
}
</style>
