<template>
  <div class="container mt-5 text-center">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h1 class="display-1 text-danger">403</h1>
        <h2 class="mb-4">Access Denied</h2>
        <p class="lead mb-5">
          {{ translatedDenialMessage || denialMessage }}
        </p>

        <!-- Semantic Metrics Substrate -->
        <div
          v-if="translationConfidence !== null"
          class="d-flex justify-content-center gap-3 mb-4 font-monospace tiny opacity-75"
        >
          <span :class="translationConfidence > 0.9 ? 'text-success' : 'text-warning'">
            CONFIDENCE: {{ (translationConfidence * 100).toFixed(1) }}%
          </span>
          <span class="text-info"> LATENCY: {{ translationLatency }} </span>
        </div>

        <!-- Noise Detection Warning -->
        <div
          v-if="highNoiseDetected"
          class="alert alert-warning py-2 mb-4 shadow-sm border-warning font-monospace tiny"
        >
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Ω SIGNAL DEGRADATION:</strong> High linguistic noise detected in protocol intent.
          Identity grounding may be unstable.
        </div>

        <router-link to="/" class="btn btn-primary"> Return to Home Substrate </router-link>

        <div class="mt-4 pt-4 border-top">
          <p v-if="!requestSent" class="text-muted small">
            Need elevated clearance? Request an upgrade to the
            <strong>{{ missingRole || 'appropriate' }}</strong> role.
          </p>
          <button
            v-if="!requestSent"
            @click="submitAccessRequest"
            :disabled="isSubmitting"
            class="btn btn-outline-warning"
          >
            {{ isSubmitting ? 'Transmitting Request...' : 'Request Protocol Access' }}
          </button>
          <div v-else class="mt-2">
            <div
              v-if="existingRequest?.status === 'Pending'"
              class="alert alert-info py-2 shadow-sm"
            >
              <span class="spinner-border spinner-border-sm me-2"></span>
              Awaiting administrative synchronization for
              <strong>{{ missingRole }}</strong> clearance.
            </div>
            <div
              v-else-if="existingRequest?.status === 'Approved'"
              class="alert alert-success py-2 shadow-sm"
            >
              ✅ Clearance Granted! Click "Synchronize Identity" below to activate your new
              permissions.
              <div v-if="redirectCountdown !== null" class="mt-1 small fw-bold">
                Automated redirect to Dashboard in {{ redirectCountdown }}s...
                <button
                  @click="cancelRedirect"
                  class="btn btn-sm btn-link text-success p-0 ms-2 fw-bold"
                  style="text-decoration: underline; font-size: 0.75rem"
                >
                  Cancel Redirect
                </button>
              </div>
            </div>
            <div
              v-else-if="existingRequest?.status === 'Denied'"
              class="alert alert-danger py-2 shadow-sm"
            >
              ❌ Request Refused:
              {{ existingRequest.denialReason || 'Insufficient protocol symmetry.' }}
              <div class="mt-2 pt-2 border-top border-danger border-opacity-25">
                <button
                  @click="dismissAndDeleteRequest"
                  :disabled="isDeleting"
                  class="btn btn-sm btn-link text-danger p-0 fw-bold"
                  style="text-decoration: underline; font-size: 0.75rem"
                >
                  {{ isDeleting ? 'Purging Request...' : 'Dismiss and Purge Request' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Substrate Debugging -->
        <div class="mt-5 text-start border-top pt-4">
          <h6
            class="text-muted text-uppercase mb-3"
            style="font-size: 0.75rem; letter-spacing: 1px"
          >
            Security Substrate Debug
          </h6>

          <div class="mb-3">
            <p class="text-muted small text-uppercase fw-bold mb-2" style="font-size: 0.6rem">
              Active Custom Claims
            </p>
            <div v-if="Object.keys(protocolClaims).length > 0" class="d-flex flex-wrap gap-2">
              <span
                v-for="(value, key) in protocolClaims"
                :key="key"
                class="badge bg-success text-white border-0 shadow-sm px-2 py-1 font-monospace"
              >
                {{ key }}: {{ value }}
              </span>
            </div>
            <p v-else class="text-muted small font-italic">No protocol-specific claims detected.</p>
          </div>

          <details class="mb-3">
            <summary class="text-muted small mb-2" style="font-size: 0.65rem; cursor: pointer">
              Inspect Raw Token Substrate
            </summary>
            <pre
              class="bg-dark text-success p-3 border rounded small shadow-sm mb-0"
            ><code>{{ JSON.stringify(claims, null, 2) }}</code></pre>
          </details>

          <button @click="refreshClaims" class="btn btn-sm btn-outline-info w-100">
            Synchronize Identity Substrate
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from './useAuth';
// import { useErrorSubstrate } from '@/errorHandler';
import { useErrorSubstrate } from './errorHandler';
import { db } from '@/firebase';
import { IopicTranslator } from '@/IopicUniversalTranslator';
import { useAsyncSymmetry } from '@/composables/useAsyncSymmetry';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  deleteDoc,
  doc
} from 'firebase/firestore';

const route = useRoute();
const router = useRouter();
const missingRole = computed(() => route.query.role);
const backendPort = import.meta.env.VITE_FIREBACK_PORT || 4000;
const isSubmitting = ref(false);
const isDeleting = ref(false);
const requestSent = ref(false);
const existingRequest = ref<any>(null);
const translatedDenialMessage = ref('');
const translationConfidence = ref<number | null>(null);
const translationLatency = ref<string | null>(null);
const highNoiseDetected = ref(false);
const redirectCountdown = ref<number | null>(null);
let countdownInterval: any = null;

// Initialize the translation substrate using the symmetry guard
const { execute: translate, isLoading: isTranslating } = useAsyncSymmetry(
  IopicTranslator.processSymmetry,
  { timeout: 5000 }
);

const denialMessage = computed(() => {
  if (missingRole.value === 'admin') {
    return 'Administrative clearance is required to access this restricted protocol node. Please contact the substrate owner.';
  } else if (missingRole.value === 'editor') {
    return 'Editor privileges are required to interface with this specific protocol substrate.';
  }
  return 'You do not have sufficient clearance to access this protocol node. Please contact your system administrator.';
});

const { user, claims, refreshClaims } = useAuth();
const { notifySuccess } = useErrorSubstrate();

function cancelRedirect() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  redirectCountdown.value = null;
}

async function dismissAndDeleteRequest() {
  if (!existingRequest.value?.id) return;

  isDeleting.value = true;
  try {
    await deleteDoc(doc(db, 'access_requests', existingRequest.value.id));
    // Reset local substrate state to allow a fresh request if needed
    existingRequest.value = null;
    requestSent.value = false;
    notifySuccess('Access request purged from substrate.');
  } catch (error) {
    // Re-throwing allows the global errorHandler or unhandledrejection listener to catch this
    throw error;
  } finally {
    isDeleting.value = false;
  }
}

let unsubscribe: Unsubscribe | null = null;

// Monitor existing requests for this user and specific role
watch(
  [user, missingRole],
  async ([newUser, newRole], _, onCleanup) => {
    onCleanup(() => {
      if (unsubscribe) unsubscribe();
    });

    if (!newUser || !newRole) {
      existingRequest.value = null;
      requestSent.value = false;
      translatedDenialMessage.value = '';
      translationConfidence.value = null;
      translationLatency.value = null;
      return;
    }

    const q = query(
      collection(db, 'access_requests'),
      where('uid', '==', newUser.uid),
      where('requestedRole', '==', newRole),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        const wasApproved = existingRequest.value?.status === 'Approved';

        existingRequest.value = { id: docSnap.id, ...data };
        requestSent.value = true;

        // Automatically synchronize the identity substrate when approval is detected
        if (!wasApproved && data.status === 'Approved') {
          refreshClaims();
          notifySuccess('Protocol permissions synchronized automatically.');

          // Initialize automated redirection sequence
          redirectCountdown.value = 5;
          if (countdownInterval) clearInterval(countdownInterval);
          countdownInterval = setInterval(() => {
            if (redirectCountdown.value !== null && redirectCountdown.value > 1) {
              redirectCountdown.value--;
            } else {
              clearInterval(countdownInterval);
              router.push('/dashboard');
            }
          }, 1000);
        }
      }
    });

    // Perform Semantic Intent Exchange (Translation)
    const result = await translate(denialMessage.value, 'en');
    if (result) {
      translatedDenialMessage.value = result.text;
      translationConfidence.value = result.confidence;
      translationLatency.value = result.latency;
    }

    // Calculate noise floor of the current protocol message
    const noise = IopicTranslator.calculateNoiseFloor(denialMessage.value || '');
    highNoiseDetected.value = noise > 0.8;

    if (import.meta.env.DEV) {
      console.log(`[Security Substrate] Monitoring backend on port: ${backendPort}`);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  // Signal all pending operations to abort when component is destroyed
  if (countdownInterval) clearInterval(countdownInterval);
});

const protocolClaims = computed(() => {
  const standardClaims = [
    'iss',
    'aud',
    'auth_time',
    'user_id',
    'sub',
    'iat',
    'exp',
    'email',
    'email_verified',
    'firebase',
    'name',
    'picture',
    'phone_number'
  ];
  return Object.fromEntries(
    Object.entries(claims.value).filter(([key]) => !standardClaims.includes(key))
  );
});

async function submitAccessRequest() {
  if (!user.value) return;

  isSubmitting.value = true;
  try {
    await addDoc(collection(db, 'access_requests'), {
      uid: user.value.uid,
      email: user.value.email,
      requestedRole: missingRole.value || 'unknown',
      status: 'Pending',
      timestamp: serverTimestamp(),
      // Include current claims for context
      currentClaims: claims.value
    });

    requestSent.value = true;
    notifySuccess('Access request transmitted. Await administrative synchronization.');
  } catch (error) {
    // Re-throwing allows the global errorHandler or unhandledrejection listener to catch this
    throw error;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.display-1 {
  font-weight: bold;
}
</style>
