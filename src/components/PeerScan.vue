<template>
  <CContainer
    fluid
    class="peer-scan-substrate p-4 bg-black min-vh-100 font-mono text-white d-flex align-items-center justify-content-center"
  >
    <CCard
      class="bg-zinc-900 border-info shadow-glow text-center p-4 animate-in"
      style="max-width: 450px"
    >
      <CCardHeader class="bg-transparent border-0 mb-3">
        <h2 class="text-glow text-info italic font-black m-0">PEER_SCAN_QRC</h2>
        <div class="tiny text-zinc-500 uppercase tracking-widest">Scan_Sovereign_Handshake</div>
      </CCardHeader>

      <CCardBody>
        <div class="scanner-container position-relative mb-4">
          <video ref="videoElement" class="w-100 rounded-4 border border-info shadow-info"></video>
          <div
            v-if="!cameraActive"
            class="camera-placeholder position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-black-50 rounded-4"
          >
            <CSpinner color="info" />
          </div>
          <div
            v-if="scanResult"
            class="scan-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-success-50 rounded-4"
          >
            <i class="bi bi-check-circle-fill text-white display-4"></i>
          </div>
        </div>

        <div class="scan-status mb-4">
          <div v-if="scanResult" class="small font-black text-success">
            PEER_SIGHTED: {{ scanResult.peerId }}
          </div>
          <div v-else-if="errorMessage" class="small font-black text-danger">
            ERROR: {{ errorMessage }}
          </div>
          <div v-else class="small font-black text-info">
            {{ cameraActive ? 'SCANNING_FOR_PEER_PULSE...' : 'ACTIVATING_SCANNER...' }}
          </div>
        </div>

        <p class="small text-zinc-400 italic mb-4">
          "Point your camera at a peer's QR code to establish a direct connection."
        </p>

        <div class="d-flex flex-column gap-2">
          <CButton
            color="info"
            class="w-100 py-3 font-black italic shadow-info"
            @click="initiatePeerConnection"
          >
            <i class="bi bi-link-45deg me-2"></i>INITIATE_PEER_CONNECTION
          </CButton>

          <CButton
            v-if="!cameraActive"
            color="dark"
            variant="outline"
            class="w-100 font-black tiny text-zinc-500 border-zinc-800"
            @click="startScanner"
          >
            ACTIVATE_CAMERA
          </CButton>
          <CButton
            v-else
            color="dark"
            variant="outline"
            class="w-100 font-black tiny text-zinc-500 border-zinc-800"
            @click="stopScanner"
          >
            DEACTIVATE_CAMERA
          </CButton>

          <hr class="border-zinc-800 my-3" />

          <CButton
            color="secondary"
            variant="outline"
            class="w-100 font-black tiny text-zinc-500 border-zinc-800"
            @click="router.push('/peer')"
          >
            <i class="bi bi-qr-code me-2"></i>SWITCH_TO_GENERATOR
          </CButton>
        </div>
      </CCardBody>

      <CCardFooter class="bg-transparent border-0 mt-3">
        <div class="tiny text-zinc-700 font-mono">I = VR² | THE LOOP IS VISIBLE</div>
      </CCardFooter>
    </CCard>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import QrScanner from 'qr-scanner';
import { useRouter } from 'vue-router';

const router = useRouter();

const videoElement = ref<HTMLVideoElement | null>(null);
const qrScanner = ref<QrScanner | null>(null);
const cameraActive = ref(false);
const scanResult = ref<{ peerId: string } | null>(null);
const errorMessage = ref('');

/**
 * Starts the QR code scanner using the device's camera.
 */
const startScanner = async () => {
  errorMessage.value = '';
  scanResult.value = null;
  if (!videoElement.value) {
    errorMessage.value = 'Video element not found.';
    return;
  }

  try {
    qrScanner.value = new QrScanner(
      videoElement.value,
      (result: any) => {
        handleScanResult(result.data);
        stopScanner(); // Stop scanning after a successful scan
      },
      {
        /* Options for qr-scanner */
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5,
        // You can specify preferred camera here if needed, e.g., 'environment'
        // preferredCamera: 'environment',
      } as any
    );

    await qrScanner.value.start();
    cameraActive.value = true;
    console.log('SCANNER_ACTIVE: Camera started.');
  } catch (err: any) {
    console.error('SCANNER_ERROR: Failed to start camera:', err);
    errorMessage.value = `Failed to start camera: ${err.message || 'Unknown error'}. Please ensure camera permissions are granted.`;
    cameraActive.value = false;
  }
};

/**
 * Stops the QR code scanner and releases the camera.
 */
const stopScanner = () => {
  if (qrScanner.value) {
    qrScanner.value.stop();
    qrScanner.value.destroy(); // Clean up resources
    qrScanner.value = null;
    cameraActive.value = false;
    console.log('SCANNER_INACTIVE: Camera stopped.');
  }
};

/**
 * Handles the decoded QR code data.
 * Extracts the peerId from the URL.
 * @param data The decoded string from the QR code.
 */
const handleScanResult = (data: string) => {
  try {
    const url = new URL(data);
    const peerId = url.searchParams.get('peerId');
    if (peerId) {
      scanResult.value = { peerId };
      errorMessage.value = '';
      console.log('PEER_SIGHTED:', peerId);
      // Optionally, automatically initiate connection here or wait for user click
    } else {
      errorMessage.value = 'Invalid QR code: No peerId found.';
      console.warn('INVALID_QRC: No peerId parameter in URL:', data);
    }
  } catch (e) {
    errorMessage.value = 'Invalid QR code format.';
    console.error('INVALID_QRC_FORMAT:', e);
  }
};

/**
 * Placeholder for initiating the actual peer-to-peer connection.
 */
const initiatePeerConnection = () => {
  if (scanResult.value && scanResult.value.peerId) {
    alert(`INITIATING_CONNECTION_TO_PEER: ${scanResult.value.peerId}`);
    // TODO: Implement actual WebRTC or other P2P connection logic here
    // This would likely involve signaling through Firebase or another backend.
    // router.push(`/connect/${scanResult.value.peerId}`); // Example navigation
  } else {
    errorMessage.value = 'No peer QR code scanned yet.';
  }
};

onMounted(() => {
  console.log('PEER_SCAN: QR Code Scanner Substrate Active.');
  startScanner(); // Attempt to start scanner automatically on mount
});

onUnmounted(() => {
  stopScanner(); // Ensure camera is stopped when component is unmounted
});
</script>

<style scoped>
.peer-scan-substrate {
  background: radial-gradient(circle at center, #0a0a0a 0%, #000 100%);
}
.text-glow {
  text-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
}
.shadow-glow {
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.15) !important;
}
.shadow-info {
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
}

.scanner-container {
  width: 100%;
  max-width: 300px; /* Adjust as needed */
  margin: 0 auto;
  aspect-ratio: 1 / 1; /* Keep video square */
  overflow: hidden;
}

.scanner-container video {
  display: block; /* Remove extra space below video */
}

.camera-placeholder {
  background-color: rgba(0, 0, 0, 0.7);
}

.scan-overlay {
  background-color: rgba(40, 167, 69, 0.5); /* Semi-transparent green */
}

.animate-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.font-black {
  font-weight: 900;
}
.tiny {
  font-size: 0.65rem;
}
.italic {
  font-style: italic;
}
.bg-success-50 {
  background-color: rgba(40, 167, 69, 0.5);
} /* Custom class for semi-transparent success */
</style>
