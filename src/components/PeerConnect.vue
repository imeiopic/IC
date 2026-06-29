<template>
  <CContainer
    fluid
    class="peer-connect-substrate p-4 bg-black min-vh-100 font-mono text-white d-flex align-items-center justify-content-center"
  >
    <CCard
      class="bg-zinc-900 border-info shadow-glow text-center p-4 animate-in"
      style="max-width: 450px"
    >
      <CCardHeader class="bg-transparent border-0 mb-3">
        <h2 class="text-glow text-info italic font-black m-0">PEER_CONNECT_QRC</h2>
        <div class="tiny text-zinc-500 uppercase tracking-widest">Initiate_Sovereign_Handshake</div>
      </CCardHeader>

      <CCardBody>
        <div class="qrc-outer p-1 bg-info rounded-4 mb-4 shadow-info">
          <div class="qrc-container p-4 bg-white rounded-4 position-relative">
            <div v-if="!qrValue" class="placeholder-loader p-5">
              <CSpinner color="info" />
            </div>
            <qrcode-vue
              v-else
              :value="qrValue"
              :size="280"
              level="H"
              render-as="svg"
              foreground="#000000"
              class="img-fluid"
            />
            <div
              class="qrc-overlay position-absolute top-50 start-50 translate-middle bg-white p-1 rounded-circle"
            >
              <img
                src="/images/iologo.png"
                width="45"
                height="45"
                class="rounded-circle border border-zinc-200"
                alt="IO"
              />
            </div>
          </div>
        </div>

        <div class="node-meta mb-4">
          <div class="tiny text-zinc-600 uppercase mb-1">Your_Peer_ID</div>
          <div
            class="small font-black text-white bg-black p-2 rounded border border-zinc-800 tracking-tighter"
          >
            {{ userId }}
          </div>
        </div>

        <p class="small text-zinc-400 italic mb-4">
          "Scan this code with another device to establish a direct peer-to-peer connection."
        </p>

        <div class="d-flex flex-column gap-2">
          <CButton color="info" class="w-100 py-3 font-black italic shadow-info" @click="shareQRC">
            <i class="bi bi-share me-2"></i>SHARE_PEER_LINK
          </CButton>

          <CButton
            color="dark"
            variant="outline"
            class="w-100 font-black tiny text-zinc-500 border-zinc-800"
            @click="downloadQRC"
          >
            EXPORT_QRC_IMAGE
          </CButton>

          <hr class="border-zinc-800 my-3" />

          <CButton
            color="secondary"
            variant="outline"
            class="w-100 font-black tiny text-zinc-500 border-zinc-800"
            @click="router.push('/peer-scan')"
          >
            <i class="bi bi-qr-code-scan me-2"></i>SWITCH_TO_SCANNER
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
import { ref, onMounted, computed } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { useAuth } from '@composables/useAuth';
import { useRouter } from 'vue-router';

const router = useRouter();
const { user } = useAuth();

// Derived reactive variable for the peer ID
const userId = computed(() => user.value?.uid || 'AWAITING_PEER_ID');

// Computed property for the QR code's value, which is a URL for peer connection
const qrValue = computed(() => {
  // This URL should point to a page or endpoint that can handle the peer connection
  // and use the 'peerId' parameter to identify the target peer.
  // For example: `${window.location.origin}/connect-to-peer?peerId=${userId.value}`
  // For now, we'll use a placeholder that includes the user ID.
  return `${window.location.origin}/peer-connect?peerId=${userId.value}`;
});

/**
 * Shares the peer connection URL using the Web Share API or copies to clipboard as a fallback.
 */
const shareQRC = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'IOPIC Peer Connection',
        text: 'Connect with me on IOPIC!',
        url: qrValue.value
      });
    } catch (err) {
      console.log('SHARE_CANCELLED or FAILED:', err);
    }
  } else {
    // Fallback to Clipboard
    await navigator.clipboard.writeText(qrValue.value);
    alert('PEER_LINK_COPIED: Share this link to connect.');
  }
};

/**
 * Placeholder for downloading the QR code image.
 * Actual implementation would involve converting the SVG to a downloadable image format.
 */
const downloadQRC = () => {
  console.log('LOGIC: Packaging QRC image for export...');
  // TODO: Implement SVG to image conversion and download logic here
};

onMounted(() => {
  console.log('PEER_CONNECT: QR Code Substrate Active.');
});
</script>

<style scoped>
.peer-connect-substrate {
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

.qrc-outer {
  transition: transform 0.3s ease;
}
.qrc-outer:hover {
  transform: scale(1.02);
}

.qrc-container {
  display: inline-block;
  line-height: 0;
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
</style>
