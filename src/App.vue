<template>
  <div id="app" class="home-page" :class="{ 'splash-active': showSplash }">
    <div v-if="showSplash" class="splash-screen"></div>

    <div
      v-if="globalError"
      class="global-error-overlay alert alert-danger shadow-lg border-0 m-3"
      role="alert"
    >
      <div class="d-flex justify-content-between align-items-center">
        <span class="d-flex align-items-center gap-2">
          <i class="bi bi-shield-lock-fill"></i>
          <strong class="text-uppercase">System Alert:</strong> {{ globalError }}
        </span>
        <button type="button" class="btn-close" @click="clearError"></button>
      </div>
    </div>

    <div v-if="isInitialized" class="initialized-content">
      <div class="vignette-overlay"></div>

      <nav class="navbar navbar-expand-lg navbar-dark shadow-sm glass-navbar">
        <div class="container-fluid">
          <router-link class="navbar-brand fw-bold d-flex align-items-center" to="/">
            <img src="/images/logo" alt="IO Logo" width="32" height="32" class="me-2 logo-img" />
            IOPIC
          </router-link>

          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              <li class="nav-item d-none d-md-block px-3">
                <div
                  class="system-status font-monospace tiny text-uppercase d-flex flex-column align-items-end"
                >
                  <div class="status-top">
                    <span
                      :class="[
                        'status-dot',
                        isSynced ? 'text-success' : 'text-warning status-pulse'
                      ]"
                      >●</span
                    >
                    <span class="ms-1 text-white">{{
                      isSynced ? 'Bus: Synced' : 'Bus: Syncing'
                    }}</span>
                  </div>
                  <div
                    v-if="userLocation"
                    class="location-tag text-info italic"
                    style="font-size: 0.55rem; letter-spacing: 1px"
                  >
                    {{ userLocation.city }}, {{ userLocation.county }}
                  </div>
                </div>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/manifesto">Manifesto</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/gov">Government</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/reset">Reset</router-link>
              </li>
              <li class="nav-item"><router-link class="nav-link" to="/doc">Doc</router-link></li>
              <li class="nav-item">
                <router-link class="nav-link" to="/playlist">Playlist</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/video-gallery">VideoGallery</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/Slides">Slides</router-link>
              </li>
              <li class="nav-item"><router-link class="nav-link" to="/iod">Donate</router-link></li>
              <li class="nav-item" v-if="user">
                <router-link class="nav-link" to="/peers">My Peers</router-link>
              </li>

              <li class="nav-item d-none d-md-block px-3">
                <div class="system-status font-monospace tiny text-uppercase">
                  <span
                    :class="['status-dot', isSynced ? 'text-success' : 'text-warning status-pulse']"
                    >●</span
                  >
                  <span class="ms-1 text-white">{{
                    isSynced ? 'Bus: Synced' : 'Bus: Syncing'
                  }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main class="container text-center py-5 position-relative z-1">
        <router-view />
      </main>

      <div
        v-if="onboardingStep > 0"
        class="modal fade show d-block"
        style="background: rgba(0, 0, 0, 0.95)"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div
            class="modal-content bg-dark border border-emerald-500 text-white p-4 shadow-emerald"
          >
            <div v-if="onboardingStep === 1" class="text-center py-4">
              <i class="bi bi-person-bounding-box text-emerald-500 display-1"></i>
              <p class="mt-3 font-mono">
                Position your face in the frame to ground your identity node.
              </p>
              <button class="btn btn-primary w-100 py-3" @click="initCamera">
                Initialize Camera
              </button>
            </div>

            <div v-if="onboardingStep === 2" class="text-center">
              <div
                class="camera-wrap mx-auto mb-3 position-relative rounded-circle border border-emerald-500 overflow-hidden"
                style="width: 280px; height: 280px"
              >
                <video
                  ref="videoFeed"
                  autoplay
                  playsinline
                  class="w-100 h-100 object-cover grayscale"
                  style="transform: scaleX(-1)"
                ></video>
                <div class="scan-line"></div>
              </div>
              <canvas ref="captureCanvas" width="600" height="600" class="d-none"></canvas>
              <button class="btn btn-success w-100 py-3 font-black" @click="captureAndSighting">
                CAPTURE_SIGHTING
              </button>
            </div>

            <div v-if="onboardingStep === 3" class="py-5 text-center">
              <div class="spinner-border text-emerald-500 mb-3"></div>
              <p class="font-mono italic">SYNCING_WITH_CLEVELAND_CLUSTER...</p>
            </div>

            <div v-if="onboardingStep === 4" class="py-4">
              <h4 class="text-center italic font-black uppercase">Identity Grounding</h4>
              <div class="mb-3 mt-4 text-start">
                <label class="font-mono tiny text-zinc-500">INPUT FULL NAME</label>
                <input
                  v-model="fullName"
                  type="text"
                  class="form-control bg-transparent border-emerald-500 text-white font-mono"
                  placeholder="Real-World Identity"
                />
              </div>
              <button
                class="btn btn-primary w-100 py-3 font-black"
                @click="groundIdentity"
                :disabled="!fullName"
              >
                GROUND_IDENTITY
              </button>
            </div>

            <div v-if="onboardingStep === 5" class="py-4">
              <h4 class="text-center italic font-black uppercase">Mesh Connection</h4>
              <ul class="nav nav-pills nav-fill mb-3 bg-black rounded p-1">
                <li class="nav-item">
                  <button
                    class="nav-link btn-sm py-1"
                    :class="{ active: connectionMode === 'find' }"
                    @click="connectionMode = 'find'"
                  >
                    Connect
                  </button>
                </li>
                <li class="nav-item">
                  <button
                    class="nav-link btn-sm py-1"
                    :class="{ active: connectionMode === 'invites' }"
                    @click="checkInvites"
                  >
                    Invites ({{ invites.length }})
                  </button>
                </li>
              </ul>

              <div v-if="connectionMode === 'find'" class="text-start">
                <input
                  v-model="peerId"
                  type="text"
                  class="form-control bg-black border-zinc-700 text-white mb-2"
                  placeholder="Peer/Group ID"
                />
                <input
                  v-model="newGroupName"
                  type="text"
                  class="form-control bg-black border-zinc-700 text-white mb-3"
                  placeholder="OR Create New Group Name"
                />
                <button class="btn btn-success w-100 font-black" @click="initiateHandshake">
                  INITIATE_HANDSHAKE
                </button>
              </div>

              <div
                v-if="connectionMode === 'invites'"
                class="invite-list overflow-auto"
                style="max-height: 200px"
              >
                <div
                  v-for="inv in invites"
                  :key="inv.id"
                  class="d-flex justify-content-between align-items-center bg-zinc-900 p-2 mb-2 rounded border border-zinc-800"
                >
                  <span class="tiny font-mono">{{ inv.fromName }}</span>
                  <button class="btn btn-success btn-xs" @click="acceptInvite(inv)">ACCEPT</button>
                </div>
                <p v-if="invites.length === 0" class="text-center tiny opacity-50 py-3">
                  No pending invites sighted.
                </p>
              </div>
              <button
                class="btn btn-link text-emerald-500 w-100 mt-3 tiny font-mono"
                @click="completeOnboarding"
              >
                FINALIZE_MESH_ENTRY
              </button>
            </div>

            <button type="button" class="btn btn-link text-zinc-500 mt-2" @click="abortOnboarding">
              Abort
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { db } from './firebase';
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadString } from 'firebase/storage';
import { useAuth } from './useAuth';
import { useRouter } from 'vue-router';
import { useError } from './useError';
// @ts-ignore
// Inside App.vue <script setup>
import { getMyLocation } from './utils/getMyLocation';

const userLocation = ref<{ city: string; county: string } | null>(null);

// Update this in your onMounted or Auth watcher
watch(
  user,
  (newUser) => {
    if (newUser && newUser.ideals) {
      userLocation.value = {
        city: newUser.ideals.city,
        county: newUser.ideals.county
      };
    }
  },
  { immediate: true }
);
const groundIdentity = async () => {
  try {
    const location = await getMyLocation();

    await updateDoc(doc(db, 'users', user.value.uid), {
      fullName: fullName.value,
      'ideals.city': location.city,
      'ideals.county': location.county,
      'ideals.coords': { lat: location.lat, lng: location.lng },
      lastSighting: serverTimestamp()
    });

    alert(`IDENTITY_GROUNDED: Welcome, node of ${location.city}, ${location.county}.`);
    onboardingStep.value = 5;
  } catch (err) {
    globalError.value = 'LOCATION_REQUIRED: Cannot ground node without city sighting.';
  }
};
const { user, isInitialized, logout: authLogout } = useAuth();
const { globalError, clearError } = useError();
const router = useRouter();

const isSynced = ref(false);
const showSplash = ref(true);
const onboardingStep = ref(0);
const videoFeed = ref<HTMLVideoElement | null>(null);
const captureCanvas = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);
const fullName = ref('');
const connectionMode = ref('find');
const peerId = ref('');
const newGroupName = ref('');
const invites = ref<any[]>([]);

const startOnboarding = () => (onboardingStep.value = 1);

const initCamera = async () => {
  onboardingStep.value = 2;
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    if (videoFeed.value) videoFeed.value.srcObject = stream.value;
  } catch (err) {
    globalError.value = 'Camera Access Required';
    onboardingStep.value = 1;
  }
};

const captureAndSighting = async () => {
  if (!videoFeed.value || !captureCanvas.value) return;
  const context = captureCanvas.value.getContext('2d');
  context?.drawImage(videoFeed.value, 0, 0, 600, 600);
  const imageData = captureCanvas.value.toDataURL('image/jpeg');
  stopCamera();
  await performSighting(imageData);
};

const performSighting = async (imageData: string) => {
  onboardingStep.value = 3;
  const storage = getStorage();
  const fileRef = storageRef(storage, `users/${user.value?.uid}/01.img`);
  try {
    await uploadString(fileRef, imageData, 'data_url');
    setTimeout(() => {
      onboardingStep.value = 4;
    }, 2000);
  } catch (error) {
    onboardingStep.value = 1;
  }
};

const groundIdentity = async () => {
  if (!user.value?.uid) return;
  try {
    await updateDoc(doc(db, 'users', user.value.uid), {
      fullName: fullName.value,
      biometricVerified: true
    });
    onboardingStep.value = 5;
  } catch (err) {
    globalError.value = 'Identity grounding failed.';
  }
};

const checkInvites = async () => {
  connectionMode.value = 'invites';
  if (!user.value?.uid) return;
  const q = query(
    collection(db, 'invites'),
    where('toId', '==', user.value.uid),
    where('status', '==', 'pending')
  );
  const snap = await getDocs(q);
  invites.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const initiateHandshake = async () => {
  if (newGroupName.value && user.value?.uid) {
    const groupId = `GRP-${Math.random().toString(36).substring(7).toUpperCase()}`;
    await setDoc(doc(db, 'groups', groupId), {
      name: newGroupName.value,
      owner: user.value.uid,
      members: [user.value.uid],
      memberNames: [fullName.value],
      created: new Date()
    });
    await updateDoc(doc(db, 'users', user.value.uid), { myGroups: arrayUnion(groupId) });
    alert(`Group Initialized: ${groupId}`);
    newGroupName.value = '';
  }
};

const acceptInvite = async (invite: any) => {
  if (!user.value?.uid) return;
  await updateDoc(doc(db, 'invites', invite.id), { status: 'accepted' });
  const targetRef = doc(db, invite.type === 'group' ? 'groups' : 'users', invite.targetId);
  await updateDoc(targetRef, {
    members: arrayUnion(user.value.uid),
    memberNames: arrayUnion(fullName.value)
  });
  checkInvites();
};

const completeOnboarding = () => {
  onboardingStep.value = 0;
  router.push('/peers');
};

const stopCamera = () => stream.value?.getTracks().forEach((t) => t.stop());
const abortOnboarding = () => {
  stopCamera();
  onboardingStep.value = 0;
};
const logout = async () => {
  await authLogout();
  router.push('/');
};

onMounted(() => {
  setTimeout(() => (showSplash.value = false), 3000);
  const statsRef = doc(db, 'system', 'global_stats');
  onSnapshot(statsRef, (docSnap) => {
    if (docSnap.exists()) nodeCount.value = docSnap.data().totalNodes;
  });
  setTimeout(() => (isSynced.value = true), 1000);
});

onUnmounted(() => stopCamera());
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #000;
  position: relative;
  overflow-x: hidden;
}
.splash-screen {
  position: fixed;
  inset: 0;
  background: url('/images/iopicworld.jpg') center/cover no-repeat;
  z-index: 9999;
  animation: fade-out 0.5s ease-in-out 2.5s forwards;
}
@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    pointer-events: none;
  }
}
</style>
