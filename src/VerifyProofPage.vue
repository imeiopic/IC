<script setup lang="ts">
import { ref } from 'vue';
import { verifyMessage } from 'ethers';
import { detectFaceWithGoogleVision } from './googleVision';
import { transcribeVoiceWithGoogleSpeech } from './googleSpeech';

const proofData = ref<any>(null);
const verificationStatus = ref<'idle' | 'valid' | 'invalid'>('idle');
const error = ref('');
const recoveredAddress = ref('');

// Face-ID and Voice-ID logic
const showFaceModal = ref(false);
const showVoiceModal = ref(false);
const faceStatus = ref<'idle' | 'verifying' | 'success' | 'fail'>('idle');
const voiceStatus = ref<'idle' | 'verifying' | 'success' | 'fail'>('idle');
const faceStream = ref<MediaStream | null>(null);
const voiceStream = ref<MediaStream | null>(null);

const startFaceID = async () => {
  showFaceModal.value = true;
  faceStatus.value = 'idle';
  try {
    faceStream.value = await navigator.mediaDevices.getUserMedia({ video: true });
  } catch (e) {
    faceStatus.value = 'fail';
  }
};

const GOOGLE_VISION_API_KEY = 'AIzaSyBYcq3QHF4FLGBWzGMZFyjNMTy_Gtag308'; // TODO: Secure this in production!

const verifyFaceID = async () => {
  faceStatus.value = 'verifying';
  try {
    // Capture a frame from the video stream
    const video = document.createElement('video');
    video.srcObject = faceStream.value;
    await video.play();
    await new Promise((r) => setTimeout(r, 300)); // Wait for video to be ready
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    const base64 = dataUrl.replace(/^data:image\/(png|jpeg);base64,/, '');

    // Call Google Vision API
    const result = await detectFaceWithGoogleVision(base64, GOOGLE_VISION_API_KEY);
    const faces = result.responses?.[0]?.faceAnnotations;
    if (faces && faces.length > 0) {
      faceStatus.value = 'success';
    } else {
      faceStatus.value = 'fail';
    }
  } catch (e) {
    faceStatus.value = 'fail';
  } finally {
    if (faceStream.value) {
      faceStream.value.getTracks().forEach((track) => track.stop());
      faceStream.value = null;
    }
    showFaceModal.value = false;
  }
};
const cancelFaceID = () => {
  showFaceModal.value = false;
  if (faceStream.value) {
    faceStream.value.getTracks().forEach((track) => track.stop());
    faceStream.value = null;
  }
};

const startVoiceID = async () => {
  showVoiceModal.value = true;
  voiceStatus.value = 'idle';
  try {
    voiceStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    voiceStatus.value = 'fail';
  }
};
const GOOGLE_SPEECH_API_KEY = 'AIzaSyBYcq3QHF4FLGBWzGMZFyjNMTy_Gtag308'; // TODO: Secure this in production!

const verifyVoiceID = async () => {
  voiceStatus.value = 'verifying';
  try {
    // Record 3 seconds of audio from the mic
    const stream = voiceStream.value;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    let audioChunks = [];
    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    mediaRecorder.start();
    await new Promise((r) => setTimeout(r, 3000));
    mediaRecorder.stop();
    await new Promise((resolve) => {
      mediaRecorder.onstop = resolve;
    });
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

    // Convert to WAV/PCM (Speech API expects LINEAR16, but for demo, send as base64 webm)
    // In production, use a library to convert to LINEAR16 PCM
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Call Google Speech-to-Text API
    const result = await transcribeVoiceWithGoogleSpeech(base64Audio, GOOGLE_SPEECH_API_KEY);
    const transcript = result.results?.[0]?.alternatives?.[0]?.transcript;
    if (transcript && transcript.length > 0) {
      voiceStatus.value = 'success';
    } else {
      voiceStatus.value = 'fail';
    }
  } catch (e) {
    voiceStatus.value = 'fail';
  } finally {
    if (voiceStream.value) {
      voiceStream.value.getTracks().forEach((track) => track.stop());
      voiceStream.value = null;
    }
    showVoiceModal.value = false;
  }
};
const cancelVoiceID = () => {
  showVoiceModal.value = false;
  if (voiceStream.value) {
    voiceStream.value.getTracks().forEach((track) => track.stop());
    voiceStream.value = null;
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);
      if (!json.header || !json.bond || !json.header.signature) {
        throw new Error('Invalid IOPIC Proof Format: Missing core protocol headers.');
      }
      proofData.value = json;
      verifyProof(json);
    } catch (err: any) {
      error.value = err.message || 'Failed to parse protocol transmission.';
      verificationStatus.value = 'invalid';
    }
  };
  reader.readAsText(file);
};

const verifyProof = async (json: any) => {
  error.value = '';
  try {
    // The message signed in DashboardPage was JSON.stringify(bondPayload)
    const message = JSON.stringify(json.bond);
    const signature = json.header.signature;

    const address = verifyMessage(message, signature);
    recoveredAddress.value = address;

    if (address.toLowerCase() === json.header.signerAddress.toLowerCase()) {
      verificationStatus.value = 'valid';
    } else {
      verificationStatus.value = 'invalid';
      error.value = 'Cryptographic Mismatch: Signer address does not match the signature.';
    }
  } catch (err) {
    verificationStatus.value = 'invalid';
    error.value = 'Signature Verification Failure: The cryptographic hash is corrupted.';
  }
};
</script>

<template>
  <div class="verify-page min-vh-100 bg-black text-light py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card bg-dark border-secondary shadow-lg mb-4">
            <div class="card-header border-secondary py-3">
              <h5 class="mb-0 font-monospace text-primary">IO "Verification"</h5>
            </div>
            <div class="card-body text-center py-5">
              <div v-if="verificationStatus === 'idle'" class="upload-zone">
                <i class="bi bi-shield-lock-fill display-1 text-secondary mb-3"></i>
                <h4>Upload Signed Proof</h4>
                <p class="text-muted small mb-4">
                  Select the .json file generated by the IDEAL ledger.
                </p>
                <input
                  type="file"
                  id="proofInput"
                  class="d-none"
                  @change="handleFileSelect"
                  accept=".json"
                />
                <label for="proofInput" class="btn btn-outline-primary px-5 fw-bold"
                  >INITIATE UPLOAD</label
                >
              </div>

              <div v-else class="results-zone">
                <div
                  :class="[
                    'alert',
                    verificationStatus === 'valid' ? 'alert-success' : 'alert-danger',
                    'border-0 shadow-sm'
                  ]"
                >
                  <h4 class="mb-0">
                    <i
                      :class="[
                        'bi',
                        verificationStatus === 'valid'
                          ? 'bi-check-circle-fill'
                          : 'bi-exclamation-triangle-fill',
                        'me-2'
                      ]"
                    ></i>
                    {{
                      verificationStatus === 'valid'
                        ? 'LOGICAL TRUTH VERIFIED'
                        : 'VERIFICATION FAILED'
                    }}
                  </h4>
                </div>

                <div v-if="error" class="text-danger small font-monospace mb-3">{{ error }}</div>

                <div
                  class="text-start mt-4 p-3 bg-black border border-secondary rounded font-monospace small"
                >
                  <div class="text-primary mb-2">// DATA_STREAM_DETAILS:</div>
                  <div>
                    SIGNER: <span class="text-info">{{ proofData.header.signerAddress }}</span>
                  </div>
                  <div>TIMESTAMP: {{ new Date(proofData.header.timestamp).toLocaleString() }}</div>
                  <hr class="border-secondary" />
                  <div>BOND_ID: {{ proofData.bond.id }}</div>
                  <div>VRE_ID: {{ proofData.bond.vreId }}</div>
                  <div>
                    LOC: {{ proofData.bond.audit.coordinates.lat.toFixed(6) }},
                    {{ proofData.bond.audit.coordinates.lon.toFixed(6) }}
                  </div>
                </div>

                <button
                  class="btn btn-secondary mt-4"
                  @click="
                    verificationStatus = 'idle';
                    proofData = null;
                    error = '';
                  "
                >
                  VERIFY ANOTHER PROOF
                </button>
              </div>

              <!-- Face-ID & Voice-ID Buttons and Results (always visible) -->
              <div class="mt-4 d-flex flex-column flex-md-row gap-3 justify-content-center">
                <button class="btn btn-outline-success px-4" @click="startFaceID">
                  <i class="bi bi-person-bounding-box me-2"></i>Face-ID
                </button>
                <button class="btn btn-outline-info px-4" @click="startVoiceID">
                  <i class="bi bi-mic-fill me-2"></i>Voice-ID
                </button>
              </div>
              <div class="mt-3 d-flex flex-column align-items-center">
                <div v-if="faceStatus === 'success'" class="alert alert-success w-100 text-center">
                  <i class="bi bi-person-bounding-box me-2"></i>Face-ID verified successfully!
                </div>
                <div v-if="faceStatus === 'fail'" class="alert alert-danger w-100 text-center">
                  <i class="bi bi-person-bounding-box me-2"></i>Face-ID verification failed or
                  denied.
                </div>
                <div v-if="voiceStatus === 'success'" class="alert alert-success w-100 text-center">
                  <i class="bi bi-mic-fill me-2"></i>Voice-ID verified successfully!
                </div>
                <div v-if="voiceStatus === 'fail'" class="alert alert-danger w-100 text-center">
                  <i class="bi bi-mic-fill me-2"></i>Voice-ID verification failed or denied.
                </div>
              </div>
            </div>
          </div>

          <div class="text-center">
            <router-link to="/" class="text-secondary text-decoration-none small">
              <i class="bi bi-arrow-left"></i> Return to Terminal
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verify-page {
  background: radial-gradient(circle, #111 0%, #000 100%);
}

.bg-black {
  background-color: #050505;
}
</style>
