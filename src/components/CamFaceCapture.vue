<template>
  <div class="cam-face-capture">
    <h2>Face Capture for {{ props.userName || 'User' }}</h2>
    <div class="video-container">
      <video ref="videoElement" autoplay playsinline></video>
      <canvas ref="canvasElement" style="display: none"></canvas>
      <div v-if="isLivenessCheckActive" class="liveness-overlay">
        <p class="liveness-prompt">{{ livenessPrompt }}</p>
        <div class="liveness-spinner"></div>
      </div>
    </div>

    <div class="controls">
      <button @click="startCamera" :disabled="cameraActive">Start Camera</button>
      <button @click="stopCamera" :disabled="!cameraActive">Stop Camera</button>
      <button @click="initiateLivenessCapture" :disabled="!cameraActive || isLivenessCheckActive">
        Capture Face
      </button>
    </div>

    <div v-if="capturedImage" class="captured-preview">
      <h3>Captured Image:</h3>
      <img :src="capturedImage" alt="Captured Face" />
      <button @click="clearCapturedImage">Retake</button>
      <button @click="uploadCapturedImage" :disabled="props.isUploading">
        {{
          props.isUploading ? props.uploadMessage || 'Uploading...' : 'Upload for Biometric Capture'
        }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Define props
const props = defineProps<{
  userName?: string; // Optional user name for display
  isUploading?: boolean; // Controlled by parent to disable upload button
  uploadMessage?: string | null; // Message from parent about upload status
}>();

// Define emitted events, updated to include livenessAction
const emit = defineEmits<{
  (e: 'image-captured', imageData: string, livenessAction: string | null): void;
  (e: 'upload-request', imageData: string, livenessAction: string | null): void;
  (e: 'error', message: string): void;
}>();
// Template refs
const videoElement = ref<HTMLVideoElement | null>(null);
const canvasElement = ref<HTMLCanvasElement | null>(null);

// Reactive state
const cameraActive = ref(false);
const capturedImage = ref<string | null>(null);
let mediaStream: MediaStream | null = null;

// Liveness detection state
const isLivenessCheckActive = ref(false);
const livenessPrompt = ref('');
const livenessActions = [
  'Please blink your eyes',
  'Please turn your head slightly left',
  'Please turn your head slightly right',
  'Please smile briefly',
  'Please open and close your mouth'
];
const livenessActionSequence = ref<string[]>([]); // Stores the sequence for the current capture
const currentLivenessActionIndex = ref<number>(0); // Tracks current action in sequence

/**
 * Starts the camera and displays the feed in the video element.
 */
async function startCamera() {
  if (!videoElement.value) {
    // Removed capturedImage.value = null; as it's not needed here
    emit('error', 'Video element not found.');
    return;
  }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.value.srcObject = mediaStream;
    await videoElement.value.play();
    cameraActive.value = true;
    console.log('CamFaceCapture: Camera started successfully.'); // Use console.log for client-side
  } catch (err: any) {
    console.error('Error accessing camera:', err);
    emit('error', `Failed to access camera: ${err.message || err}`);
    cameraActive.value = false;
  }
}

/**
 * Stops the camera and releases the media stream.
 */
function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
  cameraActive.value = false;
  console.log('CamFaceCapture: Camera stopped.'); // Use console.log for client-side
}

/**
 * Initiates the liveness check flow, prompts the user, then captures the image.
 */
async function initiateLivenessCapture() {
  if (!cameraActive.value) {
    emit('error', 'Camera not active.');
    return;
  }

  isLivenessCheckActive.value = true;
  capturedImage.value = null; // Clear any previous captured image
  livenessActionSequence.value = []; // Reset sequence for new capture
  currentLivenessActionIndex.value = 0; // Reset index

  // Generate a random sequence of 2 to 3 unique liveness actions
  const numActions = Math.floor(Math.random() * 2) + 2; // 2 or 3 actions
  const shuffledActions = [...livenessActions].sort(() => 0.5 - Math.random());
  livenessActionSequence.value = shuffledActions.slice(0, numActions);

  console.log(
    `CamFaceCapture: Initiating liveness check with sequence: ${livenessActionSequence.value.join(
      ', '
    )}`
  );

  for (let i = 0; i < livenessActionSequence.value.length; i++) {
    currentLivenessActionIndex.value = i;
    livenessPrompt.value = livenessActionSequence.value[i];
    console.log(`CamFaceCapture: Liveness prompt: ${livenessPrompt.value}`);
    await new Promise((resolve) => setTimeout(resolve, 2500)); // Time for user to react to each prompt
  }

  // Add a final brief pause before capture after the last prompt
  livenessPrompt.value = 'Capturing...';
  await new Promise((resolve) => setTimeout(resolve, 1000));

  isLivenessCheckActive.value = false; // Liveness check is now complete
  livenessPrompt.value = '';
  currentLivenessActionIndex.value = 0; // Reset index after sequence

  _captureImage(); // Call the internal image capture function
}

/**
 * Captures a frame from the video feed and converts it to a base64 image.
 */
function _captureImage() {
  // Renamed from captureImage to _captureImage and made internal
  // Renamed to be an internal helper
  if (!videoElement.value || !canvasElement.value || !cameraActive.value) {
    emit('error', 'Camera not active or elements not ready.');
    return;
  }

  const video = videoElement.value;
  const canvas = canvasElement.value;
  const context = canvas.getContext('2d');

  if (!context) {
    emit('error', 'Could not get 2D context from canvas.');
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  capturedImage.value = canvas.toDataURL('image/jpeg');
  emit('image-captured', capturedImage.value, livenessActionSequence.value.join(';')); // Emit with liveness action
  console.log('CamFaceCapture: Image captured.'); // Use console.log for client-side
}

/**
 * Clears the captured image preview.
 */
function clearCapturedImage() {
  capturedImage.value = null;
}

/**
 * Emits an event to request uploading the captured image.
 */
function uploadCapturedImage() {
  if (capturedImage.value) {
    emit('upload-request', capturedImage.value, livenessActionSequence.value.join(';'));
  }
}

// Lifecycle hooks
onMounted(() => {
  // Optionally start camera automatically on mount
  // startCamera();
});

onUnmounted(() => {
  stopCamera();
});
</script>

<style scoped>
.cam-face-capture {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: 600px;
  margin: 20px auto;
  background-color: #f9f9f9;
}

.video-container {
  width: 100%;
  max-width: 480px; /* Adjust as needed */
  border: 1px solid #ddd;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 4px;
}

.video-container video {
  width: 100%;
  height: auto;
  display: block;
}

.liveness-overlay {
  /* Re-added liveness overlay styles */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
}

.liveness-prompt {
  /* Re-added liveness prompt styles */
  margin-bottom: 15px;
}

.liveness-spinner {
  /* Re-added liveness spinner styles */
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

.controls button {
  padding: 10px 15px;
  margin: 5px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 1rem;
}

.controls button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.captured-preview {
  text-align: center;
}

.captured-preview img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  margin-top: 10px;
  border-radius: 4px;
}

.error-message {
  /* Removed error message display from component */
  color: red;
  font-weight: bold;
}

@keyframes spin {
  /* Re-added spin animation */
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
