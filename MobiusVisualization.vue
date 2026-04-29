<template>
  <!-- Encapsulated layers for the 3D scene and its reactive manifestation background -->
  <div ref="manifestationLayer" class="bg-layer bg-manifestation"></div>
  <div ref="mobiusContainer" class="bg-layer mobius-canvas-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

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

let renderer: THREE.WebGLRenderer | null = null;
let frameId: number | null = null;
let resizeHandler: (() => void) | null = null;

onMounted(() => {
  if (!mobiusContainer.value) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  mobiusContainer.value.appendChild(renderer.domElement);

  // Möbius Strip Topology Construction (ARC-LOGIC-017)
  const geometry = new THREE.BufferGeometry();
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

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x00ff41) },
      uOpacity: { value: 0.3 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float pulses = pow(max(0.0, sin(vUv.x * 40.0 - uTime * 8.0)), 12.0);
        float threads = pow(max(0.0, sin(vUv.y * 30.0)), 10.0);
        float effect = pulses + threads * 0.4;
        gl_FragColor = vec4(uColor + (effect * 0.6), uOpacity * (0.5 + effect));
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

  const animate = () => {
    frameId = requestAnimationFrame(animate);

    if ((window as any).__PAUSE_ANIMATION__) return;

    material.uniforms.uTime.value += 0.02;
    let delta = 0.003;

    if (props.isZooming) {
      delta = 0.045; // Accelerate rotation for cinematic entry
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 0.1, 0.05);
      material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        material.uniforms.uOpacity.value,
        1.0,
        0.05
      );
      if (camera.position.z < 0.3) {
        cancelAnimationFrame(frameId!);
        emit('zoom-complete'); // Delegate routing responsibility back to parent
        return;
      }
    } else if (props.isAcknowledged) {
      delta = 0.013; // Increase angular velocity when Bit 1 is anchored
      material.uniforms.uOpacity.value = 0.3 + Math.sin(Date.now() * 0.005) * 0.2;
    }

    if (props.isAcknowledged) {
      if (props.parity === 'PHYSICAL') {
        material.uniforms.uColor.value.setHex(0x00ff41);
      } else if (props.parity === 'DIGITAL') {
        material.uniforms.uColor.value.setHex(0x00bfff);
      }
    }

    mesh.rotation.y += delta;
    mesh.rotation.z += delta * 0.33;
    bgRotation += delta * 0.1;

    if (!isDragging) {
      mesh.rotation.y += pointerVelocity.y;
      pointerVelocity.y *= 0.95;
      bgRotation += bgVelocity;
      bgVelocity *= 0.98;
    }

    // Symmetry Mirror: Reflect Hub rotation
    if (manifestationLayer.value) {
      const mirrorDirection = props.parity === 'DIGITAL' ? -1 : 1;
      const finalBgRotation = bgRotation * (180 / Math.PI) * mirrorDirection;
      const scale = props.isZooming ? 1.5 : 1.12;

      manifestationLayer.value.style.transform = `rotate(${finalBgRotation}deg) scale(${scale})`;
      if (props.isAcknowledged) {
        const hue = props.parity === 'PHYSICAL' ? '90deg' : '200deg';
        manifestationLayer.value.style.filter = `hue-rotate(${hue}) brightness(1.2) blur(4px)`;
      }
    }

    renderer?.render(scene, camera);
  };
  animate();

  resizeHandler = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer?.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', resizeHandler);

  renderer.domElement.addEventListener('pointerdown', (e: PointerEvent) => {
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
  if (renderer) renderer.dispose();
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
  background: url('../../assets/images/iocreation.jpg') no-repeat center center;
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
