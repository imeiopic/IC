// Import contacts (Web Contacts Picker API) async function importFromContacts() { if ('contacts' in
navigator && 'ContactsManager' in window) { try { // Supported properties: name, email, tel const
props = ['name', 'email', 'tel']; // Multiple: false (pick one contact) const contacts = await
(navigator as any).contacts.select(props, { multiple: false }); if (contacts && contacts.length > 0)
{ const contact = contacts[0]; if (contact.name && contact.name.length > 0) name.value =
contact.name[0]; if (contact.email && contact.email.length > 0) email.value = contact.email[0]; if
(contact.tel && contact.tel.length > 0) recoveryPhone.value = contact.tel[0]; } } catch (err) {
alert('Contact import failed or was cancelled.'); } } else { alert('Contact Picker API not supported
in this browser.'); } }
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, storage } from './firebase';
import { useAuth } from './useAuth'; // Assuming useAuth uses the global auth instance
import { Wallet } from 'ethers';
import { IopicSecretManager } from './IopicSecretManager';
import IopicManifestoViewer from './components/IopicManifestoViewer.vue';
import { useIOSettings } from './useIOSettings';

const router = useRouter();
const { ensureAuthInitialized } = useAuth();
const { ioLoad } = useIOSettings();

const CURRENT_MANIFESTO_VERSION = '1.0.0';

const name = ref('');
const email = ref('');
const recoveryEmail = ref('');
const recoveryPhone = ref('');
// VoiceID (Web Speech API + MediaRecorder)
const isRecording = ref(false);
const audioVisualizerRef = ref<HTMLCanvasElement | null>(null);
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array | null = null;
let animationId: number | null = null;
const voiceTranscript = ref('');
const voiceRecorded = ref(false);
const voiceBlob = ref<Blob | null>(null);
let recognition: any = null;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: BlobPart[] = [];
let audioStream: MediaStream | null = null;

const startVoiceRecording = async () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech Recognition API not supported in this browser.');
    return;
  }
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(audioStream);
    audioChunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      voiceBlob.value = new Blob(audioChunks, { type: 'audio/webm' });
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
        audioStream = null;
      }
      stopVisualizer();
    };
    mediaRecorder.start();

    // Voice visualization setup
    setupVisualizer(audioStream);
  } catch (err) {
    alert('Microphone access denied or unavailable.');
    return;
  }
  const SpeechRecognition =
    (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  isRecording.value = true;
  voiceTranscript.value = '';
  recognition.onresult = (event: any) => {
    voiceTranscript.value = event.results[0][0].transcript;
    voiceRecorded.value = true;
    isRecording.value = false;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  };
  recognition.onerror = (event: any) => {
    isRecording.value = false;
    alert('Voice recognition error: ' + event.error);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  };
  recognition.onend = () => {
    isRecording.value = false;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  };
  recognition.start();
};

function stopVisualizer() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  analyser = null;
  dataArray = null;
}

function setupVisualizer(stream: MediaStream) {
  stopVisualizer();
  audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 128;
  source.connect(analyser);
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  drawVisualizer();
}

function drawVisualizer() {
  if (!analyser || !audioVisualizerRef.value || !dataArray) return;
  analyser.getByteTimeDomainData(dataArray);
  const canvas = audioVisualizerRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#0ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const sliceWidth = canvas.width / dataArray.length;
  let x = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.stroke();
  animationId = requestAnimationFrame(drawVisualizer);
}

const stopVoiceRecording = () => {
  if (recognition) {
    recognition.stop();
    isRecording.value = false;
  }
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  stopVisualizer();
};

// FaceID (getUserMedia)
const faceCaptured = ref(false);
const faceError = ref('');
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let stream: MediaStream | null = null;

const startFaceCapture = async () => {
  faceError.value = '';
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      videoRef.value.play();
    }
  } catch (err: any) {
    faceError.value = 'Camera access denied or unavailable.';
  }
};

const captureFace = () => {
  if (videoRef.value && canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.value, 0, 0, 320, 240);
      faceCaptured.value = true;
      stopFaceStream();
    }
  }
};

const stopFaceStream = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
};
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);
const showPasswords = ref(false);
const showManifesto = ref(false);
const showSeedPhrase = ref(false);
const mnemonic = ref('');
const showVerifySeedPhrase = ref(false);
const verificationWords = ref<{ index: number; word: string }[]>([]);
const verificationInputs = ref<string[]>(['', '', '']);
const generatedPrivateKey = ref('');

const passwordStrength = computed(() => {
  const p = password.value;
  if (!p) return { score: 0, label: '', color: '', width: '0%' };

  let score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;

  const levels = [
    { label: 'CRITICAL', color: 'bg-danger', width: '20%' },
    { label: 'WEAK', color: 'bg-warning', width: '40%' },
    { label: 'STABLE', color: 'bg-info', width: '60%' },
    { label: 'SECURE', color: 'bg-primary', width: '80%' },
    { label: 'ENCRYPTED', color: 'bg-success', width: '100%' }
  ];
  return levels[Math.min(score - 1, 4)] || levels[0];
});

onMounted(async () => {
  // Redirect to dashboard if already verified
  const user = await ensureAuthInitialized();
  if (user) {
    const existingKey = localStorage.getItem('io_entity_key');
    if (!existingKey) {
      generateNewEntityKey();
    } else {
      checkManifestoAndNavigate();
    }
  }
});

const generateNewEntityKey = () => {
  const wallet = Wallet.createRandom();
  mnemonic.value = wallet.mnemonic?.phrase || '';
  generatedPrivateKey.value = wallet.privateKey;
  showSeedPhrase.value = true; // Show the seed phrase display
};

const handleSeedPhraseConfirm = async () => {
  if (generatedPrivateKey.value) {
    // Secure the mnemonic using the provided access code (password) before storage
    try {
      const encryptedMnemonic = await IopicSecretManager.encryptSeed(
        mnemonic.value,
        password.value
      );
      localStorage.setItem('io_entity_mnemonic', encryptedMnemonic);
      localStorage.setItem('io_entity_key', generatedPrivateKey.value); // Consider encrypting this too
    } catch (err) {
      error.value = 'Encryption Substrate Failure. Identity not secured.';
      return;
    }
    showSeedPhrase.value = false;
    generateVerificationChallenge(); // Move to verification step
  }
};

const checkManifestoAndNavigate = () => {
  const syncedVersion = localStorage.getItem('io_manifesto_version');
  if (syncedVersion !== CURRENT_MANIFESTO_VERSION) {
    showManifesto.value = true;
  } else {
    router.push('/dashboard');
  }
};

const generateVerificationChallenge = () => {
  const words = mnemonic.value.split(' ');
  const selectedIndices: Set<number> = new Set();
  verificationWords.value = [];
  verificationInputs.value = ['', '', '']; // Reset inputs

  while (selectedIndices.size < 3) {
    const randomIndex = Math.floor(Math.random() * words.length);
    if (!selectedIndices.has(randomIndex)) {
      selectedIndices.add(randomIndex);
      verificationWords.value.push({ index: randomIndex, word: words[randomIndex] });
    }
  }
  verificationWords.value.sort((a, b) => a.index - b.index); // Sort by index for consistent display
  showVerifySeedPhrase.value = true;
};

const handleVerifySeedPhrase = () => {
  const allCorrect = verificationWords.value.every((challenge, i) => {
    return verificationInputs.value[i].toLowerCase() === challenge.word.toLowerCase();
  });

  if (allCorrect) {
    showVerifySeedPhrase.value = false;
    checkManifestoAndNavigate(); // Proceed to manifesto
  } else {
    error.value = 'Verification failed. Please re-enter the words correctly.';
  }
};

const handleManifestoSync = () => {
  localStorage.setItem('io_manifesto_version', CURRENT_MANIFESTO_VERSION);
  router.push('/dashboard');
};

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'All IO fields are required.';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Access codes do not match.';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // 1. Create the user account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // 2. Synchronize the identity display name
    await updateProfile(user, {
      displayName: name.value.trim()
    });

    // 3. Initialize the Entity Profile in Firestore
    // This ensures the user document exists for Dashboard/Invite logic

    // Prepare VoiceID and FaceID data
    let voiceIdData = null;
    let voiceIdUrl = null;
    if (voiceTranscript.value && voiceBlob.value) {
      // Upload audio blob to Firebase Storage
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const audioRef = ref(storage, `voiceid/${user.uid}.webm`);
      await uploadBytes(audioRef, voiceBlob.value);
      voiceIdUrl = await getDownloadURL(audioRef);
      voiceIdData = {
        transcript: voiceTranscript.value,
        audioUrl: voiceIdUrl
      };
    }
    let faceIdData = null;
    if (canvasRef.value) {
      faceIdData = canvasRef.value.toDataURL('image/png'); // Store as base64 PNG
    }

    await setDoc(doc(db, 'invitees', user.uid), {
      name: name.value.trim(),
      level: 'Member',
      status: 'Active',
      inviterUid: 'system', // Self-initialized entity
      inviteePays: false,
      recoveryEmail: recoveryEmail.value,
      recoveryPhone: recoveryPhone.value,
      voiceId: voiceIdData,
      faceId: faceIdData
    });

    const existingKey = localStorage.getItem('io_entity_key');
    if (!existingKey) {
      generateNewEntityKey();
    } else {
      checkManifestoAndNavigate();
    }
  } catch (err: any) {
    console.error('Registration failure:', err);
    if (err.code === 'auth/email-already-in-use') {
      error.value = 'Identity already registered in IO.';
    } else if (err.code === 'auth/weak-password') {
      error.value = 'Access code security threshold not met.';
    } else {
      error.value = 'Registration sequence failed.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="register-page d-flex align-items-center justify-content-center min-vh-100 bg-black text-light"
  >
    <!-- Registration Steps: VoiceID and FaceID -->
    <template v-if="!showSeedPhrase && !showVerifySeedPhrase && !showManifesto">
      <div
        v-if="!voiceRecorded"
        class="card bg-dark border-primary shadow-lg p-4 mb-4"
        style="width: 100%; max-width: 400px"
      >
        <div class="text-center mb-3">
          <h2 class="fw-bold text-primary font-monospace">VOICE ID REGISTRATION</h2>
          <p class="text-muted small text-uppercase">Say your full name clearly</p>
        </div>
        <div class="mb-3 text-center">
          <button
            class="btn btn-outline-primary"
            @click="startVoiceRecording"
            :disabled="isRecording"
          >
            <i class="bi bi-mic"></i> Start Recording
          </button>
          <button v-if="isRecording" class="btn btn-danger ms-2" @click="stopVoiceRecording">
            <i class="bi bi-stop-circle"></i> Stop
          </button>
          <div v-if="isRecording" class="mt-3 d-flex justify-content-center">
            <canvas
              ref="audioVisualizerRef"
              width="220"
              height="40"
              style="background: #111; border-radius: 8px; border: 1px solid #0ff"
            ></canvas>
          </div>
        </div>
        <div v-if="isRecording" class="text-info text-center mb-2">
          Recording... Please say your full name.
        </div>
        <div v-if="voiceTranscript" class="alert alert-info small">
          Transcript: {{ voiceTranscript }}
        </div>
        <div v-if="voiceRecorded" class="alert alert-success small">VoiceID captured.</div>
      </div>
      <div
        v-else-if="!faceCaptured && voiceRecorded"
        class="card bg-dark border-success shadow-lg p-4 mb-4"
        style="width: 100%; max-width: 400px"
      >
        <div class="text-center mb-3">
          <h2 class="fw-bold text-success font-monospace">FACE ID REGISTRATION</h2>
          <p class="text-muted small text-uppercase">Align your face in the oval and capture</p>
        </div>
        <div v-if="faceError" class="alert alert-danger small">{{ faceError }}</div>
        <div class="d-flex flex-column align-items-center mb-3">
          <video
            v-if="!faceCaptured"
            ref="videoRef"
            width="320"
            height="240"
            style="
              border-radius: 50%;
              object-fit: cover;
              border: 4px solid #28a745;
              background: #222;
            "
            autoplay
            muted
          ></video>
          <canvas ref="canvasRef" width="320" height="240" style="display: none"></canvas>
          <img
            v-if="faceCaptured && canvasRef && canvasRef.toDataURL"
            :src="canvasRef.toDataURL('image/png')"
            alt="Captured Face"
            width="320"
            height="240"
            style="
              border-radius: 50%;
              border: 4px solid #28a745;
              object-fit: cover;
              background: #222;
              margin-bottom: 8px;
            "
          />
          <div class="mt-2">
            <button
              class="btn btn-outline-success me-2"
              @click="startFaceCapture"
              v-if="!faceCaptured"
            >
              Start Camera
            </button>
            <button class="btn btn-success" @click="captureFace" v-if="!faceCaptured">
              Capture Face
            </button>
          </div>
        </div>
        <div class="text-center position-relative" style="height: 0">
          <svg
            width="120"
            height="160"
            style="
              position: absolute;
              left: 50%;
              top: -180px;
              transform: translateX(-50%);
              pointer-events: none;
            "
          >
            <ellipse
              cx="60"
              cy="80"
              rx="55"
              ry="75"
              stroke="#28a745"
              stroke-width="4"
              fill="none"
            />
          </svg>
        </div>
        <div v-if="faceCaptured" class="alert alert-success small">FaceID captured.</div>
      </div>
    </template>
    <div
      v-if="showSeedPhrase"
      class="card bg-dark border-warning shadow-lg p-4"
      style="width: 100%; max-width: 500px"
    >
      <div class="text-center mb-4">
        <h2 class="fw-bold text-warning font-monospace">IDENTITY INITIALIZATION</h2>
        <p class="text-muted small text-uppercase">Cryptographic Seed Generation</p>
      </div>

      <div class="alert alert-warning py-2 small border-0 shadow-sm mb-4">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>CRITICAL:</strong> Write down this seed phrase. It is the only way to recover your
        Entity Node. The IO OS does not store this on any server.
      </div>

      <div class="p-3 bg-black rounded border border-secondary mb-4">
        <div class="row g-2">
          <div v-for="(word, index) in mnemonic.split(' ')" :key="index" class="col-4">
            <div
              class="p-2 bg-dark rounded text-center small font-monospace border border-secondary border-opacity-25"
            >
              <span class="text-secondary me-1">{{ index + 1 }}.</span> {{ word }}
            </div>
          </div>
        </div>
      </div>

      <button
        @click="handleSeedPhraseConfirm"
        class="btn btn-warning w-100 fw-bold py-2 text-uppercase"
      >
        I Have Secured My Seed Phrase
      </button>
    </div>

    <div
      v-else-if="showVerifySeedPhrase"
      class="card bg-dark border-warning shadow-lg p-4"
      style="width: 100%; max-width: 500px"
    >
      <div class="text-center mb-4">
        <h2 class="fw-bold text-warning font-monospace">IDENTITY VERIFICATION</h2>
        <p class="text-muted small text-uppercase">Confirm Seed Phrase Security</p>
      </div>

      <div v-if="error" class="alert alert-danger py-2 small border-0 shadow-sm mb-3">
        <i class="bi bi-exclamation-octagon-fill me-2"></i> {{ error }}
      </div>

      <div class="alert alert-info py-2 small border-0 shadow-sm mb-4">
        <i class="bi bi-info-circle-fill me-2"></i>
        To confirm you have securely recorded your seed phrase, please enter the requested words
        below.
      </div>

      <div class="p-3 bg-black rounded border border-secondary mb-4">
        <div class="row g-2">
          <div
            v-for="(challenge, index) in verificationWords"
            :key="challenge.index"
            class="col-12 mb-2"
          >
            <label class="form-label small font-monospace text-secondary text-uppercase"
              >Word #{{ challenge.index + 1 }}:</label
            >
            <input
              v-model="verificationInputs[index]"
              type="text"
              class="form-control bg-dark text-white border-secondary font-monospace"
              :class="{
                'is-valid':
                  verificationInputs[index].toLowerCase() === challenge.word.toLowerCase() &&
                  verificationInputs[index] !== '',
                'is-invalid':
                  verificationInputs[index].toLowerCase() !== challenge.word.toLowerCase() &&
                  verificationInputs[index] !== ''
              }"
            />
            <div
              v-if="
                verificationInputs[index].toLowerCase() === challenge.word.toLowerCase() &&
                verificationInputs[index] !== ''
              "
              class="valid-feedback d-block tiny"
            >
              Symmetry Confirmed.
            </div>
            <div
              v-else-if="
                verificationInputs[index].toLowerCase() !== challenge.word.toLowerCase() &&
                verificationInputs[index] !== ''
              "
              class="invalid-feedback d-block tiny"
            >
              Asymmetry Detected.
            </div>
          </div>
        </div>
      </div>

      <button
        @click="handleVerifySeedPhrase"
        class="btn btn-primary w-100 fw-bold py-2 text-uppercase"
        :disabled="verificationInputs.some((input) => input === '')"
      >
        VERIFY SEED PHRASE
      </button>
    </div>

    <div v-else-if="showManifesto" class="w-100 p-3" style="max-width: 900px">
      <IopicManifestoViewer :ioLoad="ioLoad" @sync-complete="handleManifestoSync" />
    </div>

    <div
      v-else-if="faceCaptured || showSeedPhrase || showVerifySeedPhrase || showManifesto"
      class="card bg-dark border-secondary shadow-lg p-4"
      style="width: 100%; max-width: 400px"
    >
      <div class="text-center mb-4">
        <h2 class="fw-bold text-primary font-monospace">IDENTITY REGISTRATION</h2>
        <p class="text-muted small text-uppercase">Initialize New IO Entity</p>
      </div>

      <div v-if="error" class="alert alert-danger py-2 small border-0 shadow-sm mb-3">
        <i class="bi bi-exclamation-octagon-fill me-2"></i> {{ error }}
      </div>

      <form @submit.prevent="handleRegister">
        <div class="mb-3 d-flex align-items-end justify-content-between">
          <div style="flex: 1">
            <label class="form-label small font-monospace text-secondary text-uppercase"
              >Entity Name</label
            >
            <input
              v-model="name"
              type="text"
              class="form-control bg-black text-white border-secondary"
              required
              placeholder="Full Identity"
            />
          </div>
          <button
            type="button"
            class="btn btn-outline-info ms-2 mb-1"
            @click="importFromContacts"
            title="Import from Contacts"
          >
            <i class="bi bi-person-lines-fill"></i> Import
          </button>
        </div>
        <div class="mb-3">
          <label class="form-label small font-monospace text-secondary text-uppercase"
            >Entity Email</label
          >
          <input
            v-model="email"
            type="email"
            class="form-control bg-black text-white border-secondary"
            required
            placeholder="entity@iopic.world"
          />
        </div>
        <div class="mb-3">
          <label class="form-label small font-monospace text-secondary text-uppercase"
            >Recovery Email</label
          >
          <input
            v-model="recoveryEmail"
            type="email"
            class="form-control bg-black text-white border-secondary"
            required
            placeholder="recovery@email.com"
          />
        </div>
        <div class="mb-3">
          <label class="form-label small font-monospace text-secondary text-uppercase"
            >Recovery Phone</label
          >
          <input
            v-model="recoveryPhone"
            type="tel"
            class="form-control bg-black text-white border-secondary"
            required
            placeholder="+1 555-555-5555"
          />
        </div>
        <div class="mb-3">
          <label class="form-label small font-monospace text-secondary text-uppercase"
            >Access Code</label
          >
          <div class="input-group">
            <input
              v-model="password"
              :type="showPasswords ? 'text' : 'password'"
              class="form-control bg-black text-white border-secondary"
              required
              placeholder="Min 6 characters"
            />
            <button
              class="btn btn-outline-secondary border-secondary text-secondary"
              type="button"
              @click="showPasswords = !showPasswords"
            >
              <i :class="['bi', showPasswords ? 'bi-eye-slash' : 'bi-eye']"></i>
            </button>
          </div>
          <div v-if="password" class="mt-2">
            <div class="progress bg-secondary" style="height: 4px">
              <div
                class="progress-bar"
                :class="passwordStrength.color"
                role="progressbar"
                :style="{ width: passwordStrength.width }"
              ></div>
            </div>
            <div class="d-flex justify-content-between mt-1">
              <span
                class="text-uppercase font-monospace"
                style="font-size: 0.65rem"
                :class="passwordStrength.color.replace('bg-', 'text-')"
                >Strength: {{ passwordStrength.label }}</span
              >
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label small font-monospace text-secondary text-uppercase"
            >Confirm Access Code</label
          >
          <div class="input-group">
            <input
              v-model="confirmPassword"
              :type="showPasswords ? 'text' : 'password'"
              class="form-control bg-black text-white border-secondary"
              required
              placeholder="Repeat code"
            />
            <button
              class="btn btn-outline-secondary border-secondary text-secondary"
              type="button"
              @click="showPasswords = !showPasswords"
            >
              <i :class="['bi', showPasswords ? 'bi-eye-slash' : 'bi-eye']"></i>
            </button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100 fw-bold mt-2 py-2" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          CREATE ENTITY
        </button>
      </form>

      <div class="mt-4 text-center">
        <div class="mb-2">
          <span class="text-muted small">Existing Entity? </span>
          <router-link to="/login" class="text-primary small text-decoration-none hover-link">
            Access Verification
          </router-link>
        </div>
        <router-link to="/" class="text-secondary small text-decoration-none hover-link">
          <i class="bi bi-arrow-left"></i> Return to Terminal
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  background: radial-gradient(circle, #111 0%, #000 100%);
}

.hover-link:hover {
  color: #007bff !important;
}

.form-control:focus {
  background-color: #050505;
  border-color: #007bff;
  color: white;
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.25);
}
</style>
