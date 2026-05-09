<template>
  <div class="p-peer">
    <header class="p-header">
      <h2>P.PEER_SIGHT</h2>
      <div class="logic-link">Handshake ID: {{ $route.params.accessCode }}</div>
    </header>

    <div class="dual-camera-grid">
      <div class="cam-feed">
        <label>LOCAL_I</label>
        <video ref="localCam" autoplay muted playsinline></video>
      </div>
      <div class="cam-feed remote">
        <label>REMOTE_P</label>
        <div class="peer-overlay" v-if="!remoteConnected">AWAITING PROXIMITY...</div>
        <video ref="remoteCam" autoplay playsinline v-show="remoteConnected"></video>
      </div>
    </div>

    <div class="consensus-gate">
      <div class="symmetry-meter">SQ: {{ symmetryScore }}%</div>
      <div v-if="remoteConnected" class="bond-success">16-THREAD BOND CONFIRMED</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

const localCam = ref(null);
const remoteCam = ref(null);
const remoteConnected = ref(false);
const symmetryScore = ref(88);
const route = useRoute();

let localStream = null;
let peerConnection = null;
let ws = null;
const SIGNAL_SERVER = 'ws://localhost:3001'; // Change to your signaling server
const roomId = route.params.accessCode || 'default-room';

function sendSignal(data) {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ room: roomId, ...data }));
  }
}

function setupWebRTC() {
  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });
  // Send ICE candidates to peer
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignal({ type: 'ice', candidate: event.candidate });
    }
  };
  // When remote stream arrives
  peerConnection.ontrack = (event) => {
    if (remoteCam.value) {
      remoteCam.value.srcObject = event.streams[0];
      remoteConnected.value = true;
      symmetryScore.value = 92;
    }
  };
  // Add local stream tracks
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
  }
}

function handleSignal(msg) {
  if (msg.type === 'offer') {
    setupWebRTC();
    peerConnection.setRemoteDescription(new RTCSessionDescription(msg.offer));
    peerConnection.createAnswer().then((answer) => {
      peerConnection.setLocalDescription(answer);
      sendSignal({ type: 'answer', answer });
    });
  } else if (msg.type === 'answer') {
    peerConnection.setRemoteDescription(new RTCSessionDescription(msg.answer));
  } else if (msg.type === 'ice' && msg.candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate));
  }
}

onMounted(async () => {
  // Start local camera
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  if (localCam.value) localCam.value.srcObject = localStream;

  ws = new WebSocket(SIGNAL_SERVER);
  ws.onopen = () => {
    ws.send(JSON.stringify({ room: roomId, type: 'join' }));
  };
  ws.onmessage = async (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'joined' && msg.initiator) {
      // If first peer, create offer
      setupWebRTC();
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      sendSignal({ type: 'offer', offer });
    } else {
      handleSignal(msg);
    }
  };
});

onBeforeUnmount(() => {
  if (ws) ws.close();
  if (peerConnection) peerConnection.close();
  if (localStream) localStream.getTracks().forEach((t) => t.stop());
});
</script>

<style scoped>
.dual-camera-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 2rem 0;
}
.cam-feed {
  background: #111;
  border: 1px solid #00e5ff;
  position: relative;
  height: 300px;
}
.cam-feed label {
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 0.6rem;
  color: #00e5ff;
}
.peer-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff00e5;
}
.handshake-btn {
  width: 100%;
  padding: 1.5rem;
  background: #ff00e5;
  color: #000;
  font-weight: bold;
  border: none;
}
.bond-success {
  color: #00e5ff;
  font-weight: bold;
  margin-top: 1rem;
  text-align: center;
}
</style>
