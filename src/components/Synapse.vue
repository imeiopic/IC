<template>
  <div ref="container" class="synapse-3d-container"></div>
  <footer class="synapse-footer">
    <div class="live-stats">
      <span>ACTIVE_NODES: {{ nodes.length }}</span>
      <span>MESH_VELOCITY: 8.09V</span>
    </div>
    <div class="coord-readout">
      CURRENT_ANCHOR: {{ currentLat }}, {{ currentLong }} ({{ currentAlt }}m)
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';

const nodes = ref([
  { id: 1, lat: 41.49, long: -81.69, alt: 180 }, // Cleveland Node
  { id: 2, lat: 34.05, long: -118.24, alt: 90 }, // Peer Node
  { id: 3, lat: 51.5, long: -0.12, alt: 35 } // Global Peer
]);

const connections = ref([
  { id: 'c1', from: 0, to: 1 },
  { id: 'c2', from: 0, to: 2 }
]);

const currentLat = ref(41.4989);
const currentLong = ref(-81.6944);
const currentAlt = ref(184);

const container = ref(null);
let renderer, scene, camera, animationId;

function latLongToVector3(lat, lon, alt, radius = 200) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const r = radius + alt / 10;
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function addNodeSpheres(scene, nodeList) {
  nodeList.forEach((node) => {
    const pos = latLongToVector3(node.lat, node.long, node.alt);
    const geometry = new THREE.SphereGeometry(3, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff41 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(pos);
    scene.add(sphere);
    // Elevation stalk
    const stalkGeom = new THREE.CylinderGeometry(0.5, 0.5, node.alt / 10, 8);
    const stalkMat = new THREE.MeshBasicMaterial({
      color: 0x00ff41,
      transparent: true,
      opacity: 0.5
    });
    const stalk = new THREE.Mesh(stalkGeom, stalkMat);
    stalk.position.copy(latLongToVector3(node.lat, node.long, 0));
    stalk.position.lerp(pos, 0.5);
    stalk.lookAt(pos);
    scene.add(stalk);
  });
}

function addConnections(scene, nodeList, connList) {
  connList.forEach((link) => {
    const from = latLongToVector3(
      nodeList[link.from].lat,
      nodeList[link.from].long,
      nodeList[link.from].alt
    );
    const to = latLongToVector3(
      nodeList[link.to].lat,
      nodeList[link.to].long,
      nodeList[link.to].alt
    );
    const curve = new THREE.QuadraticBezierCurve3(
      from,
      from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 30, 0)),
      to
    );
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 2 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
  });
}

onMounted(() => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.set(0, 0, 400);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x001a1a, 1);
  renderer.setSize(600, 400);
  container.value.appendChild(renderer.domElement);

  // Earth sphere
  const earthGeometry = new THREE.SphereGeometry(200, 32, 32);
  const earthMaterial = new THREE.MeshBasicMaterial({
    color: 0x003333,
    wireframe: true,
    opacity: 0.2,
    transparent: true
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);

  addNodeSpheres(scene, nodes.value);
  addConnections(scene, nodes.value, connections.value);

  function animate() {
    scene.rotation.y += 0.002;
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  }
  animate();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
  renderer.dispose();
});
</script>

<style scoped>
.synapse-3d-container {
  width: 600px;
  height: 400px;
  margin: 0 auto;
  background: radial-gradient(circle at center, #001a1a 0%, #000 100%);
  border: 1px solid #00e5ff;
  position: relative;
}
.synapse-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  border-top: 1px solid #111;
  padding-top: 1rem;
  color: #00ff41;
  font-family: 'Space Mono', monospace;
}
</style>
