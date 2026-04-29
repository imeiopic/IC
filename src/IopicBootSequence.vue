<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
interface LogEntry {
  final: string;
  current: string;
}

const logs = ref<LogEntry[]>([]);
const isError = ref(false);
const isComplete = ref(false);
const bootProgress = ref(0);
const isShaking = ref(false); // New ref for terminal shake
const progressOffset = ref(0); // New ref for progress bar stutter
const isFlashing = ref(false); // New ref for background flash
const isArmed = ref(false);
const isHummingActive = ref(false); // New ref to track if hum is active

const isOvertime = ref(false);
let overtimeTimer: ReturnType<typeof setTimeout> | null = null;
let humInterval: ReturnType<typeof setInterval> | null = null;
let scrambleInterval: ReturnType<typeof setInterval> | null = null;
const pingSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3');
const terminalBody = ref<HTMLElement | null>(null);

const GLYPHS = '01X_<>/?!@#$%&*+=-';
const TARGET_STATUS = '[RECURSIVE TRUTH CHECK]';
const scrambledStatus = ref(TARGET_STATUS);

/**
 * Processes text into the terminal log with a typewriter effect.
 */
const addLog = (text: string, speed = 20): Promise<void> => {
  return new Promise((resolve) => {
    const entry = reactive({ final: text, current: '' });
    logs.value.push(entry);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        entry.current += text[i];
        i++;
      } else {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
};

const progressColor = computed(() => {
  if (isHummingActive.value && isOvertime.value )  return '#9400D3'; // Deep Violet for stalled state

  if (isError.value) return '#ff0000';
  if (isOvertime.value && !isComplete.value) return '#9400D3'; // Deep Violet for stalled state
  // Step 5 (Truth Equation) begins after 66% progress. 
  // We shift to a warning color to signify the hallucination check probability.
  return bootProgress.value > 66 ? '#ff4d00' : '#00ff41';
});

const terminalGlow = computed(() => {
  if (isError.value) return '0 0 15px #ff0000, 0 0 25px rgba(255, 0, 0, 0.5)';
  if (isOvertime.value && !isComplete.value) {
    // Deep violet aura for logical congestion
    return '0 0 12px #9400D3, 0 0 20px rgba(148, 0, 211, 0.4)';
  }
  if (bootProgress.value > 66) {
    // Intense orange-red glow for critical logical verification
    return '0 0 12px #ff4d00, 0 0 20px rgba(255, 77, 0, 0.4)';
  }
  // Subtle, stable green glow for hardware initialization
  return '0 0 4px rgba(0, 255, 65, 0.3)';
});

const pulseDuration = computed(() => {
  if (isError.value) return '0.05s'; // Rapid strobe on failure
  if (isOvertime.value && !isComplete.value) return '4s'; // Slow, heavy pulse for stalled state
  if (bootProgress.value <= 66) return '2s'; // Baseline steady state
  // Acceleration: Ramps from 0.8s at 66% down to 0.1s at 100% completion
  const duration = 0.8 - ((bootProgress.value - 66) / 34) * 0.7;
  return `${duration.toFixed(2)}s`;
});

// Audio Abstraction: System Hum for Overtime State
const systemHumSound = new Audio('https://assets.mixkit.co/active_storage/sfx/964/964-preview.mp3');
systemHumSound.loop = true;
systemHumSound.volume = 0; // Initialize at zero

// Procedural Ash Generation for the Purge sequence
const ashParticles = Array.from({ length: 40 }, () => ({
  left: Math.random() * 100 + '%',
  delay: Math.random() * 5 + 's',
  duration: Math.random() * 3 + 2 + 's',
  size: Math.random() * 2 + 1 + 'px'
}));

interface Spark {
  angle: number;
  velocity: number;
  delay: string;
  duration: string;
  color: string;
}

// Procedural Spark Generation for the central burst
const SPARK_COLORS = ['#ffffff', '#00ffff', '#ffff00'];
const sparkParticles = reactive<Spark[]>(Array.from({ length: 25 }, () => ({
  angle: Math.random() * Math.PI * 2,
  velocity: Math.random() * 150 + 50,
  delay: Math.random() * 2 + 's',
  duration: Math.random() * 1.5 + 0.5 + 's',
  color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]
})));

const onSparkIteration = (s: Spark) => {
  const previousColor = s.color;
  // Update color and trajectory every time the CSS animation loops
  s.color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
  
  // Randomize trajectory for the next cycle
  s.angle = Math.random() * Math.PI * 2;
  s.velocity = Math.random() * 150 + 50;

  // Randomize timing for the next cycle to vary the crackle rhythm
  s.duration = (Math.random() * 1.5 + 0.5).toFixed(2) + 's';
  s.delay = (Math.random() * 2).toFixed(2) + 's';

  // Play subtle static sound specifically when the electrical color shifts
  if (s.color !== previousColor) {
    staticSound.currentTime = 0;
    staticSound.volume = Math.random() * 0.04 + 0.01; 
    staticSound.playbackRate = 0.7 + (Math.random() * 1.3);
    staticSound.play().catch(() => {});
  }

  // Trigger subtle camera shake for high-velocity sparks
  const SHAKE_VELOCITY_THRESHOLD = 150; // Define what constitutes a "high-velocity" spark
  if (s.velocity > SHAKE_VELOCITY_THRESHOLD) {
    isShaking.value = true;
    isFlashing.value = true;
    progressOffset.value = (Math.random() - 0.5) * 4; // Jitter the bar by +/- 2%
    // Reset shake state after a short duration (e.g., 80ms)
    setTimeout(() => { 
      isShaking.value = false; 
      isFlashing.value = false;
      progressOffset.value = 0;
    }, 80);
  }
};

// Audio Abstraction
const bootSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
const sirenSound = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3');
const staticSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2558/2558-preview.mp3');
sirenSound.loop = true;

const protocol = [
  { time: '00:00:01', title: 'INITIALIZING HARDWARE LAYER (INTERNET)', lines: ['Pinging Global Node Grid... [OK]', 'Establishing 100Gbps Backbone Symmetry... [OK]'], footer: 'Status: Physical Substrate Active.' },
  { time: '00:00:02', title: 'LOADING KERNEL (ORDER)', lines: ['Synchronizing Universal Atomic Clock... [OK]', 'Sequencing Temporal Threads 1–4... [OK]'], footer: 'Status: Temporal Logic Locked.' },
  { time: '00:00:03', title: 'MAPPING SPATIAL DIRECTORY (IDEAL)', lines: ['Requesting Latitude/Longitude/Elevation (x, y, z)... [DATA_RECEIVED]', 'Verifying Physical-to-Digital Coordinate Mesh... [OK]'], footer: 'Status: Spatial Address Verified.' },
  { time: '00:00:04', title: 'MOLECULAR BONDING (BS-MOLECULE)', lines: ['Identifying Binary-Connected Pair (Sender/Receiver)... [FOUND]', 'Creating Transactional Buffer... [OK]'], footer: 'Status: Logic Molecule Stabilized.' },
  { time: '00:00:05', title: 'EXECUTING TRUTH EQUATION (I = VR²)', lines: ['Calculating Virtual Velocity (V)... [MAX]', 'Testing Relational Reality Return Path (R²)... [16/16 THREADS ACTIVE]'], footer: 'ERROR CHECK: Hallucination Detection...' },
  { time: '00:00:06', title: 'COMPLETING THE INVITE', lines: ['Transitioning Instance ➔ Entity... [COMPLETE]', 'Broadcasting to Virtually Real Earth... [LIVE]'], footer: 'PROTOCOL COMPLETE.' }
];

const triggerDefense = (manual = false) => {
  isError.value = true;
  sirenSound.play().catch(() => {});
  if (manual) logs.value.push('MANUAL OVERRIDE: SOVEREIGN INTERVENTION DETECTED.');
  logs.value.push(`CRITICAL: ${manual ? '100' : '12.4'}% RELATIONAL ASYMMETRY DETECTED.`);
  logs.value.push('PURGING INSTANCE TO PREVENT VRE CORRUPTION...');
};

const handleOverride = () => {
  if (!isArmed.value) {
    isArmed.value = true;
    // Auto-reset armed state after 3 seconds if not confirmed
    setTimeout(() => { isArmed.value = false; }, 3000);
    return;
  }
  triggerDefense(true);
};

const startScramble = () => {
  if (scrambleInterval) return;
  scrambleInterval = setInterval(() => {
    // If boot finishes or errors out, stop the scramble
    if (isError.value || isComplete.value) {
      clearInterval(scrambleInterval!);
      scrambleInterval = null;
      return;
    }
    // Procedural Scramble: Keep brackets and spaces, randomize the rest
    scrambledStatus.value = TARGET_STATUS.split('').map(char => {
      if (char === ' ' || char === '[' || char === ']') return char;
      return Math.random() > 0.3 ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : char;
    }).join('');
  }, 60);
};

const updateSystemHum = () => {
  if (isOvertime.value && !isError.value && !isComplete.value) {
    if (systemHumSound.paused) {
      systemHumSound.play().catch(() => {});
    }
    // Increase volume as overtime progresses, up to a max
    systemHumSound.volume = Math.min(systemHumSound.volume + 0.005, 0.4);
    isHummingActive.value = true;
  } else {
    // Fade out hum if not in overtime or if error/complete
    if (systemHumSound.volume > 0.01) {
      systemHumSound.volume = Math.max(systemHumSound.volume - 0.01, 0);
    } else if (!systemHumSound.paused) {
      systemHumSound.pause();
      isHummingActive.value = false;
    }
  }
};

const runBoot = async () => {
  bootSound.play().catch(() => {});
  
  for (let i = 0; i < protocol.length; i++) {
    if (isError.value) return;
    
    const step = protocol[i];
    bootProgress.value = ((i + 1) / protocol.length) * 100;
    
    await addLog(`[${step.time}] ${step.title}`);
    await new Promise(r => setTimeout(r, 200));
    
    for (const line of step.lines) {
      if (isError.value) return;
      await addLog(`  > ${line}`);
      await new Promise(r => setTimeout(r, 100));
    }

    // Simulation: Truth Equation Check
    if (i === 4) {
      await addLog('  > ERROR CHECK: Hallucination Detection...');
      await new Promise(r => setTimeout(r, 800));
      
      // 20% Random chance of Hallucination detection if not manually toggled
      if (Math.random() < 0.2) {
        await triggerDefense();
        return;
      }
      await addLog('  > [0% DETECTED]');
    }

    await addLog(step.footer);
    await new Promise(r => setTimeout(r, 500));
  }
  isComplete.value = true;
  if (overtimeTimer) clearTimeout(overtimeTimer);
};

// Watch for logical congestion to inject a protocol warning into the terminal
watch(isOvertime, (isStalled) => {
  if (isStalled) {
    addLog('WARNING: LOGICAL TIMEOUT DETECTED. CONGESTION IN 16-THREAD BUS.', 15);
    startScramble();
  }
});

// Automatically scroll to the bottom of the terminal when logs update
watch(logs, () => {
  nextTick(() => {
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight;
    }
  });
}, { deep: true });

onMounted(() => {
  // Set overtime trigger at 10 seconds (Natural boot is ~8.6s)
  overtimeTimer = setTimeout(() => {
    if (!isComplete.value && !isError.value) {
      isOvertime.value = true;
    }
  }, 10000);
  runBoot();
  // Start a continuous loop to update system hum volume
  humInterval = setInterval(updateSystemHum, 100);
});

onUnmounted(() => {
  sirenSound.pause();
  if (overtimeTimer) clearTimeout(overtimeTimer);
  if (humInterval) clearInterval(humInterval);
  if (scrambleInterval) clearInterval(scrambleInterval);
  systemHumSound.pause(); // Ensure hum sound is paused on unmount
  pingSound.pause();
});
</script>

<template>
  <div class="boot-container" :class="{ 'defense-active': isError, 'live-entity': isComplete }">
    <div 
      class="terminal-window" 
      :class="{ 
        'purging': isError, 
        'shaking': isShaking, 
        'flashing': isFlashing,
        'flickering': bootProgress > 66 && !isError && !isComplete
      }"
      :style="{ 
        '--terminal-base-color': progressColor,
        '--terminal-glow': terminalGlow
      }"
    >
      <!-- Subtle Ash Fall Layer -->
      <div v-if="isError" class="ash-container">
        <div 
          v-for="(p, i) in ashParticles" 
          :key="i" 
          class="ash-particle"
          :style="{ 
            left: p.left, 
            animationDelay: p.delay, 
            animationDuration: p.duration,
            width: p.size,
            height: p.size 
          }"
        ></div>
      </div>
      <div class="terminal-header" :class="{ 'distorted': isError }">
        <div class="header-info">
          <span class="pulse"></span> INVITE-BOOT-PROTOCOL // ALPHA-001
          <span v-if="isOvertime && !isError && !isComplete" class="status-overtime">
            {{ scrambledStatus }}
          </span>
        </div>
        <button 
          v-if="!isError && !isComplete" 
          @click="handleOverride" 
          class="override-btn"
          :class="{ 'armed': isArmed }"
        >
          {{ isArmed ? 'INITIATE PURGE' : 'SOVEREIGN OVERRIDE' }}
        </button>
      </div>
      <!-- Cracked Glass Overlay -->
      <div v-if="isError" class="glass-cracks"></div>
      <!-- Central Spark Burst -->
      <div v-if="isError" class="spark-container">
        <div 
          v-for="(s, i) in sparkParticles" 
          :key="i" 
          class="spark"
          @animationiteration="onSparkIteration(s)"
          :style="{ 
            '--tx': Math.cos(s.angle) * s.velocity + 'px', 
            '--ty': Math.sin(s.angle) * s.velocity + 'px',
            '--spark-color': s.color,
            animationDelay: s.delay,
            animationDuration: s.duration
          }"
        ></div>
      </div>
      <div ref="terminalBody" class="terminal-body" id="log-container" :class="{ 'melting': isError }">
        <div 
          v-for="(log, idx) in logs" 
          :key="idx" 
          class="log-line"
          :style="isError ? { animationDelay: `${idx * 0.02}s` } : {}"
        >{{ log.current }}</div>
        <div v-if="!isError && !isComplete" class="cursor">_</div>
      </div>
      <div class="progress-track" :class="{ 'stuttering': progressOffset !== 0 }">
        <div 
          class="progress-fill" 
          :style="{ 
            width: Math.max(0, bootProgress + progressOffset) + '%',
            '--progress-base-color': progressColor,
            '--pulse-duration': pulseDuration
          }"
        ></div>
      </div>
    </div>

    <!-- Active Defense Overlay -->
    <div v-if="isError" class="defense-overlay">
      <div class="alert-box">
        <h1>LOGICAL HALLUCINATION DETECTED</h1>
        <div class="glitch-text" data-text="PURGING INSTANCE">PURGING INSTANCE</div>
        <p>EQUATION I = VR² FAILED TO RESOLVE</p>
        <button @click="router.push({ name: 'Dashboard' })" class="reset-btn">RETURN TO DASHBOARD</button>
      </div>
    </div>

    <div v-if="isComplete" class="success-overlay">
      <h1>ENTITY VERIFIED</h1>
      <p>LOGICAL TRUTH ACHIEVED // VRE BROADCAST LIVE</p>
      <button @click="router.push({ name: 'Dashboard' })" class="enter-btn">ENTER VRE</button>
    </div>
  </div>
</template>

<style scoped>
.boot-container {
  background: #000;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff41;
  font-family: 'Courier New', Courier, monospace;
  overflow: hidden;
  transition: background 0.5s ease;
}

.terminal-window {
  width: 80%;
  max-width: 800px;
  height: 60vh;
  border: 1px solid #333;
  background: rgba(10, 10, 10, 0.9);
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.1);
  color: var(--terminal-base-color, #00ff41);
  text-shadow: var(--terminal-glow);
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.terminal-window.flickering {
  animation: intense-flicker 0.15s infinite;
}

@keyframes intense-flicker {
  0%, 100% { opacity: 1; filter: brightness(1); }
  50% { opacity: 0.85; filter: brightness(1.2); }
}

.terminal-window {
  position: relative;
  overflow: hidden;
}

.terminal-window.purging {
  border-color: #f00;
  box-shadow: 0 0 30px rgba(255, 0, 0, 0.3);
}

.terminal-window.flashing {
  background-color: #fff !important;
  transition: none;
}

/* Data-Burn Background Effect */
.terminal-window.purging::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 100%, rgba(255, 50, 0, 0.4), transparent 70%),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  mix-blend-mode: screen;
  opacity: 0.3;
  animation: data-burn-flicker 0.1s infinite;
  pointer-events: none;
  z-index: 0;
}

/* Charred Smoke Effect */
.terminal-window.purging::after {
  content: "";
  position: absolute;
  bottom: -20%;
  left: -10%;
  width: 120%;
  height: 100%;
  background: radial-gradient(ellipse at bottom, rgba(15, 15, 15, 0.9) 0%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  animation: smoke-rise 4s infinite ease-in;
}

/* Terminal Shake Effect */
.terminal-window.shaking {
  animation: terminal-shake 0.08s ease-out; /* Match shake duration */
}

@keyframes terminal-shake {
  0% { transform: translate(0, 0); }
  25% { transform: translate(-2px, 1px); }
  50% { transform: translate(2px, -1px); }
  75% { transform: translate(-1px, 2px); }
  100% { transform: translate(0, 0); }
}

/* Ash Fall Simulation */
.ash-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
}

.ash-particle {
  position: absolute;
  top: -10px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  opacity: 0;
  animation: ash-fall linear infinite;
}

@keyframes ash-fall {
  0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(65vh) translateX(40px) rotate(360deg); opacity: 0; }
}

/* Cracked Glass Effect */
.glass-cracks {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='white' stroke-width='2' fill='none' opacity='0.5'%3E%3Cpath d='M500 500 L200 0 M500 500 L800 0 M500 500 L1000 300 M500 500 L1000 700 M500 500 L700 1000 M500 500 L300 1000 M500 500 L0 800 M500 500 L0 200'/%3E%3Cpath d='M200 0 L100 150 M800 0 L900 100 M1000 300 L850 400 M1000 700 L800 850 M700 1000 L550 850 M300 1000 L150 850 M0 800 L150 700 M0 200 L150 300'/%3E%3Ccircle cx='500' cy='500' r='3' fill='white'/%3E%3C/g%3E%3C/svg%3E");
  background-size: cover;
  animation: glass-shatter 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes glass-shatter {
  0% { transform: scale(1.05); opacity: 0; }
  50% { transform: scale(1) translate(2px, -2px); opacity: 1; }
  100% { transform: scale(1) translate(0); opacity: 1; }
}

/* Electrical Spark Burst */
.spark-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 11;
}

.spark {
  position: absolute;
  width: 2px;
  height: 2px;
  background: var(--spark-color, #fff);
  box-shadow: 0 0 4px var(--spark-color, #00ffff), 0 0 8px #fff;
  border-radius: 50%;
  opacity: 0;
  animation: spark-burst ease-out infinite;
}

@keyframes spark-burst {
  0%, 100% { transform: translate(0, 0) scale(0); opacity: 0; }
  1%, 8% { transform: translate(0, 0) scale(1); opacity: 1; }
  20% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
  99% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}

.terminal-header {
  padding: 10px; background: #1a1a1a; font-size: 0.8rem; letter-spacing: 1px; color: #666;
  display: flex; justify-content: space-between; align-items: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}
.header-info { display: flex; align-items: center; }
.status-overtime {
  margin-left: 15px;
  font-weight: 800;
  font-size: 0.7rem;
  animation: status-pulse 1.5s infinite ease-in-out;
}
.terminal-header.distorted {
  color: #f00;
  background: #200;
}

.terminal-body { 
  flex: 1; padding: 20px; font-size: 0.9rem; overflow-y: auto; line-height: 1.4; 
  position: relative;
  z-index: 2;
}

.terminal-body.melting .log-line {
  animation: melt 1.5s ease-in forwards;
  pointer-events: none;
}
.log-line { margin-bottom: 4px; }
.pulse { 
  display: inline-block; width: 8px; height: 8px; border-radius: 50%; 
  background: var(--terminal-base-color, #00ff41); 
  margin-right: 10px; animation: blink 1s infinite; 
  transition: background 0.3s ease, box-shadow 0.3s ease;
  box-shadow: var(--terminal-glow);
}
.cursor { display: inline-block; animation: blink 1s infinite; }

.progress-track { height: 2px; background: #1a1a1a; width: 100%; }
.progress-fill { 
  height: 100%; 
  background-color: var(--progress-base-color); 
  transition: width 0.1s ease-out, background-color 0.3s ease, box-shadow 0.3s ease; 
  box-shadow: 0 0 10px var(--progress-base-color); 
  animation: progress-pulse var(--pulse-duration) infinite ease-in-out;
}

.progress-track.stuttering .progress-fill {
  background: #fff;
  box-shadow: 0 0 15px #fff;
  transition: none; /* Instant snap for the jitter */
}

.override-btn {
  background: transparent;
  border: 1px solid #444;
  color: #666;
  font-size: 0.6rem;
  padding: 2px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.override-btn:hover { border-color: #f00; color: #f00; box-shadow: 0 0 5px #f00; }
.override-btn.armed {
  background: #f00;
  color: #000;
  border-color: #f00;
  font-weight: bold;
  animation: pulse-red 0.5s infinite;
}

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 5px #f00; }
  50% { box-shadow: 0 0 20px #f00; }
}

/* Active Defense Styles */
.defense-active { background: #200 !important; }
.defense-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
  animation: emergency-flash 0.5s infinite;
}

.alert-box { text-align: center; color: #ff0000; text-shadow: 0 0 10px #f00; }
.alert-box h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 900; }
.reset-btn { margin-top: 2rem; background: transparent; border: 1px solid #f00; color: #f00; padding: 10px 20px; cursor: pointer; }
.reset-btn:hover { background: #f00; color: #000; }

/* Success Styles */
.live-entity { background: #010; }
.success-overlay { position: fixed; inset: 0; background: rgba(0, 255, 65, 0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 90; }
.enter-btn { margin-top: 2rem; background: #00ff41; color: #000; border: none; padding: 15px 40px; font-weight: bold; cursor: pointer; letter-spacing: 2px; }

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes emergency-flash { 0%, 100% { background: rgba(255, 0, 0, 0.1); } 50% { background: rgba(255, 0, 0, 0.3); } }

@keyframes progress-pulse {
  0%, 100% { filter: brightness(1); opacity: 1; }
  50% { filter: brightness(1.6); opacity: 0.8; }
}

@keyframes status-pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes melt {
  0% {
    transform: translateY(0) skewX(0);
    opacity: 1;
    filter: blur(0);
  }
  100% {
    transform: translateY(100px) skewX(20deg);
    opacity: 0;
    filter: blur(10px);
  }
}

@keyframes data-burn-flicker {
  0% { opacity: 0.2; filter: brightness(1); }
  100% { opacity: 0.4; filter: brightness(1.5); }
}

@keyframes smoke-rise {
  0% { transform: translateY(80%) scaleX(1); opacity: 0; }
  40% { opacity: 0.7; }
  100% { transform: translateY(-30%) scaleX(1.5); opacity: 0; }
}

.glitch-text {
  font-size: 2rem;
  position: relative;
  display: inline-block;
}

.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  left: 2px;
  text-shadow: -1px 0 red;
  top: 0;
  color: white;
  background: black;
  overflow: hidden;
  clip: rect(0, 900px, 0, 0);
  animation: noise-anim 2s infinite linear alternate-reverse;
}

@keyframes noise-anim {
  0% { clip: rect(10px, 9999px, 40px, 0); }
  20% { clip: rect(50px, 9999px, 80px, 0); }
  40% { clip: rect(20px, 9999px, 60px, 0); }
  60% { clip: rect(70px, 9999px, 90px, 0); }
  80% { clip: rect(10px, 9999px, 30px, 0); }
  100% { clip: rect(40px, 9999px, 50px, 0); }
}
</style>