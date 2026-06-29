<template>
  <MapDisplay v-if="showMap" :mapId="'riderMap'" :latitude="mapLat" :longitude="mapLng" :markerText="mapMarkerText" :zoom="12" />
  <CContainer fluid class="rider-dashboard p-4 bg-black min-vh-100 font-mono text-white">
    <header
      class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3"
    >
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-geo-alt-fill text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">RIDE_REQUEST_INTERFACE</h1>
      </div>
      <div class="equity-status text-end">
        <span class="tiny text-zinc-500 d-block">LIQUID_EQUITY</span>
        <span class="text-success fw-bold">{{ userStore.userEquity }} IO$</span>
      </div>
    </header>

    <CRow>
      <CCol lg="8" class="mx-auto">
        <CCard class="bg-zinc-900 border-info text-white shadow-glow mb-4">
          <CCardHeader class="font-black italic text-info">REQUEST_NEW_RIDE</CCardHeader>
          <CCardBody>
            <CForm @submit.prevent="requestRide">
              <div class="mb-3">
                <CFormLabel for="pickupLocation" class="text-zinc-400">PICKUP_LOCATION</CFormLabel>
                <CFormInput
                  id="pickupLocation"
                  type="text"
                  v-model="pickupLocation"
                  placeholder="Enter pickup location"
                  class="bg-zinc-950 border-zinc-800 text-info font-mono"
                  required
                />
              </div>
              <div class="mb-3">
                <CFormLabel for="pickupLat" class="text-zinc-400">PICKUP_LATITUDE</CFormLabel>
                <CFormInput
                  id="pickupLat"
                  type="number"
                  step="any"
                  v-model.number="pickupLat"
                  placeholder="e.g., 34.0522"
                  class="bg-zinc-950 border-zinc-800 text-info font-mono"
                  required
                />
              </div>
              <div class="mb-3">
                <CFormLabel for="pickupLng" class="text-zinc-400">PICKUP_LONGITUDE</CFormLabel>
                <CFormInput
                  id="pickupLng"
                  type="number"
                  step="any"
                  v-model.number="pickupLng"
                  placeholder="e.g., -118.2437"
                  class="bg-zinc-950 border-zinc-800 text-info font-mono"
                  required
                />
              </div>
              <div class="mb-4">
                <CFormLabel for="dropoffLocation" class="text-zinc-400">DROPOFF_LOCATION</CFormLabel>
                <CFormInput
                  id="dropoffLocation"
                  type="text"
                  v-model="dropoffLocation"
                  placeholder="Enter dropoff location"
                  class="bg-zinc-950 border-zinc-800 text-info font-mono"
                  required
                />
              </div>
              <div class="mb-3">
                <CFormLabel for="dropoffLat" class="text-zinc-400">DROPOFF_LATITUDE</CFormLabel>
                <CFormInput
                  id="dropoffLat"
                  type="number"
                  step="any"
                  v-model.number="dropoffLat"
                  placeholder="e.g., 34.0522"
                  class="bg-zinc-950 border-zinc-800 text-info font-mono"
                  required
                />
              </div>
              <div class="mb-4">
                <CFormLabel for="dropoffLng" class="text-zinc-400">DROPOFF_LONGITUDE</CFormLabel>
                <CFormInput
                  id="dropoffLng"
                  type="number"
                  step="any"
                  v-model.number="dropoffLng"
                  placeholder="e.g., -118.2437"
                  class="bg-zinc-950 border-zinc-800 text-info font-mono"
                  required
                />
              </div>
              <CButton color="info" type="submit" class="w-100 py-2 font-black italic" :disabled="isProcessing">
                <span v-if="!isProcessing">REQUEST_RIDE</span>
                <span v-else>TRANSMITTING_REQUEST...</span>
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>

        <CCard class="bg-zinc-900 border-warning text-white shadow-glow">
          <CCardHeader class="font-black italic text-warning">YOUR_ACTIVE_REQUESTS</CCardHeader>
          <CCardBody>
            <div v-if="activeRequests.length > 0">
              <div v-for="request in activeRequests" :key="request.id" class="mb-3 pb-3 border-bottom border-zinc-800">
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">REQUEST_ID:</span>
                  <span class="font-mono">{{ request.id.substring(0, 8) }}...</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">PICKUP:</span>
                  <span class="text-info">{{ request.pickupLocation }}</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">DROPOFF:</span>
                  <span class="text-info">{{ request.dropoffLocation }}</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">STATUS:</span>
                  <span :class="{'text-warning': request.status === 'pending', 'text-info': request.status === 'accepted', 'text-success': request.status === 'completed'}">{{ request.status?.toUpperCase() || 'N/A' }}</span>
                </div>
                <div v-if="request.driverId" class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">DRIVER:</span>
                  <span class="text-success">{{ request.driverId.substring(0, 8) }}...</span>
                </div>
                <div class="mt-2">
                  <MapDisplay :mapId="`rider-map-${request.id}`" :latitude="request.pickupLat" :longitude="request.pickupLng" :markerText="`Pickup: ${request.pickupLocation}`" :zoom="12" />
                  <MapDisplay :mapId="`rider-map-dropoff-${request.id}`" :latitude="request.dropoffLat" :longitude="request.dropoffLng" :markerText="`Dropoff: ${request.dropoffLocation}`" :zoom="12" class="mt-2" />
                </div>
                <div class="mt-2" v-if="request.status === 'accepted' || request.status === 'en_route'">
                  <CButton
                    color="info"
                    size="sm"
                    @click="openChat(request.id)"
                    :disabled="isProcessing"
                  >CHAT_WITH_DRIVER</CButton>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 opacity-25">
              NO_ACTIVE_RIDE_REQUESTS
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, Unsubscribe } from 'firebase/firestore';
import { useUserStore } from '../stores/user';
import { useErrorStore } from '../stores/error';
import { useSuccessStore } from '../stores/success';

import MapDisplay from './MapDisplay.vue'; // Import the new MapDisplay component

const userStore = useUserStore();
const errorStore = useErrorStore();
const successStore = useSuccessStore();

const pickupLat = ref<number | null>(null);
const pickupLng = ref<number | null>(null);
const pickupLocation = ref('');
const dropoffLat = ref<number | null>(null);
const dropoffLng = ref<number | null>(null);
const dropoffLocation = ref('');
const isProcessing = ref(false);
const activeRequests = ref<any[]>([]);
const showChatModal = ref(false);
const currentChatRideId = ref<string | null>(null);

let requestsUnsubscribe: Unsubscribe | null = null;

const requestRide = async () => {
  if (!userStore.isAuthenticated || !userStore.currentUser) {
    errorStore.setGlobalError('AUTHENTICATION_REQUIRED: Please log in to request a ride.');
    return;
  }

  if (pickupLat.value === null || pickupLng.value === null || dropoffLat.value === null || dropoffLng.value === null) {
    errorStore.setGlobalError('LOCATION_DATA_MISSING: Please provide valid coordinates.');
    return;
  }
  isProcessing.value = true;
  errorStore.clearGlobalError();
  try {
    await addDoc(collection(db, 'rideRequests'), {
      riderId: userStore.currentUser.uid,
      pickupLocation: pickupLocation.value,
      dropoffLocation: dropoffLocation.value,
      pickupLat: pickupLat.value,
      pickupLng: pickupLng.value,
      dropoffLat: dropoffLat.value,
      dropoffLng: dropoffLng.value,
      status: 'pending',
      requestedAt: serverTimestamp(),
      driverId: null,
    });
    successStore.setSuccessMessage('RIDE_REQUEST_SUCCESS: Your ride request has been sent.');
    // Clear form fields
    pickupLocation.value = ''; pickupLat.value = null; pickupLng.value = null;
    dropoffLocation.value = ''; dropoffLat.value = null; dropoffLng.value = null;
  } catch (error) {
    console.error('RIDE_REQUEST_FRACTURE:', error);
    errorStore.setGlobalError('RIDE_REQUEST_FAILED: Could not send ride request.');
  } finally {
    isProcessing.value = false;
  }
};

const initRequestsSubscription = () => {
  if (!userStore.isAuthenticated || !userStore.currentUser) return;

  requestsUnsubscribe = onSnapshot(
    query(collection(db, 'rideRequests'), where('riderId', '==', userStore.currentUser.uid)),
    (snapshot) => {
      activeRequests.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    (error) => {
      console.error("Error fetching rider requests:", error);
      errorStore.setGlobalError("Failed to load your ride requests.");
    }
  );
};

const openChat = (rideId: string) => {
  currentChatRideId.value = rideId;
  showChatModal.value = true;
};

onMounted(() => {
  initRequestsSubscription();
});

onUnmounted(() => {
  requestsUnsubscribe?.();
});
</script>

<style scoped>
.rider-dashboard .text-info {
  color: #00e5ff !important;
}
.rider-dashboard .shadow-glow {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.15) !important;
}
.bg-zinc-950 {
  background-color: #050505;
}
.font-black {
  font-weight: 900;
}
.fw-black {
  font-weight: 900;
}
.tiny {
  font-size: 0.65rem;
}
.italic {
  font-style: italic;
}
</style>