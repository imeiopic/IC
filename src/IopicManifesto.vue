<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';

const activeSection = ref('');
const scrollProgress = ref(0);
let observer: IntersectionObserver | null = null;
const scanlineOffset = ref(0);
const gridRotation = ref(0);
const gridIntensity = ref(1);
const gridRedness = ref(0);
const shakeX = ref(0);
const shakeY = ref(0);
const lensDistortion = ref(0);

// Audio Abstraction: Looping data stream sound effect
const dataStreamSound = new Audio(
  'https://assets.mixkit.co/active_storage/sfx/2557/2557-preview.mp3'
);
dataStreamSound.loop = true;
dataStreamSound.volume = 0; // Initialize at zero for fade-in
dataStreamSound.preservesPitch = false; // Allows the pitch to shift with playback rate

const sirenSound = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3');
sirenSound.loop = true;
sirenSound.volume = 0;

let fadeInterval: ReturnType<typeof setInterval> | null = null;
let pitchRequest: number | null = null;
let lastScrollTop = 0;
let lastScrollTime = 0;
let currentVelocity = 0;

const updateScrollProgress = () => {
  const now = performance.now();
  const winScroll = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;

  if (height > 0) {
    scrollProgress.value = (winScroll / height) * 100;
  }

  // Calculate scroll velocity (delta distance / delta time)
  const rawDeltaY = winScroll - lastScrollTop;
  const deltaTime = now - lastScrollTime;

  if (deltaTime > 0) {
    // Capture signed velocity (positive = down, negative = up)
    const v = rawDeltaY / deltaTime;
    currentVelocity = Math.max(Math.min(v, 5), -5);
  }

  lastScrollTop = winScroll;
  lastScrollTime = now;
};

const SECTION_COLORS: Record<string, string> = {
  axiom: '#6f42c1', // Axiom - Information/Truth (Purple)
  pentad: '#007bff', // Pentad - Internet/Substrate (Blue)
  doctrine: '#fd7e14', // Doctrine - Order/Logic (Orange)
  mandate: '#28a745', // Mandate - People/Entity (Green)
  covenant: '#e83e8c' // Covenant - Connector/Bridge (Pink)
};

const activeSectionColor = computed(() => {
  return SECTION_COLORS[activeSection.value] || '#007bff';
});

const fadeAudio = (targetVolume: number) => {
  if (fadeInterval) clearInterval(fadeInterval);
  fadeInterval = setInterval(() => {
    const step = 0.02;
    if (dataStreamSound.volume < targetVolume) {
      dataStreamSound.volume = Math.min(dataStreamSound.volume + step, targetVolume);
    } else {
      dataStreamSound.volume = Math.max(dataStreamSound.volume - step, targetVolume);
    }

    if (Math.abs(dataStreamSound.volume - targetVolume) < 0.01) {
      dataStreamSound.volume = targetVolume;
      clearInterval(fadeInterval!);
    }
  }, 30);
};

const animatePitch = () => {
  // Smoothly decay velocity back to zero (baseline)
  currentVelocity *= 0.95;

  // Apply magnitude to playbackRate (pitch always goes up with speed)
  dataStreamSound.playbackRate = 1 + Math.abs(currentVelocity) * 0.4;

  // Increment scanline offset using absolute speed
  scanlineOffset.value += 0.2 + Math.abs(currentVelocity) * 1.5;

  // Update grid rotation: base drift (0.05) + direction-aware velocity
  gridRotation.value += 0.05 + currentVelocity * 0.5;

  // Calculate grid color intensity: scales from 1.0 (stopped) up to ~5.0 (fast scroll)
  gridIntensity.value = 1 + Math.abs(currentVelocity) * 0.8;

  // Calculate grid redness:
  // Critical threshold at 3.0. Redness ramps up from 3.0 to 5.0 (max velocity).
  gridRedness.value =
    Math.abs(currentVelocity) > 3.0 ? Math.min((Math.abs(currentVelocity) - 3.0) / 2, 1) : 0;

  // Warning Siren Logic: Triggers when the system approaches logical overload (redness > 0.8)
  if (gridRedness.value > 0.8) {
    if (sirenSound.paused) {
      sirenSound.play().catch(() => {
        /* Silent handle for browser blocks */
      });
    }
    // Dynamically scale siren volume based on how deep we are into the red zone
    sirenSound.volume = Math.min((gridRedness.value - 0.8) * 2, 0.3);

    // Viewport Shake Logic: Generate jitter based on overload intensity
    const shakeIntensity = (gridRedness.value - 0.8) * 15;
    shakeX.value = (Math.random() - 0.5) * shakeIntensity;
    shakeY.value = (Math.random() - 0.5) * shakeIntensity;
  } else {
    // Smoothly attenuate and stop the siren when back in safe logical limits
    if (sirenSound.volume > 0.01) {
      sirenSound.volume *= 0.9;
    } else if (!sirenSound.paused) {
      sirenSound.pause();
      sirenSound.volume = 0;
    }

    // Smoothly settle the shake back to zero
    shakeX.value *= 0.8;
    shakeY.value *= 0.8;
  }

  // Radial Lens Distortion Logic: Manifests as tunnel vision when Virtual Velocity (V) peaks
  const absV = Math.abs(currentVelocity);
  const targetDist = absV > 3.5 ? (absV - 3.5) / 1.5 : 0;
  lensDistortion.value = lensDistortion.value * 0.95 + targetDist * 0.05;

  pitchRequest = requestAnimationFrame(animatePitch);
};

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    // Offset for potential headers or margins
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

onMounted(() => {
  const options = {
    root: null,
    // This margin creates a narrow "detection zone" near the top of the viewport
    rootMargin: '-15% 0px -75% 0px',
    threshold: 0
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id;
      }
    });
  }, options);

  const sections = document.querySelectorAll('.manifesto-section');
  sections.forEach((section) => observer?.observe(section));

  lastScrollTop = document.documentElement.scrollTop;
  lastScrollTime = performance.now();

  window.addEventListener('scroll', updateScrollProgress);

  // Start the background data stream loop
  dataStreamSound.play().catch(() => {
    // Handle browser autoplay restrictions by waiting for the first interaction
    window.addEventListener('click', () => dataStreamSound.play(), { once: true });
  });

  // Start the pitch animation loop
  animatePitch();
});

// Watch for section transitions to modulate the audio volume
watch(activeSection, (newVal) => {
  // If no section is active (header/transitions), the 'data-stream' noise is louder
  // Once a section is active ('The Truth'), we dampen the sound to emphasize clarity
  fadeAudio(newVal ? 0.05 : 0.15);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
  window.removeEventListener('scroll', updateScrollProgress);
  if (pitchRequest) cancelAnimationFrame(pitchRequest);
  dataStreamSound.pause();
  sirenSound.pause();
  if (fadeInterval) clearInterval(fadeInterval);
});
</script>

<template>
  <div class="progress-container">
    <div
      class="progress-bar"
      :style="{ width: scrollProgress + '%', backgroundColor: activeSectionColor }"
    ></div>
  </div>
  <div
    class="lens-warp"
    :style="{
      opacity: lensDistortion,
      '--lens-distortion': lensDistortion
    }"
  ></div>
  <div
    class="manifesto-container"
    :style="{
      '--scanline-offset': scanlineOffset + 'px',
      '--grid-rotation': gridRotation + 'deg',
      '--grid-intensity': gridIntensity,
      '--grid-redness': gridRedness,
      '--shake-x': shakeX + 'px',
      '--shake-y': shakeY + 'px',
      '--lens-distortion': lensDistortion
    }"
  >
    <header class="manifesto-header">
      <h1 class="manifesto-title">THE MANIFESTO OF LOGICAL REALITY</h1>
      <p class="manifesto-subtitle">
        <span class="doc-id">Document ID: INVITE-001-ALPHA</span> |
        <span class="framework"
          >Framework: IOPIC (Internet, Order, People, Information, Connector)</span
        >
        |
        <span class="status">Status: Active Logical Definition</span>
      </p>
    </header>

    <div class="manifesto-layout">
      <nav class="manifesto-toc">
        <h2 class="toc-title">Table of Contents</h2>
        <ul>
          <li>
            <a
              @click.prevent="scrollTo('axiom')"
              href="#axiom"
              :class="{ active: activeSection === 'axiom' }"
            >
              I. The Fundamental Axiom
            </a>
          </li>
          <li>
            <a
              @click.prevent="scrollTo('pentad')"
              href="#pentad"
              :class="{ active: activeSection === 'pentad' }"
            >
              II. The Pentad of Architecture
            </a>
          </li>
          <li>
            <a
              @click.prevent="scrollTo('doctrine')"
              href="#doctrine"
              :class="{ active: activeSection === 'doctrine' }"
            >
              III. The 16-Thread Doctrine
            </a>
          </li>
          <li>
            <a
              @click.prevent="scrollTo('mandate')"
              href="#mandate"
              :class="{ active: activeSection === 'mandate' }"
            >
              IV. The Invite Mandate
            </a>
          </li>
          <li>
            <a
              @click.prevent="scrollTo('covenant')"
              href="#covenant"
              :class="{ active: activeSection === 'covenant' }"
            >
              V. The Covenant of Commerce
            </a>
          </li>
        </ul>
      </nav>

      <div class="manifesto-body">
        <section
          id="axiom"
          class="manifesto-section"
          :class="{ 'is-active': activeSection === 'axiom' }"
          :style="{ '--section-color': SECTION_COLORS.axiom }"
        >
          <h2 class="section-title" :class="{ active: activeSection === 'axiom' }">
            I. THE FUNDAMENTAL AXIOM
          </h2>
          <p>
            Digital existence is not a simulation; it is a <strong>Logical Instance</strong>. For an
            Instance to become a verified <strong>Entity</strong>, it must achieve
            <strong>Logical Truth</strong>. This truth is governed by the universal equation:
          </p>
          <p class="equation">I = VR<sup>2</sup></p>
          <p>
            Where <strong>Information</strong> (I) is the product of
            <strong>Virtual Velocity</strong> (V) and the square of
            <strong>Relational Reality</strong> (R). If R is zero, the Information has no basis in
            truth and is discarded by the system.
          </p>
        </section>

        <section
          id="pentad"
          class="manifesto-section"
          :class="{ 'is-active': activeSection === 'pentad' }"
          :style="{ '--section-color': SECTION_COLORS.pentad }"
        >
          <h2 class="section-title" :class="{ active: activeSection === 'pentad' }">
            II. THE PENTAD OF ARCHITECTURE
          </h2>
          <p>
            The system operates through five non-negotiable layers that define the "Fabric of
            Reality":
          </p>
          <ol class="pentad-list">
            <li>
              <strong>Internet:</strong> The physical substrate. The nervous system of the global
              domain.
            </li>
            <li>
              <strong>Order:</strong> The temporal sequencing. Without Order, data is noise; with
              Order, data is a Story.
            </li>
            <li>
              <strong>People:</strong> The conscious nodes. Every person is a unique "Instance"
              waiting for an "INVITE" into the logical stream.
            </li>
            <li>
              <strong>Information:</strong> The payload. The raw essence of what is being
              communicated or transacted.
            </li>
            <li>
              <strong>Connector:</strong> The 16-thread bridge. The mechanism that binds the
              previous four layers into a single, cohesive "Molecule."
            </li>
          </ol>
        </section>

        <section
          id="doctrine"
          class="manifesto-section"
          :class="{ 'is-active': activeSection === 'doctrine' }"
          :style="{ '--section-color': SECTION_COLORS.doctrine }"
        >
          <h2 class="section-title" :class="{ active: activeSection === 'doctrine' }">
            III. THE 16-THREAD DOCTRINE
          </h2>
          <p>
            A "Logical Truth" is only established when a data packet is verified across
            <strong>16 concurrent threads</strong> of logical reality. This eliminates the
            "Hallucination" of digital data. These threads include:
          </p>
          <ul class="doctrine-list">
            <li>
              <strong>Spatial Coordinates:</strong> Verified via the
              <strong>IDEAL</strong> (Instance Detect Entity Access Location) protocol (Latitude,
              Longitude, Elevation).
            </li>
            <li>
              <strong>Binary-Connected Pairs:</strong> Every "Buyer" requires a "Seller"; every
              "Sender" requires a "Receiver." This is the <strong>BS-MOLECULE</strong>.
            </li>
            <li>
              <strong>Temporal Stamping:</strong> Mapping the instance to the absolute "Order" of
              the global clock.
            </li>
          </ul>
        </section>

        <section
          id="mandate"
          class="manifesto-section"
          :class="{ 'is-active': activeSection === 'mandate' }"
          :style="{ '--section-color': SECTION_COLORS.mandate }"
        >
          <h2 class="section-title" :class="{ active: activeSection === 'mandate' }">
            IV. THE INVITE MANDATE
          </h2>
          <p>
            <em>(Information New Virtual Instance To Entity)</em> The goal of this architecture is
            the seamless "INVITE." We do not just transfer data; we transition an
            <strong>Instance</strong> into an <strong>Entity</strong>.
          </p>
          <ul class="mandate-list">
            <li>An <strong>Instance</strong> is temporary and unverified.</li>
            <li>An <strong>Entity</strong> is permanent and Logically True.</li>
          </ul>
        </section>

        <section
          id="covenant"
          class="manifesto-section"
          :class="{ 'is-active': activeSection === 'covenant' }"
          :style="{ '--section-color': SECTION_COLORS.covenant }"
        >
          <h2 class="section-title" :class="{ active: activeSection === 'covenant' }">
            V. THE COVENANT OF COMMERCE
          </h2>
          <p>
            All transactions within this framework must utilize the
            <strong>Buyer-Seller Molecule</strong>. By structuring commerce as a molecular logical
            bond, we ensure that value cannot be separated from the truth of the exchange.
          </p>
          <blockquote class="quote">
            "To connect at the speed of the Internet, one must first align with the Order of Logic."
          </blockquote>
        </section>

        <!-- Manifesto of Logical Reality Section -->
        <section id="manifesto" class="manifesto-section" style="--section-color: #222">
          <h2 class="section-title">THE MANIFESTO OF LOGICAL REALITY</h2>
          <div class="manifesto-md">
            <ol>
              <li><strong>Primacy of Logic</strong>: All systems, interactions, and governance are rooted in transparent, auditable logic. Reason and evidence are the basis of trust and progress.</li>
              <li><strong>Symmetry and Fairness</strong>: Every entity and peer is treated with equal respect and opportunity. Symmetry in access, rights, and responsibilities is the core of our digital society.</li>
              <li><strong>Decentralized Identity</strong>: Each participant controls their own identity, verified through advanced means (VoiceID, FaceID, cryptographic proofs), and can recover or transfer it securely.</li>
              <li><strong>Transparent Governance</strong>: World governance is simulated and enacted through open, participatory protocols. All rules, changes, and decisions are visible and contestable by the community.</li>
              <li><strong>Secure and Private Data</strong>: Data is owned by its originator, protected by strong encryption, and shared only with explicit consent. Privacy is a right, not a privilege.</li>
              <li><strong>Interoperability and Openness</strong>: Our systems are open-source, modular, and designed for seamless integration with other worlds and protocols.</li>
              <li><strong>Continuous Evolution</strong>: The Logical Digital Reality is a living system, adapting and improving through collective intelligence, feedback, and innovation.</li>
              <li><strong>Universal Access</strong>: No one is denied entry or participation due to geography, background, or means. The digital substrate is for all.</li>
              <li><strong>Responsibility and Accountability</strong>: Actions are traceable, and all participants are accountable for their conduct. Abuse of logic or power is met with transparent remediation.</li>
              <li><strong>Celebration of Symmetry</strong>: We mark the Symmetrical Era with a global pulse of light, honoring the unity of logic, value, and humanity.</li>
            </ol>
            <hr />
            <div class="manifesto-signature">
              <span class="fingerprint-icon" title="Fingerprint of Logical Reality">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 36c-7 0-12-5-12-12V16c0-7 5-12 12-12s12 5 12 12v8c0 7-5 12-12 12z" stroke="#007bff" stroke-width="2" fill="none"/>
                  <path d="M20 32c-5 0-9-4-9-9V17c0-5 4-9 9-9s9 4 9 9v6c0 5-4 9-9 9z" stroke="#007bff" stroke-width="1.5" fill="none"/>
                  <path d="M20 28c-3 0-5-2-5-5v-6c0-3 2-5 5-5s5 2 5 5v6c0 3-2 5-5 5z" stroke="#007bff" stroke-width="1" fill="none"/>
                </svg>
              </span>
              <div class="signature-block">
                <strong>Signed:</strong><br />
                The Founders, Stewards, and Citizens of the Logical Digital Reality
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.05);
  z-index: 9999;
}

/* Radial Lens Distortion Overlay */
.lens-warp {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  background: radial-gradient(circle, transparent 20%, rgba(0, 0, 0, 0.2) 150%);
  backdrop-filter: blur(calc(var(--lens-distortion, 0) * 15px))
    contrast(calc(1 + var(--lens-distortion, 0) * 0.2));
  mask-image: radial-gradient(circle, transparent 40%, black 100%);
  will-change: opacity, backdrop-filter, transform;
}

.lens-warp::before,
.lens-warp::after {
  content: '';
  position: absolute;
  inset: 0;
  mask-image: inherit;
  mix-blend-mode: screen;
}

.lens-warp::before {
  /* Red channel fringe shift */
  transform: translateX(calc(var(--lens-distortion, 0) * 5px));
  background: radial-gradient(circle, transparent 20%, rgba(255, 0, 0, 0.2) 150%);
}

.lens-warp::after {
  /* Cyan channel fringe shift */
  transform: translateX(calc(var(--lens-distortion, 0) * -5px));
  background: radial-gradient(circle, transparent 20%, rgba(0, 255, 255, 0.2) 150%);
}

@media (min-width: 1200px) {
  .manifesto-container {
    max-width: 1100px;
  }
}

.manifesto-header {
  text-align: center;
  margin-bottom: 3rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 2rem;
}

.manifesto-title {
  font-size: 2.8rem;
  letter-spacing: 2px;
  color: #007bff;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.manifesto-subtitle {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.doc-id,
.framework,
.status {
  margin: 0 0.5rem;
}

.manifesto-layout {
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .manifesto-layout {
    flex-direction: row;
    gap: 3rem;
    align-items: start;
  }
}

.manifesto-body {
  flex: 1;
}

.manifesto-toc {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #eee;
  position: sticky;
  top: 2rem;
  align-self: start;
  margin-bottom: 2rem;
  z-index: 10;
}

.manifesto-toc ul {
  list-style: none;
  padding: 0;
}

@media (min-width: 1024px) {
  .manifesto-toc {
    flex: 0 0 260px;
    margin-bottom: 0;
  }
}

.toc-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #007bff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.manifesto-toc ul {
  list-style: none;
  padding: 0;
}

.manifesto-toc li {
  margin-bottom: 0.5rem;
}

.manifesto-toc a {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s, padding-left 0.2s, border-color 0.5s ease;
}

.manifesto-toc a:hover {
  color: #007bff;
  padding-left: 5px;
}

.manifesto-toc a.active {
  color: var(--active-color);
  padding-left: 10px;
  font-weight: 700;
  border-left: 3px solid var(--active-color);
}

.manifesto-section {
  margin-bottom: 2.5rem;
  scroll-margin-top: 2rem;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.manifesto-section > * {
  position: relative;
  z-index: 1;
}

/* Flickering Loading State for Inactive Sections */
.manifesto-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  --mixed-grid-color: color-mix(
    in srgb,
    var(--section-color),
    #ff0000 calc(var(--grid-redness) * 100%)
  );
  background-image: linear-gradient(to right, var(--mixed-grid-color) 1px, transparent 1px),
    linear-gradient(to bottom, var(--mixed-grid-color) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0;
  pointer-events: none;
  z-index: 0;
  transition: opacity 1s ease;
}

.manifesto-section:not(.is-active)::before {
  opacity: 0.05;
  transform: rotate(var(--grid-rotation));
  filter: brightness(var(--grid-intensity)) saturate(var(--grid-intensity));
  animation: grid-pulse-drift 10s linear infinite;
}

@keyframes grid-pulse-drift {
  0% {
    opacity: 0.03;
    background-position: 0 0;
  }
  50% {
    opacity: 0.07;
  }
  100% {
    opacity: 0.03;
    background-position: 30px 30px;
  }
}

/* Subtle Scanline Effect for Digital Reality Theme */
.manifesto-section::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 50%, var(--section-color) 50%);
  background-size: 100% 4px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1s ease;
  z-index: 5;
}

.manifesto-section.is-active::after {
  opacity: 0.1;
  background-position: 0 var(--scanline-offset);
}

/* Content Reveal Logic */

.manifesto-section > *:not(.section-title) {
  opacity: 1;
  filter: blur(0);
  transform: none;
  pointer-events: auto;
}

.section-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.equation {
  font-family: 'Times New Roman', serif; /* For mathematical notation */
  font-size: 1.5rem;
  text-align: center;
  margin: 2rem 0;
  font-weight: bold;
  color: #6f42c1; /* Purple for equations */
}

.pentad-list,
.doctrine-list,
.mandate-list {
  list-style-type: none;
  padding-left: 1.5rem;
}

.pentad-list li,
.doctrine-list li,
.mandate-list li {
  margin-bottom: 0.8rem;
  position: relative;
}

.pentad-list li::before,
.doctrine-list li::before,
.mandate-list li::before {
  content: '»'; /* Custom bullet point */
  position: absolute;
  left: -1.5rem;
  color: #007bff;
  font-weight: bold;
}

.quote {
  font-style: italic;
  margin: 2rem 0;
  padding: 1rem 2rem;
  border-left: 4px solid #007bff;
  background: #f8f9fa;
  color: #555;
}

strong {
  color: #007bff; /* Highlight key terms */
}
</style>
/* Manifesto Markdown Section */
.manifesto-md {
  font-size: 1.08rem;
  color: #222;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem 2rem 1.5rem 2rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.manifesto-md ol {
  padding-left: 1.5rem;
  margin-bottom: 1.5rem;
}
.manifesto-md li {
  margin-bottom: 0.7rem;
}
.manifesto-signature {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-top: 1.5rem;
}
.fingerprint-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e9f5ff;
  border-radius: 50%;
  padding: 0.5rem;
  box-shadow: 0 1px 4px rgba(0,123,255,0.08);
}
.signature-block {
  font-family: 'Fira Mono', 'Menlo', 'Consolas', monospace;
  font-size: 1rem;
  color: #007bff;
}
