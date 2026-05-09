<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2 class="text-glow">
        MANIFESTO FOR THE IOPIC AGE
        <span v-if="language.value !== 'en'">
          <!-- Translation badge or language indicator here if needed -->
        </span>
      </h2>
      <div
        class="manifesto-text scroll-area"
        ref="scrollArea"
        @scroll="onScroll"
      >
        <p>
          We, the nodes of the IOPIC-VRE ecosystem, commit to uphold the
          principles of transparency, collaboration, and innovation in the
          digital age. By signing this manifesto, you acknowledge your role as a
          responsible participant in this network.
        </p>
      </div>
      <div class="signature-options">
        <button
          class="action-btn"
          :disabled="!scrolledToEnd"
          @click="signWithSignature"
        >
          Sign with Signature
        </button>
        <button
          class="action-btn"
          :disabled="!scrolledToEnd"
          @click="signWithFingerprint"
        >
          Sign with Fingerprint
        </button>
        <button
          class="action-btn"
          :disabled="!scrolledToEnd"
          @click="signWithFaceId"
        >
          Sign with Face ID
        </button>
        <div v-if="!scrolledToEnd" class="scroll-hint">
          Scroll to the end to enable signing
        </div>
      </div>

      <!-- Signature Modal -->
      <SignatureCaptureModal
        v-if="showSignatureModal"
        @success="handleSignatureSuccess"
        @close="showSignatureModal = false"
      />
      <!-- Fingerprint Modal -->
      <FingerprintCaptureModal
        v-if="showFingerprintModal"
        @success="handleFingerprintSuccess"
        @close="showFingerprintModal = false"
      />
      <!-- Face ID Modal -->
      <FaceIdCaptureModal
        v-if="showFaceIdModal"
        @success="handleFaceIdSuccess"
        @close="showFaceIdModal = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import SignatureCaptureModal from "./SignatureCaptureModal.vue";
import FingerprintCaptureModal from "./FingerprintCaptureModal.vue";
import FaceIdCaptureModal from "./FaceIdCaptureModal.vue";
import { db, auth } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const scrolledToEnd = ref(false);
const scrollArea = ref(null);

// Enable sign buttons after scrolling to the end
function onScroll() {
  const el = scrollArea.value;
  if (!el) return;
  const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
  scrolledToEnd.value = atEnd;
}

onMounted(() => {
  // If content fits, enable immediately
  nextTick(() => {
    const el = scrollArea.value;
    if (el && el.scrollHeight <= el.clientHeight) {
      scrolledToEnd.value = true;
    }
  });
});
const language = ref("en");
const autoScrollSpeed = 2; // px per frame
const showSignatureModal = ref(false);
const showFingerprintModal = ref(false);
const showFaceIdModal = ref(false);
const feedback = ref("");

function signWithSignature() {
  showSignatureModal.value = true;
}
function signWithFingerprint() {
  showFingerprintModal.value = true;
}
function signWithFaceId() {
  showFaceIdModal.value = true;
}

async function handleSignatureSuccess(dataUrl) {
  showSignatureModal.value = false;
  feedback.value = "Submitting signature...";
  try {
    if (auth.currentUser) {
      await setDoc(
        doc(db, "manifesto_signatures", auth.currentUser.uid),
        {
          type: "signature",
          data: dataUrl,
          timestamp: serverTimestamp(),
        },
        { merge: true },
      );
    }
    emit("success", "signature");
  } catch (e) {
    feedback.value = "Failed to save signature.";
  }
}

async function handleFingerprintSuccess(fingerprintData) {
  showFingerprintModal.value = false;
  feedback.value = "Submitting fingerprint...";
  try {
    if (auth.currentUser) {
      await setDoc(
        doc(db, "manifesto_signatures", auth.currentUser.uid),
        {
          type: "fingerprint",
          data: fingerprintData,
          timestamp: serverTimestamp(),
        },
        { merge: true },
      );
    }
    emit("success", "fingerprint");
  } catch (e) {
    feedback.value = "Failed to save fingerprint.";
  }
}

async function handleFaceIdSuccess(faceIdData) {
  showFaceIdModal.value = false;
  feedback.value = "Submitting face ID...";
  try {
    if (auth.currentUser) {
      await setDoc(
        doc(db, "manifesto_signatures", auth.currentUser.uid),
        {
          type: "faceid",
          data: faceIdData,
          timestamp: serverTimestamp(),
        },
        { merge: true },
      );
    }
    emit("success", "faceid");
  } catch (e) {
    feedback.value = "Failed to save face ID.";
  }
}
const emit = defineEmits(["success"]);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #050505;
  border: 1px solid #00ff41;
  padding: 2rem;
  max-width: 600px;
  color: #00ff41;
  font-family: "Space Mono", monospace;
}
.text-glow {
  text-shadow: 0 0 10px #00ff41;
}
.scroll-area {
  height: 300px;
  overflow-y: auto;
  margin: 1rem 0;
  border-top: 1px solid #111;
  padding-top: 1rem;
}
.manifesto-text {
  font-size: 1.1rem;
  line-height: 1.7;
}
.action-btn {
  width: 100%;
  padding: 1rem;
  background: #00ff41;
  color: #000;
  border: none;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1.5rem;
}
.signature-options {
  margin-top: 1.5rem;
  text-align: center;
}
.scroll-hint {
  color: #888;
  text-align: center;
  margin-top: 1.5rem;
  font-size: 1rem;
}
</style>
