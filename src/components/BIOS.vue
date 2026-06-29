<template>
  <div class="bios-card">
    <div class="crt-overlay"></div>
    <button v-if="activeSection !== 'done'" @click="skipSequence" class="skip-button">SKIP_INIT</button>

    <h2 class="bios-title">
      <span class="typed-text">{{ display.title }}</span><span v-if="activeSection === 'title'" class="cursor">_</span>
    </h2>

    <div class="bios-metadata">
      <span class="typed-text">{{ display.metadata }}</span><span v-if="activeSection === 'metadata'" class="cursor">_</span>
    </div>

    <div v-if="reveal.section1" class="section">
      <h3>{{ display.s1Title }}<span v-if="activeSection === 's1Title'" class="cursor">_</span></h3>
      <p v-if="display.s1p1">{{ display.s1p1 }}<span v-if="activeSection === 's1p1'" class="cursor">_</span></p>
      <p v-if="display.s1p2">{{ display.s1p2 }}<span v-if="activeSection === 's1p2'" class="cursor">_</span></p>
    </div>

    <div v-if="reveal.section2" class="section">
      <h3>{{ display.s2Title }}<span v-if="activeSection === 's2Title'" class="cursor">_</span></h3>
      <p v-if="display.s2p1">{{ display.s2p1 }}<span v-if="activeSection === 's2p1'" class="cursor">_</span></p>
      <p v-if="display.s2p2">{{ display.s2p2 }}<span v-if="activeSection === 's2p2'" class="cursor">_</span></p>
    </div>

    <div v-if="reveal.section3" class="section">
      <h3>{{ display.s3Title }}<span v-if="activeSection === 's3Title'" class="cursor">_</span></h3>
      <p v-if="display.s3p1">{{ display.s3p1 }}<span v-if="activeSection === 's3p1'" class="cursor">_</span></p>
      <p v-if="display.s3p2">{{ display.s3p2 }}<span v-if="activeSection === 's3p2'" class="cursor">_</span></p>
    </div>

    <div v-if="reveal.signature" class="bios-signature">
      <p><em>{{ display.signature }}</em><span v-if="activeSection === 'signature'" class="cursor">_</span></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, reactive } from 'vue';

interface Props {
  version?: string;
  nodeName?: string;
  lastBoot?: string | number | Date;
}

const props = withDefaults(defineProps<Props>(), {
  version: '1.0.0_STABLE',
  nodeName: 'IOPIC_VRE_CORE',
  lastBoot: () => new Date()
});

const formattedBootTime = computed(() => {
  return new Date(props.lastBoot).toISOString().replace('T', ' ').slice(0, 19);
});

// Typing logic state
const activeSection = ref('title');
const reveal = reactive({
  section1: false,
  section2: false,
  section3: false,
  signature: false
});

const display = reactive({
  title: '',
  metadata: '',
  s1Title: '',
  s1p1: '',
  s1p2: '',
  s2Title: '',
  s2p1: '',
  s2p2: '',
  s3Title: '',
  s3p1: '',
  s3p2: '',
  signature: ''
});

// Audio Logic
const typeSound = typeof Audio !== 'undefined' ? new Audio('/audio/kb_click.mp3') : null;
const bootSound = typeof Audio !== 'undefined' ? new Audio('/audio/system_boot.mp3') : null;

const playTrigger = (audio: HTMLAudioElement | null, vol = 0.1) => {
  if (!audio) return;
  audio.volume = vol;
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Silently handle autoplay blocks
  });
};

const isSkipping = ref(false);
let activeInterval: ReturnType<typeof setInterval> | null = null;

const skipSequence = () => {
  isSkipping.value = true;
  reveal.section1 = true;
  reveal.section2 = true;
  reveal.section3 = true;
  reveal.signature = true;
};

const typeWriter = (text: string, key: keyof typeof display, speed = 20) => {
  if (isSkipping.value) {
    display[key] = text;
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    // Store reject to handle unmounts
    const cleanup = () => {
      if (activeInterval) clearInterval(activeInterval);
      resolve();
    };

    activeSection.value = key;
    let i = 0;
    activeInterval = setInterval(() => {
      if (isSkipping.value) {
        display[key] = text;
        cleanup();
        return;
      }

      if (i < text.length) {
        display[key] += text.charAt(i);
        // Play sound for visible characters
        if (text.charAt(i) !== ' ') playTrigger(typeSound, 0.05);
        i++;
      } else {
        cleanup();
      }
    }, speed);
  });
};

onUnmounted(() => {
  if (activeInterval) clearInterval(activeInterval);
});

onMounted(async () => {
  // Start Sequence
  playTrigger(bootSound, 0.2);
  await typeWriter(`BIOS: ${props.nodeName}`, 'title', 40);
  
  const metaStr = `KERNEL_REV: ${props.version} | STATUS: OPERATIONAL | BOOT_TIMESTAMP: ${formattedBootTime.value}`;
  await typeWriter(metaStr, 'metadata', 15);

  // Section 1
  reveal.section1 = true;
  await typeWriter('Foundational Protocols', 's1Title', 30);
  await typeWriter('The BIOS (Binary Input/Output System) represents the core foundational protocols that initiate and manage the fundamental operations within the Virtually Real Earth (VRE).', 's1p1', 10);
  await typeWriter('It ensures the integrity and functionality of the 16-Thread Fabric from the ground up, establishing the initial handshake for all entities.', 's1p2', 10);

  // Section 2
  reveal.section2 = true;
  await typeWriter('System Initialization', 's2Title', 30);
  await typeWriter('Upon activation, the BIOS performs critical system checks and initializes the essential components required for an IOist to operate within T.I.M.E.', 's2p1', 10);
  await typeWriter('This includes verifying identity, establishing secure communication channels, and preparing the environment for Binary-Connected Pairs (BS-Molecules).', 's2p2', 10);

  // Section 3
  reveal.section3 = true;
  await typeWriter('Interoperability & Control', 's3Title', 30);
  await typeWriter('The BIOS provides the low-level interface for all high-level operations, ensuring seamless interoperability between diverse IOist systems and external networks.', 's3p1', 10);
  await typeWriter('It acts as the primary control layer, safeguarding the integrity of streamed IO (Information/Order) and maintaining the stability of planetary velocity and equity.', 's3p2', 10);

  // Signature
  reveal.signature = true;
  await typeWriter('"Booting the Fabric, Anchoring Reality."', 'signature', 50);
  
  activeSection.value = 'done';
});
</script>

<style scoped>
.bios-card {
  font-family: theme('fontFamily.terminal'), monospace;
  background-color: #0a0a0a; /* Dark background for a system feel */
  border: 2px solid #00e5ff; /* Neon blue border */
  border-radius: 10px;
  padding: 25px;
  margin: 20px auto;
  max-width: 800px;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4); /* Glowing effect */
  color: #00e5ff; /* Neon blue text */
  position: relative;
  overflow: hidden;
}

.crt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), 
              linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
  background-size: 100% 3px, 2px 100%;
  pointer-events: none;
  z-index: 10;
  animation: flicker 0.1s infinite;
}

/* SKIP BUTTON */
.skip-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: 1px solid #00e5ff;
  color: #00e5ff;
  font-family: inherit;
  font-size: 0.65rem;
  padding: 4px 10px;
  cursor: pointer;
  z-index: 20;
  letter-spacing: 1px;
  text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
  transition: all 0.2s;
}

.skip-button:hover {
  background: rgba(0, 229, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}

@keyframes flicker {
  0% { opacity: 0.97; }
  100% { opacity: 1; }
}

.bios-title {
  text-align: center;
  color: #00e5ff;
  font-size: 2em;
  margin-bottom: 25px;
  border-bottom: 2px solid #00e5ff;
  padding-bottom: 15px;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.7);
}

.bios-metadata {
  text-align: center;
  font-size: 0.75rem;
  margin-bottom: 25px;
  letter-spacing: 2px;
}

.section {
  margin-bottom: 20px;
  padding-left: 15px;
  border-left: 3px solid #00e5ff;
}

.cursor {
  display: inline-block;
  background-color: #00e5ff;
  width: 10px;
  height: 1.2em;
  margin-left: 4px;
  vertical-align: middle;
  animation: blink 1s step-end infinite;
}

@keyframes blink { 50% { opacity: 0; } }

.section h3 {
  color: #00e5ff;
  font-size: 1.4em;
  margin-top: 0;
  margin-bottom: 10px;
}

.section p {
  line-height: 1.6;
  margin-bottom: 8px;
  color: #b3f0ff; /* Lighter blue for readability */
}

.section strong {
  color: #fff;
  font-weight: bold;
}

.bios-signature {
  text-align: center;
  margin-top: 30px;
  font-size: 1.1em;
  color: #00e5ff;
  font-style: italic;
  text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .bios-card {
    padding: 15px;
    margin: 15px;
  }
  .bios-title {
    font-size: 1.6em;
  }
  .section h3 {
    font-size: 1.2em;
  }
}
</style>