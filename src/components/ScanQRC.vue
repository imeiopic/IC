<template>
  <div class="scan-container bg-black min-vh-100 p-4 text-center">
    <h2 class="text-white mb-4">02_REFERRAL_SIGHTING</h2>
    
    <!-- Video Substrate for QR Handshake -->
    <div class="video-wrapper position-relative mx-auto rounded-4 border border-white overflow-hidden" style="max-width: 500px;">
      <video ref="qrFeed" class="w-100 h-100" autoplay playsinline></video>
      <div class="scan-overlay position-absolute top-50 start-50 translate-middle w-75 h-50 border border-info border-2 opacity-50"></div>
    </div>

    <div class="status-box mt-4 p-3 bg-dark rounded-3">
      <p v-if="!informerFound" class="text-info animate-pulse">SCAN INFORMER QR TO COMMENCE HANDSHAKE...</p>
      <p v-else class="text-success fw-bold">SIGHTING: INFORMER [{{ informerID }}] CONFIRMED</p>
    </div>

    <button @click="navigateBack" class="btn btn-outline-light mt-4">ABORT TRANSIT</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import QrScanner from 'qr-scanner'; // Hardware-level scanner logic

const router = useRouter();
const qrFeed = ref<HTMLVideoElement | null>(null);
const informerFound = ref(false);
const informerID = ref<string | null>(null);
let scanner: QrScanner | null = null;

onMounted(async () => {
  if (qrFeed.value) {
    scanner = new QrScanner(
      qrFeed.value,
      result => handleHandshake(result.data),
      { returnDetailedScanResult: true, highlightScanRegion: true }
    );
    await scanner.start();
  }
});

const handleHandshake = (data: string) => {
  // Protocol: Extract ?ref= from the IOPIC link
  try {
    const url = new URL(data);
    const refID = url.searchParams.get('ref');

    if (refID) {
      informerFound.value = true;
      informerID.value = refID;
      
      // Ground the referral link into the local session substrate
      // This will be picked up by App.vue during the sighting phase
      sessionStorage.setItem('referrer_instance_id', refID);
      
      // Transit to the Biometric Sighting stage
      setTimeout(() => {
        router.push({ path: '/sighting', query: { ref: refID } });
      }, 1500);
    }
  } catch (e) {
    console.error("NOISE_DETECTED: INVALID_HANDSHAKE_FORMAT");
  }
};

onUnmounted(() => {
  if (scanner) {
    scanner.stop();
    scanner.destroy();
  }
});

const navigateBack = () => router.push('/');
</script>

<style scoped>
.video-wrapper {
  aspect-ratio: 1 / 1;
  background: #111;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
</style>