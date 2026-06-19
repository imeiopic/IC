<template>
  <div class="iopic-citizen-audit">
    <h2>Iopic Citizen Audit</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <div v-for="(d, i) in directives" :key="d.id" class="directive-block">
        <h3>Directive {{ d.id }}: {{ d.title }}</h3>
        <p>{{ d.question }}</p>
        <label>
          <input type="radio" :name="'dir-' + d.id" value="yes" v-model="answers[i]" /> Yes
        </label>
        <label>
          <input type="radio" :name="'dir-' + d.id" value="no" v-model="answers[i]" /> No
        </label>
      </div>
      <button class="btn btn-primary mb-3" @click="showRegistration = true" :disabled="submitting">
        Register Node
      </button>

      <!-- Registration Modal -->
      <div
        v-if="showRegistration"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.7)"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content p-4">
            <div class="modal-header border-0">
              <h2 class="modal-title w-100 text-center">Node Registration</h2>
              <button type="button" class="btn-close" @click="showRegistration = false"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Speak your Node Name</label>
                <input
                  v-model="nodeName"
                  placeholder="Node Name (voice to text)"
                  class="form-control"
                  readonly
                />
                <button
                  class="btn btn-secondary mt-2"
                  @click="startVoiceToText"
                  :disabled="recordingVoice"
                >
                  {{ recordingVoice ? 'Listening...' : 'Start Voice Input' }}
                </button>
              </div>
              <div class="mb-3">
                <label class="form-label">Facial ID (Webcam)</label>
                <video
                  ref="videoRef"
                  width="240"
                  height="180"
                  autoplay
                  muted
                  style="border: 1px solid #ccc; transform: scaleX(-1)"
                ></video>
                <button class="btn btn-secondary mt-2" @click="captureFace">Capture Face</button>
                <div v-if="faceImage">
                  <img :src="faceImage" alt="Face Snapshot" width="120" class="mt-2" />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Voice Sample</label>
                <button
                  class="btn btn-secondary"
                  @click="startVoiceRecording"
                  :disabled="recordingAudio"
                >
                  {{ recordingAudio ? 'Recording...' : 'Record Voice Sample' }}
                </button>
                <audio v-if="voiceSample" :src="voiceSample" controls class="mt-2"></audio>
              </div>
              <div class="mb-3">
                <label class="form-label">Geolocation</label>
                <div v-if="geoError" class="text-danger">{{ geoError }}</div>
                <div v-else-if="geolocation">
                  Lat: {{ geolocation.lat }}, Lng: {{ geolocation.lng }}
                </div>
                <button class="btn btn-secondary" @click="getGeolocation">Get Location</button>
              </div>
              <div class="mb-3">
                <label class="form-label"
                  >Inviting Entity Access Address (phone, email, or code)</label
                >
                <input
                  v-model="inviteAddress"
                  placeholder="Inviter's phone, email, or code"
                  class="form-control"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">First Connect Code</label>
                <input
                  v-model="connectCode"
                  placeholder="Enter or purchase connect code"
                  class="form-control"
                />
                <button
                  class="btn btn-outline-primary mt-2"
                  @click="purchaseConnectCode"
                  :disabled="purchasingCode"
                >
                  {{ purchasingCode ? 'Processing...' : 'Purchase Connect Code ($5)' }}
                </button>
                <button
                  class="btn btn-outline-secondary mt-2 ms-2"
                  @click="inviterPays"
                  :disabled="purchasingCode"
                >
                  {{ purchasingCode ? 'Processing...' : 'Inviter Pays ($10)' }}
                </button>
                <div v-if="paymentStatus === 'paid'" class="text-success mt-2">
                  Payment complete. You may register.
                </div>
                <div v-else-if="paymentStatus === 'inviter_paid'" class="text-success mt-2">
                  Inviter paid. You may register.
                </div>
                <div v-else-if="paymentStatus === 'pending'" class="text-warning mt-2">
                  Payment required to register.
                </div>
                <div v-if="paymentError" class="text-danger mt-2">{{ paymentError }}</div>
              </div>
              <button
                class="btn btn-success mt-3"
                @click="submitAudit"
                :disabled="
                  !nodeName ||
                  !faceImage ||
                  !voiceSample ||
                  !geolocation ||
                  submitting ||
                  (paymentStatus !== 'paid' && paymentStatus !== 'inviter_paid')
                "
              >
                Submit Registration
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="result !== null" class="audit-result">
        <h3>Audit Result</h3>
        <div v-for="(d, i) in directives" :key="'r-' + d.id">
          Directive {{ d.id }}:
          <span v-if="answers" :class="{ aligned: answers[i] === 'yes', notAligned: answers[i] !== 'yes' }">
            {{ answers && answers[i] === 'yes' ? 'ALIGNED' : 'NOT ALIGNED' }}
          </span>
        </div>
        <div class="final-status">
          <strong>Status:</strong>
          <span v-if="result"
            >FULLY ALIGNED with the Iopic Constitution. Welcome, Symmetrical Node!</span
          >
          <span v-else>MISALIGNMENT detected. Please review the directives and try again.</span>
        </div>
      </div>
      <div class="mesh-nodes">
        <h3>Live Mesh Nodes</h3>
        <ul>
          <li v-for="n in meshNodes" :key="n.id">
            <strong>{{ n.name }}</strong> <span class="device">({{ n.device }})</span>
          </li>
        </ul>
      </div>

      <div class="direct-message-block">
        <h3>Send Direct Message</h3>
        <select v-model="recipientName">
          <option value="" disabled>Select recipient node</option>
          <option v-for="n in meshNodes" :key="n.id" :value="n.name">{{ n.name }}</option>
        </select>
        <input v-model="directMessage" placeholder="Type your message..." />
        <button @click="sendDirectMessage" :disabled="!recipientName || !directMessage">
          Send
        </button>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>
    </div>
  </div>
</template>

// TypeScript declarations for browser speech recognition declare global { interface Window {
SpeechRecognition: typeof SpeechRecognition; webkitSpeechRecognition: typeof SpeechRecognition; } }

<script setup lang="ts">
import { onMounted, ref, defineProps } from 'vue';
// Allow parent to open registration modal on mount
const props = defineProps<{ showRegistrationOnMount?: boolean }>();
import { watch } from 'vue';
import { useErrorSubstrate } from '../errorHandler';
const { notifySuccess, lastSubstrateError, lastSubstrateSuccess } = useErrorSubstrate();

const directives = ref<any[]>([]);
const answers = ref<string[]>([]);
const result = ref<boolean | null>(null);
const meshNodes = ref<any[]>([]);
const nodeName = ref('');
const showRegistration = ref(false);
const faceImage = ref('');
const videoRef = ref<HTMLVideoElement | null>(null);
const voiceSample = ref('');
const recordingAudio = ref(false);
const recordingVoice = ref(false);
const geolocation = ref<{lat: number, lng: number} | null>(null);
const geoError = ref('');
const device = ref(navigator.userAgent);
const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const success = ref('');
const recipientName = ref('');
const directMessage = ref('');
const inviteAddress = ref('');
const connectCode = ref('');
const paymentStatus = ref('pending');
const paymentError = ref('');
const purchasingCode = ref(false);
const inviterPays = async () => {
  purchasingCode.value = true;
  paymentError.value = '';
  try {
    const res = await fetch('/api/paypal/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 10, payer: inviteAddress.value, type: 'inviter' })
    });
    const data = await res.json();
    if (data.status === 'success') {
      paymentStatus.value = 'inviter_paid';
    } else {
      paymentError.value = data.error || 'Payment failed.';
    }
  } catch (e) {
    paymentError.value = 'Payment failed.';
  }
  purchasingCode.value = false;
};
const purchaseConnectCode = async () => {
  purchasingCode.value = true;
  paymentError.value = '';
  try {
    const res = await fetch('/api/paypal/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 5, payer: nodeName.value, type: 'node' })
    });
    const data = await res.json();
    if (data.status === 'success') {
      paymentStatus.value = 'paid';
      connectCode.value = data.transactionId;
    } else {
      paymentError.value = data.error || 'Payment failed.';
    }
  } catch (e) {
    paymentError.value = 'Payment failed.';
  }
  purchasingCode.value = false;
};
let ws: WebSocket | null = null;

async function fetchDirectives() {
  try {
    const res = await fetch('/api/audit/directives');
    const data = await res.json();
    directives.value = data.directives;
    answers.value = Array(data.directives.length).fill('');
  } catch (e) {
    error.value = 'Failed to load directives.';
  }
}

async function fetchMeshNodes() {
  try {
    const res = await fetch('/api/mesh/nodes');
    const data = await res.json();
    meshNodes.value = data.nodes;
  } catch (e) {
    error.value = 'Failed to load mesh nodes.';
  }
}

async function submitAudit() {
  submitting.value = true;
  error.value = '';
  success.value = '';
  try {
    // Optionally, you can still require audit answers, or skip for registration only
    const auditRes = await fetch('/api/audit/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answers.value })
    });
    const auditData = await auditRes.json();
    result.value = auditData.result;
    if (auditData.result) {
      // Register node in mesh with all biometrics, geo, invite, connect code, and payment
      const regRes = await fetch('/api/mesh/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Math.random().toString(36).slice(2),
          name: nodeName.value || 'Anonymous Node',
          device: device.value,
          faceImage: faceImage.value,
          voiceSample: voiceSample.value,
          geolocation: geolocation.value,
          inviteAddress: inviteAddress.value,
          connectCode: connectCode.value,
          paymentStatus: paymentStatus.value,
          inviterPays: paymentStatus.value === 'inviter_paid'
        })
      });
      const regData = await regRes.json();
      if (regData.status === 'registered') {
        success.value = 'Node registered in mesh!';
        notifySuccess('Node registered in mesh!');
        showRegistration.value = false;
        // Notify mesh via WebSocket
        if (ws && ws.readyState === 1) {
          ws.send(
            JSON.stringify({ type: 'node-joined', name: nodeName.value || 'Anonymous Node' })
          );
        }
        await fetchMeshNodes();
      } else {
        error.value = regData.error || 'Registration failed.';
      }
    } else {
      error.value = 'Audit not fully aligned.';
      notifySuccess('Audit not fully aligned.');
    }
  } catch (e) {
    error.value = 'Submission failed.';
    notifySuccess('Submission failed.');
  }
  submitting.value = false;
}

// Voice-to-text for name
function startVoiceToText(event: Event) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    error.value = 'Speech recognition not supported.';
    return;
  }
  recordingVoice.value = true;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    nodeName.value = event.results[0][0].transcript;
    recordingVoice.value = false;
  };
  recognition.onerror = () => {
    error.value = 'Voice recognition failed.';
    recordingVoice.value = false;
  };
  recognition.onend = () => {
    recordingVoice.value = false;
  };
  recognition.start();
}

// Webcam facial capture
function captureFace() {
  const video = videoRef.value;
  if (!video) return;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  faceImage.value = canvas.toDataURL('image/png');
}

// Start webcam on modal open
watch(showRegistration, (val) => {
  if (val) {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.value) videoRef.value.srcObject = stream;
    });
  } else {
    if (videoRef.value && videoRef.value.srcObject) {
      const tracks = videoRef.value.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.value.srcObject = null;
    }
  }
});

// Voice sample recording
let mediaRecorder = null;
let audioChunks = [];
function startVoiceRecording() {
  if (!navigator.mediaDevices || !window.MediaRecorder) {
    error.value = 'Audio recording not supported.';
    return;
  }
  recordingAudio.value = true;
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new window.MediaRecorder(stream);
      const audioChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      voiceSample.value = URL.createObjectURL(audioBlob);
      recordingAudio.value = false;
      stream.getTracks().forEach((t) => t.stop());
    };
    mediaRecorder.start();
    setTimeout(() => {
      if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
    }, 3000); // 3 seconds
  });
}

// Geolocation
function getGeolocation() {
  if (!navigator.geolocation) {
    geoError.value = 'Geolocation not supported.';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      geolocation.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      geoError.value = '';
    },
    (err) => {
      geoError.value = 'Failed to get location.';
    }
  );
}

function setupWebSocket() {
  ws = new WebSocket('ws://localhost:5001');
  ws.onopen = () => {
    // Register node name for direct messaging
    if (nodeName.value) {
      ws.send(JSON.stringify({ type: 'register', name: nodeName.value }));
    }
  };
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'node-joined') {
        fetchMeshNodes();
      }
      if (msg.type === 'direct-message' && msg.from && msg.text) {
        notifySuccess(`Direct message from ${msg.from}: ${msg.text}`);
      }
    } catch (e) {}
  };
  ws.onerror = () => {
    error.value = 'Mesh sync error.';
  };
}

function sendDirectMessage() {
  if (ws && ws.readyState === 1 && recipientName.value && directMessage.value) {
    ws.send(
      JSON.stringify({
        type: 'direct-message',
        to: recipientName.value,
        from: nodeName.value || 'Anonymous Node',
        text: directMessage.value
      })
    );
    notifySuccess(`Message sent to ${recipientName.value}`);
    directMessage.value = '';
  }
}

onMounted(async () => {
  loading.value = true;
  await fetchDirectives();
  await fetchMeshNodes();
  setupWebSocket();
  loading.value = false;
  if (props.showRegistrationOnMount) {
    showRegistration.value = true;
  }
});
</script>

<style scoped>
.iopic-citizen-audit {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fafbfc;
}
.directive-block {
  margin-bottom: 1.5rem;
}
.audit-result {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #fff;
}
.aligned {
  color: #2a7;
}
.notAligned {
  color: #c22;
}
.final-status {
  margin-top: 1rem;
  font-size: 1.1em;
}
</style>
