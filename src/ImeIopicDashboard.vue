<template>
  <div class="admin-dashboard container py-5">
    <h2 class="mb-4">Global Pulse Admin Tool</h2>
    <form @submit.prevent="sendPulse" class="card p-4 shadow-sm mb-4">
      <div class="mb-3">
        <label class="form-label">Title</label>
        <input v-model="title" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Body</label>
        <textarea
          v-model="body"
          class="form-control"
          rows="6"
          required
        ></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Author</label>
        <input v-model="author" class="form-control" required />
      </div>
      <button class="btn btn-primary" type="submit" :disabled="loading">
        Send Pulse
      </button>
      <span v-if="loading" class="ms-3 text-info">Sending...</span>
      <span v-if="success" class="ms-3 text-success">Pulse sent!</span>
      <span v-if="error" class="ms-3 text-danger">{{ error }}</span>
    </form>
    <!-- Protocol Actions -->
    <div class="card p-4 shadow-sm mb-4">
      <h5 class="mb-3">Protocol Actions</h5>
      <div class="d-grid gap-2 mb-2">
        <button
          class="btn btn-warning"
          :disabled="protocolLoading === 'amnesty'"
          @click="handleAmnestyPulse"
        >
          <span v-if="protocolLoading === 'amnesty'"
            >Running Amnesty Pulse...</span
          >
          <span v-else>Run Amnesty Pulse</span>
        </button>
        <button
          class="btn btn-secondary"
          :disabled="protocolLoading === 'silence'"
          @click="handleSilenceTest"
        >
          <span v-if="protocolLoading === 'silence'"
            >Running Silence Test...</span
          >
          <span v-else>Run Silence Test</span>
        </button>
        <button
          class="btn btn-info"
          :disabled="protocolLoading === 'audit'"
          @click="handleRootStewardAudit"
        >
          <span v-if="protocolLoading === 'audit'">Broadcasting Audit...</span>
          <span v-else>Broadcast Root Steward Audit</span>
        </button>
        <button
          class="btn btn-success"
          :disabled="protocolLoading === 'conversion'"
          @click="handleFirstConversionPulse"
        >
          <span v-if="protocolLoading === 'conversion'"
            >Running First Conversion Pulse...</span
          >
          <span v-else>Run First Conversion Pulse</span>
        </button>
      </div>
      <div class="d-grid gap-2 mb-2 mt-4">
        <button
          class="btn btn-outline-primary"
          @click="showFingerprintModal = true"
        >
          Sign with Fingerprint
        </button>
        <button class="btn btn-outline-info" @click="showFaceIdModal = true">
          Sign with Face ID
        </button>
      </div>
      <span v-if="protocolSuccess" class="text-success">{{
        protocolSuccess
      }}</span>
      <span v-if="protocolError" class="text-danger">{{ protocolError }}</span>
      <FingerprintCaptureModal
        v-if="showFingerprintModal"
        @success="onFingerprintSuccess"
        @close="showFingerprintModal = false"
      />
      <FaceIdCaptureModal
        v-if="showFaceIdModal"
        @success="onFaceIdSuccess"
        @close="showFaceIdModal = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { broadcastGlobalPulse } from "./broadcastGlobalPulse";
import {
  runAmnestyPulse,
  runSilenceTest,
  runRootStewardAudit,
  runFirstConversionPulse,
} from "./globalProtocolActions";
import FingerprintCaptureModal from "./components/modals/FingerprintCaptureModal.vue";
import FaceIdCaptureModal from "./components/modals/FaceIdCaptureModal.vue";

const title = ref("");
const body = ref("");
const author = ref("");
const loading = ref(false);
const success = ref(false);
const error = ref("");

// Protocol action loading and feedback states
const protocolLoading = ref(""); // action name or ""
const protocolSuccess = ref(""); // message
const protocolError = ref(""); // message

const showFingerprintModal = ref(false);
const showFaceIdModal = ref(false);

function onFingerprintSuccess(fingerprintData) {
  showFingerprintModal.value = false;
  protocolSuccess.value = `Fingerprint captured: ${fingerprintData}`;
  // TODO: Wire to Firestore or protocol action as needed
}

function onFaceIdSuccess(faceIdData) {
  showFaceIdModal.value = false;
  protocolSuccess.value = `Face ID captured: ${faceIdData}`;
  // TODO: Wire to Firestore or protocol action as needed
}

async function sendPulse() {
  loading.value = true;
  success.value = false;
  error.value = "";
  try {
    await broadcastGlobalPulse({
      title: title.value,
      body: body.value,
      author: author.value,
    });
    success.value = true;
    title.value = "";
    body.value = "";
    author.value = "";
  } catch (e) {
    error.value = e.message || "Failed to send.";
  } finally {
    loading.value = false;
  }
}

async function handleAmnestyPulse() {
  protocolLoading.value = "amnesty";
  protocolSuccess.value = "";
  protocolError.value = "";
  try {
    await runAmnestyPulse(author.value || "RootSteward");
    protocolSuccess.value = "Amnesty Pulse completed.";
  } catch (e) {
    protocolError.value = e.message || "Amnesty Pulse failed.";
  } finally {
    protocolLoading.value = "";
  }
}

async function handleSilenceTest() {
  protocolLoading.value = "silence";
  protocolSuccess.value = "";
  protocolError.value = "";
  try {
    await runSilenceTest(author.value || "RootSteward");
    protocolSuccess.value = "Silence Test completed.";
  } catch (e) {
    protocolError.value = e.message || "Silence Test failed.";
  } finally {
    protocolLoading.value = "";
  }
}

async function handleRootStewardAudit() {
  protocolLoading.value = "audit";
  protocolSuccess.value = "";
  protocolError.value = "";
  try {
    await runRootStewardAudit(
      author.value || "RootSteward",
      "Current planetary yield: 1,204,551 nodes, 890,230 active BS-Molecules, 100% TPE Pulse.",
    );
    protocolSuccess.value = "Root Steward Audit broadcasted.";
  } catch (e) {
    protocolError.value = e.message || "Audit failed.";
  } finally {
    protocolLoading.value = "";
  }
}

async function handleFirstConversionPulse() {
  protocolLoading.value = "conversion";
  protocolSuccess.value = "";
  protocolError.value = "";
  try {
    await runFirstConversionPulse(author.value || "RootSteward");
    protocolSuccess.value = "First Conversion Pulse completed.";
  } catch (e) {
    protocolError.value = e.message || "First Conversion Pulse failed.";
  } finally {
    protocolLoading.value = "";
  }
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 600px;
}
</style>
