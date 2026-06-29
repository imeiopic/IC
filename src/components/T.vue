<template>
  <div class="time-terminal">
    <header class="time-header">
      <h2 class="text-glow">T.I.M.E. CONVERGENCE</h2>
      <p>4D Relational Reality | Thread 04-07</p>
    </header>

    <div class="convergence-ring">
      <div class="ring internet" :style="{ transform: `rotate(${vRotation}deg)` }"></div>
      <div class="ring man" :style="{ transform: `rotate(${mRotation}deg)` }"></div>
      <div class="ring earth" :style="{ transform: `rotate(${eRotation}deg)` }"></div>

      <div class="center-clock">
        <div class="time-val">{{ displayTime }}</div>
        <div class="hz-val">7.83 Hz</div>
      </div>
    </div>

    <section class="cycle-status">
      <h3>8-8-8 CYCLE PROGRESS</h3>
      <div class="cycle-bar">
        <div class="phase rest" :style="{ width: '33.3%' }">REST</div>
        <div class="phase create" :style="{ width: '33.3%' }">CREATE</div>
        <div class="phase order" :style="{ width: '33.3%' }">ORDER</div>
        <div class="playhead" :style="{ left: cyclePos + '%' }"></div>
      </div>
    </section>

    <footer class="time-footer">
      <div class="sync-data">
        <span>DRIFT: 0.000ms</span>
        <span>VELOCITY: 8.09V</span>
      </div>
      <button @click="realignTime" class="sync-btn">REALIGN T.I.M.E.</button>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const displayTime = ref('04:16:32');
const vRotation = ref(0);
const mRotation = ref(0);
const eRotation = ref(0);
const cyclePos = ref(45); // Current position in the 8-8-8 cycle

const realignTime = () => {
  vRotation.value += 360;
  mRotation.value -= 360;
  eRotation.value += 180;
  alert('T.I.M.E. Realigned. Internet, Man, and Earth are Symmetrical.');
};

onMounted(() => {
  setInterval(() => {
    vRotation.value += 0.5;
    mRotation.value += 0.2;
    eRotation.value += 0.1;
  }, 50);
});
</script>

<style scoped>
.time-terminal {
  background: #000;
  color: #00e5ff;
  padding: 2.5rem;
  border: 1px solid #00e5ff;
  font-family: 'Space Mono', monospace;
  max-width: 500px;
  text-align: center;
}

.convergence-ring {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 2rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 50%;
  transition: transform 2s cubic-bezier(0.4, 0, 0.2, 1);
}

.internet {
  width: 280px;
  height: 280px;
  border-top: 2px solid #7fff00;
}
.man {
  width: 220px;
  height: 220px;
  border-right: 2px solid #00e5ff;
}
.earth {
  width: 160px;
  height: 160px;
  border-bottom: 2px solid #ff00e5;
}

.center-clock {
  z-index: 10;
}
.time-val {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
}
.hz-val {
  font-size: 0.8rem;
  color: #7fff00;
}

.cycle-bar {
  height: 40px;
  background: #111;
  margin-top: 1rem;
  position: relative;
  display: flex;
  border: 1px solid #333;
}
.phase {
  line-height: 40px;
  font-size: 0.6rem;
  font-weight: bold;
  color: #444;
}
.playhead {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: #fff;
  box-shadow: 0 0 10px #fff;
}

.sync-btn {
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: 1px solid #00e5ff;
  color: #00e5ff;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}
.sync-btn:hover {
  background: #00e5ff;
  color: #000;
}
</style>
