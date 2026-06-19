<template>
  <!-- Encapsulated layers for the 3D scene and its reactive manifestation background -->
  <div ref="manifestationLayer" class="bg-layer bg-manifestation"></div>
  <div ref="mobiusContainer" class="bg-layer mobius-canvas-container"></div>
  <div ref="frequencyOverlay" class="frequency-overlay"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const props = defineProps<{
  isZooming: boolean;
  isAcknowledged: boolean;
  parity: 'PHYSICAL' | 'DIGITAL' | 'CHAOS' | 'UNKNOWN';
}>();

const emit = defineEmits<{
  (e: 'zoom-complete'): void;
}>();

const manifestationLayer = ref<HTMLElement | null>(null);
const mobiusContainer = ref<HTMLElement | null>(null);
const frequencyOverlay = ref<HTMLElement | null>(null);
const barElements: HTMLElement[] = [];
const capElements: HTMLElement[] = [];

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let geometry: THREE.BufferGeometry | null = null;
let material: THREE.ShaderMaterial | null = null;
let composer: EffectComposer | null = null;
let bloomPass: UnrealBloomPass | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array | null = null;
let peakValues: Float32Array | null = null;
let peakHoldTime: Float32Array | null = null;

let frameId: number | null = null;
let resizeHandler: (() => void) | null = null;

const clock = new THREE.Clock();

onMounted(() => {
  if (!mobiusContainer.value) return;

  scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: window.devicePixelRatio < 2, // Disable antialias on high-DPI
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio at 2
  renderer.setSize(window.innerWidth, window.innerHeight);
  mobiusContainer.value.appendChild(renderer.domElement);

  // Post-Processing Setup
  const renderScene = new RenderPass(scene, camera);
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // Strength: High value for a noticeable glow
    0.4, // Radius: How far the glow spreads
    0.85 // Threshold: Only bright areas (pulses/wireframe) will glow
  );

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // Audio Handshake Logic
  const initAudio = async () => {
    if (audioContext) return;

    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 128; // Reduced for cleaner visualization bars

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      peakValues = new Float32Array(bufferLength);
      peakHoldTime = new Float32Array(bufferLength);

      // Dynamically create frequency bars in the DOM
      if (frequencyOverlay.value) {
        frequencyOverlay.value.innerHTML = ''; // Clear previous
        barElements.length = 0;
        capElements.length = 0;

        for (let i = 0; i < bufferLength; i++) {
          const wrapper = document.createElement('div');
          wrapper.className = 'bar-wrapper';
          const bar = document.createElement('div');
          bar.className = 'freq-bar';
          const cap = document.createElement('div');
          cap.className = 'freq-cap';

          wrapper.appendChild(cap);
          wrapper.appendChild(bar);
          frequencyOverlay.value.appendChild(wrapper);
          barElements.push(bar);
          capElements.push(cap);
        }
      }

      if (audioContext.state === 'suspended') await audioContext.resume();
    } catch (err) {
      console.error('0000_AUDIO_FRACTURE: Failed to initialize frequency analyzer', err);
    }
  };

  // Möbius Strip Topology Construction (ARC-LOGIC-017)
  geometry = new THREE.BufferGeometry();
  const slices = 120,
    stacks = 20,
    positions = [],
    indices = [],
    uvs = [];

  for (let i = 0; i <= slices; i++) {
    for (let j = 0; j <= stacks; j++) {
      const uRatio = i / slices;
      const vRatio = j / stacks;
      const u = uRatio * Math.PI * 2;
      const v = (vRatio - 0.5) * 0.8;
      const x = (1 + v * Math.cos(u / 2)) * Math.cos(u);
      const y = (1 + v * Math.cos(u / 2)) * Math.sin(u);
      const z = v * Math.sin(u / 2);
      positions.push(x, y, z);
      uvs.push(uRatio, vRatio);
    }
  }

  for (let i = 0; i < slices; i++) {
    for (let j = 0; j < stacks; j++) {
      const a = i * (stacks + 1) + j;
      const b = (i + 1) * (stacks + 1) + j;
      const c = (i + 1) * (stacks + 1) + (j + 1);
      const d = i * (stacks + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x00ff41) },
      uOpacity: { value: 0.3 },
      uLowFreq: { value: 0 },
      uHighFreq: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uLowFreq;
      uniform float uHighFreq;
      varying vec2 vUv;
      void main() {
        vUv = uv;

        // Audio-reactive geometric displacement
        // Bass (Low frequencies) creates a slow, rhythmic "breathing" pulse
        float pulse = uLowFreq * 0.4 * sin(vUv.x * 12.0 + uTime * 3.0);
        
        // Treble (High frequencies) creates sharp, rapid energetic ripples
        float ripple = uHighFreq * 0.15 * sin(vUv.x * 120.0 + uTime * 25.0);

        vec3 displacedPosition = position + normal * (pulse + ripple);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uLowFreq;
      uniform float uHighFreq;
      varying vec2 vUv;
      void main() {
        float pulses = pow(max(0.0, sin(vUv.x * 40.0 - uTime * 8.0)), 12.0);
        float threads = pow(max(0.0, sin(vUv.y * 30.0)), 10.0);
        float effect = pulses + threads * 0.4;

        vec3 baseColor = uColor * (0.8 + uLowFreq * 1.5);
        vec3 energyColor = vec3(0.0, 0.9, 1.0) * uHighFreq * 2.0; // Cyan energy for highs
        gl_FragColor = vec4(baseColor + (energyColor * effect), uOpacity * (0.5 + effect + uLowFreq));
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    wireframe: true
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  scene.add(new THREE.AmbientLight(0x003300));
  camera.position.z = 2.5;

  // Interactive Pointer Controls State
  let isDragging = false;
  let previousPointerPosition = { x: 0, y: 0 };
  let pointerVelocity = { y: 0 };
  let bgVelocity = 0;
  let bgRotation = 0;
  let lastMoveTime = 0;
  let shakeIntensity = 0;

  const animate = () => {
    frameId = requestAnimationFrame(animate);

    if ((window as any).__PAUSE_ANIMATION__) return;

    const timeDelta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    material!.uniforms.uTime.value = elapsed;
    let rotationFactor = 0.2 * timeDelta; // Base rotational velocity

    if (props.isZooming) {
      rotationFactor = 2.5 * timeDelta; // Accelerate rotation for cinematic entry
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 0.1, 4 * timeDelta);
      material!.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        material!.uniforms.uOpacity.value,
        1.0,
        4 * timeDelta
      );
      if (camera.position.z < 0.3) {
        cancelAnimationFrame(frameId!);
        emit('zoom-complete'); // Delegate routing responsibility back to parent
        return;
      }
    } else if (props.isAcknowledged) {
      rotationFactor = 0.8 * timeDelta;
      material!.uniforms.uOpacity.value = 0.3 + Math.sin(elapsed * 4.0) * 0.2;
    }

    if (props.isAcknowledged) {
      if (props.parity === 'PHYSICAL') {
        material!.uniforms.uColor.value.setHex(0x00ff41);
      } else if (props.parity === 'DIGITAL') {
        material!.uniforms.uColor.value.setHex(0x00bfff);
      }
    }

    // Reactivity Logic: Bloom Intensity
    if (bloomPass && composer) {
      // 1. User Interaction: Increase glow based on rotational velocity
      const interactionGlow = Math.abs(pointerVelocity.y) * 25;

      // 2. Audio Reactivity: Pulse based on frequency amplitude
      let audioGlow = 0;
      if (analyser && dataArray && peakValues && peakHoldTime) {
        analyser.getByteFrequencyData(dataArray as any);

        // Update the visual bars
        for (let i = 0; i < barElements.length; i++) {
          const val = dataArray[i];

          // Peak hold logic: stay at top for 0.5s before falling
          if (val > peakValues[i]) {
            peakValues[i] = val;
            peakHoldTime[i] = 0.5; // Set hold duration in seconds
          } else if (peakHoldTime[i] > 0) {
            peakHoldTime[i] -= timeDelta;
          } else {
            peakValues[i] = Math.max(0, peakValues[i] - 200 * timeDelta);
          }

          const barNorm = val / 255;
          const peakNorm = peakValues[i] / 255;
          const hue = Math.floor((1 - barNorm) * 120);

          // Update Instantaneous Bar
          barElements[i].style.height = `${barNorm * 100}%`;
          barElements[i].style.opacity = `${0.2 + barNorm * 0.8}`;
          barElements[i].style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
          barElements[i].style.boxShadow = `0 0 8px hsla(${hue}, 100%, 50%, 0.5)`;

          // Update Floating Peak Cap
          const capHue = Math.floor((1 - peakNorm) * 120);
          const isHolding = peakHoldTime[i] > 0;
          // Caps remain a hot-white while holding, then transition to the frequency hue as they fall
          const capLightness = isHolding ? 98 : 75;
          const capSaturation = isHolding ? 10 : 100;

          capElements[i].style.bottom = `${peakNorm * 100}%`;
          capElements[
            i
          ].style.backgroundColor = `hsl(${capHue}, ${capSaturation}%, ${capLightness}%)`;
          capElements[i].style.boxShadow = `0 0 6px hsla(${capHue}, 100%, ${capLightness}%, 0.8)`;
        }

        let lowSum = 0;
        let highSum = 0;
        const half = Math.floor(dataArray.length / 2);
        for (let i = 0; i < dataArray.length; i++) {
          if (i < half) lowSum += dataArray[i];
          else highSum += dataArray[i];
        }

        const lowAvg = lowSum / half / 255;
        const highAvg = highSum / half / 255;

        material!.uniforms.uLowFreq.value = lowAvg;
        material!.uniforms.uHighFreq.value = highAvg;
        audioGlow = (lowAvg + highAvg) * 2.0;

        // Trigger screen shake on high-frequency peaks (treble spikes)
        if (highAvg > 0.65) {
          shakeIntensity = Math.min(shakeIntensity + 0.2, 0.5);
        }
      }

      const baseStrength = props.isZooming ? 3.0 : 1.5;
      bloomPass.strength = THREE.MathUtils.lerp(
        bloomPass.strength,
        baseStrength + interactionGlow + audioGlow,
        0.1
      );
    }

    // Apply shake decay and calculate random offsets
    shakeIntensity *= Math.pow(0.85, timeDelta * 60);
    const shakeX = (Math.random() - 0.5) * shakeIntensity;
    const shakeY = (Math.random() - 0.5) * shakeIntensity;

    camera.position.x = shakeX;
    camera.position.y = shakeY;

    mesh.rotation.y += rotationFactor;
    mesh.rotation.z += rotationFactor * 0.33;
    bgRotation += rotationFactor * 0.1;

    if (!isDragging) {
      mesh.rotation.y += pointerVelocity.y;
      pointerVelocity.y *= Math.pow(0.95, timeDelta * 60); // Friction scaled by time
      bgRotation += bgVelocity;
      bgVelocity *= Math.pow(0.98, timeDelta * 60);
    }

    // Symmetry Mirror: Reflect Hub rotation
    if (manifestationLayer.value) {
      const mirrorDirection = props.parity === 'DIGITAL' ? -1 : 1;
      const finalBgRotation = bgRotation * (180 / Math.PI) * mirrorDirection;
      const baseScale = props.isZooming ? 1.5 : 1.12;
      // Calculate a pulse scale factor based on the low frequency (bass) uniform
      const pulseScale = 1.0 + (material?.uniforms.uLowFreq.value || 0) * 0.15;
      const finalScale = baseScale * pulseScale;

      // Apply screen shake displacement to the background layer as well
      const bgShakeX = shakeX * 40;
      const bgShakeY = shakeY * 40;

      manifestationLayer.value.style.transform = `rotate(${finalBgRotation}deg) scale(${finalScale}) translate(${bgShakeX}px, ${bgShakeY}px)`;

      // Audio-reactive opacity fluctuation (modulates between 0.6 and 1.0 based on volume)
      const audioIntensity =
        (material?.uniforms.uLowFreq.value || 0) * 0.5 +
        (material?.uniforms.uHighFreq.value || 0) * 0.5;
      manifestationLayer.value.style.opacity = (
        Math.min(elapsed / 1.6, 1.0) *
        (0.6 + audioIntensity * 0.4)
      ).toString();

      if (props.isAcknowledged) {
        const hue = props.parity === 'PHYSICAL' ? '90deg' : '200deg';
        manifestationLayer.value.style.filter = `hue-rotate(${hue}) brightness(1.2) blur(4px)`;
      }
    }

    composer?.render();
  };
  animate();

  resizeHandler = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer?.setSize(window.innerWidth, window.innerHeight);
    composer?.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', resizeHandler);

  renderer.domElement.addEventListener('pointerdown', (e: PointerEvent) => {
    initAudio(); // Initialize audio on first user gesture
    isDragging = true;
    pointerVelocity = { y: 0 };
    bgVelocity = 0;
    previousPointerPosition = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  });

  renderer.domElement.addEventListener('pointermove', (e: PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousPointerPosition.x;
    pointerVelocity.y = deltaX * 0.01;
    bgVelocity = deltaX * 0.001;
    mesh.rotation.y += pointerVelocity.y;
    bgRotation += bgVelocity;
    previousPointerPosition = { x: e.clientX, y: e.clientY };
    lastMoveTime = Date.now();
  });

  renderer.domElement.addEventListener('pointerup', (e: PointerEvent) => {
    isDragging = false;
    if (Date.now() - lastMoveTime > 50) {
      pointerVelocity = { y: 0 };
      bgVelocity = 0;
    }
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  });
});

onUnmounted(() => {
  if (frameId) cancelAnimationFrame(frameId);
  if (renderer) {
    renderer.dispose();
    geometry?.dispose();
    material?.dispose();
  }
  if (audioContext) audioContext.close();
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);
});
</script>

<style scoped>
.bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bg-manifestation {
  background: url('@/assets/images/iocreation.jpg') no-repeat center center;
  background-size: contain;
  z-index: -1;
  opacity: 0;
  animation: manifestZoom 20s cubic-bezier(0.1, 0, 0.3, 1) forwards;
  will-change: transform, opacity;
}

.mobius-canvas-container {
  z-index: 0;
  opacity: 0.6;
  filter: blur(1px);
  pointer-events: auto;
  cursor: grab;
  touch-action: none;
}

.mobius-canvas-container:active {
  cursor: grabbing;
}

.frequency-overlay {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 40px;
  z-index: 10;
  pointer-events: none;
}

:deep(.freq-bar) {
  width: 2px;
  height: 2px;
  background-color: #00e5ff;
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
  transition: height 0.05s ease;
}

@keyframes manifestZoom {
  0% {
    transform: scale(1.02);
    opacity: 0;
    filter: blur(2px);
  }
  8% {
    opacity: 1;
    filter: blur(0px);
  }
  100% {
    transform: scale(1.12);
    filter: blur(4px);
  }
}
</style>
